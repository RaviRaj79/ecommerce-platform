import { useEffect, useState } from "react";
import api from "../services/api";
import placeholder from "../assets/placeholder.svg";

const emptyProduct = {
  name: "",
  price: "",
  description: "",
  image: "",
  category: "",
  countInStock: "",
};

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [productQuery, setProductQuery] = useState("");
  const [productCategory, setProductCategory] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");

  const loadData = async () => {
    setStatus("loading");
    setError("");
    try {
      const [productRes, orderRes] = await Promise.all([
        api.get("/api/products"),
        api.get("/api/orders"),
      ]);
      setProducts(Array.isArray(productRes.data) ? productRes.data : []);
      setOrders(Array.isArray(orderRes.data) ? orderRes.data : []);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load admin data"
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      p.name?.toLowerCase().includes(productQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(productQuery.toLowerCase());
    const matchesCategory =
      productCategory === "all" || p.category === productCategory;
    return matchesQuery && matchesCategory;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "paid") return o.isPaid;
    if (orderFilter === "pending") return !o.isPaid;
    if (orderFilter === "delivered") return o.isDelivered;
    if (orderFilter === "not_delivered") return !o.isDelivered;
    return true;
  });

  const stats = {
    products: products.length,
    lowStock: products.filter((p) => (p.countInStock ?? 0) <= 5).length,
    orders: orders.length,
    revenue: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setProductForm(emptyProduct);
    setEditingId(null);
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    setError("");
    if (
      !productForm.name ||
      !productForm.price ||
      !productForm.description ||
      !productForm.image ||
      !productForm.category
    ) {
      setError("Please fill all product fields.");
      return;
    }
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price) || 0,
        countInStock: Number(productForm.countInStock) || 0,
      };
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
      } else {
        await api.post("/api/products", payload);
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save product"
      );
    }
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setProductForm({
      name: product.name || "",
      price: product.price ?? "",
      description: product.description || "",
      image: product.image || "",
      category: product.category || "",
      countInStock: product.countInStock ?? "",
    });
  };

  const deleteProduct = async (id) => {
    if (!id) return;
    try {
      await api.delete(`/api/products/${id}`);
      loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete product"
      );
    }
  };

  const markDelivered = async (orderId) => {
    try {
      await api.put(`/api/orders/${orderId}/deliver`);
      loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update order"
      );
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Admin Dashboard</h2>
          <p className="muted">Manage products, orders, and performance.</p>
        </div>
        <div className="admin-tabs">
          <button
            className={`tab ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={`tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={`tab ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </div>
      </div>

      {status === "loading" && <p>Loading admin data...</p>}
      {status === "error" && <p>{error}</p>}
      {error && status !== "error" && <p>{error}</p>}

      {activeTab === "analytics" && (
        <div className="section">
          <div className="grid">
            <div className="card glass">
              <p className="muted">Total Products</p>
              <h3>{stats.products}</h3>
            </div>
            <div className="card glass">
              <p className="muted">Low Stock (≤5)</p>
              <h3>{stats.lowStock}</h3>
            </div>
            <div className="card glass">
              <p className="muted">Orders</p>
              <h3>{stats.orders}</h3>
            </div>
            <div className="card glass">
              <p className="muted">Revenue</p>
              <h3 className="price">{formatPrice(stats.revenue)}</h3>
            </div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="section">
          <div className="admin-toolbar">
            <h3>Products</h3>
            <div className="admin-filters">
              <input
                className="input"
                placeholder="Search products"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
              />
              <select
                className="select"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All categories" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form className="form" onSubmit={submitProduct}>
            <input
              className="input"
              name="name"
              placeholder="Name"
              value={productForm.name}
              onChange={handleProductChange}
            />
            <input
              className="input"
              name="price"
              placeholder="Price"
              value={productForm.price}
              onChange={handleProductChange}
            />
            <input
              className="input"
              name="description"
              placeholder="Description"
              value={productForm.description}
              onChange={handleProductChange}
            />
            <input
              className="input"
              name="image"
              placeholder="Image URL"
              value={productForm.image}
              onChange={handleProductChange}
            />
            {productForm.image && (
              <img
                src={productForm.image}
                alt="Preview"
                className="product-image"
              />
            )}
            <input
              className="input"
              name="category"
              placeholder="Category"
              value={productForm.category}
              onChange={handleProductChange}
            />
            <input
              className="input"
              name="countInStock"
              placeholder="Count In Stock"
              value={productForm.countInStock}
              onChange={handleProductChange}
            />
            <div>
              <button className="button" type="submit">
                {editingId ? "Update Product" : "Add Product"}
              </button>
              {editingId && (
                <button
                  className="button secondary"
                  type="button"
                  onClick={resetForm}
                  style={{ marginLeft: 8 }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="grid" style={{ marginTop: 16 }}>
            {filteredProducts.map((product) => (
              <div key={product._id} className="card">
                <img
                  src={product.image || placeholder}
                  alt={product.name}
                  className="thumb-lg"
                  onError={(e) => {
                    e.currentTarget.src = placeholder;
                  }}
                />
                <h4 className="card-title">{product.name}</h4>
                <p className="price">{formatPrice(product.price)}</p>
                <p className="muted">{product.category}</p>
                <div>
                  <button
                    className="button secondary"
                    onClick={() => editProduct(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => deleteProduct(product._id)}
                    style={{ marginLeft: 8 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="section">
          <div className="admin-toolbar">
            <h3>Orders</h3>
            <div className="admin-filters">
              <select
                className="select"
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
              >
                <option value="all">All orders</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="not_delivered">Not Delivered</option>
              </select>
            </div>
          </div>
          <div className="grid">
            {filteredOrders.map((order) => (
              <div key={order._id} className="card order-card">
                <p>
                  <strong>Order:</strong> {order._id}
                </p>
                <p className="price">{formatPrice(order.totalPrice)}</p>
                <p className="muted">
                  Customer: {order.user?.name} ({order.user?.email})
                </p>
                <div className="pill">
                  {order.isPaid ? "Paid" : "Pending"}
                </div>
                <div className="pill">
                  {order.isDelivered ? "Delivered" : "Not Delivered"}
                </div>
                {!order.isDelivered && (
                  <button
                    className="button"
                    onClick={() => markDelivered(order._id)}
                  >
                    Mark Delivered
                  </button>
                )}
                <button
                  className="button secondary"
                  onClick={() => setSelectedOrder(order)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedOrder && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedOrder(null)}
        >
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h3>Order Details</h3>
            <p className="muted">Order ID: {selectedOrder._id}</p>
            <p className="muted">
              Customer: {selectedOrder.user?.name} (
              {selectedOrder.user?.email})
            </p>
            <div className="section">
              <h4>Shipping</h4>
              <p className="muted">
                {selectedOrder.shippingAddress?.address},{" "}
                {selectedOrder.shippingAddress?.city},{" "}
                {selectedOrder.shippingAddress?.postalCode},{" "}
                {selectedOrder.shippingAddress?.country}
              </p>
            </div>
            <div className="section">
              <h4>Items</h4>
              {selectedOrder.orderItems?.map((item, idx) => (
                <div key={`${item.product}-${idx}`} className="modal-item">
                  <div>
                    <strong>{item.name}</strong>
                    <p className="muted">Qty: {item.qty}</p>
                  </div>
                  <div className="price">{formatPrice(item.price)}</div>
                </div>
              ))}
            </div>
            <div className="section">
              <h4>Status</h4>
              <div className="pill">
                {selectedOrder.isPaid ? "Paid" : "Pending"}
              </div>
              <div className="pill">
                {selectedOrder.isDelivered ? "Delivered" : "Not Delivered"}
              </div>
              <p className="muted">Created: {formatDate(selectedOrder.createdAt)}</p>
              <p className="muted">Paid: {formatDate(selectedOrder.paidAt)}</p>
              <p className="muted">
                Delivered: {formatDate(selectedOrder.deliveredAt)}
              </p>
            </div>
            <div className="section">
              <h4>Payment</h4>
              <p className="muted">
                Method: {selectedOrder.paymentMethod || "N/A"}
              </p>
              {selectedOrder.paymentResult?.id && (
                <p className="muted">
                  Payment ID: {selectedOrder.paymentResult.id}
                </p>
              )}
              {selectedOrder.paymentResult?.status && (
                <p className="muted">
                  Payment Status: {selectedOrder.paymentResult.status}
                </p>
              )}
              {selectedOrder.paymentResult?.update_time && (
                <p className="muted">
                  Updated: {selectedOrder.paymentResult.update_time}
                </p>
              )}
              {selectedOrder.paymentResult?.email_address && (
                <p className="muted">
                  Payer: {selectedOrder.paymentResult.email_address}
                </p>
              )}
            </div>
            <div className="section">
              <strong>Total: {formatPrice(selectedOrder.totalPrice)}</strong>
            </div>
            <button className="button" onClick={() => setSelectedOrder(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
