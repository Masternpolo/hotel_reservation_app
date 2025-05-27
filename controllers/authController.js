const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const { accessToken } = require('../auth/authMiddleware');
const Email = require('../utils/email');




exports.signUp = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let { firstname, lastname, email, phone, username, password } = req.body;
        firstname = firstname.trim().toLowerCase();
        lastname = lastname.trim().toLowerCase();
        phone = phone.trim();
        email = email.trim().toLowerCase();
        username = username.trim().toLowerCase();

        const newUser = await userModel.register(firstname, lastname, email, phone, username, password);
        res.status(201).json({
            status: 'success',
            data: {
                user: newUser,
            },
        });

    } catch (err) {
        next(err);
    }
}

exports.login = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let { username, password } = req.body;
        username = username.trim().toLowerCase();

        const loginUser = await userModel.findUserByUsername(username);

        if (!user) next(new AppError('Invalid email or password', 401));

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) next(AppError('Invalid username or password', 401))

        const user = {
            id: loginUser.id,
            firstname: loginUser.firstname,
            lastname: loginUser.lastname,
            email: loginUser.email,
            phone: loginUser.phone,
            username: loginUser.username,
            role: loginUser.role,
            created_at: loginUser.created_at
        }
        const token = accessToken(user)

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: loginUser,
            },
        });
    } catch (err) {
        next(err)
    }
}

exports.forgotPassword = async (req, res, next) => {
    try {
        // check if email exists
        const email = req.body.email;
        
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return next(new AppError('There is no user with that email address', 404));
        }
        // generate reset token
        const resetToken = userModel.createPasswordresetToken();
        
        // save token to db
        await userModel.saveResetToken(user.id, resetToken);
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
        const message = `Click the link to reset your password: ${resetUrl}. If you didnt request this, please ignore the mail.`;

        // send email
        try {
           
            await new Email(user, resetUrl).sendResetMail();

        } catch (err) {
            await userModel.deleteResetToken(user.id);
            console.log(err); 
            return next(new AppError('There was an error sending the email. Try again later', 500));
        }
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
        });

    } catch (err) {
        next(err);
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const resetToken = req.params.token;
        const user = await userModel.findUserByResetToken(resetToken);

        if (!user) {
            return next(new AppError('Token is invalid or has expired', 400));
        }

        const newPassword = req.body.password;
        console.log('user id from reset controller :',user.id);
        
        await userModel.updateUserPassword(newPassword, user.id)
        await userModel.deleteResetToken(user.id);
        const token = accessToken(user)

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user,
            }
        });


    } catch (err) {
        next(err);
    }
}