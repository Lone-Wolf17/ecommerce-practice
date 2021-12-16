const path = require("path");
const express = require("express");
const app = express();

const adminRouter = require("./routes/admin.js");
const shopRouter = require("./routes/shop");

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/admin", adminRouter);
app.use("/", shopRouter);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "views", "error-404.html"));
});

app.listen(3000);
