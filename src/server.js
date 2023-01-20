import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import productRouter from "./api/products/index.js";
import reviewRouter from "./api/reviews/index.js";
/* import userRouter from "./users/index.js"; */
import {
    badRequestHandler,
    genericServerErrorHandler,
    notFoundHandler,
    unauthorizedHandler,
  } from "./errorHandlers.js";
import { join } from "path"
import mongoose from "mongoose";
const server = express();
const port = process.env.PORT || 3001
const publicFolderPath = join(process.cwd(), "./public");
import dotenv from "dotenv";

dotenv.config();

server.use(cors())
server.use(express.json())
server.use("/products", productRouter)
server.use("/reviews", reviewRouter)
server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericServerErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected",()=>{
  server.listen( port, ()=>{
    console.log("server is connected to Database and is running on port:" , port)
    console.table(listEndpoints(server))
})})