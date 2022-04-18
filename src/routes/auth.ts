import { Router } from "express";
import { check, body } from "express-validator";

import * as AuthController from "../controllers/auth";
import Routes from "../constants/routes";
import { UserModel } from "../models/user";

const router = Router();

/// route:: /login => GET
router.get(Routes.login, AuthController.getLogin);

/// route:: /signup => GET
router.get(Routes.signup, AuthController.getSignup);

/// route:: /login => POST
router.post(
  Routes.login,
  /// Data Validation
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password", "Password has to be valid.")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  AuthController.postLogin
);

/// route:: /signup => POST
router.post(
  Routes.signup,
  // Data Validations
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid Email")
      .custom((value, { req }) => {
        return UserModel.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email already exists, please pick a different one"
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and atleast 5 characters"
    )
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match");
        }
        return true;
      })
      .trim(),
  ],
  AuthController.postSignup
);

/// route:: /logout => POST
router.post(Routes.logout, AuthController.postLogout);

/// route:: /reset => GET
router.get(Routes.resetPassword, AuthController.getResetPassword);

/// route:: /reset => POST
router.post(Routes.resetPassword, AuthController.postReset);

/// route:: /new-password/:token => GET
router.get(Routes.newPassword + "/:token", AuthController.getNewPassword);

/// route:: /new-password => POST
router.post(Routes.newPassword, AuthController.postNewPassword);

export default router;
