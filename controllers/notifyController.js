const { isValidObjectId } = require("mongoose");
const Notifys = require("../database/entities/Notify");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");

async function createNotify(req, res) {
  try {
    let notify = new Notifys(req.body);
    notify.createdAt = Date.now();
    let newNotify = await action.notify();
    let response = new ResponseModel(1, "Create notify success!", newNotify);
    res.json(response);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.json(response);
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const notify = await Notifys.findById(id);

    if (!notify) {
      let response = new ResponseModel(0, "No item found!", null);
      return res.json(response);
    }

    notify.isRead = true;
    await notify.save();

    let response = new ResponseModel(1, "Đọc tin nhắn thành công!", notify);
    res.json(response);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.json(response);
  }
}

async function getPagingNotifies(req, res) {
  let pageSize = req.query.pageSize || 10;
  let pageIndex = req.query.pageIndex || 1;

  let searchObj = { recipient: req.userId }; // Chỉ lấy những notify cho recipient là req.userId và chưa đọc

  try {
    let notifies = await Notify.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .sort({
        createdAt: "desc",
      });

    let count = await Notify.find(searchObj).countDocuments();
    let totalPages = Math.ceil(count / pageSize);

    let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, notifies);
    res.json(pagedModel);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

module.exports = {
  createNotify,
  markAsRead,
  getPagingNotifies,
};
