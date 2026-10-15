import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import api from "../services/api";
import { useCart } from "../context/CartContext.jsx";

function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, error, subtotal, updateQuantity, removeFromCart, refreshCart } = useCart();

  const [customer, setCustomer] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState("");

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
        await refreshCart();
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/login");
      }
    };

    init();
  }, [navigate, refreshCart]);

  const handleQuantityChange = async (productId, currentQty, delta, stock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > stock) {
      setActionError(`Cannot exceed available stock of ${stock}`);
      setTimeout(() => setActionError(""), 3000);
      return;
    }

    setUpdatingId(productId);
    setActionError("");
    const res = await updateQuantity(productId, newQty);
    setUpdatingId(null);

    if (!res.success) {
      setActionError(res.message);
      setTimeout(() => setActionError(""), 3000);
    }
  };

  const handleRemove = async (productId) => {
    setUpdatingId(productId);
    setActionError("");
    const res = await removeFromCart(productId);
    setUpdatingId(null);

    if (!res.success) {
      setActionError(res.message);
      setTimeout(() => setActionError(""), 3000);
    }
  };

  if (!customer) return null;

  return (
    <div className="home-container">
      <Navbar customer={customer} />

      <main className="cart-page-container">
        <div className="catalog-header">
          <div>
            <h1>Shopping Cart</h1>
            <p>Review your selected items before checkout</p>
          </div>
        </div>

        {actionError && <div className="error-box">{actionError}</div>}

        {loading ? (
          <div className="status-container">
            <div className="spinner-large"></div>
            <p>Loading your cart...</p>
          </div>
        ) : error ? (
          <div className="status-container error-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
            <button type="button" className="btn-primary" onClick={refreshCart}>
              Retry
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="status-container empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added any products to your cart yet.</p>
            <button type="button" className="btn-primary" onClick={() => navigate("/products")}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-section">
              {cartItems.map((item) => {
                const prod = item.product || {};
                const isItemUpdating = updatingId === prod._id;
                const itemSubtotal = (prod.price || 0) * item.quantity;

                return (
                  <div key={prod._id || item._id} className="cart-item-card">
                    <img
                      src={prod.image || "https://via.placeholder.com/120x120?text=Product"}
                      alt={prod.name}
                      className="cart-item-image"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80";
                      }}
                      onClick={() => navigate(`/products/${prod._id}`)}
                    />

                    <div className="cart-item-details">
                      <h3
                        className="cart-item-title"
                        onClick={() => navigate(`/products/${prod._id}`)}
                      >
                        {prod.name || "Product"}
                      </h3>
                      <span className="cart-item-category">{prod.category}</span>
                      <span className="cart-item-price">₹{Number(prod.price || 0).toLocaleString("en-IN")} each</span>

                      {prod.stock !== undefined && (
                        <span className={`stock-hint ${prod.stock > 0 ? "in" : "out"}`}>
                          {prod.stock > 0 ? `Stock: ${prod.stock}` : "Out of stock"}
                        </span>
                      )}
                    </div>

                    <div className="cart-item-controls">
                      <div className="quantity-selector">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleQuantityChange(prod._id, item.quantity, -1, prod.stock)}
                          disabled={item.quantity <= 1 || isItemUpdating}
                        >
                          -
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleQuantityChange(prod._id, item.quantity, 1, prod.stock)}
                          disabled={item.quantity >= prod.stock || isItemUpdating}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        <span className="subtotal-label">Subtotal:</span>
                        <span className="subtotal-amount">₹{itemSubtotal.toLocaleString("en-IN")}</span>
                      </div>

                      <button
                        type="button"
                        className="remove-cart-item-btn"
                        onClick={() => handleRemove(prod._id)}
                        disabled={isItemUpdating}
                      >
                        {isItemUpdating ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary Side Card */}
            <div className="cart-summary-card">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="summary-row">
                <span>Estimated Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total-row">
                <span>Total Amount</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <button
                type="button"
                className="btn-primary checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
