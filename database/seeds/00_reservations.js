const reservationsData = require("./00_reservation_data.json");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  return knex
    .raw("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE")
    .then(() => {
      return knex("reservations").insert(reservationsData);
    });
};
