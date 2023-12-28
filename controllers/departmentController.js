// departmentController.js
const Departments = require("../database/entities/Departments");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");

async function createDepartment(req, res) {
  try {
    let department = new Departments(req.body);
    department.createdBy = req.userId;

    await department.save();

    let response = new ResponseModel(
      1,
      "Create department success!",
      department
    );
    res.json(response);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function updateDepartment(req, res) {
  try {
    const newDepartment = {
      updatedTime: Date.now(),
      updatedBy: req.userId,
      ...req.body,
    };

    let updatedDepartment = await Departments.findOneAndUpdate(
      { _id: req.params.id },
      newDepartment
    );

    if (!updatedDepartment) {
      let response = new ResponseModel(0, "No item found!", null);
      res.json(response);
    } else {
      let response = new ResponseModel(
        1,
        "Update department success!",
        updatedDepartment
      );
      res.json(response);
    }
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function deleteDepartment(req, res) {
  try {
    const department = await Departments.findByIdAndDelete(req.params.id);

    if (!department) {
      let response = new ResponseModel(0, "No item found!", null);
      res.json(response);
    } else {
      let response = new ResponseModel(1, "Delete department success!", null);
      res.json(response);
    }
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function getAllDepartments(req, res) {
  try {
    let departments = await Departments.find({});
    res.json(departments);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function getPagingDepartments(req, res) {
  try {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;

    let searchObj = {};
    if (req.query.search) {
      searchObj = {
        departmentName: {
          $regex: ".*" + req.query.search + ".*",
          $options: "i",
        },
      };
    }

    let departments = await Departments.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .sort({
        createdTime: "desc",
      })
      .populate("createdBy", "fullName");

    let count = await Departments.find(searchObj).countDocuments();
    let totalPages = Math.ceil(count / pageSize);
    let pagedModel = new PagedModel(
      pageIndex,
      pageSize,
      totalPages,
      departments
    );
    res.json(pagedModel);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function getDepartmentById(req, res) {
  try {
    let department = await Departments.findById(req.params.id);
    res.json(department);
  } catch (error) {
    res.status(404).json(404, error.message, error);
  }
}

module.exports = {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllDepartments,
  getPagingDepartments,
  getDepartmentById,
};
