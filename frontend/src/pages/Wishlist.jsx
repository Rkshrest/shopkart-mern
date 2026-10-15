import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import api from "../services/api";
import { useCart } from "../context/CartContext.jsx";

function Wishlist() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [customer, setCustomer] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/wishlist");
      if (res.data?.success) {
        setWishlist(res.data.wishlist || []);
      } else {
        setError("Unable to load wishlist");
      }
    } catch (err) {
      console.error("Fetch wishlist error:", err);
      setError("Unable to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await api.get("/customers/me");
        const profile = userRes.data.customer || userRes.data.user || userRes.data;
        if (!profile || (!profile.email && !profile._id)) {
          navigate("/login");
          return;
        }
        setCustomer(profile);
        await fetchWishlist();
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/login");
      }
    };

    init();
  }, [navigate]);

  const handleRemove = async (productId) => {
    try {
      setActionLoadingId(productId);
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data?.success) {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
      }
    } catch (err) {
      console.error("Remove from wishlist error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddToCart = async (productId) => {
    setActionLoadingId(`cart_${productId}`);
    await addToCart(productId);
    setActionLoadingId(null);
  };

  if (!customer) return null;

  return (
    <div className="home-container">
      <Navbar customer={customer} />

      <main className="catalog-container">
        <div className="catalog-header">
          <div>
            <h1>My Wishlist</h1>
            <p>Saved items you love</p>
          </div>
        </div>

        {loading ? (
          <div className="status-container">
            <div className="spinner-large"></div>
            <p>Loading your wishlist...</p>
          </div>
        ) : error ? (
          <div className="status-container error-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
            <button type="button" className="btn-primary" onClick={fetchWishlist}>
              Try Again
            </button>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="status-container empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h3>Your wishlist is empty</h3>
            <p>Save items you like so you can easily find them later.</p>
            <button type="button" className="btn-primary" onClick={() => navigate("/products")}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {wishlist.map((product) => (
              <div key={product._id} className="product-card">
                <div
                  className="product-image-container"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <img
                    src={product.image || "https://via.placeholder.com/300x200?text=Product"}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                  <span className="product-category-tag">{product.category}</span>
                </div>

                <div className="product-info">
                  <h3
                    className="product-title"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    {product.name}
                  </h3>

                  <div className="product-price-row">
                    <span className="product-price">₹{Number(product.price).toLocaleString("en-IN")}</span>
                    <span
                      className={`stock-status ${
                        product.stock > 0 ? "in-stock" : "out-of-stock"
                      }`}
                    >
                      {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                    </span>
                  </div>

                  <div className="product-card-actions">
                    <button
                      type="button"
                      className="btn-secondary view-details-btn"
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      className="btn-primary add-cart-btn"
                      onClick={() => handleAddToCart(product._id)}
                      disabled={
                        actionLoadingId === `cart_${product._id}` || product.stock <= 0
                      }
                    >
                      {actionLoadingId === `cart_${product._id}` ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-wishlist-btn"
                    onClick={() => handleRemove(product._id)}
                    disabled={actionLoadingId === product._id}
                  >
                    {actionLoadingId === product._id ? "Removing..." : "Remove from Wishlist"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Wishlist;
