const { isValidObjectId } = require("mongoose");
const Roles = require("../database/entities/authentication/Roles");
const Users = require("../database/entities/authentication/Users");
const roleAction = require("../database/entities/authentication/RoleActions");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");

async function createRole(req, res) {
  if (req.actions.includes("role")) {
    try {
      let role = new Roles(req.body);
      role.createdTime = Date.now();
      await role.save((err, newRole) => {
        if (err) {
          let response = new ResponseModel(-2, err.message, err);
          res.json(response);
        } else {
          let response = new ResponseModel(1, "Create role success!", newRole);
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

async function updateRole(req, res) {
  if (req.actions.includes("role")) {
    try {
      let newRole = { updatedTime: Date.now(), user: req.userId, ...req.body };
      let updatedRole = await Roles.findOneAndUpdate(
        { _id: req.params.id },
        newRole
      );
      if (!updatedRole) {
        let response = new ResponseModel(0, "No item found!", null);
        res.json(response);
      } else {
        let response = new ResponseModel(1, "Update banner success!", newRole);
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

async function deleteRole(req, res) {
  if (req.actions.includes("role")) {
    if (isValidObjectId(req.params.id)) {
      try {
        const user = await Users.find({ role: req.params.id });

        if (user.length > 0) {
          let response = new ResponseModel(0, "Quyền đang được sử dụng", null);
          return res.json(response);
        }

        const roleActions = await roleAction.find({ role: req.params.id });
        if (roleActions.length > 0) {
          for (const roleAction of roleActions) {
            await roleAction.remove();
          }
        }

        const role = await Roles.findByIdAndDelete(req.params.id);

        if (!role) {
          let response = new ResponseModel(0, "No item found!", null);
          return res.json(response);
        }

        let response = new ResponseModel(1, "Delete role success!", null);
        res.json(response);
      } catch (error) {
        let response = new ResponseModel(404, error.message, error);
        res.status(404).json(response);
      }
    } else {
      res
        .status(404)
        .json(new ResponseModel(404, "RoleId is not valid!", null));
    }
  } else {
    res.sendStatus(403);
  }
}

async function getAllRoles(req, res) {
  try {
    let roles = await Roles.find({});
    res.json(roles);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function getPagingRoles(req, res) {
  let pageSize = req.query.pageSize || 10;
  let pageIndex = req.query.pageIndex || 1;

  let searchObj = {};
  if (req.query.search) {
    searchObj = { roleName: { $regex: ".*" + req.query.search + ".*" } };
  }
  try {
    let roles = await Roles.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .sort({
        createdTime: "desc",
      });
    let count = await Roles.find(searchObj).countDocuments();
    let totalPages = count;
    let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, roles);
    res.json(pagedModel);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function getRoleById(req, res) {
  if (isValidObjectId(req.params.id)) {
    try {
      let role = await Roles.findById(req.params.id);
      res.json(role);
    } catch (error) {
      res.status(404).json(404, error.message, error);
    }
  } else {
    res
      .status(404)
      .json(new ResponseModel(404, "BannerId is not valid!", null));
  }
}

module.exports = {
  createRole,
  deleteRole,
  getAllRoles,
  getPagingRoles,
  getRoleById,
  updateRole,
};
