import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  // 🔹 DELIVERY INFO (OPTIONAL - required only when winning)
  mobile: {
    type: String,
  },

  address: {
    type: String,
  },

  city: {
    type: String,
  },

  state: {
    type: String,
  },

  pincode: {
    type: String,
  },

  country: {
    type: String,
    default: "India",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

export default mongoose.model("User", userSchema);