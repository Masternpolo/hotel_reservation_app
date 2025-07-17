import express from 'express';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
import { body } from 'express-validator';
import * as auth from '../auth/authMiddleware.js';

const router = express.Router();

const validateUserRegistration = () => [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const validateUserLogin = () => [
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/login', validateUserLogin(), authController.login);
router.post('/signup', validateUserRegistration(), authController.signUp);
router.post('/forgotpassword', validateUserLogin(), authController.forgotPassword);
router.post('/resetpassword/:token', validateUserRegistration(), authController.resetPassword);

router.use(auth.protect);

router.patch('/updateMyPassword', authController.updateMyPassword);
router.patch('/updateMe', userController.updateMe);

router.use(auth.isAdmin);

router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateMe)
  .delete(userController.deleteUser);

export default router;
