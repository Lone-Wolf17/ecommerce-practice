const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.js");
const isAuth = require('../middleware/is-auth');

/// route:: /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

/// route:: /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

/// route:: /admin/add-product => POST
router.post("/add-product", isAuth, adminController.postAddProduct);

/// route:: /admin/edit-product/:productId => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

/// route:: /admin/edit-product => POST
router.post("/edit-product", isAuth, adminController.postEditProduct);

/// route:: /admin/delete-product => POST
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
