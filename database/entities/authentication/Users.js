require("../../database");
const mongoose = require("mongoose");

const { Schema } = mongoose;

let userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      default: "unknown",
    },
    avatar: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    createdTime: {
      type: Date,
      default: Date.now,
    },
    updatedTime: {
      type: Date,
    },
    role: { type: Schema.Types.ObjectId, ref: "Roles" },
    activeStatus: {
      type: Number,
    },
    department: { type: Schema.Types.ObjectId, ref: "Departments" },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Users", userSchema);
