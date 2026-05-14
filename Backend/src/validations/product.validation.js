const { z } = require('z');

const createProductSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
    price: z.number().min(1),
    discountPrice: z.number().min(0).optional(),
    category: z.string().min(2),
    subCategory: z.string().optional(),
    stock: z.number().min(0),
    brand: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sku: z.string().optional()
})

module.exports = {createProductSchema}