import express from "express";
import uniqid from "uniqid";
import httpErrors from "http-errors";
import { checkReviewSchema, triggerBadRequest } from "./validator.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import ReviewsModel from "./model.js";
import ProductsModel from "../products/model.js";
import q2m from "query-to-mongo";
import createHttpError from "http-errors";
import UsersModel from "../users/model.js"; // Make sure the path is correct

const { NotFound, Unauthorized, BadRequest } = httpErrors;

const reviewsRouter = express.Router();

// Import the usersModel at the top of your src/api/reviews/index.js file

reviewsRouter.post(
  "/:productId/reviews",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const selectedProduct = await ProductsModel.findById(
        req.params.productId
      );
      if (selectedProduct) {
        // Include the user's ID in the review
        const reviewToSave = new ReviewsModel({
          ...req.body,
          userId: req.user._id, // Assuming req.user contains the authenticated user's info
        });
        const savedReview = await reviewToSave.save(); // Push the savedReview's ID to the product's reviews array

        const updatedProduct = await ProductsModel.findByIdAndUpdate(
          req.params.productId,
          { $push: { reviews: savedReview._id } },
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

reviewsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.productId).populate(
      {
        path: "reviews",
        populate: {
          path: "userId", // Assuming userId is referencing the User model
          select: "name", // Select only the 'name' field from the User model
        },
      }
    );

    if (product) {
      // If product found, return populated reviews
      res.send(product.reviews);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} is not found`
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
