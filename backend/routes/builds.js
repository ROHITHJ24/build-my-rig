const express = require('express');
const Build = require('../models/Build');
const Product = require('../models/Product');
const {
  authenticateToken,
  optionalAuth
} = require('../middleware/auth');
const {
  validateBuild,
  validateMongoId
} = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/builds
// @desc    Get user's saved builds
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search, buildType } = req.query;

    // Build query
    const query = { owner: userId };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (buildType) {
      query.buildType = buildType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const builds = await Build.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('components.CPU.product', 'name brand price thumbnail images')
      .populate('components.Motherboard.product', 'name brand price thumbnail images')
      .populate('components.Memory.product', 'name brand price thumbnail images')
      .populate('components.Storage.product', 'name brand price thumbnail images')
      .populate('components.GPU.product', 'name brand price thumbnail images')
      .populate('components.PSU.product', 'name brand price thumbnail images')
      .populate('components.Case.product', 'name brand price thumbnail images')
      .populate('components.Cooling.product', 'name brand price thumbnail images')
      .lean();

    const total = await Build.countDocuments(query);

    res.json({
      success: true,
      data: {
        builds: builds.map(build => ({
          ...build,
          componentCount: Object.values(build.components).filter(comp => comp && comp.product).length,
          missingComponents: ['CPU', 'Motherboard', 'Memory', 'Storage', 'PSU', 'Case'].filter(
            comp => !build.components[comp] || !build.components[comp].product
          ),
          isCompatible: build.compatibilityStatus.isValid &&
            build.compatibilityStatus.issues.filter(issue => issue.severity === 'error').length === 0
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
    console.error('Get builds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get builds'
    });
  }
});

// @route   GET /api/builds/public
// @desc    Get public builds for browsing
// @access  Public
router.get('/public', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, buildType, sort = 'popular' } = req.query;

    // Build query
    const query = {
      isPublic: true,
      isCompleted: true
    };

    if (buildType) {
      query.buildType = buildType;
    }

    // Sort options
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'price_low':
        sortOptions = { totalPrice: 1 };
        break;
      case 'price_high':
        sortOptions = { totalPrice: -1 };
        break;
      case 'popular':
      default:
        sortOptions = { views: -1, likes: -1 };
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const builds = await Build.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('components.CPU.product', 'name brand price thumbnail images')
      .populate('components.Motherboard.product', 'name brand price thumbnail images')
      .populate('components.Memory.product', 'name brand price thumbnail images')
      .populate('components.Storage.product', 'name brand price thumbnail images')
      .populate('components.GPU.product', 'name brand price thumbnail images')
      .populate('components.PSU.product', 'name brand price thumbnail images')
      .populate('components.Case.product', 'name brand price thumbnail images')
      .populate('components.Cooling.product', 'name brand price thumbnail images')
      .populate('owner', 'firstName lastName')
      .lean();

    const total = await Build.countDocuments(query);

    res.json({
      success: true,
      data: {
        builds: builds.map(build => ({
          ...build,
          componentCount: Object.values(build.components).filter(comp => comp && comp.product).length,
          likeCount: build.likes.length,
          viewCount: build.views
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
    console.error('Get public builds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get public builds'
    });
  }
});

// @route   GET /api/builds/:id
// @desc    Get specific build details
// @access  Private/Public depending on build visibility
router.get('/:id', optionalAuth, validateMongoId('id'), async (req, res) => {
  try {
    const buildId = req.params.id;
    const userId = req.user ? req.user.id : null;

    const build = await Build.findById(buildId)
      .populate('components.CPU.product')
      .populate('components.Motherboard.product')
      .populate('components.Memory.product')
      .populate('components.Storage.product')
      .populate('components.GPU.product')
      .populate('components.PSU.product')
      .populate('components.Case.product')
      .populate('components.Cooling.product')
      .populate('owner', 'firstName lastName')
      .populate('comments.user', 'firstName lastName')
      .populate('forkedFrom', 'name')
      .lean();

    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }

    // Check access permissions
    const isOwner = userId && build.owner._id.toString() === userId;
    const isPublic = build.isPublic;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isPublic && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Increment view count for public builds
    if (isPublic && (!isOwner || !userId)) {
      await Build.findByIdAndUpdate(buildId, { $inc: { views: 1 } });
    }

    // Check if current user liked this build
    let isLiked = false;
    if (userId) {
      isLiked = build.likes.some(like => like.user.toString() === userId);
    }

    res.json({
      success: true,
      data: {
        build: {
          ...build,
          componentCount: Object.values(build.components).filter(comp => comp && comp.product).length,
          missingComponents: ['CPU', 'Motherboard', 'Memory', 'Storage', 'PSU', 'Case'].filter(
            comp => !build.components[comp] || !build.components[comp].product
          ),
          isCompatible: build.compatibilityStatus.isValid &&
            build.compatibilityStatus.issues.filter(issue => issue.severity === 'error').length === 0,
          isLiked,
          likeCount: build.likes.length,
          canEdit: isOwner || isAdmin
        }
      }
    });
  } catch (error) {
    console.error('Get build details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get build details'
    });
  }
});

// @route   POST /api/builds
// @desc    Save a new build
// @access  Private
router.post('/', authenticateToken, validateBuild, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, components, buildType, isPublic, tags } = req.body;

    // Validate components and get product details
    const validatedComponents = {};
    let totalPrice = 0;

    for (const [category, componentData] of Object.entries(components || {})) {
      if (componentData && componentData.productId) {
        const product = await Product.findById(componentData.productId);
        if (!product || !product.isActive) {
          return res.status(400).json({
            success: false,
            message: `Invalid product for ${category}`
          });
        }

        const quantity = componentData.quantity || 1;
        const price = product.currentPrice;

        validatedComponents[category] = {
          product: product._id,
          quantity,
          price,
          addedAt: new Date()
        };

        totalPrice += price * quantity;
      }
    }

    // Create build
    const build = new Build({
      name,
      description,
      owner: userId,
      components: validatedComponents,
      totalPrice,
      totalWattage: calculateWattage(validatedComponents),
      buildType,
      isPublic: isPublic || false,
      tags: tags || [],
      isCompleted: isBuildComplete(validatedComponents)
    });

    await build.save();

    // Add to user's saved builds
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, {
      $push: { savedBuilds: build._id }
    });

    // Populate for response
    await build.populate('components.CPU.product', 'name brand price thumbnail images')
      .populate('components.Motherboard.product', 'name brand price thumbnail images')
      .populate('components.Memory.product', 'name brand price thumbnail images')
      .populate('components.Storage.product', 'name brand price thumbnail images')
      .populate('components.GPU.product', 'name brand price thumbnail images')
      .populate('components.PSU.product', 'name brand price thumbnail images')
      .populate('components.Case.product', 'name brand price thumbnail images')
      .populate('components.Cooling.product', 'name brand price thumbnail images');

    res.status(201).json({
      success: true,
      message: 'Build saved successfully',
      data: {
        build: {
          ...build.toJSON(),
          componentCount: Object.values(build.components).filter(comp => comp && comp.product).length,
          missingComponents: ['CPU', 'Motherboard', 'Memory', 'Storage', 'PSU', 'Case'].filter(
            comp => !build.components[comp] || !build.components[comp].product
          )
        }
      }
    });
  } catch (error) {
    console.error('Save build error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save build'
    });
  }
});

// @route   PUT /api/builds/:id
// @desc    Update a build
// @access  Private
router.put('/:id', authenticateToken, validateMongoId('id'), validateBuild, async (req, res) => {
  try {
    const buildId = req.params.id;
    const userId = req.user.id;
    const { name, description, components, buildType, isPublic, tags } = req.body;

    const build = await Build.findById(buildId);

    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }

    // Check ownership
    if (build.owner.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate components if provided
    if (components) {
      const validatedComponents = {};
      let totalPrice = 0;

      for (const [category, componentData] of Object.entries(components)) {
        if (componentData && componentData.productId) {
          const product = await Product.findById(componentData.productId);
          if (!product || !product.isActive) {
            return res.status(400).json({
              success: false,
              message: `Invalid product for ${category}`
            });
          }

          const quantity = componentData.quantity || 1;
          const price = product.currentPrice;

          validatedComponents[category] = {
            product: product._id,
            quantity,
            price,
            addedAt: new Date()
          };

          totalPrice += price * quantity;
        }
      }

      build.components = validatedComponents;
      build.totalPrice = totalPrice;
      build.totalWattage = calculateWattage(validatedComponents);
      build.isCompleted = isBuildComplete(validatedComponents);
    }

    // Update other fields
    if (name) build.name = name;
    if (description !== undefined) build.description = description;
    if (buildType) build.buildType = buildType;
    if (isPublic !== undefined) build.isPublic = isPublic;
    if (tags) build.tags = tags;

    await build.save();

    res.json({
      success: true,
      message: 'Build updated successfully',
      data: {
        build
      }
    });
  } catch (error) {
    console.error('Update build error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update build'
    });
  }
});

// @route   DELETE /api/builds/:id
// @desc    Delete a build
// @access  Private
router.delete('/:id', authenticateToken, validateMongoId('id'), async (req, res) => {
  try {
    const buildId = req.params.id;
    const userId = req.user.id;

    const build = await Build.findById(buildId);

    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }

    // Check ownership
    if (build.owner.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Build.findByIdAndDelete(buildId);

    // Remove from user's saved builds
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, {
      $pull: { savedBuilds: buildId }
    });

    res.json({
      success: true,
      message: 'Build deleted successfully'
    });
  } catch (error) {
    console.error('Delete build error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete build'
    });
  }
});

// @route   POST /api/builds/:id/validate
// @desc    Validate build compatibility
// @access  Private
router.post('/:id/validate', authenticateToken, validateMongoId('id'), async (req, res) => {
  try {
    const buildId = req.params.id;
    const userId = req.user.id;

    const build = await Build.findById(buildId)
      .populate('components.CPU.product')
      .populate('components.Motherboard.product')
      .populate('components.Memory.product')
      .populate('components.Storage.product')
      .populate('components.GPU.product')
      .populate('components.PSU.product')
      .populate('components.Case.product')
      .populate('components.Cooling.product');

    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }

    // Check ownership
    if (build.owner.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Perform compatibility check
    const compatibilityResult = await validateBuildCompatibility(build.components);

    // Update build compatibility status
    build.compatibilityStatus = {
      isValid: compatibilityResult.isValid,
      issues: compatibilityResult.issues,
      lastChecked: new Date()
    };

    build.compatibilityScore = compatibilityResult.score;

    await build.save();

    res.json({
      success: true,
      message: 'Build validation completed',
      data: {
        compatibility: {
          isValid: compatibilityResult.isValid,
          score: compatibilityResult.score,
          issues: compatibilityResult.issues,
          recommendations: compatibilityResult.recommendations
        }
      }
    });
  } catch (error) {
    console.error('Validate build error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate build'
    });
  }
});

// @route   POST /api/builds/:id/like
// @desc    Like/unlike a public build
// @access  Private
router.post('/:id/like', authenticateToken, validateMongoId('id'), async (req, res) => {
  try {
    const buildId = req.params.id;
    const userId = req.user.id;

    const build = await Build.findById(buildId);

    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }

    if (!build.isPublic) {
      return res.status(400).json({
        success: false,
        message: 'Can only like public builds'
      });
    }

    const existingLike = build.likes.findIndex(like => like.user.toString() === userId);

    if (existingLike !== -1) {
      // Unlike
      build.likes.splice(existingLike, 1);
      await build.save();

      res.json({
        success: true,
        message: 'Build unliked',
        data: {
          liked: false,
          likeCount: build.likes.length
        }
      });
    } else {
      // Like
      build.likes.push({ user: userId, createdAt: new Date() });
      await build.save();

      res.json({
        success: true,
        message: 'Build liked',
        data: {
          liked: true,
          likeCount: build.likes.length
        }
      });
    }
  } catch (error) {
    console.error('Like build error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike build'
    });
  }
});

// @route   POST /api/builds/:id/fork
// @desc    Create a copy of a build
// @access  Private
router.post('/:id/fork', authenticateToken, validateMongoId('id'), async (req, res) => {
  try {
    const buildId = req.params.id;
    const userId = req.user.id;
    const { name } = req.body;

    const originalBuild = await Build.findById(buildId);

    if (!originalBuild) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }

    if (!originalBuild.isPublic && originalBuild.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot fork this build'
      });
    }

    // Create forked build
    const forkedBuild = new Build({
      name: name || `Fork of ${originalBuild.name}`,
      description: originalBuild.description,
      owner: userId,
      components: originalBuild.components,
      totalPrice: originalBuild.totalPrice,
      totalWattage: originalBuild.totalWattage,
      buildType: originalBuild.buildType,
      isPublic: false, // Forked builds are private by default
      tags: originalBuild.tags,
      forkedFrom: originalBuild._id,
      isCompleted: originalBuild.isCompleted
    });

    await forkedBuild.save();

    // Add to user's saved builds
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, {
      $push: { savedBuilds: forkedBuild._id }
    });

    res.status(201).json({
      success: true,
      message: 'Build forked successfully',
      data: {
        build: forkedBuild
      }
    });
  } catch (error) {
    console.error('Fork build error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fork build'
    });
  }
});

// Helper functions
function calculateWattage(components) {
  let wattage = 0;

  Object.values(components).forEach(component => {
    if (component.product) {
      // Simple wattage estimation - in a real app, this would be more sophisticated
      wattage += 50; // Base for any component
    }
  });

  return wattage;
}

function isBuildComplete(components) {
  const requiredComponents = ['CPU', 'Motherboard', 'Memory', 'Storage', 'PSU', 'Case'];
  return requiredComponents.every(comp => components[comp] && components[comp].product);
}

async function validateBuildCompatibility(components) {
  const issues = [];
  let score = 100;

  try {
    // Get component details
    const componentProducts = {};
    for (const [category, componentData] of Object.entries(components)) {
      if (componentData && componentData.product) {
        componentProducts[category] = await Product.findById(componentData.product);
      }
    }

    // CPU-Motherboard socket compatibility
    if (componentProducts.CPU && componentProducts.Motherboard) {
      if (componentProducts.CPU.specifications.socket !== componentProducts.Motherboard.specifications.socket) {
        issues.push({
          componentId: componentProducts.Motherboard._id,
          severity: 'error',
          message: 'CPU socket is incompatible with motherboard socket',
          affectedComponents: [componentProducts.CPU._id, componentProducts.Motherboard._id]
        });
        score -= 50;
      }
    }

    // Memory compatibility
    if (componentProducts.Memory && componentProducts.Motherboard) {
      const memoryType = componentProducts.Memory.specifications.memoryType;
      const boardMemoryType = componentProducts.Motherboard.specifications.memoryType;

      if (memoryType !== boardMemoryType) {
        issues.push({
          componentId: componentProducts.Memory._id,
          severity: 'error',
          message: `Memory type ${memoryType} is incompatible with motherboard ${boardMemoryType}`,
          affectedComponents: [componentProducts.Memory._id, componentProducts.Motherboard._id]
        });
        score -= 40;
      }
    }

    // Power supply wattage check
    if (componentProducts.PSU) {
      const estimatedWattage = calculateWattage(components);
      const psuWattage = componentProducts.PSU.specifications.wattage;

      if (estimatedWattage > psuWattage * 0.8) { // 80% safety margin
        issues.push({
          componentId: componentProducts.PSU._id,
          severity: 'warning',
          message: 'Power supply wattage may be insufficient for this build',
          affectedComponents: [componentProducts.PSU._id]
        });
        score -= 20;
      }
    }

    // Form factor checks
    if (componentProducts.Case && componentProducts.Motherboard) {
      const caseFormFactor = componentProducts.Case.specifications.formFactor;
      const boardFormFactor = componentProducts.Motherboard.specifications.formFactor;

      if (!caseFormFactor.includes(boardFormFactor)) {
        issues.push({
          componentId: componentProducts.Motherboard._id,
          severity: 'error',
          message: `Motherboard form factor ${boardFormFactor} doesn't fit in case ${caseFormFactor}`,
          affectedComponents: [componentProducts.Motherboard._id, componentProducts.Case._id]
        });
        score -= 50;
      }
    }

    return {
      isValid: issues.filter(issue => issue.severity === 'error').length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: generateRecommendations(issues, componentProducts)
    };

  } catch (error) {
    console.error('Compatibility validation error:', error);
    return {
      isValid: false,
      score: 0,
      issues: [{
        componentId: null,
        severity: 'error',
        message: 'Unable to validate compatibility due to an error',
        affectedComponents: []
      }],
      recommendations: []
    };
  }
}

function generateRecommendations(issues, components) {
  const recommendations = [];

  issues.forEach(issue => {
    if (issue.message.includes('socket')) {
      recommendations.push('Ensure CPU and motherboard have matching socket types');
    }
    if (issue.message.includes('Memory type')) {
      recommendations.push('Check motherboard specifications for supported memory types');
    }
    if (issue.message.includes('wattage')) {
      recommendations.push('Consider upgrading to a higher wattage power supply');
    }
    if (issue.message.includes('form factor')) {
      recommendations.push('Verify that all components are compatible with your chosen case size');
    }
  });

  // General recommendations
  if (Object.keys(components).length < 6) {
    recommendations.push('Consider adding more components for a complete build');
  }

  return recommendations;
}

module.exports = router;