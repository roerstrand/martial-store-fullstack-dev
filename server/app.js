const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const articleRoutes = require("./routes/articleRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/favorites", favoriteRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Martial store api running" });
});

app.use(errorHandler);

module.exports = app;
