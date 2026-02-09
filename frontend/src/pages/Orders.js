import { useEffect, useState } from "react";
import api from "../services/api";
import placeholder from "../assets/placeholder.svg";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setStatus("loading");
      setError("");
      try {
        const { data } = await api.get("/api/orders/myorders");
        setOrders(Array.isArray(data) ? data : []);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load orders"
        );
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">My Orders</h2>
          <p className="muted">Track your recent purchases.</p>
        </div>
        <span className="pill">{orders.length} orders</span>
      </div>

      {status === "loading" && <p>Loading orders...</p>}
      {status === "error" && <p>{error}</p>}
      {status === "success" && orders.length === 0 && (
        <p>No orders found.</p>
      )}

      {status === "success" && (
        <div className="flow-grid">
          <div className="flow-main">
            {orders.map((order) => (
              <div key={order._id} className="card order-row">
                <div>
                  <p className="muted">Order</p>
                  <p>{order._id}</p>
                </div>
                <div>
                  <p className="muted">Total</p>
                  <p className="price">{formatPrice(order.totalPrice)}</p>
                </div>
                <div className="order-status">
                  <span className="pill">
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                  <span className="pill">
                    {order.isDelivered ? "Delivered" : "Not Delivered"}
                  </span>
                </div>
                <div>
                  <p className="muted">Items</p>
                  <p>{order.orderItems?.length || 0}</p>
                </div>
                <div>
                  <button
                    className="button secondary"
                    onClick={() => setSelected(order)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          <aside className="flow-side">
            <div className="card glass">
              <h3>Order Tips</h3>
              <p className="muted">
                Paid orders move to delivered once they pass quality checks.
              </p>
              <p className="muted">
                Need help? Contact support with your order ID.
              </p>
              <div className="helpline">
                <span className="helpline-item" data-icon="[Email]">
                  support@bazzarindia.com
                </span>
                <span className="helpline-item" data-icon="[Phone]">
                  +91 99999 88888
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h3>Order Details</h3>
            <p className="muted">Order ID: {selected._id}</p>
            <div>
              {selected.orderItems?.map((item, idx) => (
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
              ))}
            </div>
            <button className="button" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
