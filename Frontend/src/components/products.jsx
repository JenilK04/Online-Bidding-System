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

  // 🔁 Auto refresh every 10 sec
  useAutoRefresh(fetchProducts, 10000);

  return (
    <div className="bg min-h-screen">
      <Navbar />

      <section className="px-4 sm:px-8 py-10">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {products.map((product) => {
              // 🎨 Card style by status
              const cardStyle =
                product.status === "Active"
                  ? "bg-green-50 border border-green-300"
                  : product.status === "Ended"
                  ? "bg-gray-100 opacity-60 cursor-not-allowed"
                  : "bg-white";

              return (
                <div
                  key={product._id}
                  className={`group rounded-lg overflow-hidden shadow transition-all duration-300
                  ${cardStyle}
                  ${product.status === "Active" ? "hover:-translate-y-1 hover:shadow-xl" : ""}
                  `}
                >
                  {/* Image */}
                  <div className="w-full h-56 bg-gray-100 flex items-center justify-center rounded-t-xl">
                    <img
                      src={product.images?.[0]}
                      alt={product.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-base mb-1 text-blue-800 truncate">
                      {product.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-1">
                      Start Price:{" "}
                      <span className="font-semibold">
                        ₹{product.startingPrice}
                      </span>
                    </p>

                    {/* Status */}
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                        product.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : product.status === "Upcoming"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.status}
                    </span>

                    {/* Auction Start */}
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDateTime(product.auctionStart)}
                    </p>

                    <Link to={`/products/${product._id}`}>
                      <button className="mt-3 w-full text-xs bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 transition">
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
