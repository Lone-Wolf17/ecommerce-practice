const express = require("express");
const router = express.Router();

const Routes = require('../constants/routes');
const shopController = require("../controllers/shop.js");
const isAuth = require('../middleware/is-auth');

/// route:: / => GET
router.get(Routes.index, shopController.getIndex);

/// route:: /products => GET
router.get(Routes.products, shopController.getProducts);

/// route:: /products/:productId => GET
router.get("/products/:productId", shopController.getProduct);

/// route:: /cart => POST
router.post(Routes.cart, isAuth, shopController.postCart);

/// route:: /cart => GET
router.get(Routes.cart, isAuth, shopController.getCart);

/// route:: /cart-delete-item => POST
router.post(Routes.cartDeleteItem, isAuth, shopController.postCartDeleteProduct);

/// route:: /checkout => GET
router.get(Routes.checkout, isAuth, shopController.getCheckout);

/// route:: /create-order => POST
router.post(Routes.createOrder, isAuth, shopController.postOrder);

/// route:: /orders => GET
router.get(Routes.orders, isAuth, shopController.getOrders);

/// route:: /orders => GET
router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
