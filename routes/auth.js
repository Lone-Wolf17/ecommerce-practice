const express = require('express');
const authController = require('../controllers/auth');
const Routes = require('../constants/routes');

const router = express.Router();

/// route:: /login => GET
router.get(Routes.login, authController.getLogin);

/// route:: /signup => GET
router.get(Routes.signup, authController.getSignup);

/// route:: /login => POST
router.post(Routes.login, authController.postLogin);

/// route:: /signup => POST
router.post(Routes.signup, authController.postSignup);

/// route:: /logout => POST
router.post(Routes.logout, authController.postLogout);


module.exports = router;