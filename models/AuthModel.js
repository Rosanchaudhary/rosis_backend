const mongoose = require("mongoose");

// Define the auth schema
const authSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  accountType: {
    type: String,
    enum: ["email", "googlenopassword", "googlepassword"],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  }
});


module.exports = mongoose.model("Auth", authSchema);
