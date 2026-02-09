import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import AddProductModal from "./addProduct";
import API from "../services/api";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  
  const fetchMyProducts = async () => {
    const res = await API.get("/products/my-products", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setProducts(res.data);
  };
  
  useEffect(() => {
    fetchMyProducts();
  }, []);
  // ✅ CLOSE BID HANDLER
  const handleCloseBid = async (id) => {

      await API.patch(
        `/products/close/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // update UI instantly
      setProducts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, status: "Ended" } : p
        )
      );
   
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="relative mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-800 archivo-black-regular">
              My Products
            </h1>

            <button
              onClick={() => setOpen(true)}
              className="fixed right-4 bottom-6 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              <span className="text-lg">+</span>
              Add Product
            </button>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              You haven’t added any products yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
              {products.map((p) => (
                <div
                  key={p._id}
                  className={`w-full max-w-sm rounded-xl overflow-hidden transition ${
                    p.status === "Ended"
                      ? "bg-gray-100 opacity-70 cursor-not-allowed"
                      : "bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Image */}
                  <img
                    src={p.images?.[0]}
                    alt={p.title}
                    className="h-44 w-full object-cover"
                  />

                  {/* Content */}
                  <div className="p-4">
                    <h2 className="text-lg font-medium text-gray-800">
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
                    </div>

                    {/* Status */}
                    <span
                      className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${
                        p.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : p.status === "Upcoming"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </span>

                    {/* Actions */}
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => navigate(`/product/${p._id}`)}
                        className="w-full text-sm border border-indigo-600 text-indigo-600 py-2 rounded-lg hover:bg-indigo-50 transition"
                      >
                        View Bids
                      </button>

                      {p.status === "Active" && (
                        <button
                          onClick={() => handleCloseBid(p._id)}
                          className="w-full text-sm bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                        >
                          Close Bid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchMyProducts} // ✅ no reload
      />
    </>
  );
};

export default MyProducts;
