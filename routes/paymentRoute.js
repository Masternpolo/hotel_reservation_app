import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import * as auth from '../auth/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(paymentController.checkTransactionStatus)
    .post(auth.protect, paymentController.makePayment);

export default router;
