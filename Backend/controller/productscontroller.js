import Product from "../models/products.js";

const calculateStatus = (product) => {
  const now = Date.now();
  const startTime = new Date(product.auctionStart).getTime();

  // 🛑 Manual close has highest priority
  if (product.status === "Ended") {
    return "Ended";
  }

  // ⏱ Time-based logic (UTC)
  if (now >= startTime) {
    return "Active";
  }

  return "Upcoming";
};

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

    // ✅ Validation
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

    // if (images.length > 5) {
    //   return res.status(400).json({
    //     message: "Maximum 5 images allowed",
    //   });
    // }

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

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const updatedProducts = products.map((p) => ({
      ...p.toObject(),
      status: calculateStatus(p),
    }));

    res.json(updatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      sellerId: req.user.id,
    });

    const updatedProducts = products.map((p) => ({
      ...p.toObject(),
      status: calculateStatus(p),
    }));

    res.json(updatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch my products" });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      ...product.toObject(),
      status: calculateStatus(product),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};

export const closeBid = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // 🔐 Only seller can close
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    product.status = "Ended";
    await product.save();

    res.json({
      message: "Bidding closed successfully",
      product: {
        ...product.toObject(),
        status: "Ended",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to close bid",
    });
  }
};
