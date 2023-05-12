import mongoose from "mongoose";

const { Schema, model } = mongoose;

const cartsSchema = new Schema(
  {
    //owner: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    products: [
      {
        productId: { type: mongoose.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
      },
    ],
    status: { type: String, required: true, enum: ["Active", "Paid"] },
  },
  { timestamps: true }
);

export default model("Cart", cartsSchema);
