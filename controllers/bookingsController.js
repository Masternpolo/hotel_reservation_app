import * as hotelModel from '../models/hotelModel.js';
import AppError from '../utils/appError.js';
import Email from '../utils/email.js';


export const registerBooking = async (req, res, next) => {
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

export const getAllBookings = async (req, res, next) => {
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

export const getHotelById = async (req, res, next) => {
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

export const deleteBooking = async (req, res, next) => {
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

export const updateBooking = async (req, res, next) => {
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