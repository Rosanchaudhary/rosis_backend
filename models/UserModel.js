const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
  },
  profileUrl: {
    type: String,
    default:
      "https://www.shutterstock.com/shutterstock/photos/1725655669/display_1500/stock-vector-default-avatar-profile-icon-vector-social-media-user-image-1725655669.jpg",
  },
  authType: {
    type: String,
    enum: ["email", "googlenopassword", "googlepassword"],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
