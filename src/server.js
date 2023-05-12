import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import listEndpoints from "express-list-endpoints";
import { join } from "path";
import cors from "cors";
import {
  genericErrorHandler,
  notFoundHandler,
  badRequestHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import productsRouter from "./api/products/index.js";
import filesRouter from "./api/files/index.js";
import reviewsRouter from "./api/reviews/index.js";
import mongoose, { mongo } from "mongoose";

const publicFolderPath = join(process.cwd(), "./public");

const server = express();

const port = process.env.PORT;

server.use(cors());
server.use(express.json());

server.use("/products", productsRouter);
server.use("/products", filesRouter);
server.use("/products", reviewsRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to Mongo! ");

  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log("Server is running on port:", port);
  });
});
