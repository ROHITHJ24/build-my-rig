import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Heart,
  Star,
  ExternalLink,
  AlertTriangle,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProductCard = ({
  product,
  onAddToCart,
  onAddToBuild,
  onToggleWishlist,
  isInWishlist = false,
  showAddToBuild = true,
  className = ''
}) => {
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToBuild, setIsAddingToBuild] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart || !product.inStock) return;

    setIsAddingToCart(true);
    try {
      await onAddToCart?.(product);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToBuild = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToBuild || !product.inStock) return;

    setIsAddingToBuild(true);
    try {
      await onAddToBuild?.(product);
    } finally {
      setIsAddingToBuild(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = !isWishlisted;
    setIsWishlisted(newState);
    try {
      await onToggleWishlist?.(product, newState);
    } catch (error) {
      // Revert state if operation fails
      setIsWishlisted(!newState);
    }
  };

  const renderRating = () => {
    const rating = product.ratings?.average || 0;
    const count = product.ratings?.count || 0;

    if (count === 0) return null;

    return (
      <div className="flex items-center space-x-1">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < Math.floor(rating)
                  ? 'text-yellow-400 fill-current'
                  : index < rating
                  ? 'text-yellow-400 fill-current opacity-50'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)} ({count})
        </span>
      </div>
    );
  };

  const renderPrice = () => {
    const hasDiscount = product.discountPercentage > 0;

    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg font-bold text-gray-900">
          ${product.currentPrice?.toFixed(2) || '0.00'}
        </span>
        {hasDiscount && (
          <>
            <span className="text-sm text-gray-500 line-through">
              ${product.price?.toFixed(2) || '0.00'}
            </span>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
              -{product.discountPercentage}%
            </span>
          </>
        )}
      </div>
    );
  };

  const renderStockStatus = () => {
    if (!product.inStock) {
      return (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Out of Stock</span>
        </div>
      );
    }

    if (product.isLowStock) {
      return (
        <div className="flex items-center space-x-1 text-orange-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Only {product.stockQuantity} left</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1 text-green-600">
        <Package className="w-4 h-4" />
        <span className="text-sm font-medium">In Stock</span>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden group">
        <Link to={`/products/${product._id}`} className="block w-full h-full">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </Link>

        {/* Overlay Actions */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2">
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </button>

          {/* Quick View Button */}
          <Link
            to={`/products/${product._id}`}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            aria-label="View details"
          >
            <ExternalLink className="w-4 h-4 text-gray-600 hover:text-blue-600" />
          </Link>
        </div>

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discountPercentage}%
          </div>
        )}

        {/* New Badge */}
        {product.isNew && (
          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            NEW
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand and Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.brand}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <Link
          to={`/products/${product._id}`}
          className="block mb-2 group"
        >
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {renderRating()}

        {/* Price */}
        <div className="mt-2 mb-3">
          {renderPrice()}
        </div>

        {/* Stock Status */}
        <div className="mb-3">
          {renderStockStatus()}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              !product.inStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isAddingToCart
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          {/* Add to Build */}
          {showAddToBuild && product.category !== 'Pre-Built' && (
            <button
              onClick={handleAddToBuild}
              disabled={!product.inStock || isAddingToBuild}
              className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                !product.inStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isAddingToBuild
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              title="Add to PC Build"
            >
              {isAddingToBuild ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Key Specifications (for components) */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 space-y-1">
              {product.category === 'CPU' && product.specifications.cores && (
                <div>{product.specifications.cores} Cores, {product.specifications.threads} Threads</div>
              )}
              {product.category === 'Memory' && product.specifications.capacity && (
                <div>{product.specifications.capacity}GB {product.specifications.memoryType}</div>
              )}
              {product.category === 'Storage' && product.specifications.capacity && (
                <div>{product.specifications.capacity}GB {product.specifications.storageType}</div>
              )}
              {product.category === 'GPU' && product.specifications.memory && (
                <div>{product.specifications.memory}GB VRAM</div>
              )}
              {product.category === 'PSU' && product.specifications.wattage && (
                <div>{product.specifications.wattage}W {product.specifications.efficiency}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;