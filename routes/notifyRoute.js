const express = require("express");
const router = express.Router();
const middlewares = require("./middlewares");
const notifyController = require("../controllers/notifyController");

router.get(
  "/getPaging",
  middlewares.authorize,
  notifyController.getPagingNotifies
);
router.post("/create", middlewares.authorize, notifyController.createNotify);
router.put("/:id/read", middlewares.authorize, notifyController.markAsRead);

module.exports = router;
