import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import api from "../services/api";
import { useCart } from "../context/CartContext.jsx";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const [customer, setCustomer] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const cartItem = cartItems.find((item) => item.product?._id === id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

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

        // Fetch Product details
        try {
          const prodRes = await api.get(`/products/${id}`);
          if (prodRes.data?.success) {
            setProduct(prodRes.data.product);
          } else {
            setError("Product not found.");
          }
        } catch (pErr) {
          if (pErr.response?.status === 400) {
            setError("Invalid Product ID.");
          } else if (pErr.response?.status === 404) {
            setError("Product not found.");
          } else {
            setError("Unable to load product details.");
          }
        }

        // Check if in wishlist
        try {
          const wishRes = await api.get("/wishlist");
          if (wishRes.data?.success && Array.isArray(wishRes.data.wishlist)) {
            const exists = wishRes.data.wishlist.some((item) => (item._id || item) === id);
            setIsWishlisted(exists);
          }
        } catch (wErr) {
          console.warn("Could not check wishlist state:", wErr);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, navigate]);

  const handleToggleWishlist = async () => {
    if (wishlistLoading || !product) return;
    setWishlistLoading(true);
    setFeedback("");

    try {
      if (isWishlisted) {
        const res = await api.delete(`/wishlist/${product._id}`);
        if (res.data?.success) {
          setIsWishlisted(false);
          setFeedback("Removed from wishlist");
        }
      } else {
        const res = await api.post(`/wishlist/${product._id}`);
        if (res.data?.success) {
          setIsWishlisted(true);
          setFeedback("Added to wishlist!");
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setIsWishlisted(true);
        setFeedback("Product is already in wishlist");
      } else {
        setFeedback(err.response?.data?.message || "Failed to update wishlist");
      }
    } finally {
      setWishlistLoading(false);
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const handleAddToCart = async () => {
    if (cartLoading || !product || product.stock <= 0) return;
    setCartLoading(true);
    setFeedback("");

    const res = await addToCart(product._id);
    setCartLoading(false);

    if (res.success) {
      setFeedback("Added to shopping cart!");
    } else {
      setFeedback(res.message);
    }
    setTimeout(() => setFeedback(""), 3000);
  };

  if (loading) {
    return (
      <div className="home-container">
        {customer && <Navbar customer={customer} />}
        <div className="status-container">
          <div className="spinner-large"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="home-container">
        {customer && <Navbar customer={customer} />}
        <div className="status-container error-state" style={{ marginTop: "60px" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2>{error || "Product Not Found"}</h2>
          <button type="button" className="btn-primary" onClick={() => navigate("/products")}>
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Navbar customer={customer} />

      <main className="details-container">
        <button type="button" className="back-link-btn" onClick={() => navigate("/products")}>
          ← Back to Products
        </button>

        <div className="details-card">
          <div className="details-image-section">
            <img
              src={product.image || "https://via.placeholder.com/500x400?text=Product"}
              alt={product.name}
              className="details-large-image"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
              }}
            />
          </div>

          <div className="details-info-section">
            <span className="details-category-tag">{product.category}</span>
            <h1 className="details-title">{product.name}</h1>
            
            <div className="details-price-row">
              <span className="details-price">₹{Number(product.price).toLocaleString("en-IN")}</span>
              <span className={`stock-status ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
              </span>
            </div>

            <p className="details-description">{product.description}</p>

            {feedback && <div className="feedback-banner">{feedback}</div>}

            <div className="details-actions">
              <button
                type="button"
                className="btn-primary details-cart-btn"
                onClick={handleAddToCart}
                disabled={cartLoading || product.stock <= 0}
              >
                {cartLoading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span> Adding...
                  </span>
                ) : product.stock <= 0 ? (
                  "Out of Stock"
                ) : quantityInCart > 0 ? (
                  `Add Another (${quantityInCart} in cart)`
                ) : (
                  "Add to Cart"
                )}
              </button>

              <button
                type="button"
                className={`btn-secondary details-wishlist-btn ${isWishlisted ? "active-wishlist" : ""}`}
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
              >
                {wishlistLoading ? (
                  "Updating..."
                ) : isWishlisted ? (
                  "♥ Wishlisted"
                ) : (
                  "♡ Add to Wishlist"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProductDetails;
