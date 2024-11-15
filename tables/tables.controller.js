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

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [asyncErrorBoundary(create)],
  read: [tableExists, asyncErrorBoundary(read)],
  seatTable: [tableExists, asyncErrorBoundary(seatTable)],
  clearTable: [tableExists, asyncErrorBoundary(clearTable)],
};
