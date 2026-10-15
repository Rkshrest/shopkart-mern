import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext.jsx";

function ProductCard({ product, initialWishlisted = false }) {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [cartFeedback, setCartFeedback] = useState("");

  const cartItem = cartItems.find((item) => item.product?._id === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (wishlistLoading) return;

    setWishlistLoading(true);
    setWishlistError("");

    try {
      if (isWishlisted) {
        const res = await api.delete(`/wishlist/${product._id}`);
        if (res.data?.success) {
          setIsWishlisted(false);
        }
      } else {
        const res = await api.post(`/wishlist/${product._id}`);
        if (res.data?.success) {
          setIsWishlisted(true);
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setIsWishlisted(true);
      } else if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setWishlistError(err.response?.data?.message || "Failed to update wishlist");
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (cartLoading || product.stock <= 0) return;

    setCartLoading(true);
    setCartFeedback("");

    const result = await addToCart(product._id);
    setCartLoading(false);

    if (result.success) {
      setCartFeedback("Added!");
      setTimeout(() => setCartFeedback(""), 2000);
    } else {
      setCartFeedback(result.message);
      setTimeout(() => setCartFeedback(""), 3000);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-container" onClick={() => navigate(`/products/${product._id}`)}>
        <img
          src={product.image || "https://via.placeholder.com/300x200?text=Product"}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80";
          }}
        />
        <span className="product-category-tag">{product.category}</span>
        <button
          type="button"
          className={`wishlist-icon-btn ${isWishlisted ? "active" : ""}`}
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {wishlistLoading ? (
            <span className="spinner-small"></span>
          ) : isWishlisted ? (
            "♥"
          ) : (
            "♡"
          )}
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-title" onClick={() => navigate(`/products/${product._id}`)}>
          {product.name}
        </h3>
        
        <div className="product-price-row">
          <span className="product-price">₹{Number(product.price).toLocaleString("en-IN")}</span>
          <span className={`stock-status ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}>
            {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
          </span>
        </div>

        {wishlistError && <div className="card-error-text">{wishlistError}</div>}
        {cartFeedback && <div className="card-feedback-text">{cartFeedback}</div>}

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
              `Add Another (${quantityInCart})`
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
