const express = require("express");
const serverless = require("serverless-http");

const app = express();

const cors = require("cors");
app.use(cors());
const router = express.Router();
const fns = require("date-fns");
const date_format = "dd/MM/yyyy";

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const makeShortPrice = (num, fixed = 0) => {
  if (num === null) {
    return null;
  } // terminate early
  if (num === 0) {
    return "0";
  } // terminate early
  fixed = !fixed || fixed < 0 ? 0 : fixed; // number of decimal places to show
  var b = num.toPrecision(2).split("e"), // get power
    k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
    c =
      k < 1
        ? num.toFixed(0 + fixed)
        : (num / Math.pow(10, k * 3)).toFixed(1 + fixed), // divide by power
    d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
    e = d + ["", "K", "M", "B", "T"][k]; // append power
  return e;
};

const constructFareObject = (date) => {
  const price = randomIntFromInterval(1000, 800000000);
  return {
    departureDate: date,
    price: price,
    shortPrice: makeShortPrice(price),
  };
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
    currency: query.currency || "PHP",
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
