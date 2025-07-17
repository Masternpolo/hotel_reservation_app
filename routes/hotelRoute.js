import express from 'express';
import * as hotelController from '../controllers/hotelsController.js';
import { body } from 'express-validator';
import * as auth from '../auth/authMiddleware.js';
import * as multerController from '../utils/multer.js';

const router = express.Router();

// Optional: keep validation block for future use
// const validateUserRegistration = () => [
//   body('username')
//     .notEmpty().withMessage('Username is required')
//     .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
//   body('email').isEmail().withMessage('Invalid email format'),
//   body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
// ];

router.post('/registerHotel',
  multerController.uploadHotelPhotos,
  multerController.resizeHotelPhotos,
  hotelController.registerHotel
);

router.route('/')
  .get(hotelController.getAllHotels)
  .post(auth.protect, auth.isAdmin, hotelController.registerHotel);

router.route('/:id')
  .get(auth.protect, hotelController.getHotelById)
  .patch(
    auth.protect, 
    multerController.uploadHotelPhotos,
    multerController.resizeHotelPhotos, 
    hotelController.updateHotel
  )
  .delete(auth.protect, hotelController.deleteHotel);

export default router;
