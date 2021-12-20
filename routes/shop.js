const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop.js");

/// route:: / => GET
router.get("/", shopController.getIndex);

/// route:: /products => GET
router.get("/products", shopController.getProducts);

/// route:: /checkout => GET
router.get("/checkout", shopController.getCheckout);

/// route:: /cart => GET
router.get("/cart", shopController.getOrders);

/// route:: /orders => GET
router.get("/orders", shopController.getCart);

module.exports = router;
