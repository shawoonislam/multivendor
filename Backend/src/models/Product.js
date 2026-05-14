const mongoose = require('mongoose')
const { maxLength } = require('zod')

const productSchema = new mongoose.Schema({
    title:{
        type: String,
        required: [true,'Product title is required'],
        trim: true,
        maxLength: 200
    },
    description:{
        type: String,
        required: true,
        maxLength: 5000
    },
    price:{
        type: Number,
        required: true,
        min: 0
    },
    discountPrice:{
        type: Number,
        min: 0,
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subCategory: String,
    brand: String,

    // Inventory
    stock:{
        type: Number,
        required: true,
        min:0,
        default: 0,
    },
    sku:{
        type: String,
        unique: true,
        sparse: true,
    },

    //Images
    images:[{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String
        },
        isMain: {
            type: Boolean,
            default: false
        }
    }],

    // Vendor Info
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    //Status
    status:{
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended'],
        default: 'pending'
    },

    approvedAt: {
        type: Date
    },
    rejectedReason: {
        type: String
    },
    reviwedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Additional Info

    tags: [String],
    weight: Number,
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },

    // SEO & visibility
    slug:{
        type: String,
        unique: true,
        lowercase: true
    },
}, {timestamps: true})

// Index for fast search
productSchema.index({title: 'text', description: 'text'});
productSchema.index({vendor:1, status:1});
productSchema.index({category: 1})

module.exports = mongoose.model('Product',productSchema)