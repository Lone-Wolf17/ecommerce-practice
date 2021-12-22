const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop.js");

/// route:: / => GET
router.get("/", shopController.getIndex);

/// route:: /products => GET
router.get("/products", shopController.getProducts);

/// route:: /products/:productId => GET
router.get("/products/:productId", shopController.getProduct);

/// route:: /cart => POST
router.post("/cart", shopController.postCart);

/// route:: /cart => GET
router.get("/cart", shopController.getCart);

/// route:: /cart-delete-item => POST
router.post("/cart-delete-item", shopController.postCartDeleteProduct);

/// route:: /create-order => POST
router.post('/create-order', shopController.postOrder);

/// route:: /orders => GET
router.get("/orders", shopController.getOrders);

module.exports = router;
