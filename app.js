const path = require("path");
const express = require("express");
const morgan = require("morgan");
const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");
const dotenv = require("dotenv");
const session = require("express-session");
const csrf = require("csurf");
const flashMessages = require("connect-flash");
const errorController = require("./controllers/errors");
const Routes = require("./constants/routes");
const MongoDBSessionStore = require("connect-mongodb-session")(session);

dotenv.config({ path: "./config.env" }); // Load Config

const app = express();

// using ejs templating engine
app.set("view engine", "ejs");
const sessionStore = new MongoDBSessionStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

const adminRoutes = require("./routes/admin.js");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// set up logger
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
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
  // res.redirect(Routes.error500);
  res.status(500).render("error-500", {
    pageTitle: "Error!!!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoConnect(() => {
  app.listen(3000);
});
