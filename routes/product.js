// Filename: routes/productRoutes.js
// This file defines the API routes for products.
const express = require('express');
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product');

const router = express.Router(); // Create an Express router

// Define routes for products
router.route('/').get(getProducts).post(addProduct); // GET all and POST new product
router.route('/:id').get(getProductById).put(updateProduct).delete(deleteProduct); // GET, PUT, DELETE product by ID

module.exports = router; // Export the router
