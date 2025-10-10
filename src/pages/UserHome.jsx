import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import FeaturedParts from '../components/FeaturedParts';
import HowItWorks from '../components/HowItWorks';
import PopularBuilds from '../components/PopularBuilds';
import Footer from '../components/Footer';
import Cart from './Cart';

const UserHome = () => {
  return (
    <div className="h-screen  ">


      <Hero />
     
      <Features />
      <Cart />
      <FeaturedParts />
      <HowItWorks />
      <PopularBuilds />
      <Footer />
    </div>
  );
};

export default UserHome ;
