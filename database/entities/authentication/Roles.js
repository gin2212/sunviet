require("../../database");
const mongoose = require("mongoose");

const { Schema } = mongoose;

let roleSchema = new Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
    },
    actions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Actions",
      },
    ],
    roleIndex: {
      type: Number,
      require: true,
      default: 99,
    },
    createdTime: {
      type: Date,
      default: Date.now,
    },
    updatedTime: {
      type: Date,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Roles", roleSchema);
