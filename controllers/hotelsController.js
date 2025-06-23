const { validationResult } = require('express-validator');
const hotelModel = require('../models/hotelModel');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

exports.registerHotel = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    
    const doc = req.body.registrationDocFilename || '';
    const docurl = doc ? `public/uploads/registration_files/${doc}` : '';

    let {
      owner, email, phone, country,
      nic, username, password,
      hotelname, description, regno, address,
    } = req.body;

    // Normalize input
    owner = owner?.trim().toLowerCase();
    email = email?.trim().toLowerCase();
    phone = phone?.trim();
    country = country?.trim().toLowerCase();
    nic = nic?.trim().toLowerCase();
    username = username?.trim().toLowerCase();
    hotelname = hotelname?.trim().toLowerCase();
    regno = regno?.trim().toLowerCase();
    address = address?.trim().toLowerCase();
    description = description?.trim().toLowerCase();

    const newUser = await hotelModel.register(
      owner, email, phone, country, nic,
      username, password, hotelname,
      description, regno, address, docurl
    );

    const hotelId = newUser.id;
    const imageFiles = req.body.images;
    
    for (let file of imageFiles) {
        console.log(file);
      const imageUrl = `public/img/hotels/${file}`;
      await hotelModel.uploadHotelImages(hotelId, imageUrl);
    }

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllHotels = async (req, res, next) => {
    try {
        const hotels = await hotelModel.getAllHotels();
        res.status(200).json({
            status: 'success',
            length: hotels.length,
            data: {
                hotels,
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.getHotelById = async (req, res, next) => {
    try {
        const hotelId = req.params.id;
        const hotel = await hotelModel.getHotelById(hotelId);
        if (!hotel) {
            return next(new AppError('Hotel not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                hotel,
            },
        });
    } catch (err) {
        next(err);
    }
}

exports.deleteHotel = async (req, res, next) => {
    try {
        const hotelId = req.params.id;
        await hotelModel.deleteHotel(hotelId);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(err);
    }
}

exports.updateHotel = async (req, res, next) => {
    try {
        const hotelId = req.params.id;
        const { owner, email, phone, country, nic, username, hotelname, regno, address } = req.body;

        const updatedHotel = await hotelModel.updateHotel(hotelId, owner, email, phone, country, nic, username, hotelname, regno, address);
        if (!updatedHotel) {
            return next(new AppError('Hotel not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                hotel: updatedHotel,
            },
        });
    } catch (err) {
        next(err);
    }
};