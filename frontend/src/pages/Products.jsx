import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import api from "../services/api";
import { useCart } from "../context/CartContext.jsx";

function Products() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState(["Electronics", "Fashion", "Books", "Home"]);

  // Authentication check
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

        // Refresh Cart Context
        await refreshCart();

        // Load wishlist IDs to highlight wishlisted cards
        try {
          const wishRes = await api.get("/wishlist");
          if (wishRes.data?.success && Array.isArray(wishRes.data.wishlist)) {
            const ids = new Set(wishRes.data.wishlist.map((item) => item._id || item));
            setWishlistIds(ids);
          }
        } catch (wErr) {
          console.warn("Could not fetch wishlist for user:", wErr);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/login");
      }
    };

    init();
  }, [navigate, refreshCart]);

  // Fetch Products based on search & category
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category && category !== "All") params.category = category;

      const res = await api.get("/products", { params });

      if (res.data?.success) {
        setProducts(res.data.products || []);
        
        // Dynamically derive categories if available
        if (res.data.products && res.data.products.length > 0) {
          const derived = Array.from(new Set(res.data.products.map((p) => p.category).filter(Boolean)));
          if (derived.length > 0) {
            setCategories((prev) => Array.from(new Set([...prev, ...derived])));
          }
        }
      } else {
        setError("Something went wrong while loading products.");
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customer) {
      fetchProducts();
    }
  }, [category, customer]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      await api.post("/products/seed");
      await fetchProducts();
    } catch (err) {
      console.error("Seed error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <div className="home-container">
      <Navbar customer={customer} />

      <main className="catalog-container">
        <div className="catalog-header">
          <div>
            <h1>Product Catalog</h1>
            <p>Explore our wide range of premium products</p>
          </div>
          {products.length === 0 && !loading && (
            <button type="button" className="seed-btn" onClick={handleSeed}>
              Seed Sample Products
            </button>
          )}
        </div>

        {/* Filter & Search Controls */}
        <div className="filter-bar">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search products by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>

          <div className="category-filter-wrapper">
            <label htmlFor="category-select" className="filter-label">Category:</label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="status-container">
            <div className="spinner-large"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="status-container error-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
            <button type="button" className="btn-primary" onClick={fetchProducts}>
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="status-container empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3>No products found</h3>
            <p>Try searching for something else or reset your category filter.</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                initialWishlisted={wishlistIds.has(prod._id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Products;
