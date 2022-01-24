const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/user");
const Routes = require("../constants/routes");

exports.getLogin = (req, res, next) => {
  let errorMsg = req.flash("error");
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0];
  } else {
    errorMsg = null;
  }
  res.render("auth/login", {
    path: Routes.login,
    pageTitle: "Login",
    errorMessage: errorMsg,
  });
};

exports.getSignup = (req, res, next) => {
  let errorMsg = req.flash("error");
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0];
  } else {
    errorMsg = null;
  }
  res.render("auth/signup", {
    path: Routes.signup,
    pageTitle: "Sign Up",
    errorMessage: errorMsg,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect(Routes.login);
      }
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
      if (userDoc) {
        req.flash("error", "Email already exists");
        return res.redirect(Routes.signup);
      }

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

exports.getResetPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: Routes.resetPassword,
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect(Routes.resetPassword);
    }

    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found.");
          return res.redirect(Routes.resetPassword);
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        // transporter.sendMail({
        //   to: req.body.email,
        //   from: 'shop@wolfnode.com',
        //   subject: 'Password reset',
        //   html: `
        //   <p>You requested a password reset</p>
        //   <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
        //   `
        // });

        // just log token for now, later you set up mailing service
        console.log(
          `Reset Password Token:::::: http://localhost:3000/new-password/${token}`
        );
        res.redirect(Routes.login);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render("auth/new-password", {
        path: Routes.resetPassword,
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetToken = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect(Routes.login);
    })
    .catch((err) => {
      console.log(err);
    });
};
