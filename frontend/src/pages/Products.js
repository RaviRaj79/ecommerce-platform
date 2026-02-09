import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const Products = () => {
  const fallbackImage =
    "https://images.unsplash.com/photo-1580910051074-3eb694886505";
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [page, setPage] = useState(1);
  const [quickView, setQuickView] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
      return [];
    }
  });
  const { addToCart } = useCart();
  const pageSize = 8;
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      setStatus("loading");
      setError("");
      try {
        const { data } = await api.get("/api/products");
        setProducts(Array.isArray(data) ? data : []);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load products"
        );
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    const min = priceMin === "" ? -Infinity : Number(priceMin);
    const max = priceMax === "" ? Infinity : Number(priceMax);
    return products
      .filter((p) =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      )
      .filter((p) => category === "all" || p.category === category)
      .filter((p) => (Number(p.price) || 0) >= min && (Number(p.price) || 0) <= max);
  }, [products, query, category, priceMin, priceMax]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sort === "price_low") list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "price_high") list.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === "name") list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return list;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    setPage(1);
  }, [query, category, priceMin, priceMax, sort]);

  return (
    <div className="section">
      <h2 className="section-title">Products</h2>
      <p className="muted">Fresh picks, ready to ship.</p>
      <div className="banner card fade-up">
        <img
          src="https://images.unsplash.com/photo-1694315643343-b32de9a66d63?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2R1Y3RzJTIwbGFwdG9wJTIwYW5kJTIwbW9iaWxlc3xlbnwwfHwwfHx8MA%3D%3D"
          alt="Products banner"
        />
      </div>

      <section className="section featured-grid fade-up">
        <div className="card">
          <h3 className="card-title">Mobile Picks</h3>
          <p className="muted">Curated phones built for speed and clarity.</p>
          <div className="strip-grid">
            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
              alt="Mobile product"
            />
            <img
              src="https://images.unsplash.com/photo-1580910051074-3eb694886505"
              alt="Mobile product"
            />
          </div>
        </div>
      </section>

      <div className="filters-layout">
        <aside className="filter-panel card glass">
          <h3>Filters</h3>
          <label className="filter-label">
            Search
            <input
              className="input"
              placeholder="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="filter-label">
            Category
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-label">
            Sort
            <select
              className="select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </label>
          <label className="filter-label">
            Min price
            <input
              className="input"
              type="number"
              placeholder="0"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
          </label>
          <label className="filter-label">
            Max price
            <input
              className="input"
              type="number"
              placeholder="99999"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </label>
        </aside>

        <div className="filters-content">
          {status === "loading" && <p>Loading products...</p>}
          {status === "error" && <p>{error}</p>}
          {status === "success" && products.length === 0 && (
            <p>No products available.</p>
          )}

          {status === "success" && (
            <div className="grid">
              {paged.map((p, idx) => (
                <div
                  key={p._id}
                  className="card fade-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <img
                    src={p.image || fallbackImage}
                    alt={p.name}
                    className="product-image"
                    onError={(e) => {
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                  <div className="card-header">
                    <h3 className="card-title">{p.name}</h3>
                    <span className="pill">{p.category || "General"}</span>
                  </div>
                  <p className="price">{formatPrice(p.price)}</p>
                  <p className="muted">
                    {p.description?.slice(0, 80) || "Curated product built to last."}
                  </p>
                  <div className="card-meta">
                    <span className="meta">Stock: {p.countInStock ?? 0}</span>
                    <span className="meta">Ready to ship</span>
                    {(p.countInStock ?? 0) <= 5 && (
                      <span className="meta badge-warn">Low stock</span>
                    )}
                    {(p.countInStock ?? 0) > 10 && (
                      <span className="meta badge-good">Best Seller</span>
                    )}
                  </div>
                  <div className="card-actions">
                    <button className="button" onClick={() => addToCart(p)}>
                      Add to Cart
                    </button>
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => setQuickView(p)}
                    >
                      Quick View
                    </button>
                    <button
                      className={`button secondary ${wishlist.includes(p._id) ? "active" : ""}`}
                      type="button"
                      onClick={() => toggleWishlist(p._id)}
                    >
                      {wishlist.includes(p._id) ? "Wishlisted" : "Wishlist"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === "success" && (
            <div className="pagination">
              <button
                className="button secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="muted">
                Page {page} of {totalPages}
              </span>
              <button
                className="button secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {quickView && (
        <div className="modal-backdrop" onClick={() => setQuickView(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h3>{quickView.name}</h3>
            <img
              src={quickView.image || fallbackImage}
              alt={quickView.name}
              className="product-image"
            />
            <p className="price">{formatPrice(quickView.price)}</p>
            <p className="muted">{quickView.description}</p>
            <div className="card-actions">
              <button className="button" onClick={() => addToCart(quickView)}>
                Add to Cart
              </button>
              <button className="button secondary" onClick={() => setQuickView(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
