const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'], // Name is required
    trim: true, // Remove whitespace from both ends of a string
    unique: true // Product names must be unique
  },
  description: {
    type: String,
    required: false, // Description is optional
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'], // Price is required
    min: [0, 'Price cannot be negative'] // Price must be non-negative
  },
  quantity: {
    type: Number,
    required: [true, 'Product quantity is required'], // Quantity is required
    min: [0, 'Quantity cannot be negative'] // Quantity must be non-negative
  },
  category: {
    type: String,
    required: false, // Category is optional
    trim: true
  },
  imageUrl: {
    type: String,
    required: false, // Image URL is optional
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
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema); // Export the Product model
