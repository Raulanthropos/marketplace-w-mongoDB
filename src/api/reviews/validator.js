import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const reviewSchema = {
  comment: {
    in: ["body"],
    isString: {
      errorMessage: "Comment is mandatory field and needs to be a string!",
    },
  },

  rate: {
    in: ["body"],
    isInt: {
      options: { min: 1, max: 5 },
      errorMessage:
        "Rate is mandatory field and needs to be a number and between 1 and 5!",
    },
  },
};

export const checkReviewSchema = checkSchema(reviewSchema);
export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    next(
      createHttpError(400, "Errors during product validation", {
        errorsList: errors.array(),
      })
    );
  } else {
    next();
  }
};
