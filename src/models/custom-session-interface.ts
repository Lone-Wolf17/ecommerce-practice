import { Session } from "express-session";
import { User } from "./user";

declare module "express-session" {
    interface Session {
        isLoggedIn? : boolean;
        user? : User;
    }
}