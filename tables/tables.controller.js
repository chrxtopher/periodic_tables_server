const tablesService = require("./tables.service");
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
  const table_id = req.params.table_id;
  const { reservation_id } = req.body.data;
  const data = await tablesService.clearTable(table_id, reservation_id);
  res.status(200).json({ data });
};

/////////////////
// VALIDATION //
////////////////

function checkData(req, res, next) {
  const { data } = req.body;
  if (!data) {
    return next({
      status: 400,
      message: "Request body is empty.",
    });
  }

  next();
}

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

function checkTableName(req, res, next) {
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
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [checkData, checkTableName, asyncErrorBoundary(create)],
  read: [tableExists, asyncErrorBoundary(read)],
  seatTable: [tableExists, asyncErrorBoundary(seatTable)],
  clearTable: [tableExists, asyncErrorBoundary(clearTable)],
};
