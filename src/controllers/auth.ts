import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validationResult } from "express-validator";
import { Response, NextFunction } from "express";

import { UserModel } from "../models/user";
import Routes from "../constants/routes";
import HttpException from "../models/http-exception";
import { CustomRequestObject } from "../models/custom-request-object";

export const getLogin = (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  let errorMsg: string | null;
  if (req.flash("error").length > 0) {
    errorMsg = req.flash("error")[0];
  } else {
    errorMsg = null;
  }
  res.render("auth/login", {
    path: Routes.login,
    pageTitle: "Login",
    errorMessage: errorMsg,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

export const getSignup = (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  let errorMsg: string | null;
  if (req.flash("error").length > 0) {
    errorMsg = req.flash("error")[0];
  } else {
    errorMsg = null;
  }
  res.render("auth/signup", {
    path: Routes.signup,
    pageTitle: "Sign Up",
    errorMessage: errorMsg,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

export const postLogin = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array()[0]);
    return res.status(422).render("auth/login", {
      path: Routes.login,
      pageTitle: "Log In",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }
  try {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(422).render("auth/login", {
        path: Routes.login,
        pageTitle: "Log In",
        errorMessage: "Invalid email or password",
        oldInput: {
          email: email,
          password: password,
        },
        validationErrors: [],
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (isPasswordMatch) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      return req.session.save((err) => {
        if (err) console.log(err);
        res.redirect(Routes.index);
      });
    }
    return res.status(422).render("auth/login", {
      path: Routes.login,
      pageTitle: "Log In",
      errorMessage: "Invalid email or password",
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: [],
    });
  } catch (e) {
    let error = e as HttpException;
    console.log(error);
    error.statusCode = 500;
    return next(error);
  }
};

export const postSignup = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array()[0]);
    return res.status(422).render("auth/signup", {
      path: Routes.signup,
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 7);
    const user = new UserModel({
      email: email,
      password: hashedPassword,
      cart: { items: [] },
    });
    await user.save();
    res.redirect(Routes.login);
  } catch (err) {
    console.log(err);
    const error = err as HttpException;
    error.statusCode = 500;
    return next(error);
  }
};

export const postLogout = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect(Routes.index);
  });
};

export const getResetPassword = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  let errorMsg: string | null;
  if (req.flash("error").length > 0) {
    errorMsg = req.flash("error")[0];
  } else {
    errorMsg = null;
  }
  res.render("auth/reset", {
    path: Routes.resetPassword,
    pageTitle: "Reset Password",
    errorMessage: errorMsg,
  });
};

export const postReset = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect(Routes.resetPassword);
    }

    const token = buffer.toString("hex");
    try {
      const user = await UserModel.findOne({ email: req.body.email });
      if (!user) {
        req.flash("error", "No account with that email found.");
        return res.redirect(Routes.resetPassword);
      }
      user.resetToken = token;
      let tokenExpiration = new Date();
      tokenExpiration.setMilliseconds(
        tokenExpiration.getMilliseconds() + 3600000
      ); /// expires in 60 minutes
      user.resetTokenExpiration = tokenExpiration;
      // (new Date()) + (new Date(3600000));
      await user.save();

      // just log token for now, later you set up mailing service
      console.log(
        `Reset Password Token:::::: http://localhost:3000/new-password/${token}`
      );
      res.redirect(Routes.login);
    } catch (err) {
      console.log(err);
      const error = err as HttpException;
      error.statusCode = 500;
      return next(error);
    }
  });
};

export const getNewPassword = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const token = req.params.token;
  try {
    const user = await UserModel.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Token not valid.");
      return res.redirect(Routes.resetPassword);
    }

    let message: string | null;

    if (req.flash("error").length > 0) {
      message = req.flash("error")[0];
    } else {
      message = null;
    }

    res.render("auth/new-password", {
      path: Routes.resetPassword,
      pageTitle: "New Password",
      errorMessage: message,
      userId: user!._id.toString(),
      passwordToken: token,
    });
  } catch (err) {
    console.log(err);
    const error = err as HttpException;
    error.statusCode = 500;
    return next(error);
  }
};

export const postNewPassword = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  try {
    const resetUser = await UserModel.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });

    if (!resetUser) {
      req.flash("error", "Invalid Token.");
      return res.redirect(Routes.resetPassword);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    resetUser.save();
    res.redirect(Routes.login);
  } catch (err) {
    console.log(err);
    const error = err as HttpException;
    error.statusCode = 500;
    return next(error);
  }
};
