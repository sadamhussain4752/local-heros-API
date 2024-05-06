// app.js
const functions = require("firebase-functions");
const express = require("express");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
require('dotenv').config();

const cors = require("cors"); // Import cors middleware
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const UserController = require("./routes/UserRoutes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes/categoryRoutes");
const brandRoutes = require("./routes/BrandRoutes/brandRoutes");
const productRoutes = require("./routes/ProductRoutes/productRoutes");
const couponRoutes = require("./routes/couponRoutes/CouponRouter");
const addressRoutes = require("./routes/AddressRoutes/addressRoutes");
const addcartRoutes = require("./routes/AddCartRoutes/addCartRoutes");
const orderRoutes = require("./routes/OrderRoutes/orderRoutes");
const BannerRoutes = require("./routes/BannerRouters/BannerRoutes");
const EmployeeRoutes = require("./routes/AddEmployess/addEmployeesRoutes")
const FAQRoutes = require("./routes/AddFaqRoutes/faqRoutes")

// const files = fs.readFileSync('./62ACF8182B9E5DCCC1E610CE4B2C525F.txt') 

const app = express();
// Use cors middleware
app.use(cors());


// Use express.static to serve static files (including images)
app.use(express.static(path.join(__dirname, "./../uploads")));

const port = process.env.PORT || 5000;


try {
  mongoose.connect(
    'mongodb+srv://sadam:YjV45hMBCaIoyVoH@cluster0.qxyasba.mongodb.net/?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  console.log('MongoDB connected successfully');
} catch (error) {
  console.error('Error connecting to MongoDB:', error.message);
  // Handle the error as needed, e.g., terminate the application or take other corrective actions.
}
const SES_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
};


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "noreply@imsolutions.mobi",
    pass: "ssfnuabpmshuhlwj",
  },
});

// Function to validate email
function validateEmail(email) {
  // Using a more comprehensive regular expression for email validation
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Function to validate mobile number
function validateMobile(phone) {
  // Assuming phone number should contain only digits and be of a certain length
  const regex = /^\d{10}$/;
  return regex.test(phone);
}


// Additional setup, if any

app.use(bodyParser.json());

// Use routes

app.use("/api/auth", authRoutes);
app.use("/api/user", UserController);
app.use("/api/category", categoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/product", productRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/addcart", addcartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/header", BannerRoutes);
app.use("/api/staff", EmployeeRoutes);
app.use("/api/faq", FAQRoutes);

app.post("/local-heros-submit-form", (req, res) => {
  const { name, email, pinCode, phone, productName, quantity, message } = req.body;

  const subjects = pinCode !== undefined ? `Bulk Order for ${productName}` : "Local Heros";

  // Validate email and phone number
  if (!validateEmail(email)) {
    return res.status(400).send("Invalid email address");
  }

  if (!validateMobile(phone)) {
    return res.status(400).send("Invalid phone number");
  }

  const emailContent = pinCode !== undefined ? `
    <p>Name: ${name}</p>
    <p>Email: ${email}</p>
    <p>Pin Code: ${pinCode}</p>
    <p>Phone: ${phone}</p>
    <p>Product Name: ${productName}</p>
    <p>Quantity: ${quantity}</p>
    <table cellspacing="0" cellpadding="0" style="width:100%; border-bottom:1px solid #eee; font-size:12px; line-height:135%">
        <!-- ... (same as PHP code) ... -->
    </table>
  ` : `
  <p>Name: ${name}</p>
  <p>Email: ${email}</p>
  <p>Phone: ${phone}</p>
  <p>Message: ${message}</p>
  <table cellspacing="0" cellpadding="0" style="width:100%; border-bottom:1px solid #eee; font-size:12px; line-height:135%">
      <!-- ... (same as PHP code) ... -->
  </table>
`;

  const mailOptions = {
    from: `${subjects} <noreply@localheros.in>`,
    to: [
      "info@imsolutions.mobi",
      // "shashi@localheros.in",
      // "sadamdon4752@gmail.com"
     // "sadam@imsolutions.mobi"
    ],
    subject: subjects,
    html: emailContent,
  };
  const AWS_SES = new AWS.SES(SES_CONFIG);

  const sendEmail = async (recipientEmail) => {
    let params = {
      Source: "noreply@localheros.in", // Replace YOUR_CUSTOM_DOMAIN with your custom domain verified in SES
      Destination: {
        ToAddresses: [
          //"info@imsolutions.mobi",
          "shashi@localheros.in",
          //"sadamdon4752@gmail.com"
          //"sadam@imsolutions.mobi"
        ],
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `${emailContent}`,
          },

        },
        Subject: {
          Charset: 'UTF-8',
          Data: `${subjects}`,
        }
      },
    };

    try {
      const emailres = await AWS_SES.sendEmail(params).promise();
      console.log('Email has been sent!', emailres);
      res.status(200).send("Email sent successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

  sendEmail(mailOptions.to);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Email sent successfully");
    }
  });
});


// Additional routes or middleware, if any

// app.get("/.well-known/pki-validation/7A4BF23AF4370A8CB30130005F7212B3.txt", (req, res) => {
//   const filePath = '/home/ubuntu/winterbear/winterbear/7A4BF23AF4370A8CB30130005F7212B3.txt';
//   res.sendFile(filePath);
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// exports.backend = functions.https.onRequest(app);


// const express = require('express');
// const nodemailer = require('nodemailer');
// const bodyParser = require('body-parser');
// const cors = require("cors"); // Import cors middleware


// const app = express();
// const port = 3000;
// app.use(cors());


// app.use(bodyParser.json()); // Use bodyParser.json() instead of bodyParser.urlencoded()
// app.use(express.static('public')); // Serve static files from 'public' directory

// // Email configuration
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     auth: {
//         user: "noreply@imsolutions.mobi",
//         pass: "ssfnuabpmshuhlwj"
//     }
// });

// // Function to validate email
// function validateEmail(value) {
//     const regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
//     return value === '' ? false : !regex.test(value);
// }

// // Function to validate mobile number
// function validateMobile(phone) {
//     return "";
// }

// app.post('/submit-form', (req, res) => {
//     const { name, email, phone, message } = req.body;
//     const subject = 'Enquiry from Bengal Lamps Bangalore';

//     // // Validation logic
//     // if (!name || !email || !phone || !message) {
//     //     return res.status(400).send('All fields are required');
//     // }

//     // if (!validateMobile(phone)) {
//     //     return res.status(400).send('Enter a valid 10-digit mobile number');
//     // }

//     // if (!validateEmail(email)) {
//     //     return res.status(400).send('Enter a valid email address');
//     // }

//     const emailContent = `
//     <p>Name: ${name}</p>
//     <p>Email: ${email}</p>
//     <p>Phone: ${phone}</p>
//     <p>Message: ${message}</p>
//     <table cellspacing="0" cellpadding="0" style="width:100%; border-bottom:1px solid #eee; font-size:12px; line-height:135%">
//         <!-- ... (same as PHP code) ... -->
//     </table>
// `;

//     // Email options
//     const mailOptions = {
//         from: 'Bengal Lamps Bangalore <noreply@ims.a2hosted.com>',
//         to: ['sadamdon4752@gmail.com'],
//         subject: subject,
//         html: emailContent
//     };

//     // Send email
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error(error);
//             res.status(500).send('Internal Server Error');
//         } else {
//             console.log('Email sent: ' + info.response);
//             res.status(200).send('Email sent successfully');
//         }
//     });
// });

// app.listen(port, () => {
//     console.log(`Server is running at http://localhost:${port}`);
// });


