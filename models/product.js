const fs = require("fs");
const path = require("path");
const { createBrotliCompress } = require("zlib");
const rootDir = require("../util/path");

const p = path.join(rootDir, "data", "products.json");

const getProductsFromFile = (callback) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      console.log(err);
      callback([]);
    } else {
      callback(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    getProductsFromFile((products) => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => {
        if (err) console.log("Error::: " + err);
      });
    });
  }

  static fetchAll(callback) {
    getProductsFromFile(callback);
  }
};
