const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Check if admin user exists
    const adminEmail = "admin@acadlearn.com";
    const adminUser = await User.findOne({ email: adminEmail });

    // Set new password here
    const newPassword = "Admin@2026"; // Change this to your desired password

    if (adminUser) {
      // Update existing admin user password
      adminUser.name = adminUser.name || "Admin";
      adminUser.password = newPassword;
      adminUser.role = "admin";
      await adminUser.save();
      console.log(`✅ Admin user password updated for ${adminEmail}`);
    } else {
      // Create new admin user
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: newPassword,
        role: "admin",
      });
      console.log(`✅ Admin user created: ${adminEmail}`);
    }

    console.log("✅ Admin seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
