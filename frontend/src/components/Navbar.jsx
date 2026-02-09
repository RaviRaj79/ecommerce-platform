import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { cartItems } = useCart();
  const count = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  })();

  const logout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(`/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          BazzarIndia
        </Link>
        <form className="nav-search" onSubmit={submitSearch}>
          <input
            className="input nav-search-input"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="button nav-search-btn" type="submit">
            <span className="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" strokeWidth="2" />
              </svg>
            </span>
            Search
          </button>
        </form>
        <nav className="nav-links">
          <NavLink to="/products" className="nav-link">
            Products
          </NavLink>
          {userInfo?.isAdmin && (
            <NavLink to="/admin" className="nav-link">
              <span className="icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 10h18M7 4h10M5 16h14M9 20h6" strokeWidth="2" />
                </svg>
              </span>
              Admin
            </NavLink>
          )}
          <NavLink to="/orders" className="nav-link">
            <span className="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 4h12v16H6z" strokeWidth="2" />
                <path d="M8 8h8M8 12h8M8 16h6" strokeWidth="2" />
              </svg>
            </span>
            Orders
          </NavLink>
          <NavLink to="/cart" className="nav-link">
            <span className="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 6h14l-2 10H8L6 6z" strokeWidth="2" />
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="17" cy="20" r="1.5" />
              </svg>
            </span>
            Cart <span className="badge">{count}</span>
          </NavLink>
          {userInfo ? (
            <div className="nav-user">
              <span className="nav-link">{userInfo.name}</span>
              <button className="nav-logout" onClick={logout}>
                <span className="icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M10 6h8v12h-8" strokeWidth="2" />
                    <path d="M4 12h10M8 8l-4 4 4 4" strokeWidth="2" />
                  </svg>
                </span>
                Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="nav-link">
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
