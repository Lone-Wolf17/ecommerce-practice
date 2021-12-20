const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop.js");

/// route:: / => GET
router.get("/", shopController.getIndex);

/// route:: /products => GET
router.get("/products", shopController.getProducts);

/// route:: /products/:productId => GET
router.get("/products/:productId", shopController.getProduct);

/// route:: /checkout => GET
router.get("/checkout", shopController.getCheckout);

/// route:: /cart => POST
router.post("/cart", shopController.postCart);

/// route:: /cart => GET
router.get("/cart", shopController.getCart);

/// route:: /orders => GET
router.get("/orders", shopController.getOrders);

module.exports = router;
