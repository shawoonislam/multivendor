const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.addToCart = async (req,res)=>{
    try {
        const {productId, quantity = 1} = req.body
        const userId = req.user.userId

        const product = await Product.findById(productId)

        if(!product){
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        if(product.stock < quantity){
             return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            })
        }

        let cart = await Cart.findOne({
            user: userId
        })

        if(!cart){
            cart = new Cart({
                user: userId,
                items:[]
            })
        }

        const existingItem = cart.items.find(item=>item.product.toString() === productId)

        if(existingItem){
            existingItem.quantity += Number(quantity)
        }else{
            cart.items.push({
                product: productId,
                quantity: Number(quantity),
                price: product.discountPrice || product.price
            })
        }

        await cart.save();

        res.status(200).json({
            sucess: true,
            message: 'Product added to cart',
            cart
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getCart = async (req,res)=>{
    try {
        const cart = await Cart.findOne({user: req.user.id}).populate({
            path: 'items.product',
            select: 'title price discountPrice images stock vendor',
            populate: {
                path: 'vendor',
                select: 'shopName'
            }
        })

        if(!cart){
            return res.status(200).json({
                success: true,
                items: [],
                totalAmount: 0
            })
        }

        res.status(200).json({
            success: true,
            items: cart.items,
            totalAmount: cart.totalAmount,
            totalItems: cart.items.length
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}

exports.removeFromCart = async (req,res)=>{
    try {
        const {productId} = req.params
        const userId = req.user.id

        const cart = await Cart.findOne({user:userId})
        if(!cart) return res.status(404).json({success:false,message: 'Cart not fount'})

        cart.items = cart.items.filter((item)=>{
            item.product.toString() !== productId
        })

        await cart.save()

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            cart
        })

    } catch (error) {
         res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}

exports.cleanCart = async (req,res)=>{
    try {
        await Cart.findOneAndDelete({user: req.user.id})
        res.status(200).json({
            success: true,
            message: 'Cart cleared'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }

}

