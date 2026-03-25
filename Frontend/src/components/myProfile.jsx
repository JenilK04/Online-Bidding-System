import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import API from "../services/api";

const Profile = () => {

  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  // 🔥 MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    address: "",
    contact: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get("/profile");

      setUser(res.data.user);

      const all = [
        ...res.data.wonProducts,
        ...res.data.myProducts
      ];

      setProducts(all);
    } catch (err) {
      console.error(err);
    }
  };

  // 💳 PAYMENT
  const handlePayment = async (id) => {
    try {
      setLoadingAction(id);
      await API.post(`/payment/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  // 🚚 SHIPPING
  const handleShipping = async (id) => {
    try {
      setLoadingAction(id);
      await API.post(`/ship/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  // 🔥 OPEN MODAL
  const openModal = (product) => {
    setSelectedProduct(product);

    setFormData({
      address: product.shippingAddress || "",
      contact: product.contactNumber || ""
    });

    setShowModal(true);
  };

  // 💾 SAVE DETAILS
  const handleSaveDetails = async () => {
    if (!formData.address || !formData.contact) return;

    try {
      setLoadingAction(selectedProduct._id);

      await API.post(`/order-details/${selectedProduct._id}`, {
        shippingAddress: formData.address,
        contactNumber: formData.contact
      });

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  // 🔄 LOADING SCREEN
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-10">

        <div className="max-w-7xl mx-auto">

          {/* 👤 USER DETAILS */}
          <div className="bg-white rounded-2xl shadow p-6 mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-indigo-700">
                👋 {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-500 text-sm">
                {user.mobile || "No mobile"} • {user.address || "No address"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Total Auctions</p>
              <p className="text-xl font-bold text-indigo-600">
                {products.length}
              </p>
            </div>
          </div>

          {/* 🧾 AUCTION ORDERS */}
          <h2 className="text-3xl font-bold text-indigo-700 mb-8">
            🧾 Auction Orders
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">

            {products.map((p) => {

              const isWinner =
                p.winnerId?._id === user._id || p.winnerId === user._id;

              const isOwner =
                p.owner?._id === user._id || p.owner === user._id;

              const needsAddress = !p.shippingAddress;
              const needsContact = !p.contactNumber;
              const needsPayment = !p.isPaid;

              return (
                <div key={p._id}
                  className="bg-white rounded-2xl shadow hover:shadow-xl p-4 transition"
                >

                  <img
                    src={p.images?.[0]}
                    className="w-full h-40 object-contain mb-3"
                  />

                  <h4 className="font-semibold text-lg">{p.title}</h4>

                  <p className="text-sm text-gray-600">
                    Final Price: ₹{p.currentBid}
                  </p>

                  {/* RELATION */}
                  <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full
                    ${isWinner ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {isWinner ? "You Won" : "Your Product"}
                  </span>

                  {/* SHOW DETAILS */}
                  {p.shippingAddress && (
                    <div className="text-sm text-gray-600 mt-2">
                      <p><b>📍 Address:</b> {p.shippingAddress}</p>
                      <p><b>📞 Contact:</b> {p.contactNumber}</p>
                    </div>
                  )}

                  {/* STATUS */}
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                      {p.deliveryStatus || "Pending"}
                    </span>
                  </div>

                  {/* ACTION FLOW */}
                  <div className="mt-4 space-y-2">

                    {/* BUYER */}
                    {isWinner && (
                      <>
                        {(needsAddress || needsContact) && (
                          <button
                            onClick={() => openModal(p)}
                            className="w-full bg-yellow-500 text-white py-2 rounded"
                          >
                            {p.shippingAddress ? "✏️ Edit Details" : "➕ Add Address & Contact"}
                          </button>
                        )}

                        {!needsAddress && !needsContact && needsPayment && (
                          <button
                            onClick={() => handlePayment(p._id)}
                            disabled={loadingAction === p._id}
                            className="w-full bg-green-600 text-white py-2 rounded"
                          >
                            {loadingAction === p._id ? "Processing..." : "💳 Pay Now"}
                          </button>
                        )}

                        {p.isPaid && p.deliveryStatus === "Pending" && (
                          <p className="text-sm text-gray-500">
                            Waiting for seller to ship...
                          </p>
                        )}
                      </>
                    )}

                    {/* SELLER */}
                    {isOwner && (
                      <>
                        {(needsAddress || needsContact || needsPayment) && (
                          <p className="text-sm text-gray-500">
                            ⏳ Waiting for buyer to complete details
                          </p>
                        )}

                        {!needsAddress && !needsContact && !needsPayment && p.deliveryStatus === "Pending" && (
                          <button
                            onClick={() => handleShipping(p._id)}
                            disabled={loadingAction === p._id}
                            className="w-full bg-indigo-600 text-white py-2 rounded"
                          >
                            {loadingAction === p._id ? "Processing..." : "🚚 Ship Product"}
                          </button>
                        )}
                      </>
                    )}

                    {/* STATUS */}
                    {p.deliveryStatus === "Shipped" && (
                      <p className="text-blue-600 text-sm">🚚 On the way</p>
                    )}

                    {p.deliveryStatus === "Delivered" && (
                      <p className="text-green-600 text-sm">✅ Delivered</p>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

        </div>
      </div>

      {/* 🔥 MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">

            <h2 className="text-xl font-bold mb-4 text-indigo-700">
              📦 Shipping Details
            </h2>

            <textarea
              placeholder="Enter Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full border rounded p-2 mb-3"
            />

            <input
              type="text"
              placeholder="Enter Contact Number"
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
              className="w-full border rounded p-2 mb-4"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveDetails}
                disabled={loadingAction === selectedProduct?._id}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                {loadingAction === selectedProduct?._id ? "Saving..." : "Save"}
              </button>

            </div>

          </div>
        </div>
      )}

    </>
  );
};

export default Profile;