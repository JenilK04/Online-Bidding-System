import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./navbar";
import API from "../services/api";
import useAutoRefresh from "../services/autoRefrash";

// 🕒 Format time (AM/PM, local)
const formatTime = (date) =>
  new Date(date).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

const MyProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Fetch product
  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
      setError("");
    } catch {
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch bids
  const fetchBids = async () => {
    try {
      const res = await API.get(`/bids/product/${id}`);
      setBids(res.data);
    } catch {
      // silent fail (don’t block UI)
    }
  };

  // 🔁 Auto refresh every 5 sec
  useAutoRefresh(() => {
    fetchProduct();
    fetchBids();
  }, 5000);

  if (loading) {
    return (
      <>
        <Navbar />
        <p className="text-center mt-20 text-gray-600">
          Loading product…
        </p>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <p className="text-center text-red-600 mt-20">
          {error}
        </p>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg px-4 py-10">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">

          {/* PRODUCT INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">

            {/* Images */}
            <div className="grid grid-cols-2 gap-3">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="product"
                  className="h-40 w-full object-cover rounded-lg"
                />
              ))}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-2xl font-bold text-blue-800 mb-2">
                {product.title}
              </h1>

              <p className="text-gray-600 mb-4">
                {product.description}
              </p>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      product.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : product.status === "Upcoming"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.status}
                  </span>
                </p>

                <p>
                  <strong>Auction Start:</strong>{" "}
                  {formatTime(product.auctionStart)}
                </p>

                <p>
                  <strong>Starting Price:</strong> ₹{product.startingPrice}
                </p>

                <p>
                  <strong>Current Bid:</strong>{" "}
                  {product.currentBid > 0
                    ? `₹${product.currentBid}`
                    : "No bids yet"}
                </p>

                <p>
                  <strong>Total Bids:</strong> {product.bidsCount}
                </p>
              </div>
            </div>
          </div>

          {/* BID HISTORY */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Bid History
            </h2>

            {bids.length === 0 ? (
              <p className="text-gray-500">
                No bids placed yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 border">#</th>
                      <th className="p-3 border">Bid Amount</th>
                      <th className="p-3 border">Bidder</th>
                      <th className="p-3 border">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid, index) => (
                      <tr key={bid._id} className="text-center">
                        <td className="p-3 border">
                          {bids.length - index}
                        </td>
                        <td className="p-3 border font-semibold text-green-700">
                          ₹{bid.amount}
                        </td>
                        <td className="p-3 border">
                          {bid.bidderName || "User"}
                        </td>
                        <td className="p-3 border">
                          {formatTime(bid.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default MyProductDetails;
