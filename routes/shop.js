const path = require("path");
const express = require("express");
const router = express.Router();

const rootDir = require("../util/path.js");
const adminData = require("./admin");

router.get("/", (req, res, next) => {
  const products = adminData.products;
  console.log(products);
  res.render("shop.pug", { prods: products, pageTitle: "My Shop", path: "/" });
});

module.exports = router;
