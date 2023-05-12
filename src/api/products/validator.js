import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const productsSchema = {
  name: {
    in: ["body"],
    isString: {
      errorMessage: "Name is mandatory field and needs to be a string!",
    },
  },
  description: {
    in: ["body"],
    isString: {
      errorMessage: "Description is mandatory field and needs to be a string!",
    },
  },
  brand: {
    in: ["body"],
    isString: {
      errorMessage: "Brand is mandatory field and needs to be a string!",
    },
  },
  price: {
    in: ["body"],
    isInt: {
      errorMessage: "Price is mandatory field and needs to be a number!",
    },
  },
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Category is mandatory field and needs to be a string!",
    },
  },
};

export const checkProductsSchema = checkSchema(productsSchema);
export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    next(
      createHttpError(400, "Errors during product validation", {
        errorList: errors.array(),
      })
    );
  } else {
    next();
  }
};
