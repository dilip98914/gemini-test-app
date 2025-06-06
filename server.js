const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Import the DB connection function
const cors=require('cors')
const path = require('path'); // Import the 'path' module

// Load environment variables
dotenv.config({ path: './.env' });

// Connect to the database
connectDB();

const app = express(); // Initialize Express app

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors())

app.use(express.static(path.join(__dirname, './build')));

// Import route files
const productRoutes = require('./routes/product');
const customerRoutes = require('./routes/customer');
const orderRoutes = require('./routes/order');

// Mount routers
app.use('/api/products', productRoutes); // Products API endpoint
app.use('/api/customers', customerRoutes); // Customers API endpoint
app.use('/api/orders', orderRoutes); // Orders API endpoint

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './build', 'index.html'));
});

// Basic route for home page
app.get('/', (req, res) => {
  res.send('<h1>Shop Management API</h1><p>Welcome to the Shop Management API. Use endpoints like /api/products, /api/customers, /api/orders.</p>');
});



// Define the port for the server, using environment variable or default
const PORT = process.env.PORT || 5000;



// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
