const env = process.env.ENVIRONMENT || "development";
const config = require("../knexfile")[env];
module.exports = require("knex")(config);
