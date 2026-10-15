import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import api from "../services/api";

function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashMessage, setFlashMessage] = useState(location.state?.message || "");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/orders");
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      } else {
        setError("Unable to load orders");
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError("Unable to load orders");
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
        await fetchOrders();
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/login");
      }
    };

    init();
  }, [navigate]);

  if (!customer) return null;

  return (
    <div className="home-container">
      <Navbar customer={customer} />

      <main className="catalog-container">
        <div className="catalog-header">
          <div>
            <h1>My Orders</h1>
            <p>Track and view history of your placed orders</p>
          </div>
        </div>

        {flashMessage && (
          <div className="success-box" style={{ marginBottom: "20px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{flashMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="status-container">
            <div className="spinner-large"></div>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="status-container error-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
            <button type="button" className="btn-primary" onClick={fetchOrders}>
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="status-container empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <h3>No orders placed yet</h3>
            <p>Once you complete a purchase, your orders will show up here.</p>
            <button type="button" className="btn-primary" onClick={() => navigate("/products")}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-id-label">Order #{order._id}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="order-badges">
                    <span className={`status-badge payment-${(order.paymentStatus || "").toLowerCase()}`}>
                      Payment: {order.paymentStatus}
                    </span>
                    <span className="status-badge order-status">
                      Status: {order.status}
                    </span>
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-items-preview">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <img
                          src={item.image || "https://via.placeholder.com/60"}
                          alt={item.name}
                          className="order-item-img"
                        />
                        <div className="order-item-meta">
                          <span className="order-item-title">{item.name}</span>
                          <span className="order-item-qty font-muted">
                            ₹{Number(item.price).toLocaleString("en-IN")} × {item.quantity}
                          </span>
                        </div>
                        <span className="order-item-total">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total-display">
                      <span className="label">Total Paid:</span>
                      <span className="value">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
                    </div>

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      View Order Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
