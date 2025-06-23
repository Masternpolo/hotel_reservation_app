const express = require('express');
const app = express();
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const hotelRoute = require('./routes/hotelRoute');
const errHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

// app.use('/api/v1/bookings', bookingsRoute);
app.use('/api/v1/hotels', hotelRoute);
// app.use('/api/v1/payments', paymentRoute);
// app.use('/api/v1/reviews', reviewsRoute);
// app.use('/api/v1/rooms', roomsRoute);
app.use('/api/v1/users', userRoute);
// app.use('/api/v1/admins', adminRoute);


app.all('*',(req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server`, 404))
});

app.use(errHandler);


module.exports = app;