var express = require("express");
var router = express.Router();
const Shipment = require("../models/Shipments");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});
router.get("/about", function (req, res, next) {
  res.render("about");
});

router.get("/history", async (req, res, next) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.render("admin/history", { shipments }); // ✅ send to your history.ejs
  } catch (err) {
    console.error("Error fetching shipments:", err);
    next(err);
  }
});
router.get("/contact", function (req, res, next) {
  res.render("contact");
});
router.get("/about", function (req, res, next) {
  res.render("about");
});
router.get("/service_details", function (req, res, next) {
  res.render("service_details");
});
router.get("/service", function (req, res, next) {
  res.render("service");
});

router.get("/track", async (req, res) => {
  try {
    const trackingNumber = req.query.tracking?.trim();
    if (!trackingNumber) {
      return res.render("index", { error: "Please enter a tracking number." });
    }

    const shipment = await Shipment.findOne({ trackingNumber });
    if (!shipment) {
      return res.render("index", {
        error: "Invalid tracking number. Please try again.",
      });
    }

    res.render("track", { shipment });
  } catch (error) {
    console.error("TRACK ERROR:", error);
    res
      .status(500)
      .render("index", { error: "Something went wrong. Please try again." });
  }
});

// ➕ Add this new route to handle /track/TRK-2025-12345
router.get("/track/:trackingNumber", async (req, res) => {
  try {
    const trackingNumber = req.params.trackingNumber?.trim();
    const shipment = await Shipment.findOne({ trackingNumber });
    if (!shipment)
      return res.render("index", {
        error: "Invalid tracking number. Please try again.",
      });
    res.render("track", { shipment });
  } catch (error) {
    console.error("TRACK PARAM ERROR:", error);
    res
      .status(500)
      .render("index", { error: "Something went wrong. Please try again." });
  }
});

module.exports = router;
