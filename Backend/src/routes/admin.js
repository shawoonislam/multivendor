const express = require('express');
const router = express.Router();
const {protect,restrictTo} = require('../middlewares/auth');
const { approveVendor, getPendingVendors, getAllVendors, getApprovedVendors, getRejectedVendors, rejectVendor, getAdminStats, getPendingProducts, getAllProductsAdmin, approveProducts, rejectProduct } = require('../controllers/adminController');



// All admin routes protected + only admin access
router.use(protect, restrictTo('admin'));

// Vendor management routes
router.get('/vendors/pending', getPendingVendors);
router.get('/vendors/all', getAllVendors);
router.get('/vendors/approved', getApprovedVendors);
router.get('/vendors/rejected', getRejectedVendors);
router.patch('/vendors/:id/approve', approveVendor);
router.patch('/vendors/:id/reject', rejectVendor);

router.get('/stats', getAdminStats)

// Product management routes
router.get('/products/pending', getPendingProducts)
router.get('/products/all', getAllProductsAdmin)
router.patch('/products/:id/approve', approveProducts)
router.patch('/products/:id/reject', rejectProduct)


// Basic user management
router.get('/users/all', getAllUsers);

module.exports = router;