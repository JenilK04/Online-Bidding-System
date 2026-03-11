import Product from "../models/products.js";

// 🔥 Auto status calculation + DB update
const calculateStatus = async (product) => {
  const now = Date.now();
  const startTime = new Date(product.auctionStart).getTime();

  // If manually ended
  if (product.status === "Ended") {
    return "Ended";
  }

  // Upcoming → Active
  if (now >= startTime && product.status === "Upcoming") {
    product.status = "Active";
    await product.save();
    return "Active";
  }

  return product.status;
};

// ➕ Add Product
export const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      images,
      category,
      condition,
      startingPrice,
      bidIncrement,
      auctionStart,
      maxRegistrations,
    } = req.body;

    if (
      !title ||
      !description ||
      !images ||
      images.length === 0 ||
      !startingPrice ||
      !auctionStart ||
      !maxRegistrations
    ) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    if (bidIncrement !== undefined && bidIncrement < 1) {
      return res.status(400).json({
        message: "Bid increment must be at least 1",
      });
    }

    const product = new Product({
      title,
      description,
      images,
      category,
      condition,
      startingPrice,
      bidIncrement: bidIncrement || 10,
      auctionStart,
      maxRegistrations,
      sellerId: req.user.id,
      status: "Upcoming",
      currentBid: 0,
      bidsCount: 0,
    });

    await product.save();

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
};

// 📦 Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const updatedProducts = await Promise.all(
      products.map(async (p) => {
        const newStatus = await calculateStatus(p);
        return {
          ...p.toObject(),
          status: newStatus,
        };
      })
    );

    res.json(updatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// 📦 Get My Products
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      sellerId: req.user.id,
    });

    const updatedProducts = await Promise.all(
      products.map(async (p) => {
        const newStatus = await calculateStatus(p);
        return {
          ...p.toObject(),
          status: newStatus,
        };
      })
    );

    res.json(updatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch my products" });
  }
};

// 📦 Get Single Product
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const newStatus = await calculateStatus(product);

    res.json({
      ...product.toObject(),
      status: newStatus,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};

// Close Bid Manually + Set Winner
export const closeBid = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Only seller can close
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // If already closed
    if (product.status === "Ended") {
      return res.status(400).json({
        message: "Auction already closed",
      });
    }

    // 🔥 Determine winner
    if (product.highestBidderId) {
      product.winnerId = product.highestBidderId;
    }

    product.status = "Ended";

    await product.save();

    res.json({
      message: "Bidding closed successfully",
      winnerId: product.winnerId,
      product,
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to close bid",
      error: error.message
    });

  }
};

// 📝 Register For Auction
export const registerForAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const { bidderName } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.sellerId.toString() === userId)
      return res.status(400).json({
        message: "Owner cannot register",
      });

    if (product.status !== "Upcoming")
      return res.status(400).json({
        message: "Registration closed",
      });

    const alreadyRegistered = product.registeredUsers.some(
      (u) => u.userId.toString() === userId
    );

    if (alreadyRegistered)
      return res.status(400).json({
        message: "Already registered",
      });

    if (
      product.registeredUsers.length >=
      product.maxRegistrations
    )
      return res.status(400).json({
        message: "Slots full",
      });

    const bidderNumber =
      product.registeredUsers.length + 1;

    product.registeredUsers.push({
      userId,
      bidderNumber,
      bidderName: bidderName || `Bidder_${bidderNumber}`,
      registeredAt: new Date(),
    });

    await product.save();

    res.status(200).json({
      message: "Registered successfully",
      bidderNumber,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    console.error("STACK:", error.stack);

    return res.status(500).json({
      message: error.message,
    });
  }
};
