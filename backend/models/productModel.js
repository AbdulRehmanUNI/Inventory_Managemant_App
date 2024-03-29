const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name:{
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
    },
    sku:{
        type: String,
        required: true,
        default: 'SKU',
        trim: true,
    },
    category:{
        type: String,
        required: [true, 'Please enter product category'],
        trim: true,
    },
    quantity:{
        type: String,
        required: [true, 'Please enter product quantity'],
        trim: true,
    },
    price:{
        type: String,
        required: [true, 'Please enter product price'],
        trim: true,
    },
    description:{
        type: String,
        required: [true, 'Please enter product description'],
        trim: true,
    },
    image:{
        type: Object,
        default: {},
    },
},
{
    timestamps: true,
}
);





const Product = mongoose.model('Product', productSchema);
module.exports = Product;