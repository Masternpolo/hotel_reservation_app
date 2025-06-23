const express = require('express') ;
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController')
const { body } = require('express-validator');
const { protect, isAdmin } = require('../auth/authMiddleware');


const validateUserRegistration = () => [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const validateUserLogin = () => [
  // body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
];


router.post('/login', validateUserLogin(), authController.login);
router.post('/signup', validateUserRegistration(), authController.signUp);


router.post('/forgotpassword', validateUserLogin(), authController.forgotPassword);
router.post('/resetpassword/:token', validateUserRegistration(), authController.resetPassword);

router.use(protect)

router.patch('/updateMyPassword', protect, authController.updateMyPassword);
router.patch('/updateMe', protect, userController.updateMe);


router.use(isAdmin);

router.route('/')
  .get(protect, userController.getAllUsers)
  .post(protect, userController.createUser);

router
  .route('/:id')
  .get(protect, isAdmin, userController.getUserById)
  .patch(protect, isAdmin, userController.updateMe)
  .delete(protect, isAdmin, userController.deleteUser);


module.exports = router;