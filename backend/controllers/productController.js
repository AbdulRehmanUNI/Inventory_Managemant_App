const asyncHandler = require('express-async-handler'); 
const Product = require('../models/productModel');
const {fileSizeFormatter}= require("../utils/fileUpload");   
const cloudinary = require("cloudinary").v2; 

const createProduct = asyncHandler(async (req, res) => {
    const { name, sku, category, quantity,price, description } = req.body;
    //validate data
    if (!name || !sku || !category || !quantity || !price || !description) {
        res.status(400);
        throw new Error("Please fill all fields");
    }
    //handle image
    let fileData={};
    if(req.file){
        //upload image to cloudinary
        let uploadFile;
        try{
            uploadFile = await cloudinary.uploader.upload(req.file.path,
                {
                    folder: "pinvent app",
                    resource_type: "image",
                }); 
        }                                                          
        catch(err){
            res.status(400);
            throw new Error("Image could not be uploaded to cloudinary");
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
            imageId: uploadFile.public_id,
        }
    }

    else{
        res.status(400);
        throw new Error("Image is required");
    }
    //create product
    const product = await Product.create({
        user: req.user.id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData,
    });
    //send response
    if (product) {
        res.status(201).json({
            _id: product._id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            quantity: product.quantity,
            price: product.price,
            description: product.description,
            image: product.image,


        });
    } else {
        res.status(400);
        throw new Error("Invalid product data");
    }
    
});

//get all products
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({user:req.user.id}).sort("-createdAt");
    res.status(200).json(products);
});
//get single product
const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if(product.user.toString() !== req.user.id){
        res.status(401);
        throw new Error("You are not authorized to view this product");
    }
    if (product) {
        res.status(200).json(product);
    } else {
        res.status(404);
        throw new Error("Product not found");
    }
}); 

//delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if(product.user.toString() !== req.user.id){
        res.status(401);
        throw new Error("You are not authorized to delete this product");
    }
    if (product) {
        await product.deleteOne();
        const removeImage=cloudinary.uploader.destroy(product.image.imageId, function(error, result) {
            console.log(result, error);
        });    
        res.status(200).json({ message: "Product removed", });
    } else {
        res.status(404);
        throw new Error("Product not found");
    }
});

//update product
const updateProduct = asyncHandler(async (req, res) => {
    const { name, sku, category, quantity,price, description } = req.body;
    const id=req.params.id;
    const product = await Product.findById(id);
    if(!product){
        res.status(404);
        throw new Error("Product not found");
    }
    if(product.user.toString() !== req.user.id){
        res.status(401);
        throw new Error("You are not authorized to update this product");
    }
    //delete previous image from cloudinary
    if(req.file){
        if(product.image){
            await cloudinary.uploader.destroy(product.image.imageId, function(error, result) {
                console.log(result, error);
            });    
        }
    }
    //handle image
    let fileData={};
    if(req.file){
        //upload image to cloudinary
        let uploadFile;
        try{
            uploadFile = await cloudinary.uploader.upload(req.file.path,
                {
                    folder: "pinvent app",
                    resource_type: "image",
                }); 
        }                                                          
        catch(err){
            res.status(400);
            throw new Error("Image could not be uploaded to cloudinary");
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
            imageId: uploadFile.public_id,
        }
    }
    //update product
    const updatedProduct = await Product.findByIdAndUpdate({_id: id},{
        name,
        category,
        quantity,
        price,
        description,
        image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    },{
        new:true,
        runValidators:true,
    });
    //send response
    if (updatedProduct) {
        res.status(200).json({
            _id: updatedProduct._id,
            name: updatedProduct.name,
            sku: updatedProduct.sku,
            category: updatedProduct.category,
            quantity: updatedProduct.quantity,
            price: updatedProduct.price,
            description: updatedProduct.description,
            image: updatedProduct.image,
        });
    } else {
        res.status(400);
        throw new Error("Invalid product data");
    }
    
});

module.exports = {
    createProduct,getProducts,getProduct,deleteProduct,updateProduct
}


