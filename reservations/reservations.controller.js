const reservationsService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const create = async (req, res) => {
  const data = await reservationsService.create(req.body.data);
  res.status(201).json({ data });
};

const read = async (req, res) => {
  const data = res.locals.reservation;
  res.status(200).json({ data });
};

const update = async (req, res) => {
  const { reservation_id } = res.locals.reservation;
  const reservation = {
    ...req.body.data,
    reservation_id,
  };
  const data = await reservationsService.update(reservation);
  res.json({ data });
};

const updateStatus = async (req, res) => {
  const { reservation_id } = res.locals.reservation;
  const {
    data: { status },
  } = req.body;
  const data = await reservationsService.updateStatus(reservation_id, status);
  res.status(200).json({ data });
};

const list = async (req, res) => {
  const { date } = req.query;
  const { mobile_number } = req.query;
  let data;
  if (date) {
    data = await reservationsService.listByDate(date);
  } else if (mobile_number) {
    data = await reservationsService.search(mobile_number);
  } else {
    data = await reservationsService.list();
  }
  res.json({ data });
};

////////////////////////////
// VALIDATION MIDDLEWARE //
///////////////////////////

const reservationExists = async (req, res, next) => {
  const reservation_id = Number(req.params.reservation_id);
  const reservation = await reservationsService.read(reservation_id);

  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  } else {
    return next({
      status: 404,
      message: `Reservation ${reservation_id} does not exist.`,
    });
  }
};

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  update: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(update)],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(updateStatus),
  ],
};
