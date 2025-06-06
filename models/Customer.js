const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'], // Name is required
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Customer email is required'], // Email is required
    unique: true, // Email must be unique
    trim: true,
    lowercase: true, // Store emails in lowercase
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'] // Email format validation
  },
  phone: {
    type: String,
    required: false, // Phone is optional
    trim: true
  },
  address: {
    type: String,
    required: false, // Address is optional
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set creation date
  },
  updatedAt: {
    type: Date,
    default: Date.now // Automatically set update date, will be updated on save
  }
});

// Middleware to update `updatedAt` field before saving
CustomerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Customer', CustomerSchema); // Export the Customer model

