const path = require("path");
const express = require("express");
const app = express();

const adminData = require("./routes/admin.js");
const shopRouter = require("./routes/shop");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminData.routes);
app.use("/", shopRouter);

app.use((req, res, next) => {
  res.status(404).render("error-404.pug", { pageTitle: "Page Not Found" });
});

app.listen(3000);
