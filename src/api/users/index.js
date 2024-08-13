import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import q2m from "query-to-mongo";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import { createAccessToken } from "../../lib/auth/jwtTools.js";
import bcrypt from "bcrypt";

const usersRouter = express.Router();

usersRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const users = await UsersModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    ).populate("name");
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);
    if (user) {
      const payload = {
        _id: user._id,
        name: user.name, // Include the username in the payload
      };
      const accessToken = await createAccessToken(payload);
      res.send({ user, accessToken });
    } else {
      next(createHttpError(401, "Credentials are not OK!"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/logout", (req, res, next) => {
  res.status(200).send({ message: "Logged out successfully" });
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const emailAlreadyRegistered = await UsersModel.findOne({ email: email });
    if (emailAlreadyRegistered) {
      return next(
        createHttpError(400, `User with provided email already exists`)
      );
    }
    const newUser = new UsersModel(req.body);
    await newUser.save();
    if (
      (newUser && email && password && name) ||
      (newUser && email && password && name && avatar)
    ) {
      const payload = {
        _id: newUser._id,
      };

      const accessToken = await createAccessToken(payload);
      res.status(201).send({ user: newUser, accessToken: accessToken });
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User with provided id not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id);
    if (user) {
      if (req.body.password) {
        const plainPassword = req.body.password;
        req.body.password = await bcrypt.hash(plainPassword, 10);
      }
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.user._id,
        req.body,
        { new: true, runValidators: true }
      );
      res.status(204).send(updatedUser);
    } else {
      next(createHttpError(404, `User with the provided id not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User with provided id not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userToChange = await UsersModel.findById(req.params.userId);
    if (userToChange) {
      if (req.body.password) {
        const plainPassword = req.body.password;
        req.body.password = await bcrypt.hash(plainPassword, 10);
      }
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        req.body,
        { new: true, runValidators: true }
      );
      res.status(204).send(updatedUser);
    } else {
      createHttpError(404, `User with id ${req.params.userId} is not found`);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userToDelete = await UsersModel.findById(req.params.userId);
    if (userToDelete) {
      await UsersModel.findByIdAndDelete(req.params.userId);
      res.status(205).send();
    } else {
      createHttpError(404, `User with id ${req.params.userId} is not found`);
    }
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
