const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    title: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const orderSchema = new mongoose.Schema({
    orderId:{
        type: String,
        unique: true,
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress:{
        fullName: String,
        phone: String,
        address: String,
        city: String,
        postalCode: String
    },
    paymentMethod:{
        type: String,
        enum: ['cod', 'bkash', 'nagad', 'card', 'online'],
        default: 'cod'
    },
    paymentStatus:{
        type: String,
        enum: ['pending','paid','faild','refunded'],
        default: 'pending'
    },
    orderStatus:{
        type: String,
        enum: ['pending','processing','shipped','delivered','cencelled'],
        default: pending
    },
    vendorStatuses:{
        vendor:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending','processing','shipped','delivered'],
        },
        trackingNumber: String,
        notes: String,
    }
},{timestamps: true})

orderSchema.pre('save',async function(next){
    if(!this.orderId){
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2,'0');
        const day = String(date.getDate()).padStart(2,'0');

        const random = Math.floor(1000 + Math.random() * 9000);
        this.orderId = `ORD-${year}${month}${day}-${random}`
    }
    next()
})

module.exports = mongoose.model('Order',orderSchema)