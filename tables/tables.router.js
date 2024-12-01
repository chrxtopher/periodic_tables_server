const router = require("express").Router();
const controller = require("./tables.controller");

router.route("/").get(controller.list).post(controller.create);

router.route("/:table_id").get(controller.read).delete(controller.delete);

router
  .route("/:table_id/seat")
  .put(controller.seatTable)
  .delete(controller.clearTable);

module.exports = router;
