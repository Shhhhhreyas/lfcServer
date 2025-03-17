const express = require("express");
const serverless = require("serverless-http");

const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const cors = require("cors");
app.use(cors());
/* const admin = require("firebase-admin");
const serviceAccount = require("./customer-journey-stg-firebase-adminsdk-okzlk-8f31eb70c3.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
}); */
//app.use(bodyParser.text());
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(upload.array());

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

router.post("/didDriverAccept", (req, res) => {
  const { nearbyDrivers, pollCount } = req.body;
  console.log("See: ", pollCount);
  if (pollCount === 3) {
    res.json({
      driverInfo:
        nearbyDrivers[randomIntFromInterval(0, nearbyDrivers.length - 1)],
    });
  } else {
    res.json(null);
  }
});

router.post("/didDriverStartDelivery", (req, res) => {
  const { deliveryLocation, pollCount } = req.body;
  if (pollCount >= 4) {
    res.json({ deliveryLocation, deliveryStarted: true });
  } else {
    res.json({ deliveryStarted: false });
  }
});

router.post("/getDriverLocation", (req, res) => {
  const { polyline, pollCount } = req.body;
  if (pollCount >= 1 && polyline.length > 1) {
    console.log("pollCount: ", pollCount);
    console.log("Sending:  ", polyline.slice(1));
    res.json({ polyline: polyline.slice(1) });
  } else {
    res.json({ polyline: polyline });
  }
});
router.post("/getTrips", (req, res) => {
  const trip = {
    shopInfo: {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 22.7216897,
          lng: 75.8786025,
        },
        viewport: {
          northeast: {
            lat: 22.72307622989272,
            lng: 75.88000757989272,
          },
          southwest: {
            lat: 22.72037657010728,
            lng: 75.87730792010727,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/shopping-71.png",
      icon_background_color: "#4B96F3",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/shopping_pinlet",
      name: "Treasure Island Mall (TI Mall)",
      opening_hours: {
        open_now: true,
      },
      photos: [
        {
          height: 4096,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/114630510192412077490">Yogesh Meena</a>',
          ],
          photo_reference:
            "AWU5eFizA3Mz5kwYXSYy8G-8s4dcAgzc0jvcTrRcm6cNM7qJc5uTIPDBCsMfCKhsTrFHXlmEi5rVAF--Rq6FV74lLzUiN7UioDfDJXIP75k84MLHWEyGYjuwt1BOVBqNsFd6BxwOLzh6FIoNNtAS8P5bPvaA4Gea1fc9o6_o5963718XwdRW",
          width: 3072,
        },
      ],
      place_id: "ChIJAQAAQBb9YjkR8-h83fKABeI",
      plus_code: {
        compound_code: "PVCH+MC Indore, Madhya Pradesh, India",
        global_code: "7JJQPVCH+MC",
      },
      rating: 4.3,
      reference: "ChIJAQAAQBb9YjkR8-h83fKABeI",
      scope: "GOOGLE",
      types: ["shopping_mall", "point_of_interest", "establishment"],
      user_ratings_total: 34463,
      vicinity: "11, Mahatma Gandhi Rd, South Tukoganj, Indore",
    },
    deliveryLocation: {
      _id: "658315fa896f430017f2c8dc",
      addressTitle: "Home",
      house: "345",
      address: {
        name: "303,  Clerk Colony",
        value: "Indore, Madhya Pradesh 452010, India",
      },
      coords: {
        latitude: 22.7487484,
        longitude: 75.8715503,
      },
      floor: 0,
      apartment: "Nilay",
      instructions: "",
      customerName: "Test7 Test7",
      customerContactNumber: "+919999999997",
    },
  };
  const numberOfTrips = randomIntFromInterval(0, 4);

  if (numberOfTrips) {
    res.json({
      trips: Array(numberOfTrips)
        .fill(trip)
        .map((newTrip) => {
          const totalDistance = Math.round(Math.random() * 10000) / 100;
          const distanceToPickupLocation =
            Math.round(Math.random() * 1000) / 100;
          const distanceToDeliveryLocation =
            totalDistance - distanceToPickupLocation;
          return {
            ...newTrip,
            tripId: Math.random().toString(36).split(".")[1],
            type: Math.random() > 0.5 ? "Grocery Delivery" : "Parcel delivery",
            distanceToDeliveryLocation: distanceToDeliveryLocation + "km",
            estimatedTimeOfTrip:
              Math.round(Math.random() * 10000) / 100 + " minutes",
            distanceToPickupLocation: distanceToPickupLocation + "km",
            totalDistance: totalDistance + "km",
          };
        }),
    });
  } else {
    res.json({ trips: [{ noTrips: true }] });
  }
});

router.post("/getCustomToken", async (req, res) => {
  const { userId } = req.body;
  try {
    const customToken = await admin.auth().createCustomToken(userId);
    res.status(200).json({ token: customToken });
  } catch (error) {
    console.error("Error creating custom token:", error);
    res.status(500);
    res.json({ error });
  }
});

router.post("/micrositeData", (req, res) => {
  res.set({ "Content-Type": "application/json" });

  res.json(require("./proposed-content.json"));
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
