const Cart = require('../models/Cart');

// Cart lao
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        res.json(cart || { items: [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cart mein add karo
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [{ product: productId, quantity }]
            });
        } else {
            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );
            
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
            await cart.save();
        }
        
        await cart.populate('items.product');
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cart se remove karo
exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        cart.items = cart.items.filter(
            item => item.product.toString() !== req.params.productId
        );
        await cart.save();
        await cart.populate('items.product');
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cart khali karo
exports.clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user._id });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};