import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./navbar";
import API from "../services/api";
import useAutoRefresh from "../services/autoRefrash";

// 🕒 Local time formatter
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

// 🔐 Get logged-in user ID
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
  const [now, setNow] = useState(Date.now());

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [bidderName, setBidderName] = useState("");

  const userId = getUserIdFromToken();

  /* ======================
     FETCH PRODUCT
  ======================= */

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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useAutoRefresh(fetchProduct, 10000);

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
     LOGIC
  ======================= */

  const registeredCount =
    product.registeredUsers?.length || 0;

  const remainingSlots =
    product.maxRegistrations - registeredCount;

  const isRegistered = product.registeredUsers?.some(
    (u) => u.userId === userId
  );

  const isOwner = product.sellerId === userId;

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
     FUNCTIONS
  ======================= */

  const openRegisterModal = () => {
    const nextNumber = registeredCount + 1;
    setBidderName(`Bidder_${nextNumber}`);
    setShowRegisterModal(true);
  };

  const handleRegister = async () => {
    if (!bidderName.trim()) {
      alert("Bidder name cannot be empty");
      return;
    }

    try {
      await API.post(`/products/register/${id}`, {
        bidderName: bidderName.trim(),
      });

      setShowRegisterModal(false);
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

  /* ======================
     UI
  ======================= */

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg px-4 py-10">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">

          {/* IMAGES */}
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

          <h1 className="text-2xl font-bold text-blue-800 mb-2">
            {product.title}
          </h1>

          <p className="text-gray-600 mb-6">
            {product.description}
          </p>

          {/* DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
            <p><strong>Status:</strong> {product.status}</p>
            <p><strong>Auction Start:</strong> {formatLocalTime(product.auctionStart)}</p>

            {product.status === "Active" && (
              <p><strong>Live Since:</strong> {liveSince}</p>
            )}

            <p><strong>Starting Price:</strong> ₹{product.startingPrice}</p>
            <p><strong>Current Bid:</strong> {product.currentBid > 0 ? `₹${product.currentBid}` : "No bids yet"}</p>
            <p><strong>Bid Increment:</strong> ₹{product.bidIncrement}</p>
            <p><strong>Total Bids:</strong> {product.bidsCount}</p>

            {/* SLOT DISPLAY */}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
              <p>
                Registered:{" "}
                <span className="font-semibold text-blue-600">
                  {registeredCount}
                </span>{" "}
                / {product.maxRegistrations}
              </p>

              <p>
                Remaining:{" "}
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
          </div>

          {/* REGISTER BUTTON */}
          {product.status === "Upcoming" &&
            !isOwner &&
            !isRegistered &&
            remainingSlots > 0 && (
              <button
                onClick={openRegisterModal}
                className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
              >
                Register for Auction
              </button>
          )}

          {/* REGISTERED MESSAGE */}
          {product.status === "Upcoming" &&
            isRegistered && (
              <p className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                ✅ You are registered. Auction hasn’t started yet.
              </p>
          )}

          {/* BIDDING */}
          {product.status === "Active" && isRegistered && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">
                Place Your Bid
              </h3>

              <div className="flex gap-3">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="border px-3 py-2 rounded w-44"
                />

                <button
                  onClick={handlePlaceBid}
                  className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
                >
                  Place Bid
                </button>
              </div>
            </div>
          )}

          {product.status === "Active" && !isRegistered && (
            <p className="text-red-600 mt-4">
              You are not registered for this auction.
            </p>
          )}

          {product.status === "Ended" && (
            <p className="text-gray-500 mt-4">
              Auction has ended.
            </p>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showRegisterModal && (
        <div
          onClick={() => setShowRegisterModal(false)}
          className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 p-6 rounded-xl shadow-xl w-80 border"
          >
            <h2 className="text-lg font-semibold mb-4 text-center">
              Register for Auction
            </h2>

            <input
              type="text"
              value={bidderName}
              onChange={(e) => setBidderName(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRegisterModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleRegister}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetails;
