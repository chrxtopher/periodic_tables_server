exports.up = function (knex) {
  return knex.schema.table("reservations", (table) => {
    table.boolean("birthday").defaultTo(false);
    table.boolean("anniversary").defaultTo(false);
  });
};

exports.down = function (knex) {
  knex.schema.table("reservations", (table) => {
    table.dropColumn("birthday");
    table.dropColumn("anniversary");
  });
};
