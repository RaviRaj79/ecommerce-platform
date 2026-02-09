const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');  // ✅ Middleware import karo

// Get Cart (login required)
router.get('/', protect, cartController.getCart);

// Add to Cart (login required)
router.post('/', protect, cartController.addToCart);

// Remove from Cart (login required)
router.delete('/:productId', protect, cartController.removeFromCart);

// Clear Cart (login required)
router.delete('/', protect, cartController.clearCart);

module.exports = router;