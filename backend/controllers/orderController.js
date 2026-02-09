import Order from "../models/Order.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    shippingPrice,
    protectionPrice,
    promoCode,
    deliveryOption,
    deliveryNotes,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }

  const safeNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const itemsPrice = orderItems.reduce(
    (sum, item) => sum + safeNumber(item.price) * (item.qty || 1),
    0
  );

  const normalizedPromo = (promoCode || "").trim().toUpperCase();
  const safeShipping = Math.max(0, safeNumber(shippingPrice));
  const safeProtection = Math.max(0, safeNumber(protectionPrice));

  let discountPrice = 0;
  if (normalizedPromo === "SPRINT10") {
    discountPrice = Math.min(itemsPrice * 0.1, 500);
  } else if (normalizedPromo === "SHIPFREE") {
    discountPrice = safeShipping;
  }

  const computedTotal = Math.max(
    0,
    itemsPrice + safeShipping + safeProtection - discountPrice
  );
  if (computedTotal <= 0) {
    return res.status(400).json({ message: "Invalid order total" });
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    promoCode: normalizedPromo || undefined,
    deliveryOption,
    deliveryNotes,
    itemsPrice,
    shippingPrice: safeShipping,
    protectionPrice: safeProtection,
    discountPrice,
    totalPrice: computedTotal,
  });

  const createdOrder = await order.save();

  res.status(201).json(createdOrder);
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// @desc    Get order by ID (owner or admin)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) return res.status(404).json({ message: "Order not found" });

  const isOwner =
    order.user?._id?.toString() === req.user._id.toString();
  if (!isOwner && !req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized" });
  }

  res.json(order);
};

// @desc    Admin: get all orders
// @route   GET /api/orders
// @access  Admin
export const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email");
  res.json(orders);
};

// @desc    Admin: mark order delivered
// @route   PUT /api/orders/:id/deliver
// @access  Admin
export const markOrderDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updated = await order.save();
  res.json(updated);
};
