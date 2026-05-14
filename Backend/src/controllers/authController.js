const User = require('../models/User')
const VerificationToken = require('../models/verificationToken')
const jwt = require('jsonwebtoken')
const {validationResult} = require('express-validator')
const nodemailer = require('nodemailer')
const {v4: uuidv4} = require('uuid')
const { success } = require('zod')



exports.register = async (req,res)=>{
    try {
        const {name, email, password, phone, role} = req.body

        // Simple Validation
        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: 'Name, Email and Password are required'
            })
        }

        // Check if user already exixts
        const existingUser = await User.findOne({email})
        if(existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            })
        }

        // create user
        const user = new User({
            name: name,
            email: email,
            password: password,
            phone: phone || undefined,
            role: role || 'customer'
        })

        // save user
        await user.save()

        // Create verification token
        const token = uuidv4()
        await new VerificationToken({userId: user._id, token}).save()

        // Sens Email
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            }
        })

        const verificationUrl= `${process.env.APP_URL}/api/v1/auth/verify-email?token=${token}&email=${user.email}`

        const mailOption={
            from: `"Multivendor Shop", <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Verify Your Email - Multivendor Ecommerce',
            html: `
                <h2>Welcome to our platform</h2>
                <p>Hi ${user.name}</p>
                <p>Thank you for registration. Please verify your email by clicking the lik below</p>
                <a href=${verificationUrl}>Verify Email</a>
                <p>This link will be expire in 24hours</p>
                <p>Best regards, <br> Team Multivendor</p>
            `
        }

        try {
            await transporter.sendMail(mailOption)
            console.log('Email send')
        } catch (error) {
            console.error('Email send error: ', error)
        }


        res.status(201).json({
            success: true,
            message: 'Registration successful! Please Login',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        })
    }
}

exports.login = async (req,res)=>{
    try {
        const {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({success: false, message:'Email and Passwrod required'})
        }

        // Find user and select passwrod
        const user = await User.findOne({email}).select('+password')
        if(!user){
            return res.status(401).json({success: false, message:'Invalid credentials'})
        }

        const isMatch = await user.comparePassword(password)
        if(!isMatch){
            return res.status(401).json({success: false, message:'Invalid credentials'})
        }

        // Generate tokens
        const accessToken = jwt.sign(
            {id: user._id, role: user.role, email: user.email},
            process.env.JWT_ACCESS_SECRET,
            {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
        )

        const refreshToken = jwt.sign(
            {id: user._id},
            process.env.JWT_REFRESH_SECRET,
            {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
        )

        // Save refresh token to user
        user.refreshTokens.push({
            token: refreshToken,
            createdAt: new Date(),
        })

        await user.save()

        res.cookie('refreshToken', refreshToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            samSite: 'strict',
            maxAge: 7*24*60*60*1000,
            path: '/'
        })

        res.status(200).json({
            success: true,
            message: 'Login Successful',
            accesstoken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
        })
    } catch (error) {
        console.log('Login Error: ', error)
        res.status(500).json({success: false, message: 'Server Error'})
    }
}

exports.refreshToken = async ()=>{
    try {
        const refreshToken = req.cookies.refreshToken
        if(!refreshToken){
            return res.status(400).json({message: 'No refresh token'})
        }

        // Find user with the refresh token
        const user = await User.findOne({
            refreshTokens: {$elemMatch: {
                token: refreshToken
            }}
        })

        if(!user){
            res.clearCookie('refreshToken')
            return res.status(403).json({message: 'Invalid refresh token'})
        }

        // Verify refresh token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err,decoded)=>{
            if(err){
                res.clearCookie('refreshToken')
                return res.status(403).json({message: 'Invalid or expire refresh token'})
            }

            const newAccessToken = jwt.sign(
                { id: user._id, role: user.role, email: user.email },
                process.env.JWT_ACCESS_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
            )

            res.status(200).json({
                sucess: true,
                accessToken: newAccessToken
            })
        })

    } catch (error) {
        res.status(500).json({message: 'Server Error'})
    }
}

exports.logout = async (req,res)=>{
    try {
        const refreshToken = req.cookies.refreshToken
        if(!refreshToken){
            return res.status(204).send()
        }

        // find user
        const user = await User.findOne({
            refreshTokens: {$elemMatch: {token: refreshToken}}
        })

        if(user){
            user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken)
            await user.save()
        }

        res.clearCookie('refreshToken',{
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: 'strict'
        })

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        })


    } catch (error) {
        res.status(500).json({message: 'Server Error During Loout'})
    }
}

exports.logoutAll = async (req,res)=>{
    try {
        const user = await User.findById(req.user.id)

        if(!user){
            return res.status(404).json({message: 'User not found'})
        }

        user.refreshTokensTokens = []

        await user.save()

        res.clearCookie('refreshToken',{
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: 'strict'
        })

        res.status(200).json({
            success: true,
            message: 'Logged out  From all devices'
        })



    } catch (error) {
        res.status(500).json({message: 'Server Error During Logout from all device'})
    }
}

exports.registerVendor = async (req,res)=>{
    try {
        const validateData = req.body
        const {name,email,password,phone, shopName, shopDescription, shopAddress, nidNumber, bankInfo} = validateData

        // Check duplicate
        const existingUser = User.findOne({email})
        if(existingUser){
            return res.status(409).json({message: 'Email already registered, You are a vendor already please login as vendor'})
        }

        // Check duplicate NID
        if(nidNumber){
            const existingNID = User.findOne({nidNumber})
            if(existingNID){
                return res.status(409).json({message: 'NID already registered, You are a vendor already please login as vendor'})
            }
        }

        const user = new User({
            name: name,
            email: email,
            password: password,
            phone: phone,
            role: 'vendor',
            shopName: shopName,
            shopDescription: shopDescription,
            shopAddress: shopAddress,
            nidNumber: nidNumber,
            bankInfo: bankInfo,
            status: 'pending' // auto set by pre-save
        })

        await user.save()
        res.status(200).json({
            success: true,
            message: 'Vendor Registered Successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        })



    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Server Error'})
    }
}

