exports.up = function (knex) {
  return knex.schema.table("reservations", (table) => {
    table.dropTimestamps();
  });
};

exports.down = function (knex) {
  return knex.schema.table("reservations", (table) => {
    table.timestamps(true, true);
  });
};
