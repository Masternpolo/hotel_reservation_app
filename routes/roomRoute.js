const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomsController');
const auth = require('../auth/authMiddleware');
const multerController = require('../utils/multer');

router.route('/')
  .get(roomController.getAllRooms)
  .post( 
    multerController.uploadRoomPhotos,
    multerController.resizeRoomPhotos,
    roomController.registerRoom
);

router
  .route('/:id')
  .get(auth.protect, auth.isAdmin, roomController.getRoomById)
  .patch(auth.protect, auth.isAdmin, roomController.updateRoom)
  .delete(auth.protect, auth.isAdmin, roomController.deleteRoom);



module.exports = router;