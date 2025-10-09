const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipments");
const shortid = require("shortid");
const { requireAuth } = require("../middleware/auth");
const {
  verifyDatePassword,
  getTodayDateString,
} = require("../middleware/auth");

// Login page
router.get("/login", (req, res) => {
  res.render("admin/login", { error: null });
});

// Handle login form submission
router.post("/login", (req, res) => {
 const { date } = req.body;

if (verifyDatePassword(date)) {
    req.session.authenticated = true;
    res.redirect("/shipment/dashboard");
  } else {
    res.render("admin/login", { error: "Incorrect date. Access denied." });
  }
});

// Protected dashboard
// router.get("/dashboard", (req, res) => {
//   if (!req.session.authenticated) {
//     return res.redirect("/shipment/login");
//   }
//   res.render("admin/dashboard", { today: getTodayDateString() });
// });

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/shipment/login");
  });
});

// Dashboard - list shipments
// Show form
router.get("/new", requireAuth, (req, res) => {
  res.render("admin/create");
});

router.get("/dashboard", requireAuth, async function (req, res, next) {
  const shipments = await Shipment.find().sort({ createdAt: -1 });
  res.render("admin/dashboard", { shipments });
});

router.get("/edit", requireAuth, function (req, res, next) {
  res.render("admin/edit");
});
router.get("/update", requireAuth, (req, res) => {
  res.render("admin/update");
});

// Handle form submission
// router.post("/", async (req, res) => {
//   try {
//     const trackingNumber = `TRK-${Date.now()}-${Math.floor(
//       Math.random() * 1000
//     )}`;

//     const shipment = new Shipment({
//       trackingNumber,
//       shipperName: req.body.shipperName,
//       shipperContact: req.body.shipperContact,
//       shipperEmail: req.body.shipperEmail,
//       shipperAddress: req.body.shipperAddress,
//       receiverName: req.body.receiverName,
//       receiverContact: req.body.receiverContact,
//       receiverEmail: req.body.receiverEmail,
//       receiverAddress: req.body.receiverAddress,
//       serviceType: req.body.serviceType,
//       departureDate: req.body.departureDate,
//       expectedDelivery: req.body.expectedDelivery,
//       destination: req.body.destination,
//       shipmentDescription: req.body.shipmentDescription,
//       totalWeight: req.body.totalWeight,
//       packages: req.body.packages || [],
//       statusHistory: req.body.statusHistory || [],
//     });

//     await shipment.save();

//     res.redirect(`/shipment/success/${shipment._id}`);
//   } catch (err) {
//     console.error("❌ Error while creating shipment:", err.message);
//     res.status(500).send("Error creating shipment");
//   }
// });

router.post("/", requireAuth, async (req, res) => {
  try {
    const trackingNumber = `TRK-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    // Parse statusHistory from form
    let statusHistory = [];
    if (req.body.statusHistory) {
      // req.body.statusHistory will be an object like {0: {...}, 1: {...}}
      statusHistory = Object.values(req.body.statusHistory).map((sh) => ({
        date: sh.date || new Date(),
        time: sh.time || "",
        airportName: sh.airportName || "",
        theStatus: sh.theStatus || "",
        description: sh.description || "",
        remark: sh.remark || "",
      }));
    }

    const shipment = new Shipment({
      trackingNumber,
      shipperName: req.body.shipperName,
      shipperContact: req.body.shipperContact,
      shipperEmail: req.body.shipperEmail,
      shipperAddress: req.body.shipperAddress,
      receiverName: req.body.receiverName,
      receiverContact: req.body.receiverContact,
      receiverEmail: req.body.receiverEmail,
      receiverAddress: req.body.receiverAddress,
      serviceType: req.body.serviceType,
      departureDate: req.body.departureDate,
      expectedDelivery: req.body.expectedDelivery,
      destination: req.body.destination,
      shipmentDescription: req.body.shipmentDescription,
      totalWeight: req.body.totalWeight,
      packages: req.body.packages || [],
      statusHistory, // use the one filled in form
    });

    await shipment.save();

    res.redirect(`/shipment/success/${shipment._id}`);
  } catch (err) {
    console.error("❌ Error while creating shipment:", err.message);
    res.status(500).send("Error creating shipment");
  }
});

// ✅ Success page
router.get("/success/:id", requireAuth, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).send("Shipment not found");
    res.render("admin/success", { shipment });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading confirmation page");
  }
});

// View a shipment (admin view - uses same track template but with admin controls)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id).lean();
    if (!shipment) return res.status(404).send("Shipment not found");
    res.render("admin/update", { shipment });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Edit form
router.get("/:id/edit", requireAuth, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id).lean();
    if (!shipment) return res.status(404).send("Shipment not found");
    res.render("admin/edit", { shipment });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Show update form (Admin only)
router.get("/:id/update", requireAuth, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id).lean();
    if (!shipment) return res.status(404).send("Shipment not found");
    res.render("admin/update", { shipment });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Handle update submission (append new entry)
router.post("/:id/update", requireAuth, async (req, res) => {
  try {
    const { date, time, airportName, theStatus, description, remark } =
      req.body;

    // Prepare new entry
    const entry = {
      date: date || new Date(),
      time: time || "",
      airportName: airportName || "",
      theStatus: theStatus || "",
      description: description || "",
      remark: remark || "",
    };

    // Push the new travel history update
    await Shipment.findByIdAndUpdate(req.params.id, {
      $push: { statusHistory: entry },
      $set: { currentStatus: theStatus }, // keep currentStatus up to date
    });

    res
      .status(200)
      .json({ success: true, message: "Travel history updated successfully" });
  } catch (err) {
    console.error("❌ Error updating travel history:", err);
    res
      .status(500)
      .json({ success: false, message: "Error updating shipment" });
  }
});

// API endpoint to fetch shipment data (for admin/update page)
router.get("/api/shipment/:id", requireAuth, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id).lean();
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });
    res.json(shipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Delete
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Shipment.findByIdAndDelete(req.params.id);
    res.redirect("/shipment");
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed");
  }
});

/**
 * Add a status update
 * Expects body: date, time, airportName, theStatus, description, remark (remark optional)
 *
 * Behavior:
 * - Saves an object into statusHistory array.
 * - Redirects back to the shipment view.
 */
router.post("/:id/status", requireAuth, async (req, res) => {
  try {
    const { date, time, airportName, theStatus, description, remark } =
      req.body;
    const entry = {
      date:
        date ||
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      time: time || "",
      airportName: airportName || "",
      theStatus: theStatus || "",
      description: description || "",
      remark: remark || "",
    };

    await Shipment.findByIdAndUpdate(req.params.id, {
      $push: { statusHistory: entry },
    });
    res.redirect("/shipment/history/all");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add status");
  }
});

// History (all shipments with statuses)
router.get("/history/all", requireAuth, async (req, res) => {
  try {
    const shipments = await Shipment.find({
      "statusHistory.0": { $exists: true },
    }).lean();
    res.render("admin/history", { shipments });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
