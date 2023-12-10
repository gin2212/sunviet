const express = require("express");
const projectController = require("../controllers/projectController");
const router = express.Router();
const middlewares = require("./middlewares");

// Tạo project mới
router.post("/create", middlewares.authorize, projectController.createProject);

// Lấy danh sách tất cả các projects
router.get("/getAll", middlewares.authorize, projectController.getAllProjects);

// Lấy thông tin project theo ID
router.get(
  "/getById/:id",
  middlewares.authorize,
  projectController.getProjectById
);

// Cập nhật thông tin project
router.put(
  "/update/:id",
  middlewares.authorize,
  projectController.updateProject
);

// Xóa project
router.delete(
  "/delete/:id",
  middlewares.authorize,
  projectController.deleteProject
);

// Lấy danh sách projects theo trang
router.get(
  "/getPaging",
  middlewares.authorize,
  projectController.getPagingProjects
);

module.exports = router;
