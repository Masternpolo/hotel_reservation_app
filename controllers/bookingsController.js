const hotelModel = require('../models/hotelModel');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

exports.registerBooking = async (req, res, next) => {
//   try {
//     let {
//       duration, email, customerName, initialPayment, totalPayment,
//       balance, roomName, checkin, checkout, trnStatus
//     } = req.body;

//     email = email?.trim().toLowerCase();
//     customerName = customerName?.trim().toLowerCase();
//     roomName = roomName?.trim().toLowerCase();

//     const booking = await bookingModel.register(
//       customerName, email, roomName, initialPayment, totalPayment,
//       balance, checkin, checkout, duration
// );

//     res.status(201).json({
//       status: 'success',
//       data: {
//         booking
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
};

exports.getAllBookings = async (req, res, next) => {
    try {
        const bookings = await bookingModel.getAllBookings();
        res.status(200).json({
            status: 'success',
            length: bookings.length,
            data: {
                bookings,
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.getHotelById = async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        const booking = await hotelModel.getHotelById(bookingId);
        if (!booking) {
            return next(new AppError('No booking not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                booking,
            },
        });
    } catch (err) {
        next(err);
    }
}

exports.deleteBooking = async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        await bookingModel.deleteBooking(bookingId);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(err);
    }
}

exports.updateBooking = async (req, res, next) => {
    try {
    //     const bookingId = req.params.id;
    //     const { owner, email, phone, country, nic, username, hotelname, regno, address } = req.body;

    //     const updatedBooking = await bookingModel.updateBooking(hotelId, owner, email, phone, country, nic, username, hotelname, regno, address);
    //     if (!updatedHotel) {
    //         return next(new AppError('Hotel not found', 404));
    //     }

    //     res.status(200).json({
    //         status: 'success',
    //         data: {
    //             booking
    //         }
    //     });
    } catch (err) {
        // next(err);
    }
};