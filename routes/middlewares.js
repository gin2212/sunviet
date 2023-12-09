const jwt = require("jsonwebtoken");
const ResponseModel = require("../models/ResponseModel");
const Actions = require("../database/entities/authentication/Actions");
const Roles = require("../database/entities/authentication/Roles");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

async function authorize(req, res, next) {
  try {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
      const token = bearerHeader.split(" ")[1];
      const authorizedData = await jwt.verify(token, secretKey);
      if (authorizedData.user.role) {
        if (authorizedData.user.role.roleName == "SuperAdmin") {
          let actions = await Actions.find();
          req.actions = actions.map((x) => x.actionName);
        } else {
          let role = await Roles.findById(
            authorizedData.user.role._id
          ).populate("actions");
          req.actions = role.actions.map((x) => x.actionName);
        }
        req.userId = authorizedData.user._id;
        next();
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    let response = new ResponseModel(403, error.message, error);
    res.status(403).json(response);
  }
}

exports.authorize = authorize;
