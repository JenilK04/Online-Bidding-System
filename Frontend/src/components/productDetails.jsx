import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./navbar";
import API from "../services/api";
import useAutoRefresh from "../services/autoRefrash";

// 🕒 Local time formatter (display only, AM/PM)
const formatLocalTime = (utcDate) => {
  return new Date(utcDate).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

// 🔐 Get logged-in user ID from JWT
const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id;
  } catch {
    return null;
  }
};

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔴 Live clock (UTC-safe)
  const [now, setNow] = useState(Date.now());

  const userId = getUserIdFromToken();

  // 🔹 Fetch product
  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
      setError("");
    } catch {
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Backend sync every 10s
  useAutoRefresh(fetchProduct, 10000);

  // ⏱ Live clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ======================
     UI STATES
  ======================= */

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

  /* ======================
     REGISTRATION + LIVE TIME
  ======================= */

  const isRegistered = product.registeredUsers?.some(
    (u) => u.userId === userId
  );

  const remainingSlots =
    product.maxRegistrations -
    (product.registeredUsers?.length || 0);

  let liveSince = "";
  if (product.status === "Active") {
    const start = new Date(product.auctionStart).getTime();
    const diff = now - start;

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    liveSince = `${h}h ${m}m ${s}s`;
  }

  /* ======================
     ACTIONS
  ======================= */

  const handleRegister = async () => {
    try {
      await API.post(`/products/register/${id}`);
      fetchProduct();
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handlePlaceBid = async () => {
    if (!bidAmount) return alert("Enter bid amount");

    try {
      await API.post(`/bids/${id}`, {
        amount: Number(bidAmount),
      });

      setBidAmount("");
      fetchProduct();
    } catch (err) {
      alert(err.response?.data?.message || "Bid failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg px-4 py-10">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">

          {/* IMAGES (NO BLUR, NO STRETCH) */}
          <div className="flex gap-4 overflow-x-auto mb-6 border border-gray-200 p-4 rounded-lg">
            {product.images.map((img, i) => (
              <div
                key={i}
                className="shrink-0 bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-center"
                style={{ width: "220px", height: "220px" }}
              >
                <img
                  src={img}
                  alt={`product-${i}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>

          {/* TITLE */}
          <h1 className="text-2xl font-bold text-blue-800 mb-2">
            {product.title}
          </h1>

          <p className="text-gray-600 mb-6">
            {product.description}
          </p>

          {/* AUCTION DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">

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
              {formatLocalTime(product.auctionStart)}
            </p>

            {product.status === "Active" && (
              <p>
                <strong>Live Since:</strong>{" "}
                <span className="text-blue-600 font-semibold">
                  {liveSince}
                </span>
              </p>
            )}

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
              <strong>Bid Increment:</strong> ₹{product.bidIncrement}
            </p>

            <p>
              <strong>Total Bids:</strong> {product.bidsCount}
            </p>

            <p>
              <strong>Remaining Slots:</strong>{" "}
              <span
                className={`font-semibold ${
                  remainingSlots === 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {remainingSlots}
              </span>
            </p>
          </div>

          {/* REGISTER / BID SECTION */}
          {product.status === "Upcoming" && !isRegistered && remainingSlots > 0 && (
            <button
              onClick={handleRegister}
              className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
            >
              Register for Auction
            </button>
          )}

          {product.status === "Active" ? (
            isRegistered ? (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">
                  Place Your Bid
                </h3>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Min ₹${
                      product.currentBid > 0
                        ? product.currentBid + product.bidIncrement
                        : product.startingPrice
                    }`}
                    className="input w-44"
                  />

                  <button
                    onClick={handlePlaceBid}
                    className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Place Bid
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-red-600 font-medium">
                You are not registered for this auction.
              </p>
            )
          ) : (
            product.status === "Ended" && (
              <p className="text-gray-500 font-medium">
                Auction has ended.
              </p>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
