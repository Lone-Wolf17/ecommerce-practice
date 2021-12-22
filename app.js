const path = require("path");
const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" }); // Load Config

// using ejs templating engine
app.set("view engine", "ejs");

const adminRoutes = require("./routes/admin.js");
const shopRouter = require("./routes/shop");

// set up logger
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));



app.use("/admin", adminRoutes);
app.use("/", shopRouter);

const errorController = require("./controllers/errors");
app.use(errorController.get404);

mongoConnect(() => {
  app.listen(3000);
  app.use((req, res, next) => {
    User.findById("61c2dc8bc179ed796a2ef5aa")
      .then((user) => {
        req.user = new User(user.name, user.email, user.cart, user._id);
        next();
      })
      .catch((err) => console.log(err));
  });
});
