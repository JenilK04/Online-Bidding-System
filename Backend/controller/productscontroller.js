import Product from "../models/products.js";
import { io } from "../index.js";
/**
 * 🔥 Helper: Emit updated product with real-time status
 * Ensures all connected clients see the current bid, time, and winner status.
 */
const emitProductUpdate = async (productId) => {
  const updatedProduct = await Product.findById(productId);
  if (updatedProduct) {
    io.to(productId.toString()).emit("productUpdated", updatedProduct);
  }
};

/**
 * 🔥 Enterprise Status Engine
 * Handles transitions: Draft -> Scheduled -> Active -> Sold/Unsold
 * Now includes Auto-Winner selection and Seller/Buyer logistics sync.
 */
const calculateStatus = async (product) => {
  const now = new Date();
  const startTime = new Date(product.startTime);
  const endTime = new Date(product.endTime);

  // If finalized (Sold, Unsold, Cancelled), stop processing
  if (["Sold", "Unsold", "Cancelled"].includes(product.status)) {
    return product.status;
  }

  let newStatus = product.status;

  // 1. Scheduled -> Active (Auction Starts)
  if (now >= startTime && now < endTime && product.status === "Scheduled") {
    newStatus = "Active";
  } 
  
  // 2. Active -> Finalized (The Auto-Win Logic)
  else if (now >= endTime && (product.status === "Active" || product.status === "Scheduled")) {
    
    // Check for highest bidder
    if (product.bidsCount > 0 && product.highestBidderId) {
      product.winnerId = product.highestBidderId;
      product.paymentStatus = "Pending";
      product.deliveryStatus = "Pending";
      newStatus = "Sold";
    } else {
      newStatus = "Unsold";
    }
  }

  // Save changes if status shifted
  if (newStatus !== product.status) {
    product.status = newStatus;
    await product.save();
    await emitProductUpdate(product._id);
  }

  return newStatus;
};

/**
 * ➕ ADD PRODUCT (Updated for Logistics & Address)
 * Now captures sellerAddress for pickup and initializes Anti-Snipe config.
 */
export const addProduct = async (req, res) => {
  try {
    const {
      title, subtitle, sku, category, brand, modelNumber,
      condition, images, description, startingPrice,
      bidIncrement, maxRegistrations, startTime, endTime,
      antiSnipeWindow, extensionDuration, returnPolicy,
      shippingWeight, dimensions,
      sellerAddress // 📍 Captured for pickup logic
    } = req.body;

    const product = new Product({
      title, subtitle, sku, category, brand, modelNumber,
      condition, images, description,
      sellerId: req.user.id,
      sellerAddress, // Maps to the new schema field
      startingPrice,
      bidIncrement: bidIncrement || 10,
      maxRegistrations: maxRegistrations || 100,
      startTime,
      endTime,
      antiSnipeWindow: antiSnipeWindow || 60,
      extensionDuration: extensionDuration || 120,
      returnPolicy, 
      shippingWeight,
      dimensions,   
      status: "Scheduled", // Professional listings usually go straight to Scheduled
    });

    await product.save();
    
    // Broadcast to global feed
    io.emit("productCreated", product);

    res.status(201).json({ 
      message: "Listing created and scheduled successfully", 
      product 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to add product", 
      error: error.message 
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    // We search for Active/Scheduled but also "Ended" (to show recently closed items)
    const products = await Product.find({
      status: { $in: ["Active", "Scheduled", "Sold", "Unsold"] }
    })
    .sort({ endTime: 1 }) // Show items ending soonest first
    .limit(50);

    // 🔥 Sync every product's status before sending to UI
    const updatedProducts = await Promise.all(
      products.map(async (p) => {
        const currentStatus = await calculateStatus(p);
        return {
          ...p.toObject(),
          status: currentStatus,
        };
      })
    );

    res.status(200).json(updatedProducts);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ 
      message: "Failed to fetch gallery", 
      error: error.message 
    });
  }
};

/**
 * 📦 GET SINGLE PRODUCT (Seller's Private View)
 * Includes: Bidder List, Shipping Dimensions, and Return Policy.
 */
export const getMyProducts = async (req, res) => {
  try {
    const userId = req.user.id; // Correctly identified from your Auth Middleware

    // 1. Fetch ONLY products created by this specific user
    // We sort by 'createdAt' so the newest listings appear first
    const products = await Product.find({ sellerId: userId }).sort({ createdAt: -1 });

    // 2. Sync Statuses for the entire list
    // This ensures Scheduled items move to Active and Active move to Sold/Unsold
    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        const currentStatus = await calculateStatus(product);
        
        return {
          ...product.toObject(),
          status: currentStatus,
          // Extra logic for the seller dashboard
          isReadyForShipping: currentStatus === "Sold" && product.paymentStatus === "Paid"
        };
      })
    );

    // 3. Return the array of products
    res.status(200).json(updatedProducts);

  } catch (error) {
    console.error("GET MY PRODUCTS ERROR:", error);
    res.status(500).json({ 
      message: "Failed to fetch your listings", 
      error: error.message 
    });
  }
};

/**
 * 📦 GET SINGLE PRODUCT DETAILS
 * Path: GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Optional: depending on if user is logged in

    // 1. Fetch product and populate Seller info (eBay style)
    // We populate only public seller info to maintain privacy
    const product = await Product.findById(id).populate("sellerId", "name avatar ratings");

    if (!product) {
      return res.status(404).json({ message: "Product listing not found" });
    }

    // 2. 🔥 Run Status Engine
    // This ensures that if the endTime has passed, the status flips to 'Sold' 
    // and the winner is assigned BEFORE the user sees the page.
    const currentStatus = await calculateStatus(product);

    // 3. 🛡️ Bidder Privacy Logic
    // On the public details page, we hide real names and show "Paddle Numbers"
    const sanitizedRegisteredUsers = product.registeredUsers.map(u => ({
      userId: u.userId, // We keep the ID for internal logic but won't show it in the UI
      bidderNumber: u.bidderNumber,
      bidderName: u.bidderName, // Usually "Bidder_1", etc.
      registeredAt: u.registeredAt
    }));

    // 4. 🔒 Seller-Only Data Logic
    // Only the owner should see the exact buyer contact or specific logistics
    const isOwner = userId && product.sellerId._id.toString() === userId;

    const responseData = {
      ...product.toObject(),
      status: currentStatus,
      registeredUsers: isOwner ? product.registeredUsers : sanitizedRegisteredUsers,
      // Hide sensitive buyer info from public
      buyerContactNumber: isOwner ? product.buyerContactNumber : undefined,
      buyerShippingAddress: isOwner ? product.buyerShippingAddress : undefined,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("PRODUCT DETAILS ERROR:", error);
    res.status(500).json({ 
      message: "Error fetching product details", 
      error: error.message 
    });
  }
};
/**
 * 📝 REGISTER FOR AUCTION
 * Assigns a unique "Paddle Number" and alias to the bidder.
 */
export const registerForAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 🛡️ Safety: Default to empty object if body is missing
    const { bidderName } = req.body || {}; 

    if (!bidderName) {
      return res.status(400).json({ message: "A bidder name or alias is required." });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Auction not found" });

    if (product.sellerId.toString() === userId) {
      return res.status(400).json({ message: "Sellers cannot register for their own auctions." });
    }

    const alreadyRegistered = product.registeredUsers.some(u => u.userId.toString() === userId);
    if (alreadyRegistered) return res.status(400).json({ message: "Already registered." });

    const bidderNumber = product.registeredUsers.length + 1;

    product.registeredUsers.push({
      userId,
      bidderNumber,
      bidderName: bidderName.trim(),
      registeredAt: new Date()
    });

    await product.save();
    io.to(id).emit("productUpdated", product);

    res.status(200).json({ message: "Registration successful", bidderNumber });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

/**
 * 🔒 CLOSE AUCTION MANUALLY
 * Finalizes the auction immediately, locking in the winner if bids exist.
 */
export const closeAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 1. Security check
    if (product.sellerId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 2. Winner Logic
    if (product.bidsCount > 0 && product.highestBidderId) {
      product.winnerId = product.highestBidderId;
      product.status = "Sold";
      product.paymentStatus = "Pending";
    } else {
      product.status = "Unsold";
    }

    product.endTime = new Date();
    await product.save();

    // 🔥 THE GLOBAL REAL-TIME SHOUT
    // This updates the Products page and the Seller Hub instantly
    io.emit("productUpdated", product); 
    
    // This updates anyone specifically looking at the item details
    io.to(id).emit("productUpdated", product);

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const saveOrderDetails = async (req, res) => {
//   const { address, city, contact } = req.body;
//   try {
//     const product = await Product.findById(req.params.id);

//     // Security: Only the winner can add shipping info
//     if (product.winnerId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     product.shippingAddress = address;
//     product.city = city;
//     product.contactNumber = contact;
    
//     await product.save();
//     res.status(200).json({ message: "Shipping details updated", product });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to save details" });
//   }
// };

// // 3. Process Mock Payment
// export const processPayment = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (product.highestBidder.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     product.isPaid = true;
//     product.deliveryStatus = "Pending"; // Moves to seller's queue
    
//     await product.save();
//     res.status(200).json({ message: "Payment Successful", product });
//   } catch (error) {
//     res.status(500).json({ message: "Payment failed" });
//   }
// };