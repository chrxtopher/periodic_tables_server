const tablesService = require("./tables.service");
const reservationService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const create = async (req, res) => {
  const data = await tablesService.create(req.body.data);
  res.status(201).json({ data });
};

const read = (req, res) => {
  const data = res.locals.table;
  res.json({ data });
};

const list = async (req, res) => {
  const data = await tablesService.list();
  res.status(200).json({ data });
};

// update
const seatTable = async (req, res) => {
  const table_id = req.params.table_id;
  const { reservation_id } = req.body.data;
  const data = await tablesService.seatTable(table_id, reservation_id);
  res.status(200).json({ data });
};

// "delete"
// does not delete table from the database
// clears the table from having a reservation_id

const clearTable = async (req, res) => {
  const table = res.locals.table;
  const { reservation_id } = req.body.data;
  const data = await tablesService.clearTable(table.table_id, reservation_id);
  res.status(200).json({ data });
};

/////////////////
// VALIDATION //
////////////////

const checkData = (req, res, next) => {
  const { data } = req.body;
  if (!data) {
    return next({
      status: 400,
      message: "Request body is empty.",
    });
  }

  next();
};

const tableExists = async (req, res, next) => {
  const table_id = Number(req.params.table_id);
  const table = await tablesService.read(table_id);

  if (table) {
    res.locals.table = table;
    return next();
  } else {
    return next({
      status: 404,
      message: `Table ${table_id} does not exist.`,
    });
  }
};

const checkTableName = (req, res, next) => {
  const {
    data: { table_name },
  } = req.body;

  if (!table_name) {
    return next({
      status: 400,
      message: "A table name is required.",
    });
  }

  if (table_name.replace(/\s+/g, "").length === 0) {
    return next({
      status: 400,
      message: "Table name cannot be blank.",
    });
  }

  if (table_name.length < 2) {
    return next({
      status: 400,
      message: "Table name must be at least 2 characters long.",
    });
  }

  next();
};

const checkTableCapacityPOST = (req, res, next) => {
  const {
    data: { capacity },
  } = req.body;

  if (!capacity || capacity < 1) {
    return next({
      status: 400,
      message: "A capacity of at least 1 is required to create a table.",
    });
  }

  if (typeof capacity !== "number") {
    return next({
      status: 400,
      message: "Capacity must be a number.",
    });
  }

  next();
};

const checkTableCapacityPUT = async (req, res, next) => {
  const table = res.locals.table;
  const {
    data: { reservation_id },
  } = req.body;

  if (!reservation_id) {
    return {
      status: 400,
      message: "reservation_id was not provided.",
    };
  }

  const reservation = await reservationService.read(reservation_id);

  if (!reservation) {
    return next({
      status: 400,
      message: `Reservation ${reservation_id} could not be found.`,
    });
  }

  if (reservation.people > table.capacity) {
    return next({
      status: 400,
      message: "Table is not large enough for this party.",
    });
  }

  next();
};

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [
    checkData,
    checkTableName,
    checkTableCapacityPOST,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  seatTable: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(checkTableCapacityPUT),
    asyncErrorBoundary(seatTable),
  ],
  clearTable: [asyncErrorBoundary(tableExists), asyncErrorBoundary(clearTable)],
};
