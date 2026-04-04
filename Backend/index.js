import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import cron from "node-cron";

// Routes
import authRoutes from './routes/authroutes.js';
import productRoutes from './routes/productsroutes.js';
import profileRoutes from './routes/profileRoute.js';
import bidRoutes from './routes/bidsRoute.js';
import adminRoutes from "./routes/adminRoute.js";
import orderRoutes from "./routes/orderroutes.js";

// Models
import Product from "./models/products.js";

dotenv.config();
import './jobs/auctionStartReminder.js';
const app = express();
const server = http.createServer(app);

// 1. Initialize Socket.io with CORS
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Match your Vite/React URL
    methods: ["GET", "POST"],
  },
});

// 2. Socket Connection Logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinProduct", (productId) => {
    if (productId) {
      socket.join(productId.toString());
      console.log(`User ${socket.id} joined room: ${productId}`);
    }
  });

  socket.on("leaveProduct", (productId) => {
    if (productId) {
      socket.leave(productId.toString());
      console.log(`User ${socket.id} left room: ${productId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 3. Middlewares
app.use(cors());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));

// 4. Routes 
// (Note: ensure your controllers import { io } from '../index.js' ONLY after this line)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

// 5. Real-Time Status Cron Job
// Runs every 5 seconds to flip Scheduled -> Active or Active -> Sold/Unsold
// index.js - Cron Job Section
cron.schedule("*/5 * * * * *", async () => {
  try {
    const now = new Date();
    const products = await Product.find({ status: { $in: ["Scheduled", "Active"] } });

    for (let product of products) {
      const start = new Date(product.startTime);
      const end = new Date(product.endTime);
      let newStatus = product.status;

      // 1. Logic: Scheduled -> Active
      if (now >= start && now < end && product.status === "Scheduled") {
        newStatus = "Active";
      }

      // 2. Logic: Active -> Sold / Unsold
      if (now >= end && product.status === "Active") {
        if (product.bidsCount > 0 && product.highestBidderId) {
          product.winnerId = product.highestBidderId;
          product.paymentStatus = "Pending"; // Initialize logistics
          newStatus = "Sold";
        } else {
          newStatus = "Unsold";
        }
      }

      // 3. If status changed, Save and Emit
      if (newStatus !== product.status) {
        product.status = newStatus;
        const updatedDoc = await product.save();
        const cleanProduct = updatedDoc.toObject(); // Ensure clean JSON for Socket

        // 🔥 SHOUT TO DETAIL PAGE (Private Room)
        io.to(cleanProduct._id.toString()).emit("productUpdated", cleanProduct);
        
        // 🔥 SHOUT TO MARKET & SELLER HUB (Global)
        io.emit("globalProductUpdate", cleanProduct);

        console.log(`[AUTO-CLOSE] ${cleanProduct._id} is now ${newStatus}`);
      }
    }
  } catch (err) {
    console.error("Cron Error:", err.message);
  }
});
// 6. Database & Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));
