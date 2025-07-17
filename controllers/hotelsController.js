import { validationResult } from 'express-validator';
import * as hotelModel from '../models/hotelModel.js';
import AppError from '../utils/appError.js';
import Email from '../utils/email.js';


export const registerHotel = async (req, res, next) => {
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

        const newHotel = await hotelModel.register(
            owner, email, phone, country, nic,
            username, password, hotelname,
            description, regno, address, docurl
        );

        const hotelId = newHotel.id;
        const imageFiles = req.body.images;

        for (let file of imageFiles) {
            const imageUrl = `public/img/hotels/${file}`;
            await hotelModel.uploadHotelImages(hotelId, imageUrl);
        }

        res.status(201).json({
            status: 'success',
            data: {
                hotel: newHotel,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getAllHotels = async (req, res, next) => {
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

export const getHotelById = async (req, res, next) => {
    try {
        const hotelId = req.params.id;
        const hotel = await hotelModel.getHotelById(hotelId);
        if (!hotel) {
            return next(new AppError('Hotel not found', 404));
        }
        console.log(hotel);

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

export const deleteHotel = async (req, res, next) => {
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

export const updateHotel = async (req, res, next) => {
    try {
        const hotelId = req.params.id;
        let updatedHotel;
        const { owner, email, phone, hotelname, address } = req.body;

        if (owner && email && phone && hotelname && address) {
            updatedHotel = await hotelModel.updateHotel(hotelId, owner, email, phone, hotelname, address);
            if (!updatedHotel) {
                return next(new AppError('Hotel not found', 404));
            }
        }
        if (req.body.images) {
            const imageFiles = req.body.images;
            await hotelModel.deleteHotelImages(hotelId)
            
            for (let file of imageFiles) {
                const imageUrl = `public/img/hotels/${file}`;
                await hotelModel.uploadHotelImages(hotelId, imageUrl);
            }
        }

        if (!updatedHotel) {
            updatedHotel = await hotelModel.getHotelById(hotelId);  // You should implement this
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