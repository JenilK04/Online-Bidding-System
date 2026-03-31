import Order from "../models/order.js";
import Product from "../models/products.js";

/**
 * 📝 STEP 1: CREATE INITIAL ORDER
 * Triggered when the winner clicks "Checkout" and submits their address.
 */
export const createOrder = async (req, res) => {
  try {
    const { productId, shippingAddress } = req.body;
    const buyerId = req.user.id;

    // 1. Fetch the product and verify it's "Sold" to this buyer
    const product = await Product.findById(productId);
    
    if (!product || product.status !== "Sold") {
      return res.status(400).json({ message: "This lot is not available for checkout." });
    }

    if (product.winnerId.toString() !== buyerId) {
      return res.status(403).json({ message: "Unauthorized: You are not the winner of this lot." });
    }

    // 2. Check if an order already exists for this product (to prevent duplicates)
    let order = await Order.findOne({ product: productId });

    if (order) {
      // Update existing order with new address
      order.shippingAddress = shippingAddress;
    } else {
      // Create a brand new Order snapshot
      order = new Order({
        product: productId,
        buyer: buyerId,
        seller: product.sellerId,
        hammerPrice: product.currentBid,
        totalAmount: product.currentBid * 1.05, // Hammer + 5% Fee
        shippingAddress: shippingAddress,
      });
    }

    await order.save();

    res.status(201).json({ message: "Order initialized", orderId: order._id });
  } catch (error) {
    res.status(500).json({ message: "Order creation failed", error: error.message });
  }
};

/**
 * 💳 STEP 2: FINALIZE PAYMENT
 * Triggered after the "Mock" credit card check passes.
 */
export const finalizePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId).populate("product");
    if (!order) return res.status(404).json({ message: "Order not found." });

    // 1. Mock Payment Logic
    order.paymentStatus = "Paid";
    order.paidAt = new Date();
    order.transactionId = `TXN-${Math.random().toString(36).toUpperCase().substring(2, 12)}`;
    
    await order.save();

    // 2. 🔗 Sync the Product Status
    // We update the product to reference this specific order
    await Product.findByIdAndUpdate(order.product._id, {
      paymentStatus: "Paid", // For quick UI flags
      status: "Sold" 
    });

    res.status(200).json({ 
      message: "Payment Successful", 
      transactionId: order.transactionId 
    });
  } catch (error) {
    res.status(500).json({ message: "Payment processing failed" });
  }
};

// 🚚 MARK AS SHIPPED (Seller Action)
export const markAsShipped = async (req, res) => {
  try {
    const { productId } = req.params;
    const { trackingNumber, carrier } = req.body;

    // 1. Find the order associated with this product
    const order = await Order.findOne({ product: productId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // 2. Security: Ensure only the seller can ship
    if (order.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to ship this item" });
    }

    // 3. Update Order Status
    order.deliveryStatus = "Shipped";
    order.trackingNumber = trackingNumber;
    order.carrier = carrier || "Standard Shipping";
    order.shippedAt = new Date();
    await order.save();

    // 4. Sync Product Status for Buyer Visibility
    await Product.findByIdAndUpdate(productId, { 
      deliveryStatus: "Shipped" 
    });

    res.status(200).json({ message: "Item marked as Shipped", order });
  } catch (error) {
    res.status(500).json({ message: "Shipping update failed", error: error.message });
  }
};

// Matches: await API.get(`/orders/manage/${id}`)
export const getManageOrder = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if the requester is actually the seller
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const order = await Order.findOne({ product: req.params.productId });

    // If order is null, the frontend SellerManagement page will 
    // correctly show "Awaiting Buyer Checkout"
    res.json({ product, order: order || null }); 
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};