require("dotenv").config();

const port = process.env.PORT || 5050;

const app = require("./app");
const knex = require("./database/knex");

const listener = () => {
  console.log(`Listening on port :: ${port}`);
};

app.listen(port, listener());
