import * as roomModel from '../models/roomModel.js';
import AppError from '../utils/appError.js';
import redisClient from '../utils/redis.js';

const expiresIn = 3600;

export const registerRoom = async (req, res, next) => {
    try {

        let {
            name, type, description,
            price, hotelId
        } = req.body;


        description = description?.trim().toLowerCase();
        name = name?.trim().toLowerCase();
        price = price * 1

        const newRoom = await roomModel.register(
            name, type, description, price, hotelId
        );

        const roomId = newRoom.id;
        const roomImages = req.body.images;

        for (let file of roomImages) {
            const imageUrl = `public/img/rooms/${file}`;
            await roomModel.uploadRoomImages(roomId, imageUrl);
        }

        res.status(201).json({
            status: 'success',
            data: {
                room: newRoom,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getAllRooms = async (req, res, next) => {
    try {
        // Check Redis cache
        const cachedRooms = await redisClient.get('rooms');

        if (cachedRooms) {
            return res.status(200).json({
                status: 'success',
                length: JSON.parse(cachedRooms).length,
                data: {
                    rooms: JSON.parse(cachedRooms),
                },
            });
        }

        // If not in Redis, get from DB
        const rooms = await roomModel.getAllrooms();

        // const expiresIn = 3600;
        await redisClient.setEx('rooms', expiresIn, JSON.stringify(rooms));

        res.status(200).json({
            status: 'success',
            length: rooms.length,
            data: {
                rooms,
            },
        });

    } catch (err) {
        console.error('getAllRooms error:', err);
        next(err);
    }
};


export const getRoomById = async (req, res, next) => {
    try {
        const roomId = req.params.id;
        const room = await roomModel.getRoomById(roomId);
        if (!room) {
            return next(new AppError('room not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                room,
            },
        });
    } catch (err) {
        next(err);
    }
}
export const getRoomByEmail = async (req, res, next) => {
    try {
        const roomId = req.params.id;
        const room = await roomModel.getRoomById(roomId);
        if (!room) {
            return next(new AppError('room not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                room,
            },
        });
    } catch (err) {
        next(err);
    }
}

export const deleteRoom = async (req, res, next) => {
    try {
        const roomId = req.params.id;
        await roomModel.deleteRoom(roomId);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(err);
    }
}

export const updateRoom = async (req, res, next) => {
    try {
        let updatedRoom;
        const roomId = req.params.id;
        let { name, type, description,
            price, hotelId } = req.body;
        if (name && type && description && price && hotelId) {
            console.log(name, type, description, price, hotelId);
            price = price * 1
            console.log(typeof price);
            console.log(roomId);

            updatedRoom = await roomModel.updateRoom(roomId, name, type, description, price, hotelId);

            if (!updatedRoom) {
                return next(new AppError('room not found', 404));
            }
        }

        if (req.body.images) {
            await roomModel.deleteRoomImages(roomId);
            const roomImages = req.body.images;

            for (let file of roomImages) {
                const imageUrl = `public/img/rooms/${file}`;
                await roomModel.uploadRoomImages(roomId, imageUrl);
            }
        }
        if (!updatedRoom) {
            updatedRoom = await roomModel.getRoomById(roomId)
        }
        res.status(200).json({
            status: 'success',
            data: {
                room: updatedRoom,
            },
        });
    } catch (err) {
        next(err);
    }
};