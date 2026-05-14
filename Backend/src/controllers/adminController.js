const { success } = require("zod");
const User = require("../models/User")
const Product = require("../models/Product")


exports.getPendingVendors = async (req,res) => {
    try {

        const vendors = await User.find({
            role: 'vendor',
            status: 'pending'
        }).select('name email shopName shopAddress nidNumber createdAt');

        res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        });

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Server error'
        })

    }
}

exports.getAllVendors = async (req,res) => {
   try {

        const vendors = await User.find({
            role: 'vendor',
        }).select('name email shopName status shopAddress approvedAt rejectReason nidNumber createdAt');

        res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        });

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Server error'
        })

    }
}

exports.getApprovedVendors = async (req,res) => {
    try {

        const vendors = await User.find({
            role: 'vendor',
            status: 'approved'
        }).select('name email shopName shopAddress nidNumber approvedAt createdAt');

        res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        });

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Server error'
        })

    }
}

exports.getRejectedVendors = async (req,res) => {
    try {

        const vendors = await User.find({
            role: 'vendor',
            status: 'rejected'
        }).select('name email shopName shopAddress nidNumber approvedAt rejectReason createdAt');

        res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        });

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Server error'
        })

    }
}

exports.approveVendor = async (req,res) => {
    const {vendorId} = req.params;
    const vendor = await User.findById(vendorId);

    if(!vendor || vendor.role !== 'vendor'){
        return res.status(404).json({message: 'vendor not found'});
    }

    vendor.status = 'approved';
    vendor.approvedAt = new Date();
    await vendor.save();

    // Todo: send approval email

    res.json({
        success: true,
        message: 'Vendor approved'
    });

}

exports.rejectVendor = async (req,res) => {
    try {
        const { id } = req.params
        const { reason } = req.body

        if(!reason){
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            })
        }

        const vendor = await User.findOneAndUpdate(
            {_id: id, role: 'vendor', status: 'pending'},
            {
                status: 'rejected',
                rejectReason: reason,
                approvedAt: null
            },
            {new:true}
        ).select('name email shopName status rejectReason');

        if(!vendor){
            return res.status(404).json({
                success: false,
                message: 'Vendor not found or already approved'
            })
        }

        // Todo: send rejection meial with reason

        res.status(200).json({
            success: true,
            message: 'Vendor rejected successfully',
            data: vendor
        });

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Server error'
        })

    }
}


// Users

exports.getAllUsers = async (req,res) => {
    try {
        const users = await User.find({}).select('name email role status createdAt').sort({createdAt: -1})

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

// Get admin stats
exports.getAdminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalCustomers,
            vendorStats,
            pendingVendors,
            rejectedVendors,
            approvedVendors,
            suspendedVendors
        ] = await Promise.all([
            // Total users
            User.countDocuments({}),

            // Total customers
            User.countDocuments({role: 'customer'}),

            // Vendor breakdown using aggregation pipeline
            User.aggregate([
                {$match: {role: 'vendor'}},
                {
                    $group: {
                        _id: null,
                        totalVendors: {$sum: 1},
                        approved: {
                            $sum: {
                                $cond: [{$eq: ['$status', 'approved']}, 1, 0]
                            }
                        },
                        pending: {
                            $sum: {
                                $cond: [{$eq: ['$status', 'pending']}, 1, 0]
                            }
                         }
                        },
                        rejected: {
                            $sum: {
                                $cond: [{$eq: ['$status', 'rejected']}, 1, 0]
                            }
                        },
                        suspended: {
                            $sum: {
                                $cond: [{$eq: ['$status', 'suspended']}, 1, 0]
                            }
                        },  
                }
            
            ]),

            // Pending vendors
            User.countDocuments({role: 'vendor', status: 'pending'}),

            // Rejected vendors
            User.countDocuments({role: 'vendor', status: 'rejected'}),

            // Approved vendors            
            User.countDocuments({role: 'vendor', status: 'approved'}),

            // Suspended vendors            
            User.countDocuments({role: 'vendor', status: 'suspended'}),
        ])

        const vendorBreakdown = vendorStats[0] || {
            totalVendors: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            suspended: 0
        }

        const stats = {
            overview: {
                totalUsers,
                totalCustomers,
                totalVendors: vendorBreakdown.totalVendors,
            },
            vendors: {
                approved: vendorBreakdown.approved || approvedVendors,
                pending: vendorBreakdown.pending || pendingVendors,
                rejected: vendorBreakdown.rejected || rejectedVendors,
                suspended: vendorBreakdown.suspended || suspendedVendors
            },
            newRegistrationsToday: await User.countDocuments({
                createdAt: {
                    $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            }),
            timestamp: new Date().toISOString()
        }

        res.status(200).json({
            success: true,
            data: stats
        })

    } catch (error) {
        console.error('Admin stats error: ', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }

}

// Get All Pending Prodcuts
exports.getPendingProducts = async (req,res)=>{
    try {
        const products = await Product.find({status: 'pending'})
            .populate('vendor', 'name shopName email')
            .sort({createdAt: -1})


            res.status(200).json({
                sucess: true,
                count: products.length,
                products
            })

    } catch (error) {
        res.status(500).json({
            sucess: false,
            message: 'Server Error'
        })
    }
}

// Approve Product
exports.approveProducts = async (req,res)=>{
    try {
        const {id} = req.params

    const product = await Product.findByIdAndUpdate(
        id,
        {
            status: 'approved',
            approvedAt: new Date(),
            reviwedBy: req.user.id
        },
        {new:true}
    ).populate('vendor', 'shopName email')


    if(!product){
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }

    // Todo: Vendor ke email pathbo je approve hoise

    res.status(200).json({
        success: true,
        messge: 'Product approved successfully',
        product
    })
    } catch (error) {
        res.status(500).json({
            success: true,
            message: 'Server Error'
        })
    }
}

exports.rejectProduct = async(req,res)=>{
    try {
        const {id} = req.params
        const {reason} = req.body

        if(!reason){
            return res.status(400).json({
                success: false,
                message: 'Rejection reason required'
            })
        }

        const product = await Product.findByIdAndUpdate(
            id,
            {
                status: 'rejected',
                rejectedReason: reason,
                reviwedBy: req.user.id
            },
            {new: true},
        )

        if(!product){
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

         // Todo: Vendor ke email pathbo je reject hoise

         res.status(200).json({
            success: true,
            message: 'Product rejected',
            product
         })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}

exports.getAllProductsAdmin = async (req,res)=>{
    try {
        const {status,page=1,limit=20} = req.query
        const query = status ? {status} : {}

        const products = await Product.find(query)
            .populate('vendor', 'shopName name email')
            .sort({createdAt: -1})
            .skip((page-1)*limit)
            .limit(Number(limit))

            const total = await Product.countDocuments(query)

            res.status(200).json({
                success: true,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: Number(page),
                products
            })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}
