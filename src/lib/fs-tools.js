import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";

const { readJSON, writeJSON, writeFile } = fs;
const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");
const publicFolderPath = join(process.cwd(), "./public/img/products");

const productsJSONPath = join(dataFolderPath, "products.json");
const reviewsJSONPath = join(dataFolderPath, "reviews.json");

export const getProducts = () => readJSON(productsJSONPath);
export const writeProducts = (productsArray) =>
  writeJSON(productsJSONPath, productsArray);
export const getReviews = () => readJSON(reviewsJSONPath);
export const writeReviews = (reviewsArray) =>
  writeJSON(reviewsJSONPath, reviewsArray);

export const saveProductImages = (filename, contentAsABuffer) =>
  writeFile(join(publicFolderPath, filename), contentAsABuffer);
