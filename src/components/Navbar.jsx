import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/Logo.png';
import { RiShareCircleLine } from "react-icons/ri";


import {
  FaHome,
  FaGamepad,
  FaInfoCircle,
  FaBars,
  FaTimes,
  FaUserPlus,
} from 'react-icons/fa';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!menuOpen) {
        setScrolled(window.scrollY > 50);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  const handleLinkClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const menuItemVariants = {
    closed: { x: -50, opacity: 0 },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    open: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled || menuOpen
          ? 'bg-gray-900/95 backdrop-blur-xl text-white shadow-2xl border-b border-purple-500/20'
          : 'bg-transparent text-white'
          }`}
      >
        {/* Navbar Container */}
        <div className="max-w-screen-xl mx-auto px-6 h-20 flex justify-between items-center relative">
          {/* Logo with Animation */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" onClick={handleLinkClick} className="flex items-center h-12">
              <motion.img
                src={logo}
                alt="POTTA Logo"
                className="h-32 w-auto object-contain filter brightness-110"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <motion.ul
            className="hidden md:flex gap-8 font-semibold items-center"
            initial="hidden"
            animate="visible"
          >
            {[
              { to: "/", icon: FaHome, text: "Home" },
              { href: "#how", icon: FaInfoCircle, text: "How It Works" },
              { href: "#modes", icon: FaGamepad, text: "Game Modes" },
            ].map((item, index) => (
              <motion.li key={item.text}>
                {item.to ? (
                  <Link
                    to={item.to}
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 group relative"
                  >
                    <item.icon className="text-blue-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="relative">
                      {item.text}
                      <motion.span
                        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                      />
                    </span>
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 group relative"
                  >
                    <item.icon className="text-blue-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="relative">
                      {item.text}
                      <motion.span
                        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                      />
                    </span>
                  </a>
                )}
              </motion.li>
            ))}

            {/* Enhanced Join Now Button */}
            <motion.li
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/signup"
                onClick={handleLinkClick}
                className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 px-6 py-3 rounded-xl text-white font-bold shadow-2xl hover:shadow-purple-500/30 overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{ x: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <FaUserPlus className="relative z-10" />
                <span className="relative z-10">Join Now</span>
              </Link>
            </motion.li>

            <motion.li
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/invite"
                onClick={handleLinkClick}
                className="group relative flex items-center gap-1 underline transition-all duration-300 px-6 py-3 rounded-xl text-white font-bold shadow-2xl hover:shadow-purple-500/30 overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{ x: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <FaUserPlus className="relative z-10" />
                <span className="relative z-10 pl-2">Invite</span>
              </Link>
            </motion.li>
          </motion.ul>

          {/* Enhanced Mobile Menu Toggle Button */}
          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl z-[100] relative p-2 rounded-lg bg-white/10 backdrop-blur-sm"
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaTimes className="text-cyan-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaBars className="text-blue-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Enhanced Mobile Menu - Glass Morphism Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Menu Content */}
            <motion.div
              variants={staggerContainer}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden fixed top-0 left-0 w-80 h-full bg-gray-900/95 backdrop-blur-xl text-white p-8 z-40 border-r border-purple-500/20 shadow-2xl"
            >
              {/* Menu Header */}
              <motion.div
                variants={menuItemVariants}
                className="mb-12"
              >
                <Link to="/" onClick={handleLinkClick}>

                </Link>
              </motion.div>

              {/* Menu Items */}
              <motion.ul
                variants={staggerContainer}
                className="space-y-6 text-xl font-semibold"
              >
                {[
                  { to: "/", icon: FaHome, text: "Home" },
                  { href: "#how", icon: FaInfoCircle, text: "How It Works" },
                  { href: "#modes", icon: FaGamepad, text: "Game Modes" },
                ].map((item) => (
                  <motion.li key={item.text} variants={menuItemVariants}>
                    {item.to ? (
                      <Link
                        to={item.to}
                        onClick={handleLinkClick}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                      >
                        <item.icon className="text-2xl text-blue-400 group-hover:text-cyan-400 transition-colors" />
                        <span>{item.text}</span>
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        onClick={handleLinkClick}
                        className="flex items-center gap-5 p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                      >
                        <item.icon className="text-2xl text-blue-400 group-hover:text-cyan-400 transition-colors" />
                        <span>{item.text}</span>
                      </a>
                    )}
                  </motion.li>
                ))}

                {/* Mobile Join Now Button */}
                <div>
                  <motion.li variants={menuItemVariants}>
                    <Link
                      to="/invite"
                      onClick={handleLinkClick}
                      className="group relative flex items-center gap-1 underline transition-all duration-300 px-6 py-3 rounded-xl text-white font-bold shadow-2xl hover:shadow-purple-500/30 overflow-hidden"
                    >
                      <motion.span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={{ x: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <RiShareCircleLine className="relative z-10" />
                  
                      <span className="relative z-10 pl-2">Invite</span>
                    </Link>

                  </motion.li>

                  <motion.li variants={menuItemVariants}>
                    <Link
                      to="/signup"
                      onClick={handleLinkClick}
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 p-4 rounded-xl text-white font-bold mt-8 shadow-2xl hover:shadow-purple-500/30"
                    >
                      <FaUserPlus />
                      <span>Join Now</span>
                    </Link>
                  </motion.li>


                </div>


              </motion.ul>

              {/* Footer Text */}
              <motion.div
                variants={menuItemVariants}
                className="absolute bottom-8 left-8 right-8 text-center"
              >
                <p className="text-gray-400 text-sm">
                  Where Skill Meets Stakes
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;