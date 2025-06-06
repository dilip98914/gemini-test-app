const express = require('express');
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
}
= require('../controllers/order');

const router = express.Router(); // Create an Express router

// Define routes for orders
router.route('/').get(getOrders).post(createOrder); // GET all and POST new order
router.route('/:id').get(getOrderById).put(updateOrder).delete(deleteOrder); // GET, PUT, DELETE order by ID

module.exports = router; // Export the router
