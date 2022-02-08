const express = require("express");
const { check, body } = require("express-validator");
const authController = require("../controllers/auth");
const Routes = require("../constants/routes");
const User = require("../models/user");

const router = express.Router();

/// route:: /login => GET
router.get(Routes.login, authController.getLogin);

/// route:: /signup => GET
router.get(Routes.signup, authController.getSignup);

/// route:: /login => POST
router.post(
  Routes.login,
  /// Data Validation
  [
    body("email").isEmail().withMessage("Please enter a valid email address."),
    body("password", "Password has to be valid.")
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postLogin
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
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email already exists, please pick a different one"
            );
          }
        });
      }),
    body(
      "password",
      "Please enter a password with only numbers and text and atleast 5 characters"
    )
      .isLength({ min: 8 })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match");
      }
      return true;
    }),
  ],
  authController.postSignup
);

/// route:: /logout => POST
router.post(Routes.logout, authController.postLogout);

/// route:: /reset => GET
router.get(Routes.resetPassword, authController.getResetPassword);

/// route:: /reset => POST
router.post(Routes.resetPassword, authController.postReset);

/// route:: /new-password/:token => GET
router.get(Routes.newPassword + "/:token", authController.getNewPassword);

/// route:: /new-password => POST
router.post(Routes.newPassword, authController.postNewPassword);

module.exports = router;
