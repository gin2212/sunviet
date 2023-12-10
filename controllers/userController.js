const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");
const Users = require("../database/entities/authentication/Users");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

async function login(req, res) {
  try {
    let user = await Users.findOne({ email: req.body.email }).populate("role");
    if (user) {
      if (user.activeStatus === 1) {
        if (
          user.password ==
          crypto
            .createHash("sha256", secretKey)
            .update(req.body.password)
            .digest("hex")
        ) {
          user.password = "";
          jwt.sign(
            { user },
            secretKey,
            { expiresIn: "4h" },
            async (err, token) => {
              if (err) {
                let response = new ResponseModel(-2, err.message, err);
                res.json(response);
              } else {
                let expiredAt = new Date(
                  new Date().setHours(new Date().getHours() + 4)
                );
                let response = new ResponseModel(1, "Login success!", {
                  user: user,
                  token: token,
                  expiredAt: expiredAt,
                });
                res.json(response);
              }
            }
          );
        } else {
          let response = new ResponseModel(2, "Wrong password!", null);
          res.json(response);
        }
      } else {
        let response = new ResponseModel(3, "Account has been locked", null);
        res.json(response);
      }
    } else {
      let response = new ResponseModel(4, "Account was not found", null);
      res.json(response);
    }
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function insertUser(req, res) {
  if (req.actions.includes("insertUser")) {
    try {
      let user = new Users(req.body);
      user.createdTime = Date.now();
      user.password = crypto
        .createHash("sha256", secretKey)
        .update(user.password)
        .digest("hex");
      await user.save(function (err, newUser) {
        if (err) {
          let response = new ResponseModel(-1, err.message, err);
          res.json(response);
        } else {
          newUser.password = "";
          let response = new ResponseModel(1, "Create user success!", newUser);
          res.json(response);
        }
      });
    } catch (error) {
      let response = new ResponseModel(404, error.message, error);
      res.status(404).json(response);
    }
  } else {
    res.sendStatus(403);
  }
}

async function register(req, res) {
  try {
    let user = new Users(req.body);
    user.createdTime = Date.now();
    user.password = crypto
      .createHash("sha256", secretKey)
      .update(user.password)
      .digest("hex");
    user.role = process.env.CUSTOMER_ROLE_ID;
    await user.save(function (err, newUser) {
      if (err) {
        let response = new ResponseModel(-1, err.message, err);
        res.json(response);
      } else {
        newUser.password = "";
        let response = new ResponseModel(1, "Create user success!", newUser);
        res.json(response);
      }
    });
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function getPaging(req, res) {
  if (req.actions.includes("getPagingUser")) {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;

    let searchObj = {};
    if (req.query.search) {
      searchObj = { email: { $regex: ".*" + req.query.search + ".*" } };
    }
    try {
      let users = await Users.find(searchObj)
        .skip(pageSize * pageIndex - pageSize)
        .limit(parseInt(pageSize))
        .populate("role")
        .sort({
          createdTime: "desc",
        });
      let count = await Users.find(searchObj).countDocuments();
      let totalPages = count;
      let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, users);
      res.json(pagedModel);
    } catch (error) {
      let response = new ResponseModel(404, error.message, error);
      res.status(404).json(response);
    }
  } else {
    res.sendStatus(403);
  }
}

async function getAllUsers(req, res) {
  if (req.actions.includes("getAllUsers")) {
    const users = await Users.find({}).populate("role");
    res.json(users);
  } else {
    res.sendStatus(403);
  }
}

async function getUserById(req, res) {
  if (req.actions.includes("getUserById")) {
    if (req.userId) {
      try {
        let user = await Users.findById(req.userId).populate("role");
        res.json(user);
      } catch (error) {
        let response = new ResponseModel(-2, error.message, error);
        res.json(response);
      }
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
}

async function deleteUser(req, res) {
  if (req.actions.includes("deleteUser")) {
    if (isValidObjectId(req.params.id)) {
      try {
        let tag = await Users.findByIdAndDelete(req.params.id);
        if (!tag) {
          let response = new ResponseModel(0, "No item found!", null);
          res.json(response);
        } else {
          let response = new ResponseModel(1, "Delete user success!", null);
          res.json(response);
        }
      } catch (error) {
        let response = new ResponseModel(404, error.message, error);
        res.status(404).json(response);
      }
    } else {
      res
        .status(404)
        .json(new ResponseModel(404, "UserId is not valid!", null));
    }
  } else {
    res.sendStatus(403);
  }
}

async function updateUser(req, res) {
  if (req.actions.includes("updateUser")) {
    try {
      let newUser = { updatedTime: Date.now(), ...req.body };
      if (newUser.password) {
        newUser.password = crypto
          .createHash("sha256", secretKey)
          .update(newUser.password)
          .digest("hex");
      }
      let updatedUser = await Users.findOneAndUpdate(
        { _id: req.params.id },
        newUser
      );
      if (!updatedUser) {
        let response = new ResponseModel(0, "No item found!", null);
        res.json(response);
      } else {
        let response = new ResponseModel(1, "Update user success!", newUser);
        res.json(response);
      }
    } catch (error) {
      let response = new ResponseModel(404, error.message, error);
      res.status(404).json(response);
    }
  } else {
    res.sendStatus(403);
  }
}

module.exports = {
  login,
  insertUser,
  getAllUsers,
  getUserById,
  register,
  deleteUser,
  updateUser,
  getPaging,
};
