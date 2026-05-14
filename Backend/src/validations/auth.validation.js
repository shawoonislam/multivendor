const {z} = require('zod')

// Registration Schema
const registrationSchema = z.object({
    name: z.string()
        .min(2, {message: 'Name must be at least 2 characters'})
        .max(50,{message: 'Name  too long'})
        .trim(),

    email: z.string()
        .email({message: "Invalid email"})
        .toLowerCase()
        .trim(),
    
    password: z.string()
            .min(8, {message: 'Password must be at least 8 characters'})
            .regex(/[a-z]/, {message: 'Must contain at least onw lowercase letter'})
            .regex(/[A-Z]/, {message: 'Must contain at least onw uppercase letter'})
            .regex(/[0-9]/, {message: 'Must contain at least onw number'})
            .regex(/[^a-zA-Z0-9]/, {message: 'Must contain at least onw special character'}),
    
    phone: z.string()
        .regex(/^\+?8801[3-9]\d{8}$/, {message: 'Invalid Bangladeshi Phone number'})
        .optional(),
    
    role: z.enum(['customer', 'vendor'],{message: 'Invalid role'})
        .optional()
        .default('customer')
})

const loginSchema = z.object({
    email: z.string()
        .email({message: "Invalid email"})
        .toLowerCase()
        .trim(),
    
    password: z.string()
            .min(8, {message: 'Password must be at least 8 characters'})
            .regex(/[a-z]/, {message: 'Must contain at least onw lowercase letter'})
            .regex(/[A-Z]/, {message: 'Must contain at least onw uppercase letter'})
            .regex(/[0-9]/, {message: 'Must contain at least onw number'})
            .regex(/[^a-zA-Z0-9]/, {message: 'Must contain at least onw special character'}),
    
})


const vendorValidationSchema = z.object({
    name: z.string().min(2).max(50).trim(),
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/),
    phone: z.string().regex(/^\+?8801[3-9]\d{8}$/).optional(),

    // vendor specific
    shopName: z.string().min(3,{message: 'Shop name must be at least 3 characters'}).max(100).trim(),
    shopDescription: z.string().max(1000).trim(),
    shopAddress: z.string().min(10).max(100).trim(),
    nidNumber: z.string().min(10).max(17).trim(),
    bankInfo: {
        bankName: z.string().min(2).max(300).trim(),
        branchName: z.string().min(2).max(100).trim(),
        accountNumber: z.string().min(10).trim(),
        accountHolderName: z.string().min(2).max(100).trim()
    }
})






module.exports = {
    registrationSchema,
    loginSchema,
    vendorValidationSchema
}