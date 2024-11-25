const reservationsService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const create = async (req, res) => {
  const data = await reservationsService.create(req.body.data);
  res.status(201).json({ data });
};

const read = (req, res) => {
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
  const { last_name } = req.query;
  let data;
  if (date) {
    data = await reservationsService.listByDate(date);
  } else if (last_name) {
    data = await reservationsService.search(last_name);
  } else {
    data = await reservationsService.list();
  }
  res.json({ data });
};

const listCompleteReservations = async (req, res, next) => {
  const { date } = req.query;
  if (!date) return next({ status: 404, message: "No date found in query" });
  const data = await reservationsService.listCompleteReservations(date);
  res.status(200).json({ data });
};

////////////////////////////
// VALIDATION MIDDLEWARE //
///////////////////////////

const validateReqDataExists = (req, res, next) => {
  const { data } = req.body;

  if (!data) {
    return next({
      status: 400,
      message: "request body is empty",
    });
  }

  next();
};

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

const validateName = (req, res, next) => {
  // checks if first and last name is provided or blank
  const {
    data: { first_name },
  } = req.body;

  const {
    data: { last_name },
  } = req.body;

  if (!first_name || first_name.replace(/\s+/g, "").length === 0) {
    return next({
      status: 400,
      message: "first name is required",
    });
  }

  if (!last_name || last_name.replace(/\s+/g, "").length === 0) {
    return next({
      status: 400,
      message: "last name is required",
    });
  }

  next();
};

const validatePeople = (req, res, next) => {
  const {
    data: { people },
  } = req.body;

  if (!people) {
    return next({
      status: 400,
      message: "total party members is required to book reservation",
    });
  }

  if (people < 1) {
    return next({
      status: 400,
      message: "minimum one person per reservation",
    });
  }

  if (typeof people !== "number") {
    return next({
      status: 400,
      message: "people must be of data type integer",
    });
  }

  next();
};

const validateReservationDate = (req, res, next) => {
  // checks if date is provided or blank, of correct format, and not a day in the past
  const today = new Date();
  const requiredFormat = /\d\d\d\d-\d\d-\d\d/;
  const {
    data: { reservation_date, reservation_time },
  } = req.body;

  if (!reservation_date || reservation_date.replace(/\s+/g, "").length === 0) {
    return next({
      status: 400,
      message: "reservation date is required",
    });
  }

  if (!reservation_date.match(requiredFormat)) {
    return next({
      status: 400,
      message: "incorrect date format :: YYYY-MM-DD required",
    });
  }

  if (new Date(`${reservation_date} ${reservation_time}`) < today) {
    return next({
      status: 400,
      message:
        "Time travelling is fun, but we have no way to accommodate reservations of the past.",
    });
  }

  next();
};

const validateReservationTime = async (req, res, next) => {
  // checks if reservation time is provided or blank, and between 10:30am - 9:30pm.
  // checks if there is a reservation booked for that time already
  const {
    data: { reservation_time, reservation_date },
  } = req.body;

  if (!reservation_time || reservation_time.replace(/\s+/g, "").length === 0) {
    return next({
      status: 400,
      message: "reservation time is required",
    });
  }

  if (reservation_time < "10:30:00" || reservation_time > "21:30:00") {
    return next({
      status: 400,
      message:
        "requested time is outside hours of operation => 10:30 A.M. - 09:30 P.M.",
    });
  }

  const timesForToday = await reservationsService.listTimesForCurrentDay(
    reservation_date
  );

  timesForToday.forEach((time) => {
    if (time.reservation_time == `${reservation_time}:00`) {
      return next({
        status: 400,
        message: "This time slot is already booked.",
      });
    }
  });

  next();
};

const validateReservationStatusPOST = (req, res, next) => {
  const {
    data: { status },
  } = req.body;

  if (status) {
    return next({
      status: 400,
      message: "new reservations are not allowed to provide a status",
    });
  }

  next();
};

const validateReservationStatusPUT = (req, res, next) => {
  const validStatus = ["booked", "seated", "complete", "cancelled"];
  const {
    data: { status },
  } = req.body;

  if (!status) {
    return next({
      status: 400,
      message: "status required when updating a reservation",
    });
  }

  if (!validStatus.includes(status)) {
    return next({
      status: 400,
      message:
        "reservation status can only be [booked, seated, complete, or cancelled]",
    });
  }

  next();
};

module.exports = {
  list: [asyncErrorBoundary(list)],
  listCompleteReservations: [asyncErrorBoundary(listCompleteReservations)],
  create: [
    validateReqDataExists,
    validateReservationDate,
    asyncErrorBoundary(validateReservationTime),
    validatePeople,
    validateName,
    validateReservationStatusPOST,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), read],
  update: [
    asyncErrorBoundary(reservationExists),
    validateReqDataExists,
    validateReservationDate,
    asyncErrorBoundary(validateReservationTime),
    validatePeople,
    validateName,
    validateReservationStatusPUT,
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    validateReqDataExists,
    asyncErrorBoundary(reservationExists),
    validateReservationStatusPUT,
    asyncErrorBoundary(updateStatus),
  ],
};
