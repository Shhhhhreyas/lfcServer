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

const makeShortFormattedPrice = (currency = "", price) => {
  let symbol = "";
  switch (currency.toLowerCase()) {
    case "aud":
      symbol = "A$";
      break;
    case "cny":
      symbol = "¥";
      break;
    case "eur":
      symbol = "€";
      break;
    case "gbp":
      symbol = "£";
      break;
    case "hkd":
      symbol = "$";
      break;
    case "jpy":
      symbol = "¥";
      break;
    case "myr":
      symbol = "RM";
      break;
    case "nzd":
      symbol = "$";
      break;
    case "php":
      symbol = "₱";
      break;
    case "sgd":
      symbol = "$";
      break;
    case "thb":
      symbol = "฿";
      break;
    case "usd":
      symbol = "$";
      break;
    case "bdt":
      symbol = "৳";
      break;
    case "inr":
      symbol = "₹";
      break;
    case "idr":
      symbol = "Rp";
      break;
    case "krw":
      symbol = "₩";
      break;
    case "mop":
      symbol = "";
      break;
    case "twd":
      symbol = "$";
      break;
    case "vnd":
      symbol = "₫";
      break;
    case "lkr":
      symbol = "₨";
      break;
    default:
      break;
  }
  return symbol + makeShortPrice(price);
};

const constructFareObject = (airlineProfile, currency, date) => {
  const price = randomIntFromInterval(1000, 80000);
  return {
    airlineProfile,
    departureDate: date,
    price: price,
    shortFormattedPrice: makeShortFormattedPrice(currency, price),
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
  if (query.delay) {
    setTimeout(() => {
      res.sendStatus(Number(query.statusCode) || 500);
    }, Number(query.delay));
    return;
  }
  res.json({
    airlineProfiles: query.airlineProfile.split(","),
    currency: query.currency || "PHP",
    origin: query.departStation.toLowerCase(),
    destination: query.arrivalStation.toLowerCase(),
    data: getDates(query)
      .map((date) => {
        if (Math.random() < 0.3) {
          console.log("Dropping date: ", date);
          return;
        }
        return constructFareObject(
          query.airlineProfile,
          query.currency,
          fns.format(date, date_format)
        );
      })
      .filter((date) => date),
  });
});

router.get("/example", (req, res) => {
  res.set({ "Content-Type": "application/json" });
  res.json({ two: 2 });
});

router.get("/sampleData", (req, res) => {
  res.set({ "Content-Type": "application/json" });
  res.json([
    {
      id: 1,
      title: "Product 1",
      price: "10",
      image:
        "https://shop.teamsg.in/wp-content/uploads/2021/04/Blazetech-yellow-small-2-4-scaled.jpg",
      isAdded: 0,
    },
    {
      id: 2,
      title: "Product 2",
      price: "100",
      image:
        "https://rukminim1.flixcart.com/image/416/416/jf751u80/bat/g/g/u/1-1-2-short-handle-virat-kohli-grand-edition-tennis-cricket-bat-original-imaf3j2zhmdnays3.jpeg?q=70",
      isAdded: 0,
    },
    {
      id: 3,
      title: "Product 3",
      price: "50",
      image:
        "https://4.imimg.com/data4/RU/VC/MY-11853389/men-s-jackets-500x500.jpg",
      isAdded: 0,
    },
    {
      id: 4,
      title: "Product 4",
      price: "250",
      image: "https://m.media-amazon.com/images/I/418QpEn9JKL._SX425_.jpg",
      isAdded: 0,
    },
  ]);
});

router.post("/fp/xsell/aggregator/v1/page-results", (req, res) => {
  res.set({ "Content-Type": "application/json" });
  if (req.query?.journeyType?.toLocaleLowerCase() === "r") {
    res.json(require("./v1ReturnJourney.json"));
  } else {
    res.json(require("./v1OneWay.json"));
  }
});
router.post("/fp/xsell/aggregator/v2/page-results", (req, res) => {
  res.set({ "Content-Type": "application/json" });
  if (req.query?.journeyType?.toLocaleLowerCase() === "r") {
    res.json(require("./v2ReturnJourney.json"));
  } else {
    res.json(require("./v2OneWay.json"));
  }
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
