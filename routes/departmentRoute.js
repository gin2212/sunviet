const express = require("express");
const departmentController = require("../controllers/departmentController");
const router = express.Router();
const middlewares = require("./middlewares");

router.post(
  "/departments/create",
  middlewares.authorize,
  departmentController.createDepartment
);
router.put(
  "/departments/update/:id",
  middlewares.authorize,
  departmentController.updateDepartment
);
router.delete(
  "/departments/delete/:id",
  middlewares.authorize,
  departmentController.deleteDepartment
);
router.get(
  "/departments/getAll",
  middlewares.authorize,
  departmentController.getAllDepartments
);
router.get(
  "/departments/getById/:id",
  middlewares.authorize,
  departmentController.getDepartmentById
);
router.get(
  "/departments/getPaging",
  middlewares.authorize,
  departmentController.getPagingDepartments
);

module.exports = router;
