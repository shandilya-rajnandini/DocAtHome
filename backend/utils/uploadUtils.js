const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const createUploadDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage configuration for different file types
const createStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join('uploads', destination);
      createUploadDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const basename = path.basename(file.originalname, extension);
      cb(null, `${basename}-${uniqueSuffix}${extension}`);
    }
  });
};

// File filter for medical documents
const medicalFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/dicom', // For DICOM files
    'application/octet-stream' // For other medical formats
  ];

  const allowedExtensions = [
    '.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.txt', '.dcm', '.dicom'
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.originalname}. Only PDF, images, and documents are allowed.`), false);
  }
};

// General file filter
const generalFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'video/mp4',
    'video/avi',
    'video/mov'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.originalname}`), false);
  }
};

// Upload configurations
const medicalReportsUpload = multer({
  storage: createStorage('medical-reports'),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // Maximum 10 files
  },
  fileFilter: medicalFileFilter
});

const secondOpinionUpload = multer({
  storage: createStorage('second-opinions'),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 20 // Maximum 20 files for second opinions
  },
  fileFilter: medicalFileFilter
});

const videoResponseUpload = multer({
  storage: createStorage('video-responses'),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for videos
    files: 1 // Only one video file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for responses'), false);
    }
  }
});

const generalUpload = multer({
  storage: createStorage('general'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: generalFileFilter
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 50MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

module.exports = {
  medicalReportsUpload,
  secondOpinionUpload,
  videoResponseUpload,
  generalUpload,
  handleMulterError,
  createUploadDir
};