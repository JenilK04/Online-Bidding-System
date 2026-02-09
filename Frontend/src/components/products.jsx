import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./navbar";
import API from "../services/api";
import useAutoRefresh from "../services/autoRefrash";

// ✅ Timezone-safe formatter (UTC → user local, AM/PM)
const formatDateTime = (utcDate) => {
  return new Date(utcDate).toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔁 auto refresh every 15 sec
  useAutoRefresh(fetchProducts, 15000);

  return (
    <div className="bg min-h-screen">
      <Navbar />

      <section className="px-4 sm:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-blue-800 archivo-black-regular">
          Available Products for Bidding
        </h2>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-600">
            Loading products...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-600">{error}</p>
        )}

        {/* No Products */}
        {!loading && products.length === 0 && (
          <p className="text-center text-gray-600">
            No products available for bidding
          </p>
        )}

        {/* Product Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {products.map((product) => {
              // 🎨 Card UI state styles
              const cardStyle =
                product.status === "Active"
                  ? "bg-green-50 border-2 border-green-400 shadow-green-200"
                  : product.status === "Ended"
                  ? "bg-gray-100 opacity-60 cursor-not-allowed"
                  : "bg-white";

              return (
                <div
                  key={product._id}
                  className={`group rounded-xl overflow-hidden shadow transition-all duration-300
                  ${cardStyle}
                  ${product.status === "Active" ? "hover:-translate-y-2 hover:shadow-2xl" : ""}
                  `}
                >
                  {/* Image */}
                  <div className="overflow-hidden">
                    <img
                      src={product.images?.[0]}
                      alt={product.title}
                      className={`w-full h-48 object-cover transition-transform duration-500
                      ${product.status === "Active" ? "group-hover:scale-110" : ""}
                      `}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 text-center">
                    <h3 className="font-bold text-lg mb-2 text-blue-800">
                      {product.title}
                    </h3>

                    <p className="text-gray-600 mb-2">
                      Starting Price:{" "}
                      <span className="font-semibold">
                        ₹{product.startingPrice}
                      </span>
                    </p>

                    {/* Status + Auction Start */}
                    <div className="mb-4 space-y-1">
                      <div className="flex justify-center gap-2 items-center">
                        <span className="text-sm text-gray-600">
                          Status:
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            product.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : product.status === "Upcoming"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">
                        Auction Start:{" "}
                        <span className="font-medium text-gray-800">
                          {formatDateTime(product.auctionStart)}
                        </span>
                      </p>
                    </div>

                    <Link to={`/products/${product._id}`}>
                      <button
                        disabled={product.status !== "Active"}
                        className={`px-4 py-2 rounded transition text-sm ${
                          product.status === "Active"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Products;
