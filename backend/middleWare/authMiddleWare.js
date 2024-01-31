const asyncHandler= require('express-async-Handler')
const User= require('../models/userModel')
const jwt = require("jsonwebtoken")

const protect = asyncHandler (async (req,res,next)=>{
   try{
    const token = req.cookies.token;
    if(!token){
        res.status(401);
        throw new Error("Not authorized, Please login");
    }
    //verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    //find user by id
    user= await User.findById(verified.id).select("-password");

    if(!user){
        res.status(404);
        throw new Error("No user found with this id");
    }
    //send user data
    req.user = user;
    next();
   }catch(error){
       res.status(401);
       throw new Error("Not authorized, Please login");
   }  
});

module.exports= protect;