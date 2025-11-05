const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: [200, 'Pro cannot exceed 200 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [200, 'Con cannot exceed 200 characters']
  }],
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  isRecommended: {
    type: Boolean,
    required: true
  },
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  reported: {
    type: Boolean,
    default: false
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes to ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ verified: 1, rating: -1 });
reviewSchema.index({ createdAt: -1 });

// Pre-save middleware
reviewSchema.pre('save', async function(next) {
  if (this.isNew && this.order) {
    // Mark as verified if the review is from a confirmed order
    const Order = mongoose.model('Order');
    const order = await Order.findById(this.order);
    if (order && order.currentStatus === 'delivered') {
      this.verified = true;
    }
  }
  next();
});

// Static methods
reviewSchema.statics.calculateProductRating = async function(productId) {
  const result = await this.aggregate([
    { $match: { product: productId, isHidden: false } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const stats = result[0] || { averageRating: 0, totalReviews: 0 };

  await mongoose.model('Product').updateOne(
    { _id: productId },
    {
      $set: {
        'ratings.average': Math.round(stats.averageRating * 100) / 100,
        'ratings.count': stats.totalReviews
      }
    }
  );

  return stats;
};

module.exports = mongoose.model('Review', reviewSchema);