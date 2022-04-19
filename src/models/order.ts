import { prop as Property, getModelForClass, Ref } from "@typegoose/typegoose";
import { ProductOrder } from "./product-order";
import { User } from "./user";

export class Order {
  @Property({ required: true, type: () => ProductOrder })
  public products!: ProductOrder[];

  @Property({ required: true })
  public userEmail!: string;

  @Property({ required: true, ref: 'User' })
  public userId!: Ref<User>;
}

export const OrderModel = getModelForClass(Order);
