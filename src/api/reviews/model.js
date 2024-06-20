import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewsSchema = new Schema(
  {
    rate: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default model("Review", reviewsSchema);
