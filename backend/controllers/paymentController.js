import "../config/env.js";
import Order from "../models/Order.js";

const getCashfreeBaseUrl = () =>
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

// MOCK PAYMENT
export const mockPayment = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  order.paymentResult = {
    id: "MOCK_PAYMENT_ID_123",
    status: "success",
    update_time: new Date().toISOString(),
    email_address: req.user.email,
  };

  const updatedOrder = await order.save();

  res.json({
    message: "Payment successful (MOCK)",
    order: updatedOrder,
  });
};

export const createCashfreeOrder = async (req, res) => {
  try {
    const { orderId } = req.body || {};
    const finalOrderId = orderId || req.query?.orderId;

    if (!finalOrderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const order = await Order.findById(finalOrderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (req.user && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const amount = Number(order.totalPrice || 0);
    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid order total" });
    }

    const customer = {
      customer_id: order.user?.toString() || "guest",
      customer_phone: req.body?.customer_phone || "9999999999",
      customer_email: req.body?.customer_email || req.user?.email || "guest@example.com",
      customer_name: req.body?.customer_name || req.user?.name || "Guest",
    };

    const response = await fetch(`${getCashfreeBaseUrl()}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": process.env.CASHFREE_API_VERSION || "2023-08-01",
        "x-client-id": process.env.CASHFREE_APP_ID || "",
        "x-client-secret": process.env.CASHFREE_SECRET || "",
      },
      body: JSON.stringify({
        order_id: order._id.toString(),
        order_amount: amount,
        order_currency: "INR",
        customer_details: customer,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        message: data?.message || data?.error || "Cashfree order create failed",
        details: data,
      });
    }

    return res.json({
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
    });
  } catch (error) {
    console.error("Cashfree order error:", error);
    return res.status(500).json({
      message: error?.message || "Failed to create Cashfree order",
    });
  }
};

export const verifyCashfreeOrder = async (req, res) => {
  try {
    const { orderId } = req.body || {};
    const finalOrderId = orderId || req.query?.orderId;

    if (!finalOrderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const order = await Order.findById(finalOrderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (req.user && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const response = await fetch(
      `${getCashfreeBaseUrl()}/orders/${order._id.toString()}`,
      {
        method: "GET",
        headers: {
          "x-api-version": process.env.CASHFREE_API_VERSION || "2023-08-01",
          "x-client-id": process.env.CASHFREE_APP_ID || "",
          "x-client-secret": process.env.CASHFREE_SECRET || "",
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        message: data?.message || data?.error || "Cashfree order fetch failed",
        details: data,
      });
    }

    if (data?.order_status === "PAID") {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: data.cf_order_id || data.order_id,
        status: data.order_status,
        update_time: new Date().toISOString(),
        email_address: data.customer_details?.customer_email || "",
      };
      await order.save();
      return res.json({ message: "Payment verified", order });
    }

    return res.status(400).json({ message: "Payment not completed", status: data?.order_status });
  } catch (error) {
    console.error("Cashfree verify error:", error);
    return res.status(500).json({
      message: error?.message || "Failed to verify Cashfree order",
    });
  }
};
