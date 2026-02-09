import "../config/env.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  let tokenSource = "none";

  // Token header me hoga
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Bearer TOKEN → TOKEN
    token = req.headers.authorization.split(" ")[1];
    tokenSource = "authorization";
  }
  if (!token && req.headers["x-auth-token"]) {
    token = req.headers["x-auth-token"];
    tokenSource = "x-auth-token";
  }
  if (!token && req.headers["x-access-token"]) {
    token = req.headers["x-access-token"];
    tokenSource = "x-access-token";
  }

  // Fallback: token in body or query (useful for clients with blocked headers)
  if (!token && req.body?.token) {
    token = req.body.token;
    tokenSource = "body";
  }
  if (!token && req.query?.token) {
    token = req.query.token;
    tokenSource = "query";
  }

  if (!token) {
    console.warn("Auth failed: no token", {
      path: req.originalUrl,
    });
    return res.status(401).json({ message: "No token, access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      console.warn("Auth failed: user not found", {
        path: req.originalUrl,
        tokenSource,
      });
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (error) {
    console.warn("Auth failed: invalid token", {
      path: req.originalUrl,
      tokenSource,
      error: error?.message,
    });
    return res.status(401).json({ message: "Invalid token" });
  }
};
