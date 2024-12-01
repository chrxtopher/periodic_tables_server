const knex = require("../database/knex");

const create = async (table) => {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((newRecords) => newRecords[0]);
};

const read = (table_id) => {
  return knex("tables").select("*").where({ table_id }).first();
};

const seatTable = async (table_id, reservation_id) => {
  return knex("reservations")
    .where({ reservation_id })
    .update({ status: "seated" })
    .then(() => {
      return knex("tables")
        .where({ table_id })
        .update({ reservation_id })
        .returning("*");
    });
};

const clearTable = async (table_id, reservation_id) => {
  return knex("reservations")
    .where({ reservation_id })
    .update({ status: "complete" })
    .returning("*")
    .then(() => {
      return knex("tables")
        .where({ table_id })
        .update({ reservation_id: null })
        .returning("*");
    });
};

const list = () => {
  return knex("tables").select("*").orderBy("table_name");
};

const deleteTable = (table_id) => {
  return knex("tables").where({ table_id }).del();
};

module.exports = {
  create,
  read,
  seatTable,
  clearTable,
  list,
  deleteTable,
};
