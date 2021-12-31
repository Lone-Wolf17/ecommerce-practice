const bcrypt = require("bcryptjs");

const User = require("../models/user");
const Routes = require("../constants/routes");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: Routes.login,
    pageTitle: "Login",
    isAuthenticated: req.isLoggedIn,
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: Routes.signup,
    pageTitle: "Sign Up",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) return res.redirect(Routes.login);
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              if (err) console.log(err);
              res.redirect(Routes.index);
            });
          }
          res.redirect(Routes.login);
        })
        .catch((err) => {
          console.log(err);
          res.redirect(Routes.login);
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) return res.redirect(Routes.signup);
      return bcrypt
        .hash(password, 7)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          res.redirect(Routes.login);
        });
    })
    .catch((err) => {
      if (err) console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect(Routes.index);
  });
};
