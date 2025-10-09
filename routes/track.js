// const express = require("express");
// const router = express.Router();
// const Shipment = require("../models/Shipments");

// // GET /track/:trackingNumber
// router.get("/:trackingNumber", async (req, res) => {
//   try {
//     const shipment = await Shipment.findOne({
//       trackingNumber: req.params.trackingNumber,
//     }).lean();
//     if (!shipment) return res.status(404).send("Shipment not found");

//     // render public tracking template (uses your styling exactly)
//     res.render("/track", { shipment });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server error");
//   }
// });

// module.exports = router;
