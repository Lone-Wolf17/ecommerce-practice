import { prop as Property, Ref} from "@typegoose/typegoose";
import { Product } from "./product";

export class ProductOrder {
    @Property({required: true})
    public product!: Product

    @Property({required: true})
    public quantity!: number;
}