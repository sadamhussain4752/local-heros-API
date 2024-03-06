const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require("path");

const storage = new Storage({
  keyFilename: path.join(__dirname, '..', 'file', 'email-js-1a09b-firebase-adminsdk-ensw9-93ddb0e54d.json'),
  projectId: 'email-js-1a09b',
});

const bucketName = 'email-js-1a09b.appspot.com';
const bucket = storage.bucket(bucketName);

const multerMemoryStorage = multer.memoryStorage();

const localUploadArray = multer({
  storage: multerMemoryStorage,
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error('Only .png, .jpg, and .jpeg formats are allowed!');
      err.name = 'ExtensionError';
      return cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalname = file.originalname;
    const ext = path.extname(originalname);
    const newFilename = uniqueSuffix + ext;
    cb(null, newFilename);
  },
}).any('images');

const uploadHandler = (req, res, next) => {
  localUploadArray(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, error: 'Multer error', details: err.message });
    }

    const uploadPromises = req.files.map(file => new Promise((resolve, reject) => {
      console.log(`Processing file: ${file.originalname}`);
      console.log(`File size: ${file.size} bytes`);

      const folderName = 'localHeros/';
      const newFileName = Date.now() + '-' + Math.round(Math.random() * 1E9);

      const destination = `${folderName}${newFileName}`;

      // Create a writable stream and upload the buffer
      const fileStream = bucket.file(destination).createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Handle stream events
      fileStream.on('error', (error) => {
        console.error('Error uploading to Google Cloud Storage:', error);
        reject(error);
      });

      fileStream.on('finish', () => {
        console.log('File upload complete.');
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
        req.fileUrls = req.fileUrls || [];
        req.fileUrls.push(publicUrl);
        resolve();
      });

      // Pipe the buffer to the stream
      fileStream.end(file.buffer);
    }));

    // Wait for all uploads to complete
    try {
      await Promise.all(uploadPromises);
      console.log('All files uploaded successfully.');
      next();
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error });
    }
  });
};

module.exports = { uploadHandler };
