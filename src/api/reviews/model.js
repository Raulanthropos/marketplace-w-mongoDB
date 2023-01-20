import {Schema, model} from "mongoose";

const reviewDbSchema = new Schema(
    {
      comment: { type: String, required: true },
      rate: { type: Number, min: 1, max: 5, default: 5, required: true },
    },
    {timestamps: true}
  )
  
  export default model("Review", reviewDbSchema)