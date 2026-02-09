import Product from "../models/products.js";

export const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      images,
      category,
      condition,
      startingPrice,
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

    if (images.length > 5) {
      return res.status(400).json({
        message: "Maximum 5 images allowed",
      });
    }

    const product = new Product({
      title,
      description,
      images,
      category,
      condition,
      startingPrice,
      auctionStart,
      maxRegistrations,
      sellerId: req.user.id,
      status: "Upcoming", // explicit default
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
    const now = Date.now();

    const updatedProducts = products.map((p) => {
      // 🛑 MANUAL CLOSE HAS HIGHEST PRIORITY
      if (p.status === "Ended") {
        return p.toObject();
      }

      const startTime = new Date(p.auctionStart).getTime();

      let status = "Upcoming";
      if (now >= startTime) status = "Active";

      return {
        ...p.toObject(),
        status,
      };
    });

    res.json(updatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id });
    const now = Date.now();

    const updated = products.map((p) => {
      // 🛑 NEVER REOPEN MANUALLY CLOSED BID
      if (p.status === "Ended") {
        return p.toObject();
      }

      const start = new Date(p.auctionStart).getTime();
      let status = "Upcoming";
      if (now >= start) status = "Active";

      return {
        ...p.toObject(),
        status,
      };
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch my products" });
  }
};

export const closeBid = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔐 Only seller can close
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🛑 Final state
    product.status = "Ended";
    await product.save();

    res.json({
      message: "Bidding closed successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to close bid" });
  }
};
