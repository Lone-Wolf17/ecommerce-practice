const express = require("express");
const router = express.Router();
const productController = require('../controllers/products.js');

/// route:: /admin/add-product => GET
router.get("/add-product", productController.getAddProduct);

/// route:: /admin/add-product => POST
router.post("/add-product", productController.postAddProduct);

module.exports = router;

