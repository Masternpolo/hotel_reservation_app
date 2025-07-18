import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import userRoute from './routes/userRoute.js';
import roomRoute from './routes/roomRoute.js';
import paymentRoute from './routes/paymentRoute.js';
import hotelRoute from './routes/hotelRoute.js';
import errHandler from './controllers/errorController.js';
import AppError from './utils/appError.js';
import pool from './database/db.js'; // Assuming your db connection is here

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());




app.post('/paystack/webhook', express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}), async (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers['x-paystack-signature'] || req.headers['X-Paystack-Signature'];

    const hash = crypto.createHmac('sha512', secret)
        .update(req.rawBody)
        .digest('hex');

    if (hash !== signature) {
        return res.status(401).send('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'charge.success') {
        const data = event.data;

        const getField = (key) =>
            data.metadata?.custom_fields?.find(f => f.variable_name === key)?.value;

        const customerEmail = data.customer?.email || data.customer_email || 'unknown@email.com';
        const customerName = getField('customer_name') || 'Unknown';
        const initialPayment = Number(getField('initial_payment')) || 0;
        const totalPayment = Number(getField('total_payment')) || 0;
        const balance = Number(getField('balance')) || 0;
        const duration = Number(getField('duration')) || 0;
        const checkinRaw = getField('checkin');
        const checkoutRaw = getField('checkout');
        const checkin = checkinRaw ? new Date(checkinRaw) : null;
        const checkout = checkoutRaw ? new Date(checkoutRaw) : null;
        const roomName = getField('room_name') || 'Unknown Room';
        const roomPrice = Number(getField('room_price')) || 0;
        const status = data.status;

        console.log({
            customerName,
            customerEmail,
            initialPayment,
            totalPayment,
            balance,
            duration,
            checkin,
            checkout,
            roomName,
            roomPrice,
            status
        });

        try {
            const sql = `INSERT INTO bookings 
            (customer_name, customer_email, initial_payment, total_payment, balance, duration, checkin, checkout, room_name, price, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

            const values = [
                customerName,
                customerEmail,
                initialPayment,
                totalPayment,
                balance,
                duration,
                checkin,
                checkout,
                roomName,
                roomPrice,
                status
            ];

            await pool.query(sql, values);
            console.log('Payment saved to DB from webhook');
            return res.sendStatus(200);
        } catch (err) {
            console.error('DB error from webhook:', err);
            return res.sendStatus(500);
        }
    } else {
        console.log(`Unhandled webhook event: ${event.event}`);
        return res.sendStatus(200);
    }
});


app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Hotel Reservation App API');
})

app.use('/api/v1/payments', paymentRoute);
app.use('/api/v1/hotels', hotelRoute);
app.use('/api/v1/rooms', roomRoute);
app.use('/api/v1/users', userRoute);




app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(errHandler);

export default app;
