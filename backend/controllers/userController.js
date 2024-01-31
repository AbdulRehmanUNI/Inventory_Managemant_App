const User= require('../models/userModel')
const jwt = require("jsonwebtoken")
const bcrypt= require("bcryptjs")
const tokenModel = require('../models/tokenModel')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
const Token = require('../models/tokenModel')
const asyncHandler= require("express-async-Handler");

const generateToken= (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
}

//register user
const registerUser= asyncHandler(async (req, res)=>{
  const {name,email,password}=req.body;
    
  //validation
  if(!name || !email || !password){
    res.status(400);
    throw new Error("Please fill all the fields");
  }
  if(password.length<6){
    res.status(400);
    throw new Error("Password must be atleast 6 characters");
  }
  //check if user email already exists
  //using userModel to interact with the database

  const userExists_Check= await User.findOne({email})
  if(userExists_Check){
    res.status(400);
    throw new Error("This email has already been registered");
  }

    //encryptying the password in the userModel
    //create new user

  const user= await User.create({
    name,email,password
      //since names are same 
      // name: req.body.name,
      // email: req.body.email,
      // password: req.body.password
  })
    //generate token
  const token= generateToken(user._id)
    //send the response cookie

  res.cookie("token", token,{
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now()+ 24*60*60*1000), // 1 day
      sameSite: "none",
      secure: true
  })
  if(user){
    const {_id,name,email,photo,phone,bio}=user;
    res.status(201).json({
    _id,name,email,photo,phone,bio,token
  })
  }
  else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  res.send("User registered");
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Validate Request
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
    }
  
    // Check if user exists
  const user = await User.findOne({ email });
  
  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
    }
  
    // User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  
    //   Generate Token
    const token = generateToken(user._id);
  
    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });
  
    if (user && passwordIsCorrect) {
      const { _id, name, email, photo, phone, bio } = user;
      res.status(200).json({
        _id,
        name,
        email,
        photo,
        phone,
        bio,
        token,
      });
    } else {
      res.status(400);
      throw new Error("Invalid email or password");
    }
});

  // Logout User
const logoutUser = asyncHandler(async (req,res)=>{
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), 
        sameSite: "none",
        secure: true,
      });
    // res.clearCookie("token");
    return  res.status(200).json({
        message: "User logged out"
    })
  })

    // Get User Profile
    const getUser = asyncHandler(async (req,res)=>{
        const user = await User.findById(req.user._id).select("-password");
        if(user){
            const { _id, name, email, photo, phone, bio } = user; 
           return res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
          });
        }else {
            res.status(404);
            throw new Error("User not found");
        }
})

    //get login status

    const loginStatus= asyncHandler(async (req,res)=>{
      const token = req.cookies.token;
      if(!token){
          return res.status(200).json({
              isLoggedIn: false
          })
      }
      try{
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        //find user by id
        user= await User.findById(verified.id).select("-password");
        if(user){
            return res.status(200).json({
                isLoggedIn: true
            })
        }else {
            return res.status(200).json({
                isLoggedIn: false
            })
        }
      }catch(error){
        return res.status(200).json({
            isLoggedIn: false
        })
      }
})

    //update user
const updateUser=asyncHandler(async (req,res)=>{
      const user = await User.findById(req.user._id);
      if(user){
        const { name, email, photo, phone, bio } = user;
        user.email=email;
        user.name=req.body.name || name;
        user.photo=req.body.photo || photo;
        user.phone=req.body.phone || phone;
        user.bio=req.body.bio || bio;

        const updatedUser= await user.save();
        res.json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          photo: updatedUser.photo,
          phone: updatedUser.phone,
          bio: updatedUser.bio,
        })  
      }else {
        res.status(404);
        throw new Error("User not found");
      }
})

    //change password

const changePassword= asyncHandler(async (req,res)=>{
    const user = await User.findById(req.user._id);
    const {oldPassword, password}= req.body;

    if(!user){    
      res.status(404);
      throw new Error("User not found. Please signup"); 
    }
  
    if(!oldPassword || !password){
      res.status(400);
      throw new Error("Please add old and new password");
    }
    //check if old password is correct 
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);
    if(user && passwordIsCorrect){
      user.password= password;
      await user.save();
      res.status(200).json({
        message: "Password changed successfully"
      })
    }
    else {
      res.status(400);
      throw new Error("Invalid old password");
    }
})

    //forgot password

const forgotPassword= asyncHandler(async (req,res)=>{
      const {email}= req.body;
      const user = await User.findOne({email});
      if(!user){
        res.status(404);
        throw new Error("User not found. Please signup");
      }
      //delete token if it exists in db
      let token= await Token.findOne({userId: user._id});
      if(token) await token.deleteOne();
      //generate token to reset password
      let resetToken= crypto.randomBytes(32).toString("hex")+ user._id;
      //adding id so that its unique;
      console.log(resetToken);

      //hash the token
      const hash= crypto.createHash("sha256").update(resetToken).digest("hex");
      //save the token in the database
      await new Token({
        userId: user._id,
        token: hash,
        createdAt: Date.now(),
        expireAt: Date.now()+ 30*60*1000 //30 minutes
      }).save();
      //construct reset password url
      const resetUrl= `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

      const message= `
      <h2>Hello ${user.name}</h2>
      <p>You requested to reset your password</p>
      <p>Click on the link below to reset your password</p>
      <a href="${resetUrl}" target="_blank" clicktracking=off>Reset Password</a>
      
      <p>Ignore this email if you did not request to reset your password</p>

      <p>Regards</p>
      <p>Pinvet Team</p>
      `;
      const subject= "Reset Password Request";
      const sent_to= user.email;
      const sent_from= process.env.EMAIL_USER;
      try{
        await sendEmail(subject,message,sent_from,sent_to);
        res.status(200).json({
          success: true,
          message: "Reset password link sent to your email"
        })
      } catch(error){
        res.status(500); 
        throw new Error("Something went wrong. Please try again");
      }

})

const resetPassword= asyncHandler(async (req,res)=>{
  const resetToken= req.params.resetToken;
  const {password}= req.body;
  //check if token exists in db
  let UserToken= await Token.findOne({
    token: crypto.createHash("sha256").update(resetToken).digest("hex"),
    expireAt: {$gt: Date.now()}
});

if(!UserToken){
  res.status(400);
  throw new Error("Invalid or expired token");
}
//find user by id
const user= await User.findById( UserToken.userId);
if(!user){
  res.status(404);
  throw new Error("User not found");
}
//update password
user.password= password;
await user.save();
//delete token from db
await UserToken.deleteOne();
res.status(200).json({
  success: true,
  message: "Password reset successful"
})

})
module.exports= {
    registerUser, 
    loginUser,
    logoutUser,
    getUser,
    loginStatus,
    updateUser, 
    changePassword,
    forgotPassword,
    resetPassword
}