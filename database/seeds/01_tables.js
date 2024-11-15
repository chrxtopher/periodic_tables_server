const tableData = require("./01_table_data.json");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  return knex.raw("TRUNCATE TABLE tables RESTART IDENTITY CASCADE").then(() => {
    return knex("tables").insert(tableData);
  });
};
