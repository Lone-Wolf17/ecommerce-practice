import { prop as Property, Ref } from "@typegoose/typegoose";
import { Product } from "./product";

export class Cart {
    @Property({required: true, ref: ()=> CartItem})
    public items!: CartItem[];
}


/// The difference between [CartItem] and [ProductOrder] is that 
// ProductOrder is a snapshot of the product at the point of sale
/// while CartItem is a ref to the product. 
/// hence if the price of the Product Changes, it reflects in the CartItem but not in ProductOrder
class CartItem {
    @Property({required: true})
    public product!: Ref<Product>

    @Property({required: true})
    public quantity!: number;
}
