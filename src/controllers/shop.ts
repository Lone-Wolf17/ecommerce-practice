import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import Stripe from "stripe";
import { Response, NextFunction } from "express";

import { ProductModel } from "../models/product";
import HttpException from "../models/http-exception";
import { CustomRequestObject } from "../models/custom-request-object";
import { UserModel } from "../models/user";
import { isDocument, isDocumentArray } from "@typegoose/typegoose";
import { OrderModel } from "../models/order";
import { ProductOrder } from "../models/product-order";
import Routes from "../constants/routes";

const ITEMS_PER_PAGE: number = 2;

export const getProducts = (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const page = +(req.query.page || 1);
  let totalItems: number;

  ProductModel.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return ProductModel.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getProduct = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.params.productId;
  try {
    const product = await ProductModel.findById(prodId);

    res.render("shop/product-details", {
      product: product,
      pageTitle: product?.title || "No Product Found",
      path: "/products",
    });
  } catch (err) {
    console.log(err);
  }
};

export const getIndex = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const page = +(req.query.page || 1);
  let totalItems: number;

  ProductModel.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return ProductModel.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getCart = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  // req.user!
  //   .populate("cart.items.productId")
  //   // .execPopulate()
  //   .then((user) => {
  try {
    const user = await UserModel.findById(req.user!._id).populate({
      path: "cart.items.product",
      model: "Product",
    });
    const products: any[] = user!.cart.items.map(
      (item) => item as ProductOrder
    );

    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products,
    });
  } catch (err) {
    console.log(err);
    const error = err as HttpException;
    error.statusCode = 500;
    return next(error);
  }
};

export const postCart = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.body.productId;
  try {
    const product = await ProductModel.findById(prodId);
    if (!product) {
      throw new HttpException(404, "Product not Found!!");
    }
    const user = await UserModel.findById(req.user!._id);

    await user!.addToCart(product);

    res.redirect("/cart");
  } catch (e) {
    const error = e as HttpException;
    error.statusCode = 500;
    throw error;
  }
};

export const postCartDeleteProduct = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.body.productId;
  const user = await UserModel.findById(req.user!._id);
  user!
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

export const getCheckout = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const user = await UserModel.findById(req.user!._id).populate({
    path: "cart.items.product",
    model: "Product",
  });
  const cartItems = user!.cart.items;
  let totalValue = 0;
  let stripeLineItems: any[] = [];

  const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
    apiVersion: "2020-08-27",
    typescript: true,
  });

  const product = await stripe.products.create({ name: "T-shirt" });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 2000,
    currency: "usd",
  });

  cartItems.forEach((cartItem) => {
    if (isDocument(cartItem.product)) {
      const product = cartItem.product;
      totalValue += cartItem.quantity * product.price;
      stripeLineItems.push({
        // title: product!.title,
        description: product!.description,
        price: price.id,
        quantity: cartItem.quantity,
      });
    }
  });

  // console.log(process.env.STRIPE_SECRET_KEY, "Stripe Key");
  // console.log(stripe);
  // console.log(stripeLineItems);
  stripe.checkout.sessions
    .create({
      payment_method_types: ["card"],
      line_items: stripeLineItems,
      success_url: req.protocol + "://" + req.get("host") + "/checkout/success",
      cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      mode: "payment",
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: cartItems,
        totalSum: totalValue,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = err as HttpException;
      error.statusCode = 500;
      return next(error);
    });
};

export const getCheckoutCancel = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  res.redirect(Routes.cart);
};

export const getCheckoutSuccess = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findById(req.user!._id).populate({
      path: "cart.items.product",
      model: "Product",
    });

    // Since cart.items.product has been populated,
    // the CartItems is now the same as the ProductOrder
    const products = user!.cart.items;

    const order = new OrderModel({
      userEmail: req.user!.email,
      userId: req.user!._id,
      products: products,
    });
    await order.save();

    await user!.clearCart();
    res.redirect("/orders");
  } catch (err) {
    console.log(err);
  }
};

export const postOrder = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findById(req.user!._id).populate({
      path: "cart.items.product",
      model: "Product",
    });

    // Since cart.items.product has been populated,
    // the CartItems is now the same as the ProductOrder
    const products = user!.cart.items;

    const order = await OrderModel.create({
      userEmail: req.user!.email,
      userId: req.user!._id,
      products: products,
    });
    await order.save();
    await user!.clearCart();

    res.redirect("/orders");
  } catch (err) {
    console.log(err);
  }
};

export const getOrders = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  OrderModel.find({ userId: req.user!._id })
    .then((orders) => {
      console.log(orders);
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};

export const getInvoice = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.orderId;

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return next(new Error("No order found"));
    }

    if (order.userId!.toString() !== req.user!._id.toString()) {
      return next(new HttpException(403, "Unauthorized access"));
    }

    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);

    /// Preloading Data [Not recommeded]
    // fs.readFile(invoicePath, (err, invoice) => {
    //   if (err) return next(err);

    //   res.setHeader("Content-Type", "application/pdf");
    //   res.setHeader(
    //     "Content-Disposition",
    //     'inline; filename="' + invoiceName + '"'
    //   );
    //   res.send(invoice);
    // });

    /// Streaming the Data [Recommeded]
    // const file = fs.createReadStream(invoicePath);
    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader(
    //   "Content-Disposition",
    //   'inline; filename="' + invoiceName + '"'
    // );
    // file.pipe(res);

    /// Generate PDF on the fly
    const pdfDoc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + invoiceName + '"'
    );
    // save file to filesystem
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    // PDF content
    pdfDoc.fontSize(24).text("Invoice", {
      underline: true,
    });
    pdfDoc.text("-----------------------");
    let totalPrice = 0;
    order.products.forEach((prod) => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc
        .fontSize(16)
        .text(
          prod.product.title +
            " -- " +
            prod.quantity +
            " x " +
            "$" +
            prod.product.price
        );
    });
    pdfDoc.fontSize(24).text("-----------------------");
    pdfDoc.fontSize(20).text("Total Price:: $" + totalPrice);

    pdfDoc.end();
  } catch (err) {
    next(err);
  }
};
