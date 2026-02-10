import React, { useState } from "react";
import API from "../services/api";

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    condition: "Used",
    startingPrice: "",
    bidIncrement: 10, // ✅ default
    auctionStart: "",
    maxRegistrations: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  /* =========================
     HANDLERS
  ========================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      setErrors({ ...errors, images: "Maximum 5 images allowed" });
      return;
    }

    const base64Images = [];
    for (let file of files) {
      base64Images.push(await convertToBase64(file));
    }

    setImages(base64Images);
    setErrors({ ...errors, images: "" });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  /* =========================
     VALIDATION
  ========================== */
  const validate = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";

    if (!images.length)
      newErrors.images = "At least one image is required";

    if (form.startingPrice <= 0)
      newErrors.startingPrice = "Starting price must be greater than 0";

    if (form.bidIncrement < 1)
      newErrors.bidIncrement = "Bid increment must be at least 1";

    if (form.maxRegistrations <= 0)
      newErrors.maxRegistrations =
        "Max registrations must be greater than 0";

    if (!form.auctionStart)
      newErrors.auctionStart = "Auction start time is required";
    else if (new Date(form.auctionStart) <= new Date())
      newErrors.auctionStart =
        "Auction start must be a future date/time";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await API.post(
        "/products",
        { ...form, images },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Add New Product
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-red-600"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <input
              name="title"
              placeholder="Product Title"
              className="input"
              onChange={handleChange}
            />
            {errors.title && (
              <p className="text-red-500 text-xs">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <textarea
              name="description"
              placeholder="Product Description"
              className="input h-24"
              onChange={handleChange}
            />
            {errors.description && (
              <p className="text-red-500 text-xs">
                {errors.description}
              </p>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="inline-flex cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg">
              📷 Choose Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {errors.images && (
              <p className="text-red-500 text-xs mt-1">
                {errors.images}
              </p>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative h-24 border rounded-lg overflow-hidden"
                  >
                    <img
                      src={img}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category + Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="category"
              placeholder="Category"
              className="input"
              onChange={handleChange}
            />

            <select
              name="condition"
              className="input"
              onChange={handleChange}
            >
              <option>New</option>
              <option>Used</option>
              <option>Antique</option>
            </select>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <input
                type="number"
                name="startingPrice"
                placeholder="Starting Price"
                className="input"
                onChange={handleChange}
              />
              {errors.startingPrice && (
                <p className="text-red-500 text-xs">
                  {errors.startingPrice}
                </p>
              )}
            </div>

            <div>
              <input
                type="number"
                name="bidIncrement"
                placeholder="Bid Increment"
                className="input"
                onChange={handleChange}
              />
              {errors.bidIncrement && (
                <p className="text-red-500 text-xs">
                  {errors.bidIncrement}
                </p>
              )}
            </div>

            <div>
              <input
                type="number"
                name="maxRegistrations"
                placeholder="Max Registrations"
                className="input"
                onChange={handleChange}
              />
              {errors.maxRegistrations && (
                <p className="text-red-500 text-xs">
                  {errors.maxRegistrations}
                </p>
              )}
            </div>
          </div>

          {/* Auction Start */}
          <div>
            <input
              type="datetime-local"
              name="auctionStart"
              className="input"
              onChange={handleChange}
            />
            {errors.auctionStart && (
              <p className="text-red-500 text-xs">
                {errors.auctionStart}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
