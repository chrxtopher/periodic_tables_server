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
    .orderBy("reservation_time");
};

const search = (mobile_number) => {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
};

module.exports = {
  list,
  listByDate,
  create,
  read,
  update,
  updateStatus,
  search,
};
