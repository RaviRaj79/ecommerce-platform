const express = require('express');
const router = express.Router();

// Auth Routes
const authRoutes = require('./authRoutes');
router.use('/auth', authRoutes);

// Product Routes
const productRoutes = require('./productRoutes');
router.use('/products', productRoutes);

// Cart Routes
const cartRoutes = require('./cartRoutes');
router.use('/cart', cartRoutes);

// Order Routes
const orderRoutes = require('./orderRoutes');
router.use('/orders', orderRoutes);

module.exports = router;