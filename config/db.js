// This file handles the connection to the MongoDB database.
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB database using the URI from environment variables
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully!');
  } catch (err) {
    // Log any connection errors and exit the process if connection fails
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB; // Export the connection function
