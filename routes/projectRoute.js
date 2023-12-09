const express = require("express");
const projectController = require("../controllers/projectController");
const router = express.Router();
const middlewares = require("./middlewares");

// Tạo project mới
router.post(
  "/projects/create",
  middlewares.authorize,
  projectController.createProject
);

// Lấy danh sách tất cả các projects
router.get(
  "/projects/getAll",
  middlewares.authorize,
  projectController.getAllProjects
);

// Lấy thông tin project theo ID
router.get(
  "/projects/getById/:id",
  middlewares.authorize,
  projectController.getProjectById
);

// Cập nhật thông tin project
router.put(
  "/projects/update/:id",
  middlewares.authorize,
  projectController.updateProject
);

// Xóa project
router.delete(
  "/projects/delete/:id",
  middlewares.authorize,
  projectController.deleteProject
);

// Lấy danh sách projects theo trang
router.get(
  "/projects/getPaging",
  middlewares.authorize,
  projectController.getPagingProjects
);

module.exports = router;
