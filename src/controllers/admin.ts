import { validationResult } from "express-validator";
import { Response, NextFunction } from "express";

import Routes from "../constants/routes";
import { ProductModel } from "../models/product";
import HttpException from "../models/http-exception";
import { CustomRequestObject } from "../models/custom-request-object";
import { deleteFile } from "../util/file";

const ITEMS_PER_PAGE: number = 2;

export const getAddProduct = (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: Routes.addProduct,
    editing: false,
    hasError: true,
    product: {
      _id: "",
      title: "",
      price: "",
      description: "",
    },
    errorMessage: null,
    validationErrors: [],
  });
};

export const postAddProduct = (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  console.log("Point 1:::::");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: Routes.editProduct,
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  console.log("Point 2:::::");

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: Routes.editProduct,
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not an image",
      validationErrors: [],
    });
  }

  console.log("Point 3:::::");

  const imageUrl = image.path;

  const product = new ProductModel({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      // console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getEditProduct = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  try {
    const product = await ProductModel.findById(prodId);
    if (!product) {
      return res.redirect("/");
    }

    if (product.user!.toString() !== req.user!._id.toString()) {
      return res.redirect("/");
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: Routes.editProduct,
      editing: editMode,
      product: product,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (err) {
    console.log(err);
    const error = err as HttpException;
    error.statusCode = 500;
    return next(error);
  }
};

export const postEditProduct = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImage = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: Routes.editProduct,
      editing: true,
      hasError: true,
      product: {
        _id: prodId,
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  try {
    const product = await ProductModel.findById(prodId);

    if (!product) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: Routes.editProduct,
        editing: true,
        hasError: true,
        product: {
          _id: prodId,
          title: updatedTitle,
          price: updatedPrice,
          description: updatedDesc,
        },
        errorMessage: "Product Not Found",
        validationErrors: errors.array(),
      });
    }

    if (product.user!.toString() !== req.user!._id.toString()) {
      return res.redirect("/");
    }

    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    if (updatedImage) {
      deleteFile(product.imageUrl);
      product.imageUrl = updatedImage.path;
    }
    await product.save();

    console.log("UPDATED PRODUCT!");
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    const error = err as HttpException;
    error.statusCode = 500;
    return next(error);
  }
};

export const getProducts = (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const page = +(req.query.page || 1);
  let totalItems: number;

  ProductModel.find({ userId: req.user!._id })
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return ProductModel.find({ userId: req.user!._id })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
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
      const error = err as HttpException;
      error.statusCode = 500;
      return next(error);
    });
};

export const deleteProduct = async (
  req: CustomRequestObject,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.params.productId;

  try {
    // delete product image then delete image
    const product = await ProductModel.findById(prodId);
    if (!product) {
      return next(new Error("Product not found"));
    }
    deleteFile(product.imageUrl);
    await ProductModel.deleteOne({
      _id: prodId,
      userId: req.user!._id,
    });
    console.log("DESTROYED PRODUCT");
    res.status(200).json({ message: "Success!!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Deleting product failed." });
  }
};
