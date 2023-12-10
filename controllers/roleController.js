const { isValidObjectId } = require("mongoose");
const Roles = require("../database/entities/authentication/Roles");
const Users = require("../database/entities/authentication/Users");
const roleAction = require("../database/entities/authentication/RoleActions");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");

async function createRole(req, res) {
  if (req.actions.includes("createRole")) {
    try {
      const roleName = req.body.roleName;

      const existingRole = await Roles.findOne({ roleName });
      if (existingRole) {
        let response = new ResponseModel(0, "Role name already exists.", null);
        res.json(response);
        return;
      }

      let role = new Roles(req.body);
      role.createdTime = Date.now();
      const newRole = await role.save();

      const roleData = await Roles.findById(newRole._id).populate("actions");
      const transformedObject = {
        createdTime: roleData?.createdTime,
        actions: roleData?.actions?.map((action) => JSON.stringify(action)),
        roleName: roleData?.roleName,
      };
      await actionHistoryController.createActionHistory(
        "createRole",
        null,
        [transformedObject],
        req.userId
      );

      let response = new ResponseModel(1, "Create role success!", newRole);
      res.json(response);
    } catch (error) {
      let response = new ResponseModel(404, error.message, error);
      res.status(404).json(response);
    }
  } else {
    res.sendStatus(403);
  }
}

async function updateRole(req, res) {
  if (req.actions.includes("updateRole")) {
    try {
      const oldRole = await Roles.findOne({ _id: req.params.id }).populate(
        "actions"
      );
      let newRole = { updatedTime: Date.now(), user: req.userId, ...req.body };
      let updatedRole = await Roles.findOneAndUpdate(
        { _id: req.params.id },
        newRole
      );
      if (!updatedRole) {
        let response = new ResponseModel(0, "No item found!", null);
        res.json(response);
      } else {
        const roleDataNew = await Roles.findById(req.params.id).populate(
          "actions"
        );
        const transformedObjectNew = {
          createdTime: roleDataNew?.createdTime,
          actions: roleDataNew?.actions?.map((action) =>
            JSON.stringify(action)
          ),
          roleName: roleDataNew?.roleName,
        };

        const transformedObjectOld = {
          createdTime: oldRole?.createdTime,
          actions: oldRole?.actions?.map((action) => JSON.stringify(action)),
          roleName: oldRole?.roleName,
        };
        await actionHistoryController.createActionHistory(
          "updateRole",
          [transformedObjectOld],
          [transformedObjectNew],
          req.userId
        );

        let response = new ResponseModel(1, "Update role success!", newRole);
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
  if (req.actions.includes("deleteRole")) {
    if (isValidObjectId(req.params.id)) {
      try {
        const oldRole = await Roles.findOne({ _id: req.params.id }).populate(
          "actions"
        );
        const transformedObject = {
          createdTime: oldRole?.createdTime,
          actions: oldRole?.actions?.map((action) => JSON.stringify(action)),
          roleName: oldRole?.roleName,
        };
        const role = await Roles.findByIdAndDelete(req.params.id);
        if (!role) {
          let response = new ResponseModel(0, "No item found!", null);
          res.json(response);
        } else {
          await actionHistoryController.createActionHistory(
            "deleteRole",
            [transformedObject],
            null,
            req.userId
          );
          let response = new ResponseModel(1, "Delete role success!", null);
          res.json(response);
        }
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
async function deleteManyRoles(req, res) {
  if (req.actions.includes("deleteManyRoles")) {
    try {
      const roleIds = req.body.ids;

      if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
        res
          .status(400)
          .json(
            new ResponseModel(
              404,
              "Invalid request body. 'ids' array is required.",
              null
            )
          );
        return;
      }

      if (!roleIds.every(isValidObjectId)) {
        res
          .status(400)
          .json(
            new ResponseModel(404, "One or more roleIds are not valid!", null)
          );
        return;
      }

      const oldRoles = [];
      for (const roleId of roleIds) {
        const oldRole = await Roles.findOne({ _id: roleId }).populate(
          "actions"
        );
        const transformedObject = {
          createdTime: oldRole?.createdTime,
          actions: oldRole?.actions?.map((action) => JSON.stringify(action)),
          roleName: oldRole?.roleName,
        };
        oldRoles.push(transformedObject);
      }
      await actionHistoryController.createActionHistory(
        "deleteManyRoles",
        oldRoles,
        null,
        req.userId
      );

      const deleteResults = await Roles.deleteMany({ _id: { $in: roleIds } });

      if (deleteResults.deletedCount === 0) {
        res.json(
          new ResponseModel(0, "No role found for deletion!", deleteResults)
        );
      } else {
        res.json(
          new ResponseModel(1, "Roles deletion results:", deleteResults)
        );
      }
    } catch (error) {
      let response = new ResponseModel(404, error.message, error);
      res.status(404).json(response);
    }
  } else {
    res.sendStatus(403);
  }
}

async function getAllRoles(req, res) {
  if (req.actions.includes("getAllRoles")) {
    try {
      let roles = await Roles.find({});
      res.json(roles);
    } catch (error) {
      let response = new ResponseModel(404, error.message, error);
      res.status(404).json(response);
    }
  } else {
    res.sendStatus(403);
  }
}

async function getPagingRoles(req, res) {
  if (req.actions.includes("getPagingRoles")) {
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
        })
        .populate("actions");

      let count = await Roles.find(searchObj).countDocuments();
      let totalPages = count;
      let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, roles);
      res.json(pagedModel);
    } catch (error) {
      let response = new ResponseModel(404, error.message, error);
      res.status(404).json(response);
    }
  } else {
    res.sendStatus(403);
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

async function getMenuById(req, res) {
  if (isValidObjectId(req.params.id)) {
    try {
      const role = await Roles.findById(req.params.id);

      if (!role) {
        let response = new ResponseModel(0, "No item found!", null);
        return res.json(response);
      }
      if (role.roleName === "SuperAdmin") {
        const actionGroups = await Actions.distinct("actionGroup");
        return res.json({ actionGroups });
      } else {
        const actions = await Actions.find({ _id: { $in: role.actions } });
        const actionGroups = [
          ...new Set(actions.map((action) => action.actionGroup)),
        ];
        return res.json({ actionGroups });
      }
    } catch (error) {
      res.status(404).json(404, error.message, error);
    }
  } else {
    res.status(404).json(new ResponseModel(404, "RoleId is not valid!", null));
  }
}

async function getRoleManagementPage(req, res) {
  if (req.actions.includes("getRoleManagementPage")) {
    const pageSize = req.query.pageSize || 10;
    const pageIndex = req.query.pageIndex || 1;

    const searchObj = {};

    try {
      //PagingRole
      let rolesPag = await Roles.find(searchObj)
        .skip(pageSize * pageIndex - pageSize)
        .limit(parseInt(pageSize))
        .sort({
          createdTime: "desc",
        })
        .populate("actions");

      let count = await Roles.find(searchObj).countDocuments();
      let totalPages = count;
      let pagedModel = new PagedModel(
        pageIndex,
        pageSize,
        totalPages,
        rolesPag
      );

      //getAllRole
      let roles = await Roles.find({});
      //getAllAction
      let actions = await Actions.find({});
      res.json({ dataPage: pagedModel, roles, actions });
    } catch (error) {
      const response = new ResponseModel(404, error.message, error);
      res.status(404).json(response);
    }
  } else {
    res.sendStatus(403);
  }
}

module.exports = {
  createRole,
  deleteRole,
  deleteManyRoles,
  getAllRoles,
  getPagingRoles,
  getRoleById,
  updateRole,
  getMenuById,
  getRoleManagementPage,
};
