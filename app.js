const express = require("express");
const cors = require("cors");

const app = express();

const reservationsRouter = require("./reservations/reservations.router");
const errorHandler = require("./errors/errorHandler");

app.use(cors());
app.use(express.json());

app.use("/reservations", reservationsRouter);

app.use(errorHandler);

module.exports = app;
