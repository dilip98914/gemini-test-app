const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
exports.getOrders = async (req, res) => {
  try {
    // Find all orders and populate customer and product details
    const orders = await Order.find()
      .populate('customer', 'name email') // Populate customer's name and email
      .populate('products.product', 'name price'); // Populate product's name and price

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Public
exports.getOrderById = async (req, res) => {
  try {
    // Find order by ID and populate customer and product details
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('products.product', 'name price');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    if (error.name === 'CastError') { // Handle invalid ID format
      return res.status(400).json({
        success: false,
        error: 'Invalid Order ID format'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
  try {
    const { customer: customerId, products: orderedProducts, status } = req.body;

    // Validate if customer ID and products array are provided
    if (!customerId || !orderedProducts || orderedProducts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide customer ID and at least one product for the order'
      });
    }

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    let totalAmount = 0;
    const productsInOrder = [];

    // Process each product in the order
    for (const item of orderedProducts) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${item.product} not found`
        });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: `Quantity for product ${product.name} must be positive`
        });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Not enough stock for product: ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
        });
      }

      // Add product details to the order's product list, storing current price for historical records
      productsInOrder.push({
        product: product._id,
        quantity: item.quantity,
        priceAtOrder: product.price // Store the price at the time of order
      });
      totalAmount += product.price * item.quantity;

      // Decrease product quantity in stock
      product.quantity -= item.quantity;
      await product.save();
    }

    // Create the new order
    const order = await Order.create({
      customer: customerId,
      products: productsInOrder,
      totalAmount,
      status: status || 'pending'
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format for customer or product'
      });
    }
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            error: messages
        });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Update order status or add/remove products
// @route   PUT /api/orders/:id
// @access  Public
exports.updateOrder = async (req, res) => {
  try {
    const { status, products: updatedOrderedProducts } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // If order is already completed or cancelled, disallow further modifications except for status change
    if (order.status === 'completed' || order.status === 'cancelled') {
        if (status && status !== order.status) {
            order.status = status;
            await order.save();
            return res.status(200).json({ success: true, data: order, message: 'Order status updated.' });
        } else {
            return res.status(400).json({ success: false, error: 'Cannot modify a completed or cancelled order.' });
        }
    }

    // Handle status update
    if (status) {
        if (!['pending', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status provided.' });
        }
        order.status = status;
    }

    // Handle product updates only if order is pending
    if (updatedOrderedProducts && order.status === 'pending') {
        // Revert old quantities
        for (const item of order.products) {
            const product = await Product.findById(item.product);
            if (product) {
                product.quantity += item.quantity;
                await product.save();
            }
        }

        let newTotalAmount = 0;
        const newProductsInOrder = [];

        // Process new product list
        for (const item of updatedOrderedProducts) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: `Product with ID ${item.product} not found for update`
                });
            }
            if (item.quantity <= 0) {
                return res.status(400).json({
                  success: false,
                  error: `Quantity for product ${product.name} must be positive`
                });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    error: `Not enough stock for product: ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
                });
            }

            newProductsInOrder.push({
                product: product._id,
                quantity: item.quantity,
                priceAtOrder: product.price // Store the current price
            });
            newTotalAmount += product.price * item.quantity;

            // Decrease product quantity in stock
            product.quantity -= item.quantity;
            await product.save();
        }

        order.products = newProductsInOrder;
        order.totalAmount = newTotalAmount;
    }

    // Save the updated order
    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Order ID format'
      });
    }
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            error: messages
        });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Delete order by ID
// @route   DELETE /api/orders/:id
// @access  Public
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // If order is pending, return products to stock before deleting
    if (order.status === 'pending') {
      for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }

    await order.deleteOne(); // Use deleteOne() for Mongoose 6+

    res.status(200).json({
      success: true,
      data: {} // Return empty data on successful deletion
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Order ID format'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};
