import express from "express";
import ProductsModel from "./model.js";
import CartsModel from "./cartModel.js";

import q2m from "query-to-mongo";
import httpErrors from "http-errors";
import { checkProductsSchema, triggerBadRequest } from "./validator.js";
import { getProducts, writeProducts } from "../../lib/fs-tools.js";

const { NotFound, Unauthorized, BadRequest } = httpErrors;

const productsRouter = express.Router();

productsRouter.post(
  "/",
  checkProductsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newProduct = new ProductsModel(req.body);
      const { _id } = await newProduct.save();

      res.status(201).send(_id);
    } catch (error) {
      next(error);
    }
  }
);

productsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await ProductsModel.countDocuments(mongoQuery.criteria);
    const products = await ProductsModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort)
      .populate({
        path: "reviews",
      });

    res.send({
      products
    });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.productId).populate(
      {
        path: "reviews",
      }
    );
    if (product) {
      res.send(product);
    } else {
      next(NotFound(`Product with id ${req.params.productId} is not found`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const updatedProduct = ProductsModel.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedProduct) {
      res.send(updatedProduct);
    } else {
      next(NotFound(`Product with id ${req.params.productId} is not found`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const deletedProduct = await ProductsModel.findByIdAndDelete(
      req.params.productId
    );
    if (deletedProduct) {
      res.status(204).send();
    } else {
      next(NotFound(`Product with id ${req.params.productId} is not found`));
    }
  } catch (error) {
    next(error);
  }
});

// productsRouter.post("/:productId/cart", async (req, res, next) => {
//   try {
//     const purchasedProduct = await ProductsModel.findById(req.params.productId);
//     if (!purchasedProduct)
//       return next(createHttpError(404, `Book with id ${bookId} not found!`));

//     const isProductThere = await CartsModel.findOne({
//       product: req.params.productId,
//     });

//     if (isProductThere) {
//       const updatedCart = await CartsModel.findOneAndUpdate(
//         {
//           productId: req.params.productId,
//           status: "Active",
//           "products.productId": productId,
//         },
//         { $inc: { "products.$.quantity": req.body.quantity } },
//         { new: true, runValidators: true }
//       );
//       res.send(updatedCart);
//     } else {
//       const modifiedCart = await CartsModel.findOneAndUpdate(
//         { productId: req.params.productId },
//         {
//           $push: {
//             products: {
//               productId: req.params.productId,
//               quantity: req.body.quantity,
//             },
//           },
//         },
//         { new: true, runValidators: true, upsert: true }
//       );
//       res.send(modifiedCart);
//     }
//   } catch (error) {
//     next(error);
//   }
// });

export default productsRouter;
