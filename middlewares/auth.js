// C:\laragon\www\bus-booking-backend\middlewares\auth.js
import jwt from "jsonwebtoken";

// Middleware: Verify token
export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    req.user = decoded; // Attach user info (id, role, company_id, etc.)
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

// Middleware: Verify admin role
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. Token missing." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  // If admin is tied to a company, attach it
  req.admin = {
    id: req.user.id,
    company_id: req.user.company_id || null, // depends on DB structure
  };

  next();
};
