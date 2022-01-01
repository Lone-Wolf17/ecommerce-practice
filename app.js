const path = require("path");
const express = require("express");
const morgan = require("morgan");
const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");
const dotenv = require("dotenv");
const session = require("express-session");
const csrf = require('csurf');
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

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// Tell Express to pass these varaibles to all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next(); 
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

const errorController = require("./controllers/errors");
app.use(errorController.get404);

mongoConnect(() => {
  app.listen(3000);
});
