const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelsController');
const { body } = require('express-validator');
const { protect, isAdmin } = require('../auth/authMiddleware');
const multerController = require('../utils/multer');


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
  .post(protect, isAdmin, hotelController.registerHotel);

router
  .route('/:id')
  .get(protect, isAdmin, hotelController.getHotelById)
  .patch(protect, isAdmin, hotelController.updateHotel)
  .delete(protect, isAdmin, hotelController.deleteHotel);



module.exports = router;