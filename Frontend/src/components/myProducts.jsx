import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import AddProductModal from "./addProduct";
import API from "../services/api";
import useAutoRefresh from "../services/autoRefrash";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [closingId, setClosingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔴 Modal state
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const navigate = useNavigate();

  const fetchMyProducts = async () => {
    try {
      const res = await API.get("/products/my-products");
      setProducts(res.data);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(fetchMyProducts, 10000);

  // 🔴 Open Modal
  const openCloseModal = (id) => {
    setSelectedProductId(id);
    setShowCloseModal(true);
  };

  // 🔴 Confirm Close
  const confirmCloseBid = async () => {
    try {
      setClosingId(selectedProductId);

      await API.patch(`/products/close/${selectedProductId}`);

      setProducts((prev) =>
        prev.map((p) =>
          p._id === selectedProductId
            ? { ...p, status: "Ended" }
            : p
        )
      );
    } catch {
      alert("Failed to close bid.");
    } finally {
      setClosingId(null);
      setShowCloseModal(false);
      setSelectedProductId(null);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto">

          <div className="relative mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-800">
              My Products
            </h1>

            <button
              onClick={() => setOpen(true)}
              className="fixed right-4 bottom-6 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
            >
              + Add Product
            </button>
          </div>

          {loading && (
            <p className="text-center text-gray-600 mt-12">
              Loading products...
            </p>
          )}

          {!loading && products.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              You haven’t added any products yet.
            </div>
          ) : (
            !loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className={`w-full max-w-sm rounded-xl overflow-hidden ${
                      p.status === "Ended"
                        ? "bg-gray-100 opacity-70"
                        : "bg-white shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
                      <img
                        src={p.images?.[0]}
                        alt={p.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <div className="p-4">
                      <h2 className="text-lg font-medium">
                        {p.title}
                      </h2>

                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <p>Base Price: ₹{p.startingPrice}</p>
                        <p>
                          Highest Bid: ₹
                          {p.currentBid > 0
                            ? p.currentBid
                            : "No bids yet"}
                        </p>

                        {/* 🔥 Registration Count */}
                        <p>
                          Registered:{" "}
                          <span className="font-semibold">
                            {p.registeredUsers?.length || 0}
                          </span>
                          {" / "}
                          {p.maxRegistrations}
                        </p>
                      </div>

                      <span className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${
                        p.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : p.status === "Upcoming"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {p.status.toUpperCase()}
                      </span>

                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() => navigate(`/my-product/${p._id}`)}
                          className="w-full border border-indigo-600 text-indigo-600 py-2 rounded-lg hover:bg-indigo-50"
                        >
                          View Bids
                        </button>

                        {(p.status === "Upcoming" || p.status === "Active") && (
                          <button
                            disabled={closingId === p._id}
                            onClick={() => openCloseModal(p._id)}
                            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                          >
                            {closingId === p._id
                              ? "Processing..."
                              : p.status === "Upcoming"
                              ? "Cancel Bid"
                              : "Close Bid"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* 🔴 Close Confirmation Modal */}
      {showCloseModal && (
        <div
          onClick={() => setShowCloseModal(false)}
          className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-xl shadow-xl w-80"
          >
            <h2 className="text-lg font-semibold mb-4 text-center">
              Confirm Action
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to close this auction?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmCloseBid}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <AddProductModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchMyProducts}
      />
    </>
  );
};

export default MyProducts;
