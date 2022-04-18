import {Router} from 'express';
import {body} from 'express-validator';

import * as AdminController from '../controllers/admin';
import isAuth from '../middleware/is-auth';

const router = Router();

/// route:: /admin/add-product => GET
router.get("/add-product", isAuth, AdminController.getAddProduct);

/// route:: /admin/products => GET
router.get("/products", isAuth, AdminController.getProducts);

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
  AdminController.postAddProduct
);

/// route:: /admin/edit-product/:productId => GET
router.get("/edit-product/:productId", isAuth, AdminController.getEditProduct);

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
  AdminController.postEditProduct
);

/// route:: /admin/product/:productId => DELETE
router.delete("/product/:productId", isAuth, AdminController.deleteProduct);

export default router;
