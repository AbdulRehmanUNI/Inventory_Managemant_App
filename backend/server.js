const dotenv = require ("dotenv").config();
const express = require ("express");
const cors = require ("cors");
const mongoose = require ("mongoose");
const bodyParser = require ("body-parser");
const userRoute= require("./routes/userRoute");
const productRoute= require("./routes/productRoute");
const contactRoute= require("./routes/contactRoute");
const errorHandler= require("./middleWare/errorMiddleWare");
const cookieParser= require("cookie-parser");
const path = require("path");


const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));


//route-middleware
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/contact", contactRoute);



//routes
app.get("/", (req,res)=>{
    res.send("Welcome to the server");
})

//error handler

app.use(errorHandler)

const PORT= process.env.PORT || 5000;
//connect to mongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT, ()=>{
            console.log(`Server is running on port ${PORT} `)
        })
    })
    .catch((error)=> console.log(error.message));