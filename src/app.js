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
// For exposing local server publicly

// const files = fs.readFileSync('./62ACF8182B9E5DCCC1E610CE4B2C525F.txt') 

const app = express();
// Use cors middleware
app.use(cors());


// Use express.static to serve static files (including images)
app.use(express.static(path.join(__dirname, "./../uploads")));

const port = process.env.PORT || 4000;


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
// // Redirect HTTP to HTTPS and enforce domain redirection to localheros.in
// app.use((req, res, next) => {
//   const host = req.headers.host;
  
//   // Check if the request is not using HTTPS or not hitting the correct domain
//   if (req.protocol !== "https" || host !== "localheros.in") {
//     return res.redirect(301, `https://localheros.in`);
//   }

//   // If everything is correct, proceed with the request
//   next();
// });

// // Define root route for the API
// app.get("/", (req, res) => {
//   res.send("Welcome to the API! Available routes are /api/auth, /api/user, etc.");
// });

// Handle undefined routes (404)
// app.use((req, res, next) => {
//   res.status(404).send("Sorry, that route does not exist.");
// });
// Webhook endpoint to receive requests
app.post('/menu-push', (req, res) => {
  console.log('Webhook Event Received:', req.body);
  res.status(200).send('Webhook Event Received Successfully');
});




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
      // "info@imsolutions.mobi",
      // "shashi@localheros.in",
      // "sadamdon4752@gmail.com"
     "sadam@imsolutions.mobi"
    ],
    subject: subjects,
    html: emailContent,
  };

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

// Start listening on the defined port
app.listen(port, async () => {
  console.log(`Listening for events on http://localhost:${port}`);

  // // Use ngrok to expose the local server publicly
  // const url = await ngrok.connect(port);
  // console.log(`Public URL via ngrok: ${url}`);
});
// exports.backend = functions.https.onRequest(app);


