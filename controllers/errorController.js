import AppError from '../utils/appError.js';
//  Duplicate key error handler
const handleDuplicateKeyError = (err) => {
    const message = `${err.detail}`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    console.log(err.statusCode);
    
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
}

const sendErrorProd = (err, res) => {
    //operational, trusted error: message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        // programming or other unknown errors: don't leak details
    } else {
        // Log the error
        console.error(err);
        // Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
}

const globalErrorHandler = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = err;
        if (error.code === '23505') error = handleDuplicateKeyError(error);

        sendErrorProd(error, res);
    }
};

export default globalErrorHandler;


