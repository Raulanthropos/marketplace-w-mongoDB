import express from "express";
import uniqid from "uniqid";
import httpErrors from "http-errors";
import { checkReviewSchema, triggerBadRequest } from "./validator.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import ReviewsModel from "./model.js";
import ProductsModel from "../products/model.js";
import q2m from "query-to-mongo";
import createHttpError from "http-errors";

const { NotFound, Unauthorized, BadRequest } = httpErrors;

const reviewsRouter = express.Router();

reviewsRouter.post(
  "/:productId/reviews",
  JWTAuthMiddleware,
  async (req, res, next) => {
    let reviewId = "";
    try {
      const selectedProduct = await ProductsModel.findById(
        req.params.productId
      );
      try {
        const reviewToSave = new ReviewsModel(req.body);
        reviewId = await reviewToSave.save();
      } catch (error) {
        next(error);
      }
      if (selectedProduct) {
        const reviewToInsert = {
          ...selectedProduct.toObject(),
          reviewDate: new Date(),
        };
        console.log(reviewToInsert);
        const updatedProduct = await ProductsModel.findByIdAndUpdate(
          req.params.productId,
          { $push: { reviews: reviewId } },
          { new: true, runValidators: true }
        );

        res.send(updatedProduct);
      } else {
        next(
          createHttpError(
            404,
            `Product with id ${req.params.productId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// reviewsRouter.post(
//   "/:productId/reviews",
//   JWTAuthMiddleware,
//   async (req, res, next) => {
//     try {
//       const review = new ReviewsModel({
//         ...req.body,
//         userId: req.user._id,
//         productId: req.params.productId,
//       });
//       await review.save();
//       res.status(201).send(review);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

reviewsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const review = await ProductsModel.findById(req.params.productId).populate({
      path: "reviews",
    });
    if (review) {
      res.send(review.reviews);
    } else {
      next(
        createHttpError(
          404,
          `review with id ${req.params.productId} is not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.productId).populate(
      {
        path: "reviews",
      }
    );
    if (product) {
      const review = product.reviews.find(
        (rew) => rew._id.toString() === req.params.reviewId
      );
      if (review) {
        res.send(review);
      } else {
        createHttpError(
          404,
          `review with id ${req.params.reviewId} is not found`
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `review with id ${req.params.productId} is not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.productId);
    if (product) {
      const index = product.reviews.findIndex(
        (rew) => rew._id.toString() === req.params.reviewId
      );
      if (index !== -1) {
        const reviewToChange = await ReviewsModel.findByIdAndUpdate(
          product.reviews[index],
          req.body,
          { new: true, runValidators: true }
        );
        res.send(reviewToChange);
      } else {
        createHttpError(
          404,
          `review with id ${req.params.reviewId} is not found`
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `product with id ${req.params.productId} is not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const updatedProduct = await ProductsModel.findByIdAndUpdate(
        req.params.productId,
        { $pull: { reviews: req.params.reviewId } },
        { new: true }
      );
      if (updatedProduct) {
        res.send(updatedProduct);
      } else {
        next(
          createHttpError(
            404,
            `review with id ${req.params.productId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default reviewsRouter;
