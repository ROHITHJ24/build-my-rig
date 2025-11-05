const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  // CPU specific
  socket: String,
  cores: Number,
  threads: Number,
  baseClock: Number,
  boostClock: Number,
  tdp: Number,
  cache: String,

  // Motherboard specific
  chipset: String,
  formFactor: String,
  memorySlots: Number,
  maxMemory: Number,
  memoryType: String,
  expansionSlots: [String],

  // Memory specific
  memoryType: String,
  capacity: Number,
  speed: Number,
  casLatency: Number,
  modules: Number,
  timing: String,

  // Storage specific
  storageType: String,
  capacity: Number,
  interface: String,
  readSpeed: Number,
  writeSpeed: Number,
  formFactor: String,

  // GPU specific
  chipset: String,
  memory: Number,
  coreClock: Number,
  boostClock: Number,
  memoryType: String,
  interfaces: [String],
  powerConnectors: String,
  tdp: Number,

  // PSU specific
  wattage: Number,
  efficiency: String,
  modular: Boolean,
  formFactor: String,

  // Case specific
  formFactor: String,
  material: String,
  dimensions: {
    width: Number,
    height: Number,
    depth: Number
  },
  weight: Number,

  // Cooling specific
  type: String,
  size: Number,
  rpmMin: Number,
  rpmMax: Number,
  noiseLevel: Number,

  // Common specifications
  color: String,
  warranty: Number,
  manufacturerUrl: String
}, { _id: false });

const compatibilityInfoSchema = new mongoose.Schema({
  socket: [String],
  formFactor: [String],
  memoryType: [String],
  powerRequirements: {
    minimumWattage: Number,
    recommendedWattage: Number
  },
  compatibility: [{
    component: String,
    requirements: mongoose.Schema.Types.Mixed
  }]
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [100, 'Brand cannot exceed 100 characters']
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['CPU', 'Motherboard', 'Memory', 'Storage', 'GPU', 'PSU', 'Case', 'Cooling', 'Pre-Built']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  features: [{
    type: String,
    trim: true
  }],
  specifications: specificationSchema,
  compatibilityInfo: compatibilityInfoSchema,
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Please provide valid image URLs'
    }
  }],
  thumbnail: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Please provide valid thumbnail URL'
    }
  },
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: true
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discounted price
productSchema.virtual('currentPrice').get(function() {
  return this.salePrice && this.salePrice < this.price ? this.salePrice : this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.salePrice || this.salePrice >= this.price) return 0;
  return Math.round(((this.price - this.salePrice) / this.price) * 100);
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
  return this.stockQuantity > 0;
});

// Virtual for low stock warning
productSchema.virtual('isLowStock').get(function() {
  return this.stockQuantity > 0 && this.stockQuantity < 5;
});

// Text indexes for search functionality
productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  model: 'text'
});

// Compound indexes
productSchema.index({ category: 1, price: 1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ createdAt: -1 });

// Static method to search products
productSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    ...filters,
    $text: { $search: query }
  };

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

// Pre-save middleware to set default thumbnail
productSchema.pre('save', function(next) {
  if (!this.thumbnail && this.images.length > 0) {
    this.thumbnail = this.images[0];
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);