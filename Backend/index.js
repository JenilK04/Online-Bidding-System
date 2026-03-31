import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authroutes.js';
import productRoutes from './routes/productsroutes.js';
import profileRoutes from './routes/profileRoute.js';
import bidRoutes from './routes/bidsRoute.js';
import adminRoutes from "./routes/adminRoute.js";
import orderRoutes from "./routes/orderroutes.js";
import { Server } from 'socket.io';
import http from 'http';

// 🔥 ADDED
import cron from "node-cron";
import Product from "./models/products.js";

const app = express();
dotenv.config();

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ FIXED name
  socket.on("joinProduct", (productId) => {
    socket.join(productId.toString()); // 🔥 FIXED (string safety)
    console.log("Joined room:", productId);
  });

  socket.on("leaveProduct", (productId) => {
    socket.leave(productId.toString()); // 🔥 FIXED
    console.log("Left room:", productId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


// 🔥 🔥 🔥 ADDED CRON JOB HERE
cron.schedule("*/5 * * * * *", async () => {
  try {
    const now = new Date();

    const products = await Product.find({
      status: { $in: ["Scheduled", "Active"] }
    });

    for (let product of products) {
      const start = new Date(product.startTime);
      const end = new Date(product.endTime);

      let newStatus = product.status;

      // Scheduled → Active
      if (now >= start && now < end && product.status === "Scheduled") {
        newStatus = "Active";
      }

      // Active → Sold / Unsold
      if (now >= end && product.status === "Active") {
        if (product.bidsCount > 0 && product.highestBidderId) {
          newStatus = "Sold";
        } else {
          newStatus = "Unsold";
        }
      }

      // 🔥 Only update if changed
      if (newStatus !== product.status) {
        product.status = newStatus;
        await product.save();

        // 🔥 REAL-TIME SOCKET UPDATE
        io.to(product._id.toString()).emit("productUpdated", product);

        console.log("Cron updated:", product._id, newStatus);
      }
    }
  } catch (err) {
    console.log("Cron error:", err.message);
  }
});
// 🔥 END CRON


app.use(cors());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));

app.use('/api/auth', authRoutes);
app.use('/api/products',productRoutes );
app.use("/api/profile", profileRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('DB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));