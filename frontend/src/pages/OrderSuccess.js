import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import placeholder from "../assets/placeholder.svg";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [order, setOrder] = useState(state || null);
  const [error, setError] = useState("");

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const formatDate = (value) => {
    if (!value) return "N/A";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  };

  useEffect(() => {
    const storedId = localStorage.getItem("last_order_id");
    const orderId = state?.orderId || storedId;
    if (!orderId) return;
    if (order?.orderId || order?._id) return;

    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${orderId}`);
        setOrder({
          orderId: data._id,
          total: data.totalPrice,
          items: data.orderItems,
          paymentMethod: data.paymentMethod,
          createdAt: data.createdAt,
          isPaid: data.isPaid,
        });
        localStorage.removeItem("last_order_id");
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load order details"
        );
      }
    };

    fetchOrder();
  }, [state, order]);

  return (
    <div className="section">
      <div className="flow-grid">
        <div className="flow-main">
          <div className="card">
            <div className="stepper" style={{ marginBottom: 12 }}>
              <span className="step done">Cart</span>
              <span className="step done">Checkout</span>
              <span className="step active">Success</span>
            </div>
            <h2>Order Placed Successfully!</h2>
            <p className="muted">Order ID: {order?.orderId || "N/A"}</p>
            {error && <p className="muted">{error}</p>}
            <div className="success-steps">
              <div className="step">
                <span className="step-dot" />
                <div>
                  <strong>Order confirmed</strong>
                  <p className="muted">We have received your order.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-dot" />
                <div>
                  <strong>
                    {order?.isPaid ? "Payment processed" : "Payment pending"}
                  </strong>
                  <p className="muted">
                    {order?.isPaid
                      ? "Your payment has been recorded."
                      : "Pay on delivery for COD orders."}
                  </p>
                </div>
              </div>
              <div className="step">
                <span className="step-dot" />
                <div>
                  <strong>Preparing shipment</strong>
                  <p className="muted">We are packing your items.</p>
                </div>
              </div>
            </div>
            <button className="button" onClick={() => navigate("/orders")}>
              View My Orders
            </button>
          </div>
        </div>
        <aside className="flow-side">
          <div className="card">
            <h3>Receipt</h3>
            <p className="muted">A confirmation email will arrive shortly.</p>
            <div className="summary-row">
              <span className="muted">Date</span>
              <span>{formatDate(order?.createdAt)}</span>
            </div>
            <div className="summary-row">
              <span className="muted">Payment</span>
              <span>{order?.paymentMethod || "N/A"}</span>
            </div>
            <div className="summary-row">
              <span className="muted">Status</span>
              <span className={`pill ${order?.isPaid ? "badge-good" : "badge-warn"}`}>
                {order?.isPaid ? "Paid" : "Pending"}
              </span>
            </div>
            <div className="summary-row">
              <span className="muted">Total</span>
              <strong>{formatPrice(order?.total)}</strong>
            </div>
            <div className="section">
              <h4>Items</h4>
              {order?.items?.length ? (
                order.items.map((item, idx) => (
                  <div key={`${item.product}-${idx}`} className="modal-item">
                    <div className="item-row">
                      <img
                        src={item.image || placeholder}
                        alt={item.name}
                        className="thumb-sm"
                        onError={(e) => {
                          e.currentTarget.src = placeholder;
                        }}
                      />
                      <div>
                        <strong>{item.name}</strong>
                        <p className="muted">Qty: {item.qty}</p>
                      </div>
                    </div>
                    <div className="price">{formatPrice(item.price)}</div>
                  </div>
                ))
              ) : (
                <p className="muted">No items found.</p>
              )}
            </div>
            <div className="summary-row">
              <span className="muted">Support</span>
              <span>support@shopsprint.com</span>
            </div>
            <button className="button secondary" onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OrderSuccess;
