import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import placeholder from "../assets/placeholder.svg";

const Cart = () => {
  const { cartItems, addToCart, decrementFromCart, removeFromCart, updateQty } =
    useCart();

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1),
    0
  );

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Your Cart</h2>
          <p className="muted">Review items before checkout.</p>
        </div>
        <div className="stepper">
          <span className="step active">Cart</span>
          <span className="step">Checkout</span>
          <span className="step">Success</span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="card">
          <p>Cart is empty</p>
        </div>
      ) : (
        <div className="flow-grid">
          <div className="flow-main">
            {cartItems.map((item, idx) => {
              const itemId = item._id || item.id;
              return (
                <div
                  key={itemId}
                  className="card cart-row fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div>
                    <img
                      className="cart-image"
                      src={item.image || placeholder}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = placeholder;
                      }}
                    />
                    <h3 className="card-title">{item.name}</h3>
                    <p className="muted">
                      Unit: {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="cart-controls">
                    <button
                      className="button secondary"
                      onClick={() => decrementFromCart(itemId)}
                    >
                      -
                    </button>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      max="99"
                      value={item.qty || 1}
                      onChange={(e) => updateQty(itemId, e.target.value)}
                    />
                    <button
                      className="button secondary"
                      onClick={() => addToCart(item)}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-meta">
                    <p className="price">
                      {formatPrice(
                        (Number(item.price) || 0) * (item.qty || 1)
                      )}
                    </p>
                    <button
                      className="button secondary"
                      onClick={() => removeFromCart(itemId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <aside className="flow-side">
            <div className="card glass">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span className="muted">Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className="summary-row">
                <span className="muted">Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row">
                <span className="muted">Taxes</span>
                <span>Included</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <Link className="button" to="/checkout">
                Proceed to Checkout
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
