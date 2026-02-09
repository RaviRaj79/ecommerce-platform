import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import placeholder from "../assets/placeholder.svg";

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const cashfreeClientId = process.env.REACT_APP_CASHFREE_CLIENT_ID;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [protection, setProtection] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [activePromo, setActivePromo] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("Cashfree");

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [paymentSessionId, setPaymentSessionId] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);

  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!userInfo) return;
    if (!fullName && userInfo.name) setFullName(userInfo.name);
    if (!email && userInfo.email) setEmail(userInfo.email);
  }, [userInfo, fullName, email]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1),
        0
      ),
    [cartItems]
  );

  const itemsCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.qty || 1), 0),
    [cartItems]
  );

  const shippingFee = deliveryOption === "express" ? 99 : 0;
  const protectionFee = protection ? 29 : 0;

  const promoDiscount = useMemo(() => {
    if (!activePromo) return 0;
    if (activePromo === "SPRINT10") {
      return Math.min(subtotal * 0.1, 500);
    }
    if (activePromo === "SHIPFREE") {
      return shippingFee;
    }
    return 0;
  }, [activePromo, subtotal, shippingFee]);

  const total = useMemo(
    () => Math.max(0, subtotal + shippingFee + protectionFee - promoDiscount),
    [subtotal, shippingFee, protectionFee, promoDiscount]
  );

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const isIndia = country.trim().toLowerCase() === "india";

  const errors = useMemo(() => {
    const nextErrors = {};
    if (!fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!addressLine1.trim()) nextErrors.addressLine1 = "Address line 1 is required.";
    if (!city.trim()) nextErrors.city = "City is required.";
    if (!state.trim()) nextErrors.state = "State is required.";
    if (!postalCode.trim()) nextErrors.postalCode = "Postal code is required.";
    if (!country.trim()) nextErrors.country = "Country is required.";
    if (!phone.trim()) nextErrors.phone = "Phone is required.";

    if (postalCode && isIndia && !/^\d{6}$/.test(postalCode.trim())) {
      nextErrors.postalCode = "Enter a 6 digit PIN code.";
    }
    if (postalCode && !isIndia && postalCode.trim().length < 4) {
      nextErrors.postalCode = "Postal code looks too short.";
    }
    if (phone && isIndia && !/^\d{10}$/.test(phone.trim())) {
      nextErrors.phone = "Enter a 10 digit phone number.";
    }
    if (phone && !isIndia && phone.trim().length < 7) {
      nextErrors.phone = "Phone number looks too short.";
    }

    return nextErrors;
  }, [fullName, email, addressLine1, city, state, postalCode, country, phone, isIndia]);

  const markTouched = (field) =>
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

  const showError = (field) => touched[field] && errors[field];

  useEffect(() => {
    if (!createdOrder && !paymentSessionId) return;
    setCreatedOrder(null);
    setPaymentSessionId("");
  }, [
    createdOrder,
    paymentSessionId,
    fullName,
    email,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    postalCode,
    country,
    phone,
    deliveryOption,
    protection,
    activePromo,
    notes,
    paymentMethod,
    cartItems,
  ]);

  const validateOrderItems = () => {
    const missingImage = cartItems.find((i) => !i.image);
    const missingId = cartItems.find((i) => !(i._id || i.id));
    if (missingImage) {
      return "One or more items are missing an image.";
    }
    if (missingId) {
      return "One or more items are missing product IDs.";
    }
    return "";
  };

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setActivePromo("");
      setPromoMessage("Promo removed.");
      return;
    }

    if (code === "SPRINT10") {
      setActivePromo(code);
      setPromoMessage("SPRINT10 applied. Save 10% up to 500.");
      return;
    }

    if (code === "SHIPFREE") {
      setActivePromo(code);
      setPromoMessage("SHIPFREE applied. Shipping fee waived.");
      return;
    }

    setActivePromo("");
    setPromoMessage("Invalid promo code.");
  };

  const estimatedDelivery = useMemo(() => {
    const date = new Date();
    const days = deliveryOption === "express" ? 2 : 5;
    date.setDate(date.getDate() + days);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }, [deliveryOption]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (Object.keys(errors).length) {
      setTouched({
        fullName: true,
        email: true,
        addressLine1: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        phone: true,
      });
      setError("Please fix the highlighted fields.");
      return;
    }

    const itemError = validateOrderItems();
    if (itemError) {
      setError(itemError);
      return;
    }

    if (total <= 0) {
      setError("Order total must be greater than zero.");
      return;
    }

    try {
      setStatus("loading");

      const authHeaders = userInfo?.token
        ? {
            Authorization: `Bearer ${userInfo.token}`,
            "x-auth-token": userInfo.token,
          }
        : {};

      const fullAddress = [addressLine1, addressLine2, landmark]
        .map((line) => line.trim())
        .filter(Boolean)
        .join(", ");

      if (!createdOrder) {
        const orderPayload = {
          orderItems: cartItems.map((item) => ({
            name: item.name,
            qty: item.qty || 1,
            image: item.image,
            price: Number(item.price) || 0,
            product: item._id || item.id,
          })),
          shippingAddress: {
            name: fullName,
            address: fullAddress,
            city,
            state,
            postalCode,
            country,
            phone,
          },
          paymentMethod,
          promoCode: activePromo,
          deliveryOption,
          deliveryNotes: notes,
          itemsPrice: subtotal,
          shippingPrice: shippingFee,
          protectionPrice: protectionFee,
          totalPrice: total,
        };

        const { data: newOrder } = await api.post("/api/orders", orderPayload);
        setCreatedOrder(newOrder);

        if (paymentMethod === "COD") {
          const orderSummary = {
            orderId: newOrder._id,
            total: newOrder.totalPrice,
            items: newOrder.orderItems,
            paymentMethod: newOrder.paymentMethod,
            createdAt: newOrder.createdAt,
            isPaid: newOrder.isPaid,
          };
          localStorage.setItem("last_order_id", newOrder._id);
          clearCart();
          navigate("/order-success", { state: orderSummary });
          setStatus("idle");
          return;
        }

        const { data } = await api.post(
          "/api/payment/cashfree/order",
          {
            orderId: newOrder._id,
            customer_name: fullName || userInfo?.name,
            customer_email: email || userInfo?.email,
            customer_phone: phone,
          },
          { headers: authHeaders }
        );
        setPaymentSessionId(data.payment_session_id);
        setStatus("idle");
        return;
      }

      if (paymentMethod === "COD") {
        setStatus("idle");
        return;
      }

      if (createdOrder && !paymentSessionId) {
        const { data } = await api.post(
          "/api/payment/cashfree/order",
          {
            orderId: createdOrder._id,
            customer_name: fullName || userInfo?.name,
            customer_email: email || userInfo?.email,
            customer_phone: phone,
          },
          { headers: authHeaders }
        );
        setPaymentSessionId(data.payment_session_id);
        setStatus("idle");
        return;
      }

      if (!cashfreeClientId) {
        setError("Cashfree client id is missing.");
        setStatus("idle");
        return;
      }

      if (!paymentSessionId) {
        setError("Payment session not created.");
        setStatus("idle");
        return;
      }

      const loadScript = (src) =>
        new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

      const loaded = await loadScript("https://sdk.cashfree.com/js/v3/cashfree.js");
      if (!loaded) {
        setError("Failed to load Cashfree.");
        setStatus("idle");
        return;
      }

      const cashfree = window.Cashfree({ mode: "sandbox" });
      const result = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_modal",
      });

      if (result?.error) {
        setError(result.error?.message || "Payment failed.");
        setStatus("idle");
        return;
      }

      try {
        await api.post(
          "/api/payment/cashfree/verify",
          { orderId: createdOrder._id },
          { headers: authHeaders }
        );

      const orderSummary = {
        orderId: createdOrder._id,
        total: createdOrder.totalPrice,
        items: createdOrder.orderItems,
        paymentMethod: createdOrder.paymentMethod,
        createdAt: createdOrder.createdAt,
        isPaid: createdOrder.isPaid,
      };
        localStorage.setItem("last_order_id", createdOrder._id);

        clearCart();
        navigate("/order-success", { state: orderSummary });
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Payment verification failed.";
        setError(message);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Checkout failed. Please try again.";
      setError(message);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Checkout</h2>
          <p className="muted">Secure your order with verified delivery details.</p>
        </div>
        <div className="stepper">
          <span className="step done">Cart</span>
          <span className="step active">Checkout</span>
          <span className="step">Success</span>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}
      {promoMessage && !error && <p className="alert">{promoMessage}</p>}

      <div className="flow-grid">
        <form onSubmit={submitHandler} className="flow-main card">
          <div className="section">
            <h3>Contact</h3>
            <div className="form-grid">
              <label className="field">
                <span className="field-label">Full Name</span>
                <input
                  className={`input ${showError("fullName") ? "input-error" : ""}`}
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => markTouched("fullName")}
                />
                {showError("fullName") && (
                  <span className="field-error">{errors.fullName}</span>
                )}
              </label>
              <label className="field">
                <span className="field-label">Email</span>
                <input
                  className={`input ${showError("email") ? "input-error" : ""}`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched("email")}
                />
                {showError("email") && (
                  <span className="field-error">{errors.email}</span>
                )}
              </label>
              <label className="field">
                <span className="field-label">Phone</span>
                <input
                  className={`input ${showError("phone") ? "input-error" : ""}`}
                  type="tel"
                  placeholder="10 digit phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => markTouched("phone")}
                />
                {showError("phone") && (
                  <span className="field-error">{errors.phone}</span>
                )}
              </label>
            </div>
          </div>

          <div className="section">
            <h3>Shipping Address</h3>
            <div className="form-grid">
              <label className="field">
                <span className="field-label">Address Line 1</span>
                <input
                  className={`input ${showError("addressLine1") ? "input-error" : ""}`}
                  type="text"
                  placeholder="Street, house number"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  onBlur={() => markTouched("addressLine1")}
                />
                {showError("addressLine1") && (
                  <span className="field-error">{errors.addressLine1}</span>
                )}
              </label>
              <label className="field">
                <span className="field-label">Address Line 2</span>
                <input
                  className="input"
                  type="text"
                  placeholder="Apartment, suite, floor"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
                <span className="field-hint">Optional</span>
              </label>
              <label className="field">
                <span className="field-label">Landmark</span>
                <input
                  className="input"
                  type="text"
                  placeholder="Nearby landmark"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
                <span className="field-hint">Optional</span>
              </label>
              <label className="field">
                <span className="field-label">City</span>
                <input
                  className={`input ${showError("city") ? "input-error" : ""}`}
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={() => markTouched("city")}
                />
                {showError("city") && <span className="field-error">{errors.city}</span>}
              </label>
              <label className="field">
                <span className="field-label">State</span>
                <input
                  className={`input ${showError("state") ? "input-error" : ""}`}
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  onBlur={() => markTouched("state")}
                />
                {showError("state") && <span className="field-error">{errors.state}</span>}
              </label>
              <label className="field">
                <span className="field-label">Postal Code</span>
                <input
                  className={`input ${showError("postalCode") ? "input-error" : ""}`}
                  type="text"
                  placeholder={isIndia ? "6 digit PIN" : "Postal code"}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  onBlur={() => markTouched("postalCode")}
                />
                {showError("postalCode") && (
                  <span className="field-error">{errors.postalCode}</span>
                )}
              </label>
              <label className="field">
                <span className="field-label">Country</span>
                <input
                  className={`input ${showError("country") ? "input-error" : ""}`}
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  onBlur={() => markTouched("country")}
                />
                {showError("country") && (
                  <span className="field-error">{errors.country}</span>
                )}
              </label>
            </div>
          </div>

          <div className="section">
            <h3>Delivery</h3>
            <div className="radio-group">
              <label className={`radio-card ${deliveryOption === "standard" ? "active" : ""}`}>
                <div className="radio-info">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryOption === "standard"}
                    onChange={() => setDeliveryOption("standard")}
                  />
                  <div>
                    <strong>Standard Delivery</strong>
                    <p className="muted">Arrives by {estimatedDelivery}</p>
                  </div>
                </div>
                <span className="price">Free</span>
              </label>
              <label className={`radio-card ${deliveryOption === "express" ? "active" : ""}`}>
                <div className="radio-info">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryOption === "express"}
                    onChange={() => setDeliveryOption("express")}
                  />
                  <div>
                    <strong>Express Delivery</strong>
                    <p className="muted">Priority handling, arrives sooner</p>
                  </div>
                </div>
                <span className="price">{formatPrice(shippingFee)}</span>
              </label>
            </div>

            <div className="toggle">
              <div>
                <strong>Order Protection</strong>
                <p className="muted">Covers accidental damage and loss.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={protection}
                  onChange={() => setProtection((prev) => !prev)}
                />
              </label>
            </div>
          </div>

          <div className="section">
            <h3>Promo Code</h3>
            <div className="form-grid">
              <input
                className="input"
                type="text"
                placeholder="Try SPRINT10 or SHIPFREE"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button
                type="button"
                className="button secondary"
                onClick={applyPromo}
              >
                Apply
              </button>
            </div>
          </div>

          <div className="section">
            <h3>Payment Method</h3>
            <div className="radio-group">
              <label
                className={`radio-card ${
                  paymentMethod === "Cashfree" ? "active" : ""
                }`}
              >
                <div className="radio-info">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "Cashfree"}
                    onChange={() => setPaymentMethod("Cashfree")}
                  />
                  <div>
                    <strong>Pay Online</strong>
                    <p className="muted">UPI, Cards, Netbanking via Cashfree</p>
                  </div>
                </div>
                <span className="price">Instant</span>
              </label>
              <label
                className={`radio-card ${paymentMethod === "COD" ? "active" : ""}`}
              >
                <div className="radio-info">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <div>
                    <strong>Cash on Delivery</strong>
                    <p className="muted">Pay when your order arrives</p>
                  </div>
                </div>
                <span className="price">Pay Later</span>
              </label>
            </div>
          </div>

          <div className="section">
            <h3>Payment</h3>
            <p className="muted">
              {paymentMethod === "Cashfree"
                ? "You will be redirected to Cashfree secure checkout (UPI, Card, Netbanking)."
                : "Your order will be confirmed. Pay on delivery."}
            </p>
          </div>

          <div className="section">
            <h3>Delivery Notes</h3>
            <textarea
              className="input textarea"
              placeholder="Any delivery instructions for the rider"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button className="button" type="submit" disabled={status === "loading"}>
            {status === "loading"
              ? "Processing..."
              : paymentSessionId
              ? "Pay Now"
              : "Create Payment Order"}
          </button>
        </form>

        <aside className="flow-side">
          <div className="card">
            <h3>Order Summary</h3>
            <p className="muted">Items: {itemsCount}</p>
            <div className="summary-row">
              <span className="muted">Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span className="muted">Shipping</span>
              <span>{shippingFee ? formatPrice(shippingFee) : "Free"}</span>
            </div>
            <div className="summary-row">
              <span className="muted">Protection</span>
              <span>{protectionFee ? formatPrice(protectionFee) : "None"}</span>
            </div>
            <div className="summary-row">
              <span className="muted">Discount</span>
              <span>- {formatPrice(promoDiscount)}</span>
            </div>
            <div className="summary-row">
              <span className="muted">Payment</span>
              <span>{paymentMethod === "COD" ? "Cash on Delivery" : "Online"}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <div className="summary-list">
              <h4>Items</h4>
              {cartItems.length ? (
                cartItems.map((item, idx) => (
                  <div key={`${item._id || item.id}-${idx}`} className="summary-item">
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
                        <p className="muted">Qty: {item.qty || 1}</p>
                      </div>
                    </div>
                    <div className="price">{formatPrice(item.price)}</div>
                  </div>
                ))
              ) : (
                <p className="muted">No items in cart.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
