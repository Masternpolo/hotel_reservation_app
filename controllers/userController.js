const userModel = require('../models/userModel');
const AppError = require('../utils/appError');

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await userModel.getAllUsers();
        res.status(200).json({
            status: 'success',
            data: {
                users,
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.createUser = async (req, res, next) => {
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

exports.getUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await userModel.getUserById(userId);
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        await userModel.deleteUser(userId);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(err);
    }
};

exports.updateMe = async (req, res, next) => {
    try {
        const userId = req.user
        const { firstname, lastname, email, phone, username } = req.body;

        const updatedUser = await userModel.updateUser(userId, firstname, lastname, email, phone, username);
        if (!updatedUser) {
            return next(new AppError('User not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser,
            },
        });
    } catch (err) {
        next(err);
    }
};

