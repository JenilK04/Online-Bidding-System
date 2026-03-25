import Product from "../models/products.js";

// 📦 UPDATE ADDRESS + CONTACT
export const updateOrderDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const { shippingAddress, contactNumber } = req.body;

    // 🔍 Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ❌ Only winner can update
    if (product.winnerId?.toString() !== userId) {
      return res.status(403).json({
        message: "Only winner can add address"
      });
    }

    // ❌ Auction must be ended
    if (product.status !== "Ended") {
      return res.status(400).json({
        message: "Auction not completed"
      });
    }

    // ✅ Update fields
    product.shippingAddress = shippingAddress;
    product.contactNumber = contactNumber;

    // 🔥 AUTO ORDER READY CHECK
    if (
      product.shippingAddress &&
      product.contactNumber &&
      product.paymentStatus === "Paid"
    ) {
      product.orderReady = true;
    }

    await product.save();

    res.json({
      message: "Details updated successfully",
      product
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};