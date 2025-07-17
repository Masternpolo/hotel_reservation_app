import multer from 'multer';
import sharp from 'sharp';
import AppError from '../utils/appError.js';
import fs from 'fs/promises';
import { log } from 'console';

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/uploads')
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
//     const imgExt = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${uniqueSuffix}.${imgExt}`)
//   }
// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError('Only image files or PDFs are allowed!', 400), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 3 } // 3MB
});

export const uploadUserPhoto = upload.single('photo');

export const uploadHotelPhotos = upload.fields([
  { name: 'registrationDoc', maxCount: 1 },
  { name: 'hotelPhotos', maxCount: 6 }
]);

export const uploadRoomPhotos = upload.array('roomPhotos', 2);

export const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

export const resizeHotelPhotos = async (req, res, next) => {
  try {
    req.body.images = [];
        console.log(req.body.hotelname);

    if (req.files && req.files.hotelPhotos) {
      await Promise.all(
        
        req.files.hotelPhotos.map(async (file, index) => {

          const filename = `${req.body.hotelname?.replace(/\s+/g, '-')}-${Date.now()}-${Math.round(Math.random() * 1E9)}-${index + 1}.jpeg`;

          await sharp(file.buffer)
            .resize(800, 400)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/hotels/${filename}`);

          req.body.images.push(filename);
        })
      );
    }

    const docFile = req.files?.registrationDoc?.[0];
    if (docFile && docFile.mimetype === 'application/pdf') {
      const ext = docFile.mimetype.split('/')[1] || 'pdf';
      const filename = `${req.body.hotelname?.replace(/\s+/g, '-')}-${Date.now()}-registrationDoc.${ext}`;
      const filePath = `public/uploads/registration_files/${filename}`;

      await fs.writeFile(filePath, docFile.buffer);

      req.body.registrationDocFilename = filename;
    }

    next();
  } catch (err) {
    console.error('Error in resizeHotelPhotos middleware:', err);
    next(new AppError('File processing failed', 500));
  }
};

export const resizeRoomPhotos = async (req, res, next) => {
  try {
    req.body.images = [];

    if (req.files) {
      await Promise.all(
        req.files.map(async (file, index) => {
          const filename = `${req.body.name?.replace(/\s+/g, '-')}-${Date.now()}-${Math.round(Math.random() * 1E9)}-${index + 1}.jpeg`;

          await sharp(file.buffer)
            .resize(800, 400)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/rooms/${filename}`);

          req.body.images.push(filename);
        })
      );
    }
    next();
  } catch (err) {
    next(err);
  }
};
