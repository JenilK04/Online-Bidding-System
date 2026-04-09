const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // rzp_test_...
  key_secret: process.env.RAZORPAY_SECRET // Your secret here
});

// Endpoint to create an order
app.post("/orders/create-razorpay-order", async (req, res) => {
  const options = {
    amount: 50000, // Amount in PAISA (50000 = ₹500)
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  
  const order = await razorpay.orders.create(options);
  res.json(order); // Send this to your React app
});