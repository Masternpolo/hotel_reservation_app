import express from 'express';
import * as roomController from '../controllers/roomsController.js';
import * as auth from '../auth/authMiddleware.js';
import * as multerController from '../utils/multer.js';

const router = express.Router();

router.route('/')
  .get(roomController.getAllRooms)
  .post( 
    multerController.uploadRoomPhotos,
    multerController.resizeRoomPhotos,
    roomController.registerRoom
);

router.route('/:id')
  .get(auth.protect, roomController.getRoomById)
  .patch(
    auth.protect, 
    multerController.uploadRoomPhotos,
    multerController.resizeRoomPhotos,
    roomController.updateRoom)
  .delete(auth.protect, roomController.deleteRoom);



export default router;
