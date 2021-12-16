const path = require("path");
const express = require("express");
const router = express.Router();

const rootDir = require('../util/path.js');

/// route:: /admin/add-product => GET
router.get("/add-product", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "add-product.html"));
});

/// route:: /admin/add-product => POST
router.post("/add-product", (req, res, next) => {});

module.exports = router;
