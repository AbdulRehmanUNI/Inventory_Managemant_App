const mongoose = require ("mongoose");
const bcrypt= require ("bcryptjs")

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,"Please add a name"]
    },
    email:{
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ,"Please add a valid email"
        ]
    },
    password: {
        type: String,
        required:[true,"Please add a password"],
        minLength: [6, "Password must be at least 6 characters long"],
        //maxLength: [12, "Password must be at most 12 characters long"] 
    },
    photo: {
        type: String,
        required: [true, "Please add a photo"],
        default:   "https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png"

    },
    phone: {
        type: String, 
        default: "+92"
    },
    bio:{
        type: String,
        maxLength: [2500, "Bio must be at most 250 characters long"],
        default: "No bio yet" 
    }
},{
   timestamps: true 
})

//encrypt password
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) next(); 
    const salt= await bcrypt.genSalt(10);
    this.password= await bcrypt.hash(this.password,salt); 
    next()
})


const User  = mongoose.model("User", userSchema);

module.exports=User;