const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.js");

/// route:: /admin/add-product => GET
router.get("/add-product", adminController.getAddProduct);

/// route:: /admin/products => GET
router.get("/products", adminController.getProducts);

/// route:: /admin/add-product => POST
router.post("/add-product", adminController.postAddProduct);

/// route:: /admin/edit-product/:productId => GET
router.get("/edit-product/:productId", adminController.getEditProduct);

/// route:: /admin/edit-product => POST
router.post("/edit-product", adminController.postEditProduct);

/// route:: /admin/delete-product => POST
router.post("/delete-product", adminController.postDeleteProduct);

module.exports = router;
