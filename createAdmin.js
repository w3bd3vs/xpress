require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shipment_dashboard";

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const username = process.env.ADMIN_USERNAME || "w3bd3v3admin";
    const password = process.env.ADMIN_PASSWORD || "ChangeMe0328";

    let user = await User.findOne({ username });
    if (user) {
      console.log("⚠️ Admin user already exists");
    } else {
      user = new User({ username });
      await user.setPassword(password);
      await user.save();
      console.log(`✅ Admin user created: ${username}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
})();
