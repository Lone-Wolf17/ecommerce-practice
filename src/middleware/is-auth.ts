import Routes from "../constants/routes";
import { Request, Response, NextFunction } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isLoggedIn) {
    return res.redirect(Routes.login);
  }
  next();
};
