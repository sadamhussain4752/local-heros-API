// firebase/firebaseSetup.js
const admin = require('firebase-admin');
const serviceAccount = require('../file/email-js-1a09b-firebase-adminsdk-ensw9-93ddb0e54d.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://email-js-1a09b.appspot.com',
  });

const bucket = admin.storage().bucket();

// Multer middleware for handling file uploads to Firebase Storage
const firebaseMulterHandler = (req, res, next) => {
    console.log(req, req.file, next);
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const uploadPromises = req.files.map((file) => {
    const blob = bucket.file(file.filename);
    const blobStream = blob.createWriteStream();

    return new Promise((resolve, reject) => {
      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        req.fileUrls = req.fileUrls || [];
        req.fileUrls.push(publicUrl);
        resolve();
      });

      blobStream.on('error', (error) => {
        reject(`Unable to upload file: ${error}`);
      });

      blobStream.end(file.buffer);
    });
  });

  Promise.all(uploadPromises)
    .then(() => next())
    .catch((error) => res.status(500).json({ error }));
};

module.exports = { firebaseMulterHandler };
