const fs = require("fs");
const path = require("path");
const Cart = require('./cart');
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
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    (this.description = description), (this.price = price);
  }

  save() {
    getProductsFromFile((products) => {
      if (this.id) {
        console.log("editing");
        const existingProductIndex = products.findIndex(
          (prod) => prod.id === this.id
        );
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          if (err) console.log("Error::: " + err);
        });
      } else {
        console.log("not editing");
        this.id = Math.random().toString;
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (err) => {
          if (err) console.log("Error::: " + err);
        });
      }
    });
  }

  static fetchAll(callback) {
    getProductsFromFile(callback);
  }

  static findById(id, callback) {
    getProductsFromFile((products) => {
      const product = products.find((p) => p.id === id);
      callback(product);
    });
  }

  static deleteById (id) {
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id === id);
      const updatedProducts = products.filter(prod => prod.id !== id );
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        if (!err) {
          Cart.deleteProduct(id, product.price);
        } else console.log(err);
      })
    })
  }
};
