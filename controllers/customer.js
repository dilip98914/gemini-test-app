const Customer = require('../models/Customer');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Public
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find(); // Find all customers
    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Public
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id); // Find customer by ID

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    if (error.name === 'CastError') { // Handle invalid ID format
      return res.status(400).json({
        success: false,
        error: 'Invalid Customer ID format'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Add new customer
// @route   POST /api/customers
// @access  Public
exports.addCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide customer name and email'
      });
    }

    const customer = await Customer.create({ name, email, phone, address }); // Create new customer

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    if (error.code === 11000) { // Handle duplicate key error (e.g., duplicate email)
      return res.status(400).json({
        success: false,
        error: 'Customer with this email already exists'
      });
    }
    if (error.name === 'ValidationError') { // Handle Mongoose validation errors
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

// @desc    Update customer by ID
// @route   PUT /api/customers/:id
// @access  Public
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body, // Update with provided fields
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Customer ID format'
      });
    }
    if (error.code === 11000) { // Handle duplicate key error if email is updated to an existing one
      return res.status(400).json({
        success: false,
        error: 'Customer with this email already exists'
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

// @desc    Delete customer by ID
// @route   DELETE /api/customers/:id
// @access  Public
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id); // Find and delete customer

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {} // Return empty data on successful deletion
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Customer ID format'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

