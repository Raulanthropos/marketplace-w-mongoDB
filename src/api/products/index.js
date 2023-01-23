import express from "express";
import createHttpError from "http-errors";
import productModel from "./model.js";
import reviewModel from '../reviews/model.js'
import q2m from "query-to-mongo";
import options from "mongoose";

const productRouter = express.Router();

productRouter.get("/", async (req,res,next)=>{
    try{
        const mongoQuery = q2m(req.query);
        console.log("This is the initial response to the req.query, without using query-to-mongo", req.query, "This is the mongoquery", mongoQuery)
        const total = await productModel.countDocuments(mongoQuery.criteria);
        console.log(total)
        const products = await productModel.find(
          mongoQuery.criteria,
          mongoQuery.options.fields
        )
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit)
        res.status(200).send({
          links:mongoQuery.links(total),
          total,
          totalPages: Math.ceil(total/mongoQuery.options.limit), 
          products
        })        
    }catch(error){ 
        next(error)
    }    
})

productRouter.get("/:productId" , async (req,res,next)=>{
    try{      
        const foundProduct = await productModel.findById(req.params.productId)       
        if(foundProduct){
            res.status(200).send(foundProduct);
        }else{next(createHttpError(404, "Product Not Found"));
    } 
    }catch(error){
        next(error);
    }
})

productRouter.post("/", async (req,res,next)=>{
    try{
        const newProduct = new productModel(req.body);
        const{_id}= await newProduct.save();

        res.status(201).send({message:`Added a new product.`,_id});
        
    }catch(error){
        next(error);
    }
})   
    
    productRouter.put("/:productId", async (req,res,next)=>{
        try{ const foundProduct = await productModel.findByIdAndUpdate(req.params.productId,
            {...req.body},
            {new:true,runValidators:true});
            res.status(200).send(updatedProduct);      
        }catch(error){ 
            next(error);
        }
    })
    
    
    productRouter.delete("/:productId", async (req,res,next)=>{try{
        const deletedProduct =  await productModel.findByIdAndDelete(req.params.productId)      
        if(deletedProduct){
            res.status(204).send({message:"product has been deleted."})
        }else{
            next(createHttpError(404, "product Not Found"));    
        }
    }catch(error){
        next(error)
    }
})

productRouter.post("/:productId/reviews/", async (req,res,next)=>{
    try{
        const product = await productModel.findByIdAndUpdate(
            req.params.productId,
            { $push: { reviews: req.body } },
            { new: true, runValidators: true }
          );     

        res.status(201).send({message:`Added a new review.`});
        
    }catch(error){
        console.log(error);
    }
})
productRouter.get("/:productId/reviews/:reviewId" , async (req,res,next)=>{
    try{      
        const foundProduct = await productModel.findById(req.params.productId)       
        if(foundProduct){
            const foundReview = foundProduct.reviews.find(review => review._id.toString()===req.params.reviewId)
            console.log(foundReview)
            if(foundReview){
            res.status(200).send(foundReview);
            }else{next(createHttpError(404, "Review Not Found"));}
        }else{next(createHttpError(404, "Product Not Found"));
    } 
    }catch(error){
        console.log(error);
    }
})
productRouter.get("/:productId/reviews" , async (req,res,next)=>{
    try{ 
        const foundProduct = await productModel.findById(req.params.productId)       
        if(foundProduct){
            res.status(200).send(foundProduct.reviews);            
        }else{next(createHttpError(404, "Product Not Found"));
    } 
}catch(error){
    console.log(error);
}
})

productRouter.put("/:productId/reviews/:reviewId" , async (req,res,next)=>{
    try{     
        const foundProduct = await productModel.findById(req.params.productId);
        if(foundProduct){            
            const foundReviewIndex = foundProduct.reviews.findIndex(review => review._id.toString()===req.params.reviewId);
            if(foundReviewIndex>-1){                
                foundProduct.reviews[foundReviewIndex] = {
                    ...foundProduct.reviews[foundReviewIndex],
                    ...req.body
                }
                await foundProduct.save()
               
            res.status(200).send({message: "Review updated successfully!"});
            }else{next(createHttpError(404, "Review Not Found"));}
        }else{next(createHttpError(404, "Product Not Found"));
    } 
    }catch(error){
        console.log(error);
    }
})

productRouter.delete("/:productId/reviews/:reviewId" , async (req,res,next)=>{
    try{ 
        const foundProduct = await productModel.findById(req.params.productId)       
        if(foundProduct){
            const foundReview = foundProduct.reviews.find(review => review._id.toString()===req.params.reviewId)
            console.log(foundReview)
            const foundReviewIndex = foundProduct.reviews.findIndex(review => review._id.toString()===req.params.reviewId)
            if(foundReviewIndex>-1){
                const deletedReview = await productModel.findByIdAndUpdate(req.params.productId,{$pull:{reviews:{_id: req.params.reviewId}}},{new:true});
                console.log(deletedReview)
            res.status(200).send(foundReview);
            }else{next(createHttpError(404, "Review Not Found"));}
        }else{next(createHttpError(404, "Product Not Found"));
    } 
    }catch(error){
        console.log(error);
    }
})

export default productRouter;