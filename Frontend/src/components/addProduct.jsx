import React, { useState } from "react";
import API from "../services/api";

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    condition: "Used",
    startingPrice: "",
    auctionStart: "",
    maxRegistrations: "",
  });

  const [images, setImages] = useState([]); // base64 images
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // handle text inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  };

  // handle image selection
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    // optional limits
    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    const base64Images = [];
    for (let file of files) {
      const base64 = await convertToBase64(file);
      base64Images.push(base64);
    }

    setImages(base64Images);
  };

  // remove image
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setLoading(true);

      await API.post(
        "/products",
        {
          ...form,
          images, // ✅ base64 array
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      onSuccess();
      onClose();
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

          <input
            name="title"
            placeholder="Product Title"
            className="input"
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Product Description"
            className="input h-24"
            onChange={handleChange}
            required
          />

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              📷 Choose Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <p className="text-xs text-gray-500 mt-1">
              Max 5 images (stored as Base64)
            </p>

            {/* Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-full h-24 border rounded-lg overflow-hidden"
                  >
                    <img
                      src={img}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="number"
              name="startingPrice"
              placeholder="Starting Price"
              className="input"
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="maxRegistrations"
              placeholder="Max Registrations"
              className="input"
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="datetime-local"
            name="auctionStart"
            className="input"
            onChange={handleChange}
            required
          />

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
