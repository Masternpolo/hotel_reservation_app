const express = require('express') ;
const router = express.Router();
const bookingModel = require('../controllers/authController');
const bookingController = require('../controllers/userController')
const auth = require('../auth/authMiddleware');

router.post('/pastBookings', auth.protect, isAdmin, bookingController.getAllPastBookings)

router.route('/')
  .get(bookingController.getAllBookings)
  .post(auth.protect, auth.isAdmin, bookingController.createBooking);

router
  .route('/:id')
  .get(auth.protect, bookingController.getBookingById)
  .patch(auth.protect, bookingController.updateBooking)
  .delete(auth.protect, bookingController.deleteBooking);



module.exports = router;