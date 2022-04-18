import fs from "fs";
import path from "path";
import express, { NextFunction, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import session from "express-session";
import csrf from "csurf";
import flashMessages from "connect-flash";
import multer from "multer";
import connectMongoDBSession from "connect-mongodb-session";

import * as ErrorController from "./controllers/errors";
import Routes from "./constants/routes";
import { mongoConnect } from "./util/database";
import { UserModel } from "./models/user";
import adminRoutes from "./routes/admin.js";
import shopRoutes from "./routes/shop";
import authRoutes from "./routes/auth";
import { CustomRequestObject } from "./models/custom-request-object";
import HttpException from "./models/http-exception";

dotenv.config({ path: "./config.env" }); // Load Config

const app = express();

const MongoDBSessionStore = connectMongoDBSession(session);

// using ejs templating engine
app.set("view engine", "ejs");
const sessionStore = new MongoDBSessionStore({
  uri: process.env.MONGO_URI!,
  collection: "sessions",
});

const csrfProtection = csrf();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// set up logger
/// Display logs in terminal if in dev mode else write to file
if ((process.env.NODE_ENV = "dev")) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("dev", { stream: accessLogStream }));
}

// set up secure respose headers
app.use(helmet());
// set up asset compression
app.use(compression());

// setup serving static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

/// set up multer storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

/// setup multer file filter
const fileFilter = (req: CustomRequestObject, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(
  session({
    secret: "fuck boy",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

app.use(csrfProtection);
app.use(flashMessages());

// Tell Express to pass these varaibles to all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req: CustomRequestObject, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    return next();
  }

  UserModel.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

/// Error handling
app.get(Routes.error500, ErrorController.get500);
app.use(ErrorController.get404);
app.use((error: HttpException, req: CustomRequestObject, res: Response, next: NextFunction) => {
  console.log(error);
  res.redirect(Routes.error500);
});

mongoConnect(() => {
  app.listen(3000);
});
