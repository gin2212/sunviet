const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const middlewares = require("./middlewares");
const multer = require("multer");
const fs = require("fs");
const slugify = require("slugify");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (fs.existsSync(`public/images`)) {
      cb(null, `public/images`);
    } else {
      fs.mkdir(`public/images`, (err) => {
        if (err) {
          return console.error(err);
        }
        console.log("Directory created successfully!");
        cb(null, `public/images`);
      });
    }
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname;
    const filename = `${slugify(originalname, { lower: true })}`;

    cb(null, filename);
  },
});

let upload = multer({
  storage: storage,
});

let uploadFile = upload.single("image");

router.post("/login", userController.login);
router.post("/register", userController.register);
router.post(
  "/insert",
  middlewares.authorize,
  uploadFile,
  userController.insertUser
);
router.put(
  "/update/:id",
  middlewares.authorize,
  uploadFile,
  userController.updateUser
);
router.delete("/delete/:id", middlewares.authorize, userController.deleteUser);
router.get("/getAll", middlewares.authorize, userController.getAllUsers);
router.get("/getById/:id", middlewares.authorize, userController.getUserById);
router.get("/getPaging", middlewares.authorize, userController.getPaging);
router.get("/getMyAction", middlewares.authorize, userController.getMyActions);

module.exports = router;
