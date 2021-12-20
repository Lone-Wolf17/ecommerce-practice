const path = require("path");
const express = require("express");
const app = express();
const morgan = require("morgan");

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

app.listen(3000);
