const multer = require('multer');
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary')

// Vendor logo upload
const logoStorage = new CloudinaryStorage({
    cloudinary,
    params: (req,file) => ({
        folder: 'vendors/logo',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        public_id: `logo-${req.body.email || 'unknown'}-${Date.now()}`,
        transformation: [{
            width: 500,
            height: 500,
            crop: 'limit',
            quality: 'auto'
        }]
    })
})

// NID / Document  upload
const nidStorage = new CloudinaryStorage({
    cloudinary,
    params: (req,file) => ({
        folder: 'vendors/nids',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        public_id: `nid-${req.body.nidNumber || 'unknown'}-${Date.now()}`,
        transformation: [{
            quality: 'auto'
        }]
    })
})

// File filter (extra security)
const fileFilter = (req,file,cb)=>{
    const allowedTypes = /jpeg|jpg|png|webp|pdf/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype= allowedTypes.test(file.mimetype);

    if(extname && mimetype){
        return cb(null,true)
    }
    cb(new Error('Only images (jpg,jpeg,png,webp) and PDF allowed!'))

}

// Logo Uploader (signle file)
const uploadLogo = multer({
    storage: logoStorage,
    limits: {
        fileSize: 5 * 1024 *1024, //5mb
    },
    fileFilter
}).single('shopLogo')

// NID Uploader (signle file)
const uploadNid = multer({
    storage: nidStorage,
    limits: {
        fileSize: 10 * 1024 *1024, //5mb
    },
    fileFilter
}).single('nidScan')

// Product image upload
const productStorage = new CloudinaryStorage({
    cloudinary,
    params: (req,file) => ({
        folder: 'products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        public_id: `product-${Date.now()}-${Math.random().toString(36).subString(7)}`,
        transformation: [{
            width: 800,
            height: 800,
            crop: 'limit',
            quality: 'auto'
        }]
    })
})

// product upload multiple
const uploadProductImages = multer({
    storage: productStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5mb per image,
    },
    fileFilter
}).array('images', 8)

module.exports = { uploadLogo, uploadNid, uploadProductImages }