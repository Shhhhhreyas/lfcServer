const express = require("express");
const serverless = require("serverless-http");

const app = express();
const router = express.Router();
const fns = require("date-fns");
const port = 1110;
const date_format = "dd/MM/yyyy";

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const constructFareObject = (date) => {
  return { departureDate: date, price: randomIntFromInterval(2000, 4000) };
};

const getDatesBetweenDates = (startDate, endDate) => {
  let dates = [];
  const theDate = new Date(startDate);
  while (theDate < new Date(endDate)) {
    dates = [...dates, new Date(theDate)];
    theDate.setDate(theDate.getDate() + 1);
  }
  dates = [...dates, new Date(endDate)];
  return dates;
};

const getDates = (query) => {
  let dates = [];
  if (query.beginDate && query.endDate) {
    dates = getDatesBetweenDates(
      fns.parse(query.beginDate, date_format, new Date()),
      fns.parse(query.endDate, date_format, new Date())
    );
  } else if (query.beginDate && query.range) {
    let endDate = fns.addDays(
      fns.parse(query.beginDate, date_format, new Date()),
      query.range
    );
    dates = getDatesBetweenDates(
      fns.parse(query.beginDate, date_format, new Date()),
      endDate
    );
  } else {
    dates = [new Date()];
  }
  return dates;
};

router.get("/", (req, res) => {
  const query = req.query;
  console.log("req: ", query);
  res.set({ "Content-Type": "application/json" });
  res.json({
    currency: "PHP",
    origin: query.departStation.toLowerCase(),
    destination: query.arrivalStation.toLowerCase(),
    data: getDates(query).map((date) =>
      constructFareObject(fns.format(date, date_format))
    ),
  });
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
