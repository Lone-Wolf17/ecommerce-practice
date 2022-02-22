const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.js");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator");

/// route:: /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

/// route:: /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

/// route:: /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title", "Title should contain atleast 3 characters")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("price", "Enter valid price").isFloat(),
    body(
      "description",
      "Description must have a length between 5 and 400 characters"
    )
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

/// route:: /admin/edit-product/:productId => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

/// route:: /admin/edit-product => POST
router.post(
  "/edit-product",
  [
    body("title", "Title should contain atleast 3 characters")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("price", "Enter valid price").isFloat(),
    body(
      "description",
      "Description must have a length between 5 and 400 characters"
    )
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

/// route:: /admin/product/:productId => DELETE
router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
