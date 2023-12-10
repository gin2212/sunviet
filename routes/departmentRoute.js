const express = require("express");
const departmentController = require("../controllers/departmentController");
const router = express.Router();
const middlewares = require("./middlewares");

router.post(
  "/create",
  middlewares.authorize,
  departmentController.createDepartment
);
router.put(
  "/update/:id",
  middlewares.authorize,
  departmentController.updateDepartment
);
router.delete(
  "/delete/:id",
  middlewares.authorize,
  departmentController.deleteDepartment
);
router.get(
  "/getAll",
  middlewares.authorize,
  departmentController.getAllDepartments
);
router.get(
  "/getById/:id",
  middlewares.authorize,
  departmentController.getDepartmentById
);
router.get(
  "/getPaging",
  middlewares.authorize,
  departmentController.getPagingDepartments
);

module.exports = router;
