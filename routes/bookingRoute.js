import express from 'express';
import * as bookingController from '../controllers/bookingsController.js';
import * as auth from '../auth/authMiddleware.js';

const router = express.Router();

router.post('/pastBookings', auth.protect, isAdmin, bookingController.getAllPastBookings);

router.route('/')
  .get(bookingController.getAllBookings)
  .post(auth.protect, auth.isAdmin, bookingController.createBooking);

router
  .route('/:id')
  .get(auth.protect, bookingController.getBookingById)
  .patch(auth.protect, bookingController.updateBooking)
  .delete(auth.protect, bookingController.deleteBooking);

export default router;
