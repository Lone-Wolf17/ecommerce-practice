import { prop as Property, getModelForClass, Ref } from "@typegoose/typegoose";
import {Schema} from 'mongoose';

import { User } from "./user";

export class Product {
  @Property({ required: true })
  public title!: string;

  @Property({ required: true })
  public price!: number;

  @Property({ required: true })
  public description!: string;

  @Property({ required: true })
  public imageUrl!: string;

  @Property({ required: true })
  public user!: Ref<User>;

  _id!: Schema.Types.ObjectId
}

export const ProductModel = getModelForClass(Product);