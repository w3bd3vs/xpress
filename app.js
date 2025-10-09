require('dotenv').config(); // if you will use a .env locally
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shipmentdb';
// const PORT = process.env.PORT || 5000;

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const shipmentRouter = require("./routes/shipment");

const indexRouter = require("./routes/index");

const app = express();



const session = require('express-session');
const { checkIPWhitelist, requireAuth } = require('./middleware/auth');

// Session configuration
app.use(session({
  secret: 'supersecretkey123', // change this to something unique
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true only if using HTTPS
}));

// Parse form data
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// IP whitelist middleware – applies to ALL routes
app.use(checkIPWhitelist);




/**
 * CONFIG - update MONGO_URI if needed
 */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shipment_dashboard";
mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://127.0.0.1:27017/shipmentdb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// static files
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

// Routes
app.use("/shipment", shipmentRouter); // admin CRUD + status updates
app.use("/", indexRouter);


// app.get("/", (req, res) => res.redirect("/shipments"));

// 404
app.use((req, res) => res.status(404).send("Not found"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));


