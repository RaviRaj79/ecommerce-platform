export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // allow
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};
