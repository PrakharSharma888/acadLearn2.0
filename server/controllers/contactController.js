
const Contact = require("../models/Contact");
const { sendContactMail } = require("../utils/sendContactMail");

exports.submitContact = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    // Save to database
    await Contact.create({ name, email, message });
    // Send themed email
    await sendContactMail({ name, email, message });
    res.status(200).json({ message: "Contact form submitted successfully. Our team will contact you soon!" });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
