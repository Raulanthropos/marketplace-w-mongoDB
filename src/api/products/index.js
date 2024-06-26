import express from "express";
import ProductsModel from "./model.js";
import httpErrors from "http-errors";
import q2m from "query-to-mongo";
import { checkProductsSchema, triggerBadRequest } from "./validator.js";

const { NotFound } = httpErrors;

const productsRouter = express.Router();

// Create a new product
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
    const products = await ProductsModel.find(mongoQuery.criteria)
      .sort({ price: mongoQuery.options.sort === "desc" ? -1 : 1 })
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .populate({
        path: "reviews",
      });

    res.send({ products });
  } catch (error) {
    next(error);
  }
});

// Get a single product by ID
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

// Update a product by ID
productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const updatedProduct = await ProductsModel.findByIdAndUpdate(
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

// Delete a product by ID
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

// Get products with sorting and filtering
productsRouter.get("/filtered", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const filter = mongoQuery.criteria;
    const sort = mongoQuery.options.sort;

    const products = await ProductsModel.find(filter).sort(sort).populate({
      path: "reviews",
    });

    res.send(products);
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
