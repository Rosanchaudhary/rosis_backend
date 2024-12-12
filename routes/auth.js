const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const AuthModel = require("../models/AuthModel");
const UserModel = require("../models/UserModel");

dotenv.config();
const router = express.Router();

/**
 * Utility function to validate passwords
 */
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Password must include at least one letter.");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must include at least one number.");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must include at least one special character.");
  }
  return errors;
}

/**
 * Register a new user
 */
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validate input fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existingUser = await AuthModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.accountType === "googlenopassword") {
        return res
          .status(401)
          .json({ message: "User is logged in with Google Sign-In." });
      }
      return res
        .status(401)
        .json({ message: "User already registered. Try signing in." });
    }

    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ message: passwordErrors.join(" ") });
    }

    // Hash password and save to AuthModel
    const hashedPassword = bcrypt.hashSync(password, 10);
    const authResponse = await AuthModel.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      accountType: "email",
    });

    // Create user in UserModel
    const userResponse = await UserModel.create({
      userId: authResponse._id,
      email: email.toLowerCase(),
      username: username,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: authResponse._id,
        spaceId: userResponse._id,
        isAdmin: authResponse.isAdmin,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "10d" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering user." });
  }
});

/**
 * Login a user
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Check if user exists
    const user = await AuthModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Verify account type
    if (user.accountType === "googlenopassword") {
      return res
        .status(401)
        .json({ message: "This account is linked to Google Sign-In." });
    }

    // Compare password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Fetch additional user information
    const userDetails = await UserModel.findOne({ userId: user._id });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        spaceId: userDetails._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "10d" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in." });
  }
});

module.exports = router;
