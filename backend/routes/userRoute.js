const express= require ("express");
const { registerUser,loginUser,logoutUser,getUser, loginStatus,updateUser, changePassword,forgotPassword, resetPassword} = require("../controllers/userController");
const protect = require("../middleWare/authMiddleWare");
const router= express.Router();



router.post("/register", registerUser)
router.post("/login",loginUser )
router.get("/logout",logoutUser )
router.get("/getUser",protect,getUser )
router.get("/loggedIn",loginStatus)
router.patch("/updateUser",protect,updateUser)
router.patch("/changePassword",protect, changePassword)
router.post("/forgotPassword",forgotPassword)
router.put("/resetPassword/:resetToken",resetPassword)

module.exports= router;