import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewsSchema = new Schema(
  {
    rate: { type: Number, required: true },
    comment: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

export default model("Review", reviewsSchema);
