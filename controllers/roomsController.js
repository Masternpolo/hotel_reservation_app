const roomModel = require('../models/roomModel');
const AppError = require('../utils/appError');

exports.registerRoom = async (req, res, next) => {
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

exports.getAllRooms = async (req, res, next) => {
    try {
        const rooms = await roomModel.getAllrooms();
        res.status(200).json({
            status: 'success',
            length: rooms.length,
            data: {
                rooms,
            },
        });
    } catch (err) {
        next(err);
    }
};


exports.getRoomById = async (req, res, next) => {
    try {
        const roomId = req.params.id;
        const room = await roomModel.getroomById(roomId);
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
exports.getRoomByEmail = async (req, res, next) => {
    try {
        const roomId = req.params.id;
        const room = await roomModel.getroomById(roomId);
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

exports.deleteRoom = async (req, res, next) => {
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

exports.updateRoom = async (req, res, next) => {
    try {
        const roomId = req.params.id;
        const { name, type, description,
      price, hotelId } = req.body;

        const updatedRoom = await roomModel.updateroom(roomId, name, type, description,
      price, hotelId);
        if (!updatedRoom) {
            return next(new AppError('room not found', 404));
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