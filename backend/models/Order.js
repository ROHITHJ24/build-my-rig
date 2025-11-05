const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  buildId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Build'
  }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'USA' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: String,
  phone: String
}, { _id: false });

const paymentDetailsSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['stripe', 'paypal', 'cash_on_delivery'],
    required: true
  },
  stripePaymentIntentId: String,
  paypalOrderId: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  amount: Number,
  currency: {
    type: String,
    default: 'USD'
  },
  transactionId: String,
  failureReason: String,
  refundedAt: Date,
  refundAmount: Number,
  paymentDate: Date
}, { _id: false });

const shippingInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['standard', 'express', 'overnight']
  },
  carrier: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  cost: {
    type: Number,
    required: true,
    min: [0, 'Shipping cost cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'returned'],
    default: 'pending'
  },
  shippedAt: Date,
  deliveredAt: Date
}, { _id: false });

const orderStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return `PCF${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  taxRate: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.08
  },
  shipping: {
    type: Number,
    required: true,
    min: [0, 'Shipping cost cannot be negative'],
    default: 0
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    default: 0
  },
  discountCode: String,
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  orderStatus: [orderStatusSchema],
  currentStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  payment: paymentDetailsSchema,
  shippingInfo: shippingInfoSchema,
  notes: String,
  priority: {
    type: String,
    enum: ['normal', 'high', 'express'],
    default: 'normal'
  },
  source: {
    type: String,
    enum: ['website', 'mobile', 'admin'],
    default: 'website'
  },
  promotionalCode: String,
  giftWrap: {
    requested: {
      type: Boolean,
      default: false
    },
    message: String,
    cost: {
      type: Number,
      default: 0
    }
  },
  estimatedDelivery: Date,
  cancelledAt: Date,
  cancellationReason: String,
  returnedAt: Date,
  returnReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

orderSchema.virtual('isShipped').get(function() {
  return this.currentStatus === 'shipped' || this.currentStatus === 'delivered';
});

orderSchema.virtual('isDelivered').get(function() {
  return this.currentStatus === 'delivered';
});

orderSchema.virtual('isCancelled').get(function() {
  return this.currentStatus === 'cancelled';
});

orderSchema.virtual('isReturnable').get(function() {
  return this.isDelivered &&
         this.deliveredAt &&
         (Date.now() - this.deliveredAt.getTime()) < (30 * 24 * 60 * 60 * 1000); // 30 days
});

orderSchema.virtual('canCancel').get(function() {
  return ['pending', 'confirmed'].includes(this.currentStatus);
});

// Methods
orderSchema.methods.updateStatus = function(status, note = '', updatedBy = null) {
  this.currentStatus = status;
  this.orderStatus.push({
    status,
    note,
    updatedBy,
    timestamp: new Date()
  });

  // Update specific timestamps
  if (status === 'cancelled') {
    this.cancelledAt = new Date();
  } else if (status === 'delivered') {
    this.deliveredAt = new Date();
    this.shippingInfo.actualDelivery = new Date();
    this.shippingInfo.status = 'delivered';
  } else if (status === 'shipped') {
    this.shippingInfo.shippedAt = new Date();
    this.shippingInfo.status = 'shipped';
  }
};

orderSchema.methods.calculateTotals = function() {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => total + item.subtotal, 0);

  // Calculate tax
  this.tax = this.subtotal * this.taxRate;

  // Calculate total
  this.total = this.subtotal + this.tax + this.shipping - this.discount;
};

orderSchema.methods.addItem = function(product, quantity = 1, buildId = null) {
  const existingItem = this.items.find(item => item.product.toString() === product._id.toString());

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.subtotal = existingItem.price * existingItem.quantity;
  } else {
    this.items.push({
      product: product._id,
      name: product.name,
      sku: product.sku,
      price: product.currentPrice,
      quantity,
      subtotal: product.currentPrice * quantity,
      buildId
    });
  }

  this.calculateTotals();
};

orderSchema.methods.removeItem = function(productId, quantity = null) {
  const itemIndex = this.items.findIndex(item => item.product.toString() === productId.toString());

  if (itemIndex !== -1) {
    const item = this.items[itemIndex];

    if (quantity === null || quantity >= item.quantity) {
      // Remove the entire item
      this.items.splice(itemIndex, 1);
    } else {
      // Reduce quantity
      item.quantity -= quantity;
      item.subtotal = item.price * item.quantity;
    }

    this.calculateTotals();
  }
};

// Pre-save middleware
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.calculateTotals();
  }

  // Set initial order status if not set
  if (this.orderStatus.length === 0) {
    this.orderStatus.push({
      status: 'pending',
      timestamp: new Date()
    });
  }

  next();
});

// Indexes
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ currentStatus: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });

// Static methods
orderSchema.statics.findByCustomer = function(customerId, options = {}) {
  const { page = 1, limit = 10, status } = options;
  const query = { customer: customerId };

  if (status) {
    query.currentStatus = status;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('items.product', 'name images');
};

module.exports = mongoose.model('Order', orderSchema);