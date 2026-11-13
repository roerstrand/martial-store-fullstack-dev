const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

const requireCsrfHeader = (req, res, next) => {
  if (SAFE_METHODS.includes(req.method)) return next();
  if (req.get("X-Requested-With") === "XMLHttpRequest") return next();
  res.status(403).json({ message: "Missing CSRF header" });
};

module.exports = { requireCsrfHeader };
