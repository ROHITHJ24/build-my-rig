const express = require('express');
const Product = require('../models/Product');
const Review = require('../models/Review');
const {
  authenticateToken,
  optionalAuth,
  requireAdmin
} = require('../middleware/auth');
const {
  validateProduct,
  validateMongoId,
  validateSearch,
  validateReview
} = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/products
// @desc    Get products with filtering and pagination
// @access  Public
router.get('/', optionalAuth, validateSearch, async (req, res) => {
  try {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sort = 'name_asc',
      featured,
      inStock
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Brand filter
    if (brand) {
      query.brand = new RegExp(brand, 'i');
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Stock filter
    if (inStock === 'true') {
      query.stockQuantity = { $gt: 0 };
    }

    // Sort options
    let sortOptions = {};
    switch (sort) {
      case 'price_asc':
        sortOptions = { currentPrice: 1 };
        break;
      case 'price_desc':
        sortOptions = { currentPrice: -1 };
        break;
      case 'name_asc':
        sortOptions = { name: 1 };
        break;
      case 'name_desc':
        sortOptions = { name: -1 };
        break;
      case 'rating_desc':
        sortOptions = { 'ratings.average': -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { name: 1 };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reviews', 'rating')
      .lean();

    // Get total count
    const total = await Product.countDocuments(query);

    // Add search score if text search
    if (q) {
      const productsWithScore = await Product.find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reviews', 'rating')
        .lean();

      return res.json({
        success: true,
        data: {
          products: productsWithScore.map(product => ({
            ...product,
            inStock: product.stockQuantity > 0,
            isLowStock: product.stockQuantity > 0 && product.stockQuantity < 5,
            discountPercentage: product.salePrice && product.salePrice < product.price
              ? Math.round(((product.price - product.salePrice) / product.price) * 100)
              : 0
          })),
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total,
            limit: parseInt(limit)
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        products: products.map(product => ({
          ...product,
          inStock: product.stockQuantity > 0,
          isLowStock: product.stockQuantity > 0 && product.stockQuantity < 5,
          discountPercentage: product.salePrice && product.salePrice < product.price
            ? Math.round(((product.price - product.salePrice) / product.price) * 100)
            : 0
        })),
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products'
    });
  }
});

// @route   GET /api/products/search
// @desc    Search products with advanced search
// @access  Public
router.get('/search', optionalAuth, validateSearch, async (req, res) => {
  try {
    const { q, category, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const query = {
      isActive: true,
      $text: { $search: q }
    };

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .select('name brand price salePrice thumbnail images category ratings stockQuantity')
      .lean();

    res.json({
      success: true,
      data: {
        products: products.map(product => ({
          ...product,
          inStock: product.stockQuantity > 0,
          currentPrice: product.salePrice && product.salePrice < product.price ? product.salePrice : product.price
        }))
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isActive: true,
      isFeatured: true
    })
    .sort({ 'ratings.average': -1, createdAt: -1 })
    .limit(parseInt(limit))
    .select('name brand price salePrice thumbnail images category ratings stockQuantity')
    .lean();

    res.json({
      success: true,
      data: {
        products: products.map(product => ({
          ...product,
          inStock: product.stockQuantity > 0,
          currentPrice: product.salePrice && product.salePrice < product.price ? product.salePrice : product.price,
          discountPercentage: product.salePrice && product.salePrice < product.price
            ? Math.round(((product.price - product.salePrice) / product.price) * 100)
            : 0
        }))
      }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured products'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get product categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });

    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({
          category,
          isActive: true
        });
        return { category, count };
      })
    );

    res.json({
      success: true,
      data: {
        categories: categoryStats
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories'
    });
  }
});

// @route   GET /api/products/brands
// @desc    Get product brands
// @access  Public
router.get('/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });

    const brandStats = await Promise.all(
      brands.map(async (brand) => {
        const count = await Product.countDocuments({
          brand,
          isActive: true
        });
        return { brand, count };
      })
    );

    res.json({
      success: true,
      data: {
        brands: brandStats.sort((a, b) => a.brand.localeCompare(b.brand))
      }
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get brands'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product details
// @access  Public
router.get('/:id', optionalAuth, validateMongoId('id'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews', 'rating title content user createdAt')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      });

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get related products (same category, different product)
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
    .limit(8)
    .select('name brand price salePrice thumbnail images category ratings stockQuantity')
    .lean();

    res.json({
      success: true,
      data: {
        product: {
          ...product.toJSON(),
          inStock: product.stockQuantity > 0,
          isLowStock: product.stockQuantity > 0 && product.stockQuantity < 5,
          currentPrice: product.salePrice && product.salePrice < product.price ? product.salePrice : product.price,
          discountPercentage: product.salePrice && product.salePrice < product.price
            ? Math.round(((product.price - product.salePrice) / product.price) * 100)
            : 0
        },
        relatedProducts: relatedProducts.map(p => ({
          ...p,
          currentPrice: p.salePrice && p.salePrice < p.price ? p.salePrice : p.price
        }))
      }
    });
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product details'
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin only)
router.post('/', authenticateToken, requireAdmin, validateProduct, async (req, res) => {
  try {
    const productData = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Admin only)
router.put('/:id', authenticateToken, requireAdmin, validateMongoId('id'), validateProduct, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if SKU conflicts with another product
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (soft delete)
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateMongoId('id'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Add a review to a product
// @access  Private
router.post('/:id/reviews', authenticateToken, validateMongoId('id'), validateReview, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const { rating, title, content, isRecommended, pros, cons } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Create review
    const review = new Review({
      product: productId,
      user: userId,
      rating,
      title,
      content,
      isRecommended,
      pros: pros || [],
      cons: cons || []
    });

    await review.save();

    // Update product ratings
    await Review.calculateProductRating(productId);

    // Populate review data for response
    await review.populate('user', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: {
        review
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
});

// @route   GET /api/products/:id/reviews
// @desc    Get reviews for a product
// @access  Public
router.get('/:id/reviews', validateMongoId('id'), async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const productId = req.params.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Sort options
    let sortOptions = {};
    switch (sort) {
      case 'rating_high':
        sortOptions = { rating: -1 };
        break;
      case 'rating_low':
        sortOptions = { rating: 1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({
      product: productId,
      isHidden: false
    })
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'firstName lastName')
    .populate('response.respondedBy', 'firstName lastName')
    .lean();

    const total = await Review.countDocuments({
      product: productId,
      isHidden: false
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews'
    });
  }
});

module.exports = router;