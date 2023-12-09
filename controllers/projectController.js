const Projects = require("../database/entities/Project");
const ResponseModel = require("../models/ResponseModel");

// Tạo project mới
async function createProject(req, res) {
  try {
    const { projectName, description } = req.body;
    const createdBy = req.userId;

    const project = new Projects({
      projectName,
      description,
      createdBy,
    });

    await project.save();

    let response = new ResponseModel(1, "Create project success!", project);
    res.json(response);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

// Lấy danh sách tất cả các projects
async function getAllProjects(req, res) {
  try {
    let projects = await Projects.find({});
    res.json(projects);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

// Lấy thông tin project theo ID
async function getProjectById(req, res) {
  try {
    let project = await Projects.findById(req.params.id);
    res.json(project);
  } catch (error) {
    res.status(404).json(new ResponseModel(404, error.message, error));
  }
}

// Cập nhật thông tin project
async function updateProject(req, res) {
  try {
    const { projectName, description } = req.body;

    let updatedProject = await Projects.findOneAndUpdate(
      { _id: req.params.id },
      {
        projectName,
        description,
        updatedTime: Date.now(),
        updatedBy: req.userId,
      },
      { new: true }
    );

    if (!updatedProject) {
      let response = new ResponseModel(0, "No item found!", null);
      res.json(response);
    } else {
      let response = new ResponseModel(
        1,
        "Update project success!",
        updatedProject
      );
      res.json(response);
    }
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

// Xóa project
async function deleteProject(req, res) {
  try {
    const project = await Projects.findByIdAndDelete(req.params.id);

    if (!project) {
      let response = new ResponseModel(0, "No item found!", null);
      res.json(response);
    } else {
      let response = new ResponseModel(1, "Delete project success!", null);
      res.json(response);
    }
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

// Lấy danh sách projects theo trang
async function getPagingProjects(req, res) {
  try {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;

    let searchObj = {};
    if (req.query.search) {
      searchObj = {
        projectName: { $regex: ".*" + req.query.search + ".*", $options: "i" },
      };
    }

    let projects = await Projects.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .sort({
        createdTime: "desc",
      });

    let count = await Projects.find(searchObj).countDocuments();
    let totalPages = Math.ceil(count / pageSize);
    let response = new ResponseModel(1, "Get paging projects success!", {
      pageIndex,
      pageSize,
      totalPages,
      projects,
    });
    res.json(response);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getPagingProjects,
};
