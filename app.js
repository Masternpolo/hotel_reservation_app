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
    const customFields = data.metadata?.custom_fields || [];

    const customerEmail   = data.customer.email;
    const customerName    = customFields[0]?.value || 'Unknown';
    const initialPayment  = Number(customFields[1]?.value) || 0;
    const totalPayment    = Number(customFields[2]?.value) || 0;
    const balance         = Number(customFields[3]?.value) || 0;
    const duration        = customFields[4]?.value || 'Unknown';
    const checkin         = customFields[5]?.value || 'Unknown';
    const checkout        = customFields[6]?.value || 'Unknown';
    const roomName        = customFields[7]?.value || 'Unknown';
    const roomPrice       = Number(customFields[8]?.value) || 0;
    const status          = data.status;

    try {
      await pool.query(
        `INSERT INTO bookings 
         (customer_name, customer_email, initial_payment, total_payment, balance, duration, checkin, checkout, room_name, room_price, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customerName, customerEmail, initialPayment, totalPayment, balance, duration, checkin, checkout, roomName, roomPrice, status]
      );
      console.log('Payment saved from webhook');
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
