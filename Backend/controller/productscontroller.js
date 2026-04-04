import Product from "../models/products.js";
import { io } from "../index.js"; // Ensure index.js exports 'io' after initializing it

/**
 * 🔥 Helper: Emit updated product with real-time status
 * This updates both the specific product room and the global feed.
 */
const emitProductUpdate = async (productId) => {
  const updatedProduct = await Product.findById(productId);
  if (updatedProduct) {
    // 1. Update the specific product page room
    io.to(productId.toString()).emit("productUpdated", updatedProduct);
    
    // 2. 🔥 ADD THIS: Update the global Live Market gallery
    io.emit("globalProductUpdate", updatedProduct); 
  }
};

/**
 * 🔥 Enterprise Status Engine
 * Logic to transition statuses based on current time.
 */
const calculateStatus = async (product) => {
  const now = new Date();
  const startTime = new Date(product.startTime);
  const endTime = new Date(product.endTime);

  if (["Sold", "Unsold", "Cancelled"].includes(product.status)) {
    return product.status;
  }

  let newStatus = product.status;

  // 1. Scheduled -> Active
  if (now >= startTime && now < endTime && product.status === "Scheduled") {
    newStatus = "Active";
  } 
  
  // 2. Active -> Finalized
  else if (now >= endTime && (product.status === "Active" || product.status === "Scheduled")) {
    if (product.bidsCount > 0 && product.highestBidderId) {
      product.winnerId = product.highestBidderId;
      product.paymentStatus = "Pending";
      product.deliveryStatus = "Pending";
      newStatus = "Sold";
    } else {
      newStatus = "Unsold";
    }
  }

  if (newStatus !== product.status) {
    product.status = newStatus;
    await product.save();
    // Use the helper to shout the change to the frontend
    await emitProductUpdate(product._id);
  }

  return newStatus;
};

export const addProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      sellerId: req.user.id,
      status: "Scheduled"
    };

    const product = new Product(productData);
    await product.save();
    
    // Broadcast new product to everyone online
    io.emit("productCreated", product);

    res.status(201).json({ message: "Listing created successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: { $in: ["Active", "Scheduled", "Sold", "Unsold"] }
    }).sort({ endTime: 1 }).limit(50);

    const updatedProducts = await Promise.all(
      products.map(async (p) => {
        const currentStatus = await calculateStatus(p);
        return { ...p.toObject(), status: currentStatus };
      })
    );

    res.status(200).json(updatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch gallery", error: error.message });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    const updatedProducts = await Promise.all(
      products.map(async (p) => {
        const currentStatus = await calculateStatus(p);
        return {
          ...p.toObject(),
          status: currentStatus,
          isReadyForShipping: currentStatus === "Sold" && p.paymentStatus === "Paid"
        };
      })
    );
    res.status(200).json(updatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch listings", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("sellerId", "name avatar ratings");
    if (!product) return res.status(404).json({ message: "Not found" });

    const currentStatus = await calculateStatus(product);
    const currentUserId = req.user?.id?.toString(); // Get current logged-in user ID
    const isOwner = currentUserId && product.sellerId._id.toString() === currentUserId;

    const responseData = {
      ...product.toObject(),
      status: currentStatus,
      
      // 🔥 THE FIX: Privacy logic that doesn't break the UI
      registeredUsers: product.registeredUsers.map(u => {
        const regUserId = u.userId?.toString();
        
        // If it's the owner OR if it's the user themselves, show the userId
        if (isOwner || regUserId === currentUserId) {
          return u; 
        }
        
        // Otherwise, hide the userId for other bidders
        return {
          bidderNumber: u.bidderNumber,
          bidderName: u.bidderName,
          // We omit userId here for privacy of OTHER bidders
        };
      }),
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching details", error: error.message });
  }
};

export const registerForAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { bidderName } = req.body;

    if (!bidderName) return res.status(400).json({ message: "Alias required" });

    const product = await Product.findById(id);
    if (product.sellerId.toString() === userId) return res.status(400).json({ message: "Sellers can't bid" });

    const alreadyRegistered = product.registeredUsers.some(u => u.userId.toString() === userId);
    if (alreadyRegistered) return res.status(400).json({ message: "Already registered" });

    product.registeredUsers.push({
      userId,
      bidderNumber: product.registeredUsers.length + 1,
      bidderName: bidderName.trim()
    });

    await product.save();
    // 🔥 Alert the room
    await emitProductUpdate(id);

    res.status(200).json({ message: "Registered", bidderNumber: product.registeredUsers.length });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export const closeAuction = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product.sellerId.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    if (product.bidsCount > 0 && product.highestBidderId) {
      product.winnerId = product.highestBidderId;
      product.status = "Sold";
    } else {
      product.status = "Unsold";
    }

    product.endTime = new Date(); // Close immediately
    await product.save();

    // 🔥 Shout it to everyone
    await emitProductUpdate(product._id);

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};