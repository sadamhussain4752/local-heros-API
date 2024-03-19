const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/UserModel/User");
const Admin = require("../../models/UserModel/Admin");
const transporter = require("../../utils/emailConfig");
const { v4: uuidv4 } = require("uuid");
const twilio = require("twilio");

const RESPONSE_MESSAGES = {
  EMAIL_TAKEN: "Email is already taken",
  MOBILE_TAKEN: "Mobile number is already taken",
  USERNAME_TAKEN: "Username is already taken",
  SERVER_ERROR: "Server error",
};

// Generate a unique token using uuid
const generateToken = () => {
  return uuidv4();
};

// Function to check if a field is already taken
const isFieldTaken = async (field, value, errorMessage) => {
  const existingUser = await User.findOne({ [field]: value });
  if (existingUser) {
    return { success: false, error: errorMessage };
  }
  return null;
};

// Send reset email
const sendResetEmail = async (userEmail, resetToken) => {
  const resetLink = `http://localhost:5000/reset?token=${resetToken}`;

  const mailOptions = {
    from: "sadamimsolutions@gmail.com",
    to: userEmail,
    subject: "Password Reset",
    text: `Click the following link to reset your password: ${resetLink}`,
  };

  await transporter.sendMail(mailOptions);
};

// Send reset email
const sendVerificationEmail = async (email) => {
  const mailOptions = {
    from: "sadamimsolutions@gmail.com",
    to: email,
    subject: "Account Verification",
    html: "<p>Thank you for registering! Please click the link to verify your account.</p>",
  };
  await transporter.sendMail(mailOptions);
};
const updateUser = async (userId, updateData) => {
  try {
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    console.error(`Error updating user: ${error.message}`);
    throw error;
  }
};

const updateAdmin = async (adminId, updateData) => {
  try {
    return await Admin.findOneAndUpdate({ admin_id: adminId }, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    console.error(`Error updating admin: ${error.message}`);
    throw error;
  }
};

// Function to send a verification SMS using Twilio
async function sendVerificationSMS(phoneNumber) {
  const accountSid = "AC7293676e0655bebc9648970017499691";
  const authToken = "4212c70cf0532c43e0aba25c99bdd406";
  const client = new twilio(accountSid, authToken);

  const verificationCode = generateVerificationCode(); // Implement your own function to generate a verification code

  try {
    // console.log({
    //   body: `Your verification code: ${verificationCode}`,
    //   from: "+12296007432",  // Ensure the phone number is in E.164 format
    //   to: phoneNumber,
    // })
    await client.messages.create({
      body: `Your verification code: ${verificationCode}`,
      from: "+12296007432", // Ensure the phone number is in E.164 format
      to: phoneNumber,
    });

    console.log("Verification SMS sent successfully");
    return verificationCode;
  } catch (err) {
    console.error("Error sending verification SMS:", err);
  }
}

// Function to generate a random verification code (replace this with your own logic)
function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

module.exports = {
  login: async (req, res) => {
    const { email, password, mobilenumber } = req.body;

    try {
      // Find user by username
      const errors = validationResult(req);
      if (mobilenumber) {
        if (!errors.isEmpty()) {
          return res
            .status(400)
            .json({ success: false, errors: errors.array() });
        }
      }

      const user = await User.findOne(
        mobilenumber ? { mobilenumber } : { email }
      );

      // Check if user exists
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
      // Check if user exists
      if (!user.verified || !user.OTPNumber || user.UserType === "3") {
        // Send verification code via Twilio SMS
        let updateOTP = await sendVerificationSMS(`+91${user.mobilenumber}`); // Assuming phoneNumber is a property of your User model
        // Save the reset token and its expiration time in the user document
        user.OTPNumber = updateOTP;
        await user.save();
        return res.status(401).json({
          success: false,
          message: "Verification SMS sent successfully",
        });
      }

      // Check password
      if (!mobilenumber) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res
            .status(401)
            .json({ success: false, message: "Invalid credentials" });
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { email: user.email, userId: user._id, UserType: user.UserType },
        "your-secret-key",
        { expiresIn: "1h" }
      );

      res
        .status(200)
        .json({
          success: true,
          token,
          userId: user._id,
          UserType: user.UserType,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  register: async (req, res) => {
    try {
      let newAdmin;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        firstname,
        lastname,
        email,
        password,
        mobilenumber,
        UserType,
        storename,
        storeaddress,
        storetimming,
        lat,
        log,
        lang,
      } = req.body;

      const emailTaken = await isFieldTaken(
        "email",
        email,
        RESPONSE_MESSAGES.EMAIL_TAKEN
      );
      if (emailTaken) return res.status(400).json(emailTaken);

      const mobileTaken = await isFieldTaken(
        "mobilenumber",
        mobilenumber,
        RESPONSE_MESSAGES.MOBILE_TAKEN
      );
      if (mobileTaken) return res.status(400).json(mobileTaken);

      const usernameTaken = await isFieldTaken(
        "firstname",
        firstname,
        RESPONSE_MESSAGES.USERNAME_TAKEN
      );
      if (usernameTaken) return res.status(400).json(usernameTaken);

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateVerificationCode();

      const newUser = await User.create({
        firstname,
        lastname,
        UserType,
        mobilenumber,
        email,
        password: hashedPassword,
        username: firstname,
        lang,
        OTPNumber: otp, // Save the generated OTP in the user document
      });

      if (UserType === "2") {
        newAdmin = await Admin.create({
          storename,
          storeaddress,
          admin_id: newUser._id,
          storetimming,
          lat,
          log,
        });
      }

      // Send OTP via Twilio SMS
      await sendVerificationSMS(`+91${mobilenumber}`, otp);

      const response = {
        success: true,
        user: newUser,
      };

      if (newAdmin) {
        response.admin = newAdmin;
      }

      res.status(201).json(response);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, error: RESPONSE_MESSAGES.SERVER_ERROR });
    }
  },
  listUsers: async (req, res) => {
    try {
      // Fetch all users
      const users = await User.find();
      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  getUsers: async (req, res) => {
    try {
      // Extract usertype and lang from query parameters
      const { UserType, lang } = req.query;

      // Construct the filter object based on provided parameters
      const filter = {};
      if (UserType) filter.UserType = UserType;
      if (lang) filter.lang = lang;

      // Fetch users based on the filter
      const users = await User.find(filter);

      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  forgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Generate a unique reset token
      const resetToken = generateToken();

      // Save the reset token and its expiration time in the user document
      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
      await user.save();

      // Send reset email
      await sendResetEmail(user.email, resetToken);

      res
        .status(200)
        .json({ success: true, message: "Password reset email sent" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  listAdmins: async (req, res) => {
    try {
      const admins = await Admin.find();
      res.status(200).json({ success: true, admins });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
  requestUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { mobilenumber } = req.body;
      const user = await User.findOne({ mobilenumber });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Send verification code via Twilio SMS
      const updateOTP = await sendVerificationSMS(`+91${user.mobilenumber}`);
      // Save the OTP in the user document
      user.OTPNumber = updateOTP;
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "Verification SMS sent successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
  verifyUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, mobilenumber, otp } = req.body;
      const user = await User.findOne(
        mobilenumber ? { mobilenumber } : { email }
      );

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (user.OTPNumber !== Number(otp)) {
        return res.status(401).json({ success: false, message: "Invalid OTP" });
      }

      // Reset the OTP after successful verification
      user.OTPNumber = null;
      user.verified = true;
      await user.save();

      return res
        .status(200)
        .json({
          success: true,
          message: "OTP verified successfully",
          userId: user._id,
          UserType: user.UserType,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
  AdminsListDes: async (req, res) => {
    try {
      const admins = await Admin.find();

      var adminsWithData = await Promise.all(
        admins.map(async (admin) => {
          const userData = await User.findById(admin.admin_id);
          admin["admin_id"] = userData;
          console.log(userData);
          return admin;
        })
      );

      res.status(200).json({ success: true, admins: adminsWithData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  deleteAdmin: async (req, res) => {
    try {
      const adminId = req.params.id;

      // Check if the admin with the given ID exists
      const adminToDelete = await Admin.findById(adminId);

      if (!adminToDelete) {
        return res
          .status(404)
          .json({ success: false, error: "Admin not found" });
      }

      // Check if the associated user with the given ID exists
      const userToDelete = await User.findById(adminToDelete.admin_id);

      if (!userToDelete) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      // Delete the admin and associated user
      await Admin.deleteOne({ _id: adminId });
      await User.deleteOne({ _id: adminToDelete.admin_id });

      res.status(200).json({
        success: true,
        message: "Admin and associated user deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const adminId = req.params.id;

      // Check if the admin with the given ID exists
      const adminToDelete = await User.findById(adminId);

      if (!adminToDelete) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      // Delete the admin and associated user
      await User.deleteOne({ _id: adminId });

      res.status(200).json({
        success: true,
        message: "User and associated user deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
  userGetById: async (req, res) => {
    try {
      const userId = req.params.id;

      // Check if the user with the given ID exists
      const userData = await User.findById(userId);

      if (!userData) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }
      // Check if user exists
      if (!userData?.verified) {
        return res
          .status(401)
          .json({ success: false, message: "Account not Verified" });
      }

      res.status(200).json({
        success: true,
        User: userData,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
  updateAdmin: async (req, res) => {
    try {
      const adminId = req.params.id;
      const updateData = req.body;

      const userToUpdate = await User.findById(adminId);

      if (!userToUpdate) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      if (userToUpdate.UserType === "2") {
        const updatedAdmin = await updateAdmin(adminId, updateData);

        if (!updatedAdmin) {
          return res
            .status(404)
            .json({ success: false, error: "Admin not found" });
        }

        const updatedUser = await updateUser(adminId, updateData);

        const response = {
          success: true,
          user: updatedUser,
        };

        if (updatedAdmin) {
          response.admin = updatedAdmin;
        }

        res.status(201).json(response);
      } else {
        const updatedUser = await updateUser(adminId, updateData);
        res.status(200).json({ success: true, user: updatedUser });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  updateUsers: async (req, res) => {
    try {
      const UserId = req.params.id;
      const updateData = req.body;

      const userToUpdate = await User.findById(UserId);

      if (!userToUpdate) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      if (userToUpdate.UserType === "2") {
        const updatedAdmin = await updateAdmin(UserId, updateData);

        if (!updatedAdmin) {
          return res
            .status(404)
            .json({ success: false, error: "User not found" });
        }

        const updatedUser = await updateUser(UserId, updateData);

        const response = {
          success: true,
          user: updatedUser,
        };

        if (updatedAdmin) {
          response.admin = updatedAdmin;
        }

        res.status(201).json(response);
      } else {
        const updatedUser = await updateUser(UserId, updateData);
        res.status(200).json({ success: true, user: updatedUser });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },
};
