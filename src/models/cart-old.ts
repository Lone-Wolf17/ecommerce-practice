// import fs from 'fs';
// import path from 'path';

// import rootDir from '../util/path';


// const jsonFilePath = path.join(rootDir, "data", "cart.json");

// export class Cart {
//   static addProduct(id : string, productPrice : number) {
//     // Fetch the previous cart
//     fs.readFile(jsonFilePath, (err, fileContent: Buffer) => {
//       let cart = { products: [], totalPrice: 0 };
//       if (!err) {
//         cart = JSON.parse(fileContent);
//       }
//       // Analyze the cart => Find the Existing product
//       const existingProductIndex = cart.products.findIndex(
//         (prod) => prod.id === id
//       );
//       const existingProduct = cart.products[existingProductIndex];
//       let updatedProduct;
//       // Add new product / increase quantity
//       if (existingProduct) {
//         updatedProduct = { ...existingProduct };
//         updatedProduct.qty = updatedProduct.qty + 1;
//         cart.products = [...cart.products];
//         cart.products[existingProductIndex] = updatedProduct;
//       } else {
//         updatedProduct = { id: id, qty: 1 };
//         cart.products = [...cart.products, updatedProduct];
//       }
//       cart.totalPrice = cart.totalPrice + +productPrice;
//       fs.writeFile(jsonFilePath, JSON.stringify(cart), (err) => {
//         if (err) console.log(err);
//       });
//     });
//   }

//   static deleteProduct(id, productPrice) {
//     fs.readFile(jsonFilePath, (err, fileContent) => {
//       if (err) return;

//       const updatedCart = { ...JSON.parse(fileContent) };
//       const product = updatedCart.product.find((prod) => prod.id === id);

//       if (!product) return;

//       const productQty = product.qty;
//       // delete product from cart by filtering it out
//       updatedCart.products = updatedCart.products.filter(
//         (prod) => prod.id !== id
//       );
//       // reduce Cart's total price
//       updatedCart.totalPrice =
//         updatedCart.totalPrice - productPrice * productQty;

//       fs.writeFile(jsonFilePath, JSON.stringify(updatedCart), (err) => {
//         if (err) console.log(err);
//       });
//     });
//   }

//   static getCart(callback) {
//     fs.readFile(jsonFilePath, (err, fileContent) => {
//       const cart = JSON.parse(fileContent);
//       if (err) {
//         callback(null);
//       } else {
//         callback(cart);
//       }
//     });
//   }
// };
