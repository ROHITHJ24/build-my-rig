const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const compatibilityIssueSchema = new mongoose.Schema({
  componentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  severity: {
    type: String,
    enum: ['error', 'warning', 'info'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  affectedComponents: [{
    type: mongoose.Schema.Types.ObjectId
  }]
}, { _id: false });

const buildSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Build name is required'],
    trim: true,
    maxlength: [100, 'Build name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  components: {
    CPU: componentSchema,
    Motherboard: componentSchema,
    Memory: componentSchema,
    Storage: componentSchema,
    GPU: componentSchema,
    PSU: componentSchema,
    Case: componentSchema,
    Cooling: componentSchema
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative'],
    default: 0
  },
  totalWattage: {
    type: Number,
    required: true,
    min: [0, 'Total wattage cannot be negative'],
    default: 0
  },
  compatibilityStatus: {
    isValid: {
      type: Boolean,
      default: true
    },
    issues: [compatibilityIssueSchema],
    lastChecked: {
      type: Date,
      default: Date.now
    }
  },
  buildType: {
    type: String,
    enum: ['gaming', 'productivity', 'budget', 'high-end', 'custom'],
    default: 'custom'
  },
  budget: {
    min: Number,
    max: Number
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  forkedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Build'
  },
  benchmarks: {
    gamingScore: Number,
    productivityScore: Number,
    expectedFPS: {
      low: Number,
      medium: Number,
      high: Number,
      ultra: Number
    }
  },
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for component count
buildSchema.virtual('componentCount').get(function() {
  return Object.values(this.components).filter(comp => comp && comp.product).length;
});

// Virtual for missing components
buildSchema.virtual('missingComponents').get(function() {
  const requiredComponents = ['CPU', 'Motherboard', 'Memory', 'Storage', 'PSU', 'Case'];
  return requiredComponents.filter(comp => !this.components[comp] || !this.components[comp].product);
});

// Virtual for estimated performance score
buildSchema.virtual('performanceScore').get(function() {
  if (!this.benchmarks) return 0;
  return (this.benchmarks.gamingScore || 0 + this.benchmarks.productivityScore || 0) / 2;
});

// Virtual for is fully compatible
buildSchema.virtual('isCompatible').get(function() {
  return this.compatibilityStatus.isValid && this.compatibilityStatus.issues.filter(issue => issue.severity === 'error').length === 0;
});

// Method to check if build has all required components
buildSchema.methods.isComplete = function() {
  const requiredComponents = ['CPU', 'Motherboard', 'Memory', 'Storage', 'PSU', 'Case'];
  return requiredComponents.every(comp => this.components[comp] && this.components[comp].product);
};

// Method to add or update a component
buildSchema.methods.addComponent = function(category, product, quantity = 1) {
  this.components[category] = {
    product: product._id,
    quantity,
    price: product.currentPrice,
    addedAt: new Date()
  };
  this.recalculateTotals();
};

// Method to remove a component
buildSchema.methods.removeComponent = function(category) {
  if (this.components[category]) {
    delete this.components[category];
    this.recalculateTotals();
  }
};

// Method to recalculate total price
buildSchema.methods.recalculateTotals = function() {
  let totalPrice = 0;
  let totalWattage = 0;

  Object.values(this.components).forEach(component => {
    if (component && component.product) {
      totalPrice += component.price * component.quantity;
      // Add estimated wattage based on component type
      // This would be more sophisticated in a real implementation
      switch (true) {
        case component.category === 'CPU':
          totalWattage += 65; // Average CPU wattage
          break;
        case component.category === 'GPU':
          totalWattage += 150; // Average GPU wattage
          break;
        default:
          totalWattage += 50; // Default for other components
      }
    }
  });

  this.totalPrice = totalPrice;
  this.totalWattage = totalWattage;
};

// Pre-save middleware to recalculate totals
buildSchema.pre('save', function(next) {
  if (this.isModified('components')) {
    this.recalculateTotals();
  }
  next();
});

// Compound indexes
buildSchema.index({ owner: 1, createdAt: -1 });
buildSchema.index({ isPublic: 1, isCompleted: 1 });
buildSchema.index({ buildType: 1, totalPrice: 1 });

// Static method to find public builds
buildSchema.statics.findPublic = function(limit = 10) {
  return this.find({ isPublic: true, isCompleted: true })
    .sort({ likes: -1, views: -1 })
    .limit(limit)
    .populate('components.product', 'name brand price images')
    .populate('owner', 'firstName lastName');
};

module.exports = mongoose.model('Build', buildSchema);