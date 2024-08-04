import createHttpError from "http-errors";
import { verifyAccessToken } from "./jwtTools.js";

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Please Provide Bearer Token"));
  } else {
    try {
      const accessToken = req.headers.authorization.replace("Bearer ", "");
      const payload = await verifyAccessToken(accessToken);
      req.user = payload; // Set the payload (which contains _id and name) to req.user
      next();
    } catch (error) {
      console.log(error);
      next(createHttpError(401, "Token is not accepted"));
    }
  }
};
