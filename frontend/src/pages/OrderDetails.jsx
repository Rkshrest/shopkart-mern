import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import api from "../services/api";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [customer, setCustomer] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashMessage, setFlashMessage] = useState(location.state?.message || "");

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

        try {
          const res = await api.get(`/orders/${id}`);
          if (res.data?.success) {
            setOrder(res.data.order);
          } else {
            setError("Order not found.");
          }
        } catch (oErr) {
          if (oErr.response?.status === 403) {
            setError("You are not authorized to view this order.");
          } else if (oErr.response?.status === 404) {
            setError("Order not found.");
          } else {
            setError("Unable to load order details.");
          }
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

  if (!customer) return null;

  return (
    <div className="home-container">
      <Navbar customer={customer} />

      <main className="details-container">
        <button type="button" className="back-link-btn" onClick={() => navigate("/orders")}>
          ← Back to Orders
        </button>

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
            <p>Loading order details...</p>
          </div>
        ) : error || !order ? (
          <div className="status-container error-state" style={{ marginTop: "40px" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h2>{error || "Order Not Found"}</h2>
            <button type="button" className="btn-primary" onClick={() => navigate("/orders")}>
              Back to My Orders
            </button>
          </div>
        ) : (
          <div className="order-details-card">
            <div className="order-details-header">
              <div>
                <span className="order-details-id">Order #{order._id}</span>
                <span className="order-details-date">
                  Placed on{" "}
                  {new Date(order.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
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

            <div className="order-details-grid">
              {/* Items Section */}
              <div className="order-section">
                <h3>Ordered Items Snapshot</h3>
                <div className="items-table">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="table-item-row">
                      <img
                        src={item.image || "https://via.placeholder.com/60"}
                        alt={item.name}
                        className="table-item-img"
                      />
                      <div className="table-item-info">
                        <span className="table-item-name">{item.name}</span>
                        <span className="table-item-price">
                          Purchase Price: ₹{Number(item.price).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="table-item-qty">Qty: {item.quantity}</div>
                      <div className="table-item-subtotal">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Payment Summary Section */}
              <div className="order-sidebar">
                <div className="summary-block">
                  <h3>Shipping Address</h3>
                  <div className="address-details">
                    <p className="address-name">{order.shippingAddress?.fullName}</p>
                    <p>{order.shippingAddress?.addressLine1}</p>
                    <p>
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                      {order.shippingAddress?.pincode}
                    </p>
                    <p className="address-phone">Phone: {order.shippingAddress?.phone}</p>
                  </div>
                </div>

                <div className="summary-block">
                  <h3>Payment Info</h3>
                  <div className="info-list">
                    <div className="info-row">
                      <span>Payment Status:</span>
                      <strong style={{ color: order.paymentStatus === "PAID" ? "#15803d" : "#dc2626" }}>
                        {order.paymentStatus}
                      </strong>
                    </div>
                    {order.razorpayPaymentId && (
                      <div className="info-row">
                        <span>Payment ID:</span>
                        <code className="code-sm">{order.razorpayPaymentId}</code>
                      </div>
                    )}
                    {order.razorpayOrderId && (
                      <div className="info-row">
                        <span>Razorpay Order:</span>
                        <code className="code-sm">{order.razorpayOrderId}</code>
                      </div>
                    )}
                  </div>
                </div>

                <div className="summary-block grand-total-block">
                  <div className="grand-total-row">
                    <span>Total Amount:</span>
                    <span className="grand-total-val">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrderDetails;
