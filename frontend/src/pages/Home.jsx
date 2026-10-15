import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import api from "../services/api";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState(
    location.state?.loginMessage || ""
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/customers/me");
        // Extract customer object regardless of backend payload structure
        const profileData = res.data.customer || res.data.user || res.data;
        if (profileData && (profileData.fullName || profileData.email || profileData._id)) {
          setCustomer(profileData);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
        <p>Loading Profile...</p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="home-container">
      <Navbar customer={customer} />
      
      <main className="dashboard-content">
        {loginSuccessMessage && (
          <div className="success-box" style={{ marginBottom: "24px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{loginSuccessMessage}</span>
          </div>
        )}

        <div className="dashboard-banner">
          <div className="banner-content">
            <span className="welcome-tag">Customer Portal</span>
            <h1>Welcome back, {customer.fullName || "Valued Customer"}!</h1>
            <p>You are logged in securely to your ShopKart account.</p>
          </div>
          <div className="banner-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Authenticated</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="profile-card">
            <div className="card-header">
              <h2>Customer Profile</h2>
              <span className="active-status">Logged In</span>
            </div>

            <div className="profile-fields">
              <div className="info-tile">
                <div className="tile-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="tile-details">
                  <span className="tile-label">Full Name</span>
                  <span className="tile-value">{customer.fullName || "N/A"}</span>
                </div>
              </div>

              <div className="info-tile">
                <div className="tile-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="tile-details">
                  <span className="tile-label">Email Address</span>
                  <span className="tile-value">{customer.email || "N/A"}</span>
                </div>
              </div>

              <div className="info-tile">
                <div className="tile-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="tile-details">
                  <span className="tile-label">Phone Number</span>
                  <span className="tile-value">{customer.phone || "N/A"}</span>
                </div>
              </div>

              {customer._id && (
                <div className="info-tile">
                  <div className="tile-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <div className="tile-details">
                    <span className="tile-label">Customer ID</span>
                    <span className="tile-value code">{customer._id}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
