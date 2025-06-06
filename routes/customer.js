// This file defines the API routes for customers.
const express = require('express');
const {
  getCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customer');

const router = express.Router(); // Create an Express router

// Define routes for customers
router.route('/').get(getCustomers).post(addCustomer); // GET all and POST new customer
router.route('/:id').get(getCustomerById).put(updateCustomer).delete(deleteCustomer); // GET, PUT, DELETE customer by ID

module.exports = router; // Export the router
