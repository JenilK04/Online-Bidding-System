import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authroutes.js';
import productRoutes from './routes/productsroutes.js';
import profileRoutes from './routes/profileRoute.js';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
dotenv.config();

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your frontend
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ FIXED name
  socket.on("joinProduct", (productId) => {
    socket.join(productId);
    console.log("Joined room:", productId);
  });

  socket.on("leaveProduct", (productId) => {
    socket.leave(productId);
    console.log("Left room:", productId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


app.use(cors());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));

app.use('/api/auth', authRoutes);
app.use('/api/products',productRoutes );
app.use("/api/profile", profileRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('DB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
