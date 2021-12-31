const Routes = require("../constants/routes");

module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect(Routes.login);
    }
    next();
}