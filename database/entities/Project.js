require("../database");
const mongoose = require("mongoose");

const { Schema } = mongoose;

let projectsSchema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    createdTime: {
      type: Date,
      default: Date.now,
    },
    updatedTime: {
      type: Date,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Projects", projectsSchema);
