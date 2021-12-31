const express = require("express");
const router = express.Router();
const Routes = require('../constants/routes');

const shopController = require("../controllers/shop.js");

/// route:: / => GET
router.get(Routes.index, shopController.getIndex);

/// route:: /products => GET
router.get(Routes.products, shopController.getProducts);

/// route:: /products/:productId => GET
router.get("/products/:productId", shopController.getProduct);

/// route:: /cart => POST
router.post(Routes.cart, shopController.postCart);

/// route:: /cart => GET
router.get(Routes.cart, shopController.getCart);

/// route:: /cart-delete-item => POST
router.post(Routes.cartDeleteItem, shopController.postCartDeleteProduct);

/// route:: /create-order => POST
router.post(Routes.createOrder, shopController.postOrder);

/// route:: /orders => GET
router.get(Routes.orders, shopController.getOrders);

module.exports = router;
