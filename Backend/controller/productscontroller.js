import Product from "../models/products.js";
import { io } from "../index.js";

// 🔥 Helper: Emit updated product with real-time status
const emitProductUpdate = async (productId) => {
  const updatedProduct = await Product.findById(productId);
  if (updatedProduct) {
    io.to(productId.toString()).emit("productUpdated", updatedProduct);
  }
};

// 🔥 Enterprise Status Engine (Handles Soft-Close & Expiration)
const calculateStatus = async (product) => {
  const now = new Date();
  const startTime = new Date(product.startTime);
  const endTime = new Date(product.endTime);

  // If already finalized, don't re-calculate
  if (["Sold", "Unsold", "Cancelled"].includes(product.status)) {
    return product.status;
  }

  let newStatus = product.status;

  // Scheduled -> Active
  if (now >= startTime && now < endTime && product.status === "Scheduled") {
    newStatus = "Active";
  } 
  
  // 🔥 ACTIVE/SCHEDULED -> FINALIZED (The Auto-Win Logic)
  else if (now >= endTime && (product.status === "Active" || product.status === "Scheduled")) {
    
    // Check if there was at least one bid
    if (product.bidsCount > 0 && product.highestBidderId) {
      product.winnerId = product.highestBidderId;
      product.paymentStatus = "Pending";
      newStatus = "Sold";
    } else {
      newStatus = "Unsold";
    }
  }

  if (newStatus !== product.status) {
    product.status = newStatus;
    await product.save();
    await emitProductUpdate(product._id);
  }

  return newStatus;
};

// ➕ 1. ADD PRODUCT (Handles nested Return Policy & Logistics)
export const addProduct = async (req, res) => {
  try {
    const {
      title, subtitle, sku, category, brand, modelNumber,
      condition, images, description, startingPrice,
      bidIncrement, maxRegistrations, startTime, endTime,
      antiSnipeWindow, extensionDuration, returnPolicy,
      shippingWeight, dimensions
    } = req.body;

    const product = new Product({
      title, subtitle, sku, category, brand, modelNumber,
      condition, images, description,
      sellerId: req.user.id,
      startingPrice,
      bidIncrement: bidIncrement || 10,
      maxRegistrations: maxRegistrations || 100,
      startTime,
      endTime,
      antiSnipeWindow: antiSnipeWindow || 60,
      extensionDuration: extensionDuration || 120,
      returnPolicy, // Matches nested schema object
      shippingWeight,
      dimensions,   // Matches nested schema object
      status: "Draft", // Pro apps start as Draft
    });

    await product.save();
    io.emit("productCreated", product);

    res.status(201).json({ message: "Listing created successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};

// 📦 2. GET ALL PRODUCTS (Filtered for Gallery)
export const getProducts = async (req, res) => {
  try {
    // Only show live/scheduled auctions on public gallery
    const products = await Product.find({ 
      status: { $in: ["Scheduled", "Active"] },
      isArchived: { $ne: true } 
    }).sort({ startTime: 1 });

    const updatedProducts = await Promise.all(
      products.map(async (p) => {
        const status = await calculateStatus(p);
        return { ...p.toObject(), status };
      })
    );

    res.json(updatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch gallery" });
  }
};

// 📦 3. GET SINGLE PRODUCT
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("sellerId", "name email");

    if (!product) return res.status(404).json({ message: "Product not found" });

    const status = await calculateStatus(product);
    res.json({ ...product.toObject(), status });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

// 📝 4. REGISTER FOR AUCTION (Paddle Number Assignment)
export const registerForAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { bidderName } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Auction not found" });

    if (product.sellerId.toString() === userId) {
      return res.status(400).json({ message: "Sellers cannot bid on their own items" });
    }

    const alreadyRegistered = product.registeredUsers.some(u => u.userId.toString() === userId);
    if (alreadyRegistered) return res.status(400).json({ message: "Already registered" });

    if (product.registeredUsers.length >= product.maxRegistrations) {
      return res.status(400).json({ message: "Auction is at full capacity" });
    }

    const bidderNumber = product.registeredUsers.length + 1; // Assign "Paddle Number"

    product.registeredUsers.push({
      userId,
      bidderNumber,
      bidderName: bidderName || `Bidder_${bidderNumber}`,
      registeredAt: new Date()
    });

    await product.save();
    await emitProductUpdate(product._id);

    res.status(200).json({ message: "Registration successful", bidderNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔒 5. CLOSE AUCTION & MANAGE RESULTS
export const closeAuction = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Determine Final State
    if (product.bidsCount > 0 && product.highestBidderId) {
      product.winnerId = product.highestBidderId;
      product.status = "Sold";
      product.paymentStatus = "Pending";
    } else {
      product.status = "Unsold";
    }

    product.endTime = new Date(); // Close it now
    await product.save();
    await emitProductUpdate(product._id);

    res.json({ message: "Auction closed", status: product.status, winnerId: product.winnerId });
  } catch (error) {
    res.status(500).json({ message: "Closing failed", error: error.message });
  }
};

// 📦 6. GET MY LISTINGS (Seller Dashboard)
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your listings" });
  }
};