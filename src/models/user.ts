import {
  prop as Property,
  getModelForClass,
  DocumentType,
  isDocument,
} from "@typegoose/typegoose";
import { Schema } from "mongoose";

import { Cart } from "./cart";
import { Product } from "./product";

export class User {
  _id!: Schema.Types.ObjectId;

  @Property()
  public name!: string;

  @Property({ required: true })
  public email!: string;

  @Property({ required: true })
  public password!: string;

  @Property({ required: false })
  public resetToken?: string;

  @Property({ required: false })
  public resetTokenExpiration?: Date;

  @Property()
  public cart!: Cart;

  public async addToCart(this: DocumentType<User>, product: Product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.product!.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        product: product,
        quantity: newQuantity,
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };
    this.cart = updatedCart;
    return this.save();
  }

  public async removeFromCart(this: DocumentType<User>, productId: number) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.product!.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
  }

  public async clearCart(this: DocumentType<User>) {
    this.cart = { items: [] };
    return this.save();
  }

  public async getCartTotalValue(this: DocumentType<User>): Promise<number> {
    const user = await this.populate("cart.items.product");
    const products = user!.cart.items;
    let total = 0;

    products.forEach((p) => {
      if (isDocument(p.product)) {
        total += p.quantity * p.product!.price;
      }
    });
    return total;
  }
}

export const UserModel = getModelForClass(User);

// userSchema.methods.addToCart = function (product) {
//   const cartProductIndex = this.cart.items.findIndex((cp) => {
//     return cp.productId.toString() === product._id.toString();
//   });
//   let newQuantity = 1;
//   const updatedCartItems = [...this.cart.items];

//   if (cartProductIndex >= 0) {
//     newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//     updatedCartItems[cartProductIndex].quantity = newQuantity;
//   } else {
//     updatedCartItems.push({
//       productId: product._id,
//       quantity: newQuantity,
//     });
//   }
//   const updatedCart = {
//     items: updatedCartItems,
//   };
//   this.cart = updatedCart;
//   return this.save();
// };

// userSchema.methods.removeFromCart = function (productId) {
//   const updatedCartItems = this.cart.items.filter((item) => {
//     return item.productId.toString() !== productId.toString();
//   });
//   this.cart.items = updatedCartItems;
//   return this.save();
// };

// userSchema.methods.clearCart = function () {
//   this.cart = { items: [] };
//   return this.save();
// };

// module.exports = mongoose.model("User", userSchema);
