const knex = require("../database/knex");

const create = async (reservation) => {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((newRecords) => newRecords[0]);
};

const read = (reservation_id) => {
  return knex("reservations").select("*").where({ reservation_id }).first();
};

const update = async (reservation) => {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: reservation.reservation_id })
    .update(reservation, "*")
    .then((updatedRecords) => updatedRecords[0]);
};

const updateStatus = async (reservation_id, status) => {
  return knex("reservations")
    .select("*")
    .where({ reservation_id })
    .update({ status })
    .then(() => read(reservation_id));
};

const list = () => {
  return knex("reservations").select("*").orderBy("reservation_time");
};

const listByDate = (reservation_date) => {
  return knex("reservations")
    .select("*")
    .where({ reservation_date })
    .whereNot({ status: "complete" })
    .andWhereNot({ status: "cancelled" })
    .orderBy("reservation_time");
};

const listTimesForCurrentDay = (reservation_date) => {
  return knex("reservations")
    .select("reservation_time")
    .where({ reservation_date })
    .whereNot({ status: "complete" })
    .andWhereNot({ status: "cancelled" });
};

const search = (last_name) => {
  return knex("reservations")
    .whereILike("last_name", `%${last_name}%`)
    .orderBy("reservation_date");
};

const listCompleteReservations = (reservation_date) => {
  return knex("reservations")
    .select("*")
    .where({ reservation_date, status: "complete" })
    .orWhere({ reservation_date, status: "cancelled" })
    .orderBy("reservation_time");
};

module.exports = {
  list,
  listByDate,
  listCompleteReservations,
  listTimesForCurrentDay,
  create,
  read,
  update,
  updateStatus,
  search,
};
