const express = require("express");
const router = express.Router();

const productController = require("../controllers/products.js");

router.get("/", productController.getProducts);

module.exports = router;
