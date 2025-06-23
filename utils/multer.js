const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const fs = require('fs/promises');


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/uploads')
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
//     const imgExt = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${uniqueSuffix}.${imgExt}`)
//   }
// })


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

exports.uploadUserPhoto = upload.single('photo');

exports.uploadHotelPhotos = upload.fields([
  { name: 'registrationDoc', maxCount: 1 },
  { name: 'hotelPhotos', maxCount: 6 }
]);


exports.resizeUserPhoto = async (req, res, next) => {
  
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpeg`
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next()
}

exports.resizeHotelPhotos = async (req, res, next) => {
  try {
    
    req.body.images = [];
    
    // Resize and save hotel images
    if (req.files && req.files.hotelPhotos) {
      await Promise.all(
        req.files.hotelPhotos.map(async (file, index) => {
          
          const filename = `${req.body.hotelname?.replace(/\s+/g, '-')}-${Date.now()}-${Math.round(Math.random() * 1E9)}-${index + 1}.jpeg`;

          await sharp(file.buffer)
            .resize(800, 600)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/hotels/${filename}`);
          
          req.body.images.push(filename);
        })
      );
    }

    // Save registrationDoc if it exists and is a PDF
    const docFile = req.files?.registrationDoc?.[0];
    if (docFile && docFile.mimetype === 'application/pdf') {
      const ext = docFile.mimetype.split('/')[1] || 'pdf';
      const filename = `${req.body.hotelname?.replace(/\s+/g, '-')}-${Date.now()}-registrationDoc.${ext}`;
      const filePath = `public/uploads/registration_files/${filename}`;

      await fs.writeFile(filePath, docFile.buffer); 

      req.body.registrationDocFilename = filename;
      // console.log(req.body);

      
    }

    next();
  } catch (err) {
    console.error('Error in resizeHotelPhotos middleware:', err);
    next(new AppError('File processing failed', 500));
  }
}