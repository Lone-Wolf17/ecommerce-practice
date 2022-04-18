import { Request } from "express";
// import { Session } from "express-session";
// import './custom-session-interface';
import { User } from "./user";

export interface CustomRequestObject extends Request {
    // flash: Function;
    user?: User;
}