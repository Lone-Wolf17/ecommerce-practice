import { Request, Response, NextFunction } from "express";

export const get404 = (req: Request, res : Response, next : NextFunction) => {
  res
    .status(404)
    .render("error-404", {
      pageTitle: "Page Not Found",
      path: "/404",
      isAuthenticated: req.session.isLoggedIn
    });
};


export const get500 = (req : Request, res : Response, next : NextFunction) => {
  res
    .status(500)
    .render("error-500", {
      pageTitle: "Error!!!",
      path: "/500",
      isAuthenticated: req.session.isLoggedIn
    });
};