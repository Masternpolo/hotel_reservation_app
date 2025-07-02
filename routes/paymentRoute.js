const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController')
const auth = require('../auth/authMiddleware');

router
    .route('/')
    .get(paymentController.checkTransactionStatus)
    .post(auth.protect, paymentController.makePayment);


module.exports = router;