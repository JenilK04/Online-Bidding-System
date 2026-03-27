import jwt from "jsonwebtoken";

// 1. First Layer: Is the user logged in?
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // This 'decoded' now contains { id, role }
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// 2. Second Layer: Is the logged-in user an Admin?
export const isAdmin = (req, res, next) => {
  // Check if req.user exists and has the 'admin' role
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ 
      message: "Access Denied: Administrator privileges required" 
    });
  }
};