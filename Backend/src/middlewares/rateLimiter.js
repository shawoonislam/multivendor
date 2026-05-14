const rateLimit = require('express-rate-limit')
const { success } = require('zod')

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 request per IP
    message: {
        success: false,
        message: 'Too many registration attempts, Please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit information in headers
    legacyHeaders: false
})

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 request per IP
    message: {
        success: false,
        message: 'Too many login attempts, Please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit information in headers
    legacyHeaders: false
})

const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 request per IP
    message: {
        success: false,
        message: 'Too many refresh token attempts, Please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit information in headers
    legacyHeaders: false
})

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 5 request per IP
    message: {
        success: false,
        message: 'Too many attempts, Please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit information in headers
    legacyHeaders: false
})

module.exports = {
    registerLimiter,
    loginLimiter,
    refreshLimiter,
    apiLimiter
}