const express = require("express");
const router = express.Router();
const middlewares = require("./middlewares");
const roleController = require("../controllers/roleController");

router.post("/insert", middlewares.authorize, roleController.createRole);
router.put("/update/:id", middlewares.authorize, roleController.updateRole);
router.delete("/delete/:id", middlewares.authorize, roleController.deleteRole);
router.delete(
  "/deleteMany",
  middlewares.authorize,
  roleController.deleteManyRoles
);
router.get("/getAll", middlewares.authorize, roleController.getAllRoles);
router.get("/getPaging", middlewares.authorize, roleController.getPagingRoles);
router.get("/getById/:id", roleController.getRoleById);
router.get("/getMenuById/:id", roleController.getMenuById);
router.get(
  "/getManagementRole",
  middlewares.authorize,
  roleController.getRoleManagementPage
);

module.exports = router;
