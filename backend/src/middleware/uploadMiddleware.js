const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage for CSV file parsing (processed in-memory without leftover temp files)
const csvMemoryStorage = multer.memoryStorage();

const csvFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.csv' || file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only CSV (.csv) files are allowed for bulk import.'), false);
  }
};

const uploadCsv = multer({
  storage: csvMemoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for CSV
  fileFilter: csvFileFilter,
});

// Disk storage for project documents (PDF/DOCX max 10MB)
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  },
});

const documentFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.docx', '.doc'];
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX/DOC files up to 10MB are permitted.'), false);
  }
};

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB strict limit
  fileFilter: documentFileFilter,
});

module.exports = {
  uploadCsv,
  uploadDocument,
};
