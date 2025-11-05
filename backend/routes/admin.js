const express = require('express');
const {
  authenticateToken,
  requireAdmin
} = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalOrders: 0,
      totalRevenue: 0,
      totalUsers: 0,
      totalProducts: 0
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin statistics'
    });
  }
});

module.exports = router;