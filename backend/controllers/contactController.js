const expressAsyncHandler = require("express-async-handler")
const User= require("../models/userModel");
const sendEmail= require("../utils/sendEmail");

const contactUs= expressAsyncHandler(async(req,res)=>{
    const {subject, message}= req.body;
    const user= await User.findById(req.user._id);
    if(!user){
        res.status(404);
        throw new Error("User not found.Please sign up");
    }
    if(!subject || !message){
        res.status(400);
        throw new Error("Please add subject and message");
    }
    const sent_to= process.env.EMAIL_USER;
    const sent_from= process.env.EMAIL_USER;
    const reply_to= user.email;

    try{
        await sendEmail(subject,message,sent_from,sent_to,reply_to);
        res.status(200).json({
          success: true,
          message: "email sent successfully"
        })
      } catch(error){
        res.status(500); 
        throw new Error("Something went wrong. Please try again");
      }

})

module.exports = {
    contactUs
}
