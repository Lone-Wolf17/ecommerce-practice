const path = require("path");
const express = require("express");
const router = express.Router();

const rootDir = require("../util/path.js");

const products = [];

/// route:: /admin/add-product => GET
router.get("/add-product", (req, res, next) => {
  res.render('add-product', {pageTitle: 'Add Product', path: '/admin/add-product'})
});

/// route:: /admin/add-product => POST
router.post("/add-product", (req, res, next) => {
  products.push({ title: req.body.title });
  console.log("adminjs" + req.body.title);
  res.redirect("/");
});

// module.exports = router;
exports.routes = router;
exports.products = products;
