const fs = require('fs');
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require('compression');
const dotenv = require("dotenv");
const session = require("express-session");
const csrf = require("csurf");
const flashMessages = require("connect-flash");
const multer = require("multer");
const MongoDBSessionStore = require("connect-mongodb-session")(session);

const errorController = require("./controllers/errors");
const Routes = require("./constants/routes");
const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");
const adminRoutes = require("./routes/admin.js");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

dotenv.config({ path: "./config.env" }); // Load Config

const app = express();

// using ejs templating engine
app.set("view engine", "ejs");
const sessionStore = new MongoDBSessionStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'), {flags: 'a'}
);

// set up logger
app.use(morgan("dev", {stream: accessLogStream}));
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
const fileFilter = (req, file, cb) => {
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

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
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
app.get(Routes.error500, errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  console.log(error);
  res.redirect(Routes.error500);
  // console.log("Session:::" + req.session);
  // res.status(500).render("error-500", {
  //   pageTitle: "Error!!!",
  //   path: Routes.error500,
  //   isAuthenticated: req.session.isLoggedIn,
  // });
});

mongoConnect(() => {
  app.listen(3000);
});
