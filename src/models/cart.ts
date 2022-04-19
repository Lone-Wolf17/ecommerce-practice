import {
  prop as Property,
  Ref,
  modelOptions,
  getModelForClass,
} from "@typegoose/typegoose";
import { Product } from "./product";

/// The difference between [CartItem] and [ProductOrder] is that
// ProductOrder is a snapshot of the product at the point of sale
/// while CartItem is a ref to the product.
@modelOptions({ schemaOptions: { _id: false } }) /// hence if the price of the Product Changes, it reflects in the CartItem but not in ProductOrder
class CartItem {
  @Property({ required: true })
  public product!: Ref<Product>;

  @Property({ required: true })
  public quantity!: number;
}

export class Cart {
  @Property({ required: true, type: () => CartItem })
  public items!: CartItem[];
}

export const CartItemModel = getModelForClass(CartItem);
export const CartModel = getModelForClass(Cart);
