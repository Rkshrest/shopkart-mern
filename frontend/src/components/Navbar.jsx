import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext.jsx";

function Navbar({ customer }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalCount, clearCartState } = useCart();

  const handleLogout = async () => {
    try {
      const res = await api.post("/customers/logout");
      const msg = res.data?.message || "Logged out successfully";
      clearCartState();
      navigate("/login", { state: { logoutMessage: msg } });
    } catch (error) {
      console.error("Logout API error:", error);
      clearCartState();
      navigate("/login", { state: { logoutMessage: "Logged out successfully" } });
    }
  };

  const isActive = (path) => (location.pathname === path ? "nav-link active" : "nav-link");

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/home" className="nav-brand">
          <div className="nav-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <span className="logo-text">ShopKart</span>
        </Link>

        <div className="nav-menu">
          <Link to="/home" className={isActive("/home")}>
            Home
          </Link>
          <Link to="/products" className={isActive("/products")}>
            Products
          </Link>
          <Link to="/wishlist" className={isActive("/wishlist")}>
            Wishlist
          </Link>
          <Link to="/cart" className={isActive("/cart")}>
            Cart <span className="cart-badge-count">({totalCount})</span>
          </Link>
          <Link to="/orders" className={isActive("/orders")}>
            My Orders
          </Link>
        </div>
      </div>

      <div className="nav-actions">
        {customer && (
          <div className="user-badge">
            <span className="user-avatar">
              {(customer.fullName || "U").charAt(0).toUpperCase()}
            </span>
            <span className="user-name">{customer.fullName || customer.email}</span>
          </div>
        )}
        <button type="button" className="logout-btn" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
