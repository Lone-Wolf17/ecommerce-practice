const path = require("path");
const express = require("express");
const app = express();

// using pug templating engine
// app.set("view engine", "pug");

// Using handlebars templating engine
// const expressHbs = require("express-handlebars");
// app.engine(
//   "hbs",
//   expressHbs.engine({
//     layoutsDir: "views/layouts/",
//     defaultLayout: "main-layout",
//     extname: "hbs",
//   })
// );
// app.set("view engine", "hbs");

// using ejs templating engine
app.set("view engine", "ejs");

const adminData = require("./routes/admin.js");
const shopRouter = require("./routes/shop");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminData.routes);
app.use("/", shopRouter);

app.use((req, res, next) => {
  res.status(404).render("error-404", { pageTitle: "Page Not Found" });
});

app.listen(3000);
