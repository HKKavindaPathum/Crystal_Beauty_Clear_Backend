import express from "express";
import { createOrder, getOrders, updateOrderStatus, getDashboardStats } from "../controllers/orderController.js";
const orderRouter = express.Router();

orderRouter.post("/",createOrder)
orderRouter.get("/dashboard/stats", getDashboardStats)
orderRouter.get("/",getOrders)
orderRouter.put("/:orderId/:status",updateOrderStatus)

export default orderRouter;