const mongoose = require('mongoose');


const tokenSchema= mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId, //object id of the user
        required: true,
        ref: "User"
    },
    token:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    expireAt:{
        type: Date,
        required: true
    }
})



const Token=mongoose.model( "Token", tokenSchema);

module.exports= Token;