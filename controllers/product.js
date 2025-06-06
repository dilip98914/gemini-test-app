const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find(); // Find all products
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // Find product by ID

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.name === 'CastError') { // Handle invalid ID format
      return res.status(400).json({
        success: false,
        error: 'Invalid Product ID format'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Add new product
// @route   POST /api/products
// @access  Public
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category, imageUrl } = req.body;

    // Basic validation
    if (!name || !price || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Please provide product name, price, and quantity'
      });
    }
    if (price < 0 || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price and quantity cannot be negative'
      });
    }

    const product = await Product.create({ name, description, price, quantity, category, imageUrl }); // Create new product

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.code === 11000) { // Handle duplicate key error (e.g., duplicate product name)
      return res.status(400).json({
        success: false,
        error: 'Product with this name already exists'
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

// @desc    Update product by ID
// @route   PUT /api/products/:id
// @access  Public
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category, imageUrl } = req.body;

    // Optional: Basic validation for update fields if provided
    if ((price !== undefined && price < 0) || (quantity !== undefined && quantity < 0)) {
        return res.status(400).json({
            success: false,
            error: 'Price and quantity cannot be negative'
        });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body, // Update with provided fields
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Product ID format'
      });
    }
    if (error.code === 11000) { // Handle duplicate key error if name is updated to an existing one
      return res.status(400).json({
        success: false,
        error: 'Product with this name already exists'
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

// @desc    Delete product by ID
// @route   DELETE /api/products/:id
// @access  Public
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id); // Find and delete product

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
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
        error: 'Invalid Product ID format'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};
