const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')

const {
    addToCart,
    getCart,
    removeFromCart,
    cleanCart
} = require('../controllers/cartController')

router.use(protect)

router.post('/add', addToCart)
router.get('/', getCart)
router.delete('/remove/:productId', removeFromCart)
router.delete('/clear', cleanCart)

module.exports = router

