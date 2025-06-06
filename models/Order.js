const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer', // Reference to the Customer model
    required: [true, 'Order must be associated with a customer']
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
        required: [true, 'Product ID is required']
      },
      quantity: {
        type: Number,
        required: [true, 'Product quantity in order is required'],
        min: [1, 'Quantity must be at least 1']
      },
      priceAtOrder: { // Price of the product at the time of order (for historical accuracy)
        type: Number,
        required: [true, 'Price at order is required'],
        min: [0, 'Price at order cannot be negative']
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'], // Allowed statuses
    default: 'pending' // Default status
  },
  orderDate: {
    type: Date,
    default: Date.now // Automatically set order date
  },
  updatedAt: {
    type: Date,
    default: Date.now // Automatically set update date, will be updated on save
  }
});

// Middleware to update `updatedAt` field before saving
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', OrderSchema); // Export the Order model

