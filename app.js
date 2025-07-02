const express = require('express');
const app = express();
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const roomRoute = require('./routes/roomRoute');
const paymentRoute = require('./routes/paymentRoute');
const hotelRoute = require('./routes/hotelRoute');
const errHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');


app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());


app.post('/paystack/webhook', express.json({ verify: (req, res, buf) => {
    req.rawBody = buf;
} }), async (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY; 

    const hash = crypto
        .createHmac('sha512', secret)
        .update(req.rawBody)
        .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
        return res.status(401).send('Invalid signature');
    }

    const event = req.body;

    // Handle only successful payments
    if (event.event === 'charge.success') {
        const paymentData = event.data;
        console.log(paymentData);
        
        const customerEmail = paymentData.customer.email;
        const customerName = paymentData.metadata?.custom_fields?.[0]?.value || 'Unknown';
        const initialPayment = paymentData.metadata?.custom_fields?.[1]?.value *1 || 'Unknown';
        const totalPayment = paymentData.metadata?.custom_fields?.[2]?.value *1 || 'Unknown';
        const balance = paymentData.metadata?.custom_fields?.[3]?.value *1 || 'Unknown';
        const duration = paymentData.metadata?.custom_fields?.[4]?.value || 'Unknown';
        const checkin = paymentData.metadata?.custom_fields?.[5]?.value || 'Unknown';
        const checkout = paymentData.metadata?.custom_fields?.[6]?.value || 'Unknown';
        const roomName = paymentData.metadata?.custom_fields?.[7]?.value || 'Unknown';
        const roomPrice = paymentData.metadata?.custom_fields?.[8] ?.value *1 || 'Unknown';
        const amount = paymentData.amount;
        const status = paymentData.status;
        const reference = paymentData.reference;
        const paidAt = paymentData.paid_at;
        try {
            await db.execute(
                `INSERT INTO payments (customer_name, customer_email, initial_payment, total_payment, balance, duration,checkin, checkout, room_name, room_price, status)
                 VALUES (?, ?, ?, ?, ?, ??, ?, ?, ?)`,
                [customerName, customerEmail, initialPayment, totalPayment, balance, duration, checkin, checkout, roomName, roomPrice, status]
            );
            console.log('Payment saved from webhook');
            console.log('payment saved')
        } catch (err) {
            console.error('DB error from webhook:', err);
        }
    }
        res.sendStatus(200);
});

app.use(express.json());
app.use('/api/v1/payments', paymentRoute);

// app.use('/api/v1/bookings', bookingsRoute);
app.use('/api/v1/hotels', hotelRoute);
// app.use('/api/v1/reviews', reviewsRoute);
app.use('/api/v1/rooms', roomRoute);
app.use('/api/v1/users', userRoute);
// app.use('/api/v1/admins', adminRoute);


app.all('*',(req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server`, 404))
});

app.use(errHandler);


module.exports = app;