const mongoose = require("mongoose");
const shortid = require("shortid");
const shipmentSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    // Shipper Information
    shipperName: { type: String, required: true },
    shipperContact: { type: String, required: true },
    shipperEmail: { type: String, required: true },
    shipperAddress: { type: String, required: true },

    // Receiver Information
    receiverName: { type: String, required: true },
    receiverContact: { type: String, required: true },
    receiverEmail: { type: String, required: true },
    receiverAddress: { type: String, required: true },

    // Shipment Details
    serviceType: {
      type: String,
      enum: ["Air Freight", "Sea Freight", "Road Freight", "Express Delivery"],
      required: true,
    },
    departureDate: { type: Date, required: true },
    expectedDelivery: { type: Date, required: true },
    destination: { type: String, required: true },
    shipmentDescription: { type: String, required: true },
    totalWeight: { type: Number, required: true },

    // Optional: Packages (for future use)
    packages: [
      {
        qty: Number,
        weight: Number,
        description: String,
      },
    ],

    // Optional: Timeline (for future use)
statusHistory: [
  {
    date: { type: Date, default: Date.now },
    time: { type: String, default: "" },
    airportName: { type: String, default: "" },
    theStatus: { type: String, default: "" },
    description: { type: String, default: "" },
    remark: { type: String, default: "" }, // optional
  },
],


    currentStatus: {
      type: String,
      default: "Processing",
    },
  },
  { timestamps: true }
);
const Shipment = mongoose.model("shipment", shipmentSchema);
module.exports = Shipment;
