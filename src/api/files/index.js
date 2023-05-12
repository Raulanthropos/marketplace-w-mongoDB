import multer from "multer";
import express from "express";
import { extname } from "path";
import {
  saveProductImages,
  getProducts,
  writeProducts,
} from "../../lib/fs-tools.js";

const filesRouter = express.Router();

filesRouter.post(
  "/:productId/upload",
  multer().single("image"),
  async (req, res, next) => {
    try {
      const originalFileExtension = extname(req.file.originalname);
      const fileName = req.params.productId + originalFileExtension;
      await saveProductImages(fileName, req.file.buffer);
      const url = `http://localhost:3001/img/products/${fileName}`;
      const products = await getProducts();
      const index = products.findIndex(
        (product) => product.id === req.params.productId
      );
      if (index !== -1) {
        const oldProduct = products[index];
        const updatedProduct = {
          ...oldProduct,
          imageUrl: url,
          updateAt: new Date(),
        };
        products[index] = updatedProduct;
        await writeProducts(products);
      }
      res.send("File Uploaded");
    } catch (error) {
      next(error);
    }
  }
);

export default filesRouter;
