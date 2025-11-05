import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Star,
  Shield,
  Truck,
  Cpu,
  Monitor,
  Zap,
  Package,
  ChevronRight,
  Check,
  TrendingUp,
  Award,
  Users,
  Headphones
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../utils/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getFeaturedProducts({ limit: 8 });

        if (response.success) {
          setFeaturedProducts(response.data.products);
        } else {
          throw new Error(response.message || 'Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = async (product) => {
    console.log('Adding to cart:', product.name);
    // TODO: Implement cart functionality
  };

  const handleAddToBuild = async (product) => {
    console.log('Adding to build:', product.name);
    // TODO: Implement build functionality
  };

  const categories = [
    {
      name: 'Processors',
      icon: Cpu,
      description: 'High-performance CPUs for every budget',
      link: '/products?category=CPU'
    },
    {
      name: 'Graphics Cards',
      icon: Monitor,
      description: 'Latest GPUs for gaming and creative work',
      link: '/products?category=GPU'
    },
    {
      name: 'Memory',
      icon: Zap,
      description: 'Fast RAM for smooth multitasking',
      link: '/products?category=Memory'
    },
    {
      name: 'Storage',
      icon: Package,
      description: 'SSD and HDD options for all needs',
      link: '/products?category=Storage'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Compatibility Guarantee',
      description: 'All components are tested for perfect compatibility'
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders over $99 within the continental US'
    },
    {
      icon: Award,
      title: 'Expert Support',
      description: 'Get help from our PC building experts'
    },
    {
      icon: Users,
      title: 'Community Builds',
      description: 'Browse and share custom PC configurations'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Gaming Enthusiast',
      content: 'Built my dream gaming rig with PC|Forge. The compatibility checker saved me from making costly mistakes!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Content Creator',
      content: 'Great prices and excellent customer service. My video editing workstation is blazing fast!',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'First-Time Builder',
      content: 'Never built a PC before, but the guided builder made it easy. Loving my new computer!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Build Your Dream
                <span className="text-blue-300"> PC</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Custom PC building made simple. Expert guidance, compatibility checking, and the best components all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/builder"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Start Building
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors border border-blue-400"
                >
                  Browse Products
                  <Package className="ml-2 w-5 h-5" />
                </Link>
              </div>
              <div className="mt-8 flex items-center space-x-8">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 bg-blue-300 rounded-full border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-xs font-semibold text-blue-800">
                        {String.fromCharCode(65 + i)}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-300">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-blue-100">
                    <strong>10,000+</strong> happy builders
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-full flex items-center justify-center">
                  <div className="text-center">
                    <Cpu className="w-24 h-24 mx-auto mb-4 text-white" />
                    <h3 className="text-2xl font-bold mb-2">Smart Builder</h3>
                    <p className="text-blue-100">
                      Real-time compatibility checking
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PC|Forge?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make PC building accessible to everyone with expert guidance and guaranteed compatibility.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect components for your build from our curated selection.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group bg-gray-50 rounded-lg p-6 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center mb-4">
                  <category.icon className="w-8 h-8 text-blue-600 group-hover:text-blue-700" />
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 ml-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600">
                Hand-picked components for the best performance and value.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Failed to load products</p>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToBuild={handleAddToBuild}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Builders Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who built their dream PCs with us.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Build Your Perfect PC?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join our community of PC builders and get started today with expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/builder"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Start Building Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-lg hover:bg-white/10 transition-colors border border-white/30"
              >
                <Headphones className="mr-2 w-5 h-5" />
                Get Expert Help
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;