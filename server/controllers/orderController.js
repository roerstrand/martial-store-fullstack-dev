const asyncHandler = require("express-async-handler");
const {
  getAllOrdersService,
  getOrderService,
  getOrdersByUserService,
  createOrderService,
  updateOrderStatusService,
  deleteOrderService,
} = require("../services/orderService");

// @desc    GET all orders
// @route   GET /api/orders
// @access  private/admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await getAllOrdersService();
  res.status(200).json(orders);
});

// @desc    GET order by id
// @route   GET /api/orders/:id
// @access  private
const getOrder = asyncHandler(async (req, res) => {
  const order = await getOrderService(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.status(200).json(order);
});

// @desc    GET orders for current user
// @route   GET /api/orders/me
// @access  private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await getOrdersByUserService(req.user.id);
  res.status(200).json(orders);
});

// @desc    Create order
// @route   POST /api/orders
// @access  private
const createOrder = asyncHandler(async (req, res) => {
  const { products, totalPrice, shippingMethod, carrier } = req.body;
  if (!products || !totalPrice) {
    res.status(400);
    throw new Error("products and totalPrice are required");
  }
  const order = await createOrderService({
    user_id: req.user?.id || null,
    products,
    totalPrice,
    shippingMethod,
    carrier,
  });
  res.status(201).json(order);
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  private/admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400);
    throw new Error("status is required");
  }
  const order = await updateOrderStatusService(req.params.id, status);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.status(200).json(order);
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  private/admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await deleteOrderService(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.status(200).json({ message: "Order deleted" });
});

module.exports = {
  getAllOrders,
  getOrder,
  getMyOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};
