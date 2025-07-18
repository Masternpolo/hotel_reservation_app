import https from 'https';
import * as roomModel from '../models/roomModel.js';
import * as userModel from '../models/userModel.js';
import AppError from '../utils/appError.js';


export const makePayment = async (req, res, next) => {
    
    let { amount, duration, checkin, checkout, roomId, roomPrice } = req.body;
    let email = req.user.email;
    email = email.trim().toLowerCase();
    

    if (!amount || !duration || !checkin || !checkout || !roomId || !email, !roomPrice) {
        return next(new AppError('Please provide all required fields', 400));
    }
    amount = amount * 100;
    duration = duration * 1
    const initialPayment = parseInt(amount) * 100;
    const totalPayment = initialPayment * duration;
    const balance = totalPayment - initialPayment;

    try {
        const customer = await userModel.findUserByEmail(email);
        if (!customer) return next(new AppError('User not found', 404));

        const room = await roomModel.getRoomById(roomId);
        if (!room) return next(new AppError('room not found', 404));

        const customerName = `${customer.firstname} ${customer.lastname}`;
        const callback_url = `https://hotel-reservation-app-79j3.onrender.com/api/v1/payments/`;

        const params = JSON.stringify({
            email,
            amount,
            callback_url,
            metadata: {
                custom_fields: [
                    {
                        customerName,
                        initialPayment,
                        totalPayment,
                        balance,
                        duration,
                        checkin,
                        checkout,
                        roomName: room.name,
                        roomPrice: room.price * 1
                    }
                ]
            }
        });

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/transaction/initialize',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const reqPaystack = https.request(options, resPaystack => {
            let data = '';

            resPaystack.on('data', chunk => data += chunk);
            resPaystack.on('end', () => {
                console.log(JSON.parse(data));
                res.send(data);
            });
        });

        reqPaystack.on('error', error => console.error(error));

        reqPaystack.write(params);
        reqPaystack.end();
    } catch (err) {
        next(err)
    }
};

export const checkTransactionStatus = async (req, res, next) => {
    try {
        const reference = req.query.reference;
        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: `/transaction/verify/${reference}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            }
        };

        const reqVerify = https.request(options, verifyRes => {
            let data = '';

            verifyRes.on('data', chunk => data += chunk);
            verifyRes.on('end', () => {
                const response = JSON.parse(data);

                if (response.status && response.data.status === 'success') {
                     res.json({
                        status: 'success',
                        message: 'Payment successful',
                    })
                } else {
                    res.json({
                        status: 'failed',
                        message: 'Payment failed',
                    });
                }
            });
        });

        reqVerify.on('error', error => {
            console.error(error);
            res.send('An error occurred');
        });
        reqVerify.end();
    } catch (err) {
        next(err);
    }
}