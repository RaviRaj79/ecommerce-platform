import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="section">
      <section className="amazon-hero">
        <div className="amazon-hero-content">
          <h1>Big deals, fast delivery.</h1>
          <p className="muted">
            Daily offers across mobiles, laptops, audio, and home essentials.
          </p>
          <div className="amazon-hero-actions">
            <Link className="button" to="/products">
              Shop All
            </Link>
            <Link className="button secondary" to="/orders">
              Track Orders
            </Link>
          </div>
        </div>
        <div className="amazon-hero-banner">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
            alt="Big sale"
          />
        </div>
      </section>

      <section className="amazon-grid">
        <div className="card amazon-tile">
          <h3>Top picks in Mobiles</h3>
          <img
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
            alt="Mobiles"
          />
          <Link className="link" to="/products">
            Shop now
          </Link>
        </div>
        <div className="card amazon-tile">
          <h3>Premium Laptops</h3>
          <img
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
            alt="Laptops"
          />
          <Link className="link" to="/products">
            Shop now
          </Link>
        </div>
        <div className="card amazon-tile">
          <h3>Audio Essentials</h3>
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
            alt="Audio"
          />
          <Link className="link" to="/products">
            Shop now
          </Link>
        </div>
        <div className="card amazon-tile">
          <h3>Work & Study</h3>
          <img
            src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
            alt="Work"
          />
          <Link className="link" to="/products">
            Shop now
          </Link>
        </div>
      </section>

      <section className="amazon-row">
        <div className="row-header">
          <h2 className="section-title">Deals of the Day</h2>
          <Link className="link" to="/products">
            See all deals
          </Link>
        </div>
        <div className="row-scroll">
          {[
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
            "https://images.unsplash.com/photo-1542060748-10c28b62716f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGNsb3RoZXN8ZW58MHx8MHx8fDA%3D",
            "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
          ].map((img, i) => (
            <div className="deal-card" key={i}>
              <img src={img} alt="Deal" />
              <p className="muted">Up to 40% off</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <h4>Get to Know Us</h4>
            <p className="muted">About BazzarIndia</p>
            <p className="muted">Careers</p>
            <p className="muted">Press Releases</p>
          </div>
          <div>
            <h4>Connect with Us</h4>
            <p className="muted">Facebook</p>
            <p className="muted">Instagram</p>
            <p className="muted">Twitter</p>
          </div>
          <div>
            <h4>Help</h4>
            <p className="muted">Payments</p>
            <p className="muted">Shipping</p>
            <p className="muted">Returns & Refunds</p>
          </div>
          <div>
            <h4>Policy</h4>
            <p className="muted">Privacy Notice</p>
            <p className="muted">Terms of Use</p>
            <p className="muted">Security</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="muted">Copyright (c) 2026 BazzarIndia.</span>
          <span className="muted">All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;

