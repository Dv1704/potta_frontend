import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/Logo.png';
import { RiShareCircleLine } from "react-icons/ri";


import {
  FaHome,
  FaGamepad,
  FaInfoCircle,
  FaBars,
  FaTimes,
  FaUserPlus,
  FaTrophy,
  FaWallet
} from 'react-icons/fa';

const Navbar = () => {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
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
          ? 'bg-black/90 backdrop-blur-2xl text-white shadow-2xl border-b border-emerald-500/20'
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
                className="h-28 w-auto object-contain brightness-110"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <motion.ul
            className="hidden md:flex gap-6 font-black items-center italic uppercase tracking-tighter"
            initial="hidden"
            animate="visible"
          >
            {[
              { to: "/", icon: FaHome, text: "Arena" },
              { href: "/#how", icon: FaInfoCircle, text: "Protocol" },
              { href: "/#modes", icon: FaGamepad, text: "Lobby" },
            ].map((item, index) => (
              <motion.li key={item.text}>
                {item.to ? (
                  <Link
                    to={item.to}
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg hover:text-emerald-400 transition-all duration-300 group relative"
                  >
                    <item.icon className="text-emerald-500" />
                    <span>{item.text}</span>
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg hover:text-emerald-400 transition-all duration-300 group relative"
                  >
                    <item.icon className="text-emerald-500" />
                    <span>{item.text}</span>
                  </a>
                )}
              </motion.li>
            ))}

            {/* Wallet Quick Link for Auth Users */}
            {token && (
              <motion.li>
                <Link to="/wallet" className="flex items-center gap-2 px-3 py-1 hover:text-emerald-400 text-yellow-500 transition-all">
                  <FaWallet />
                  <span>Wallet</span>
                </Link>
              </motion.li>
            )}

            {/* Dashboard / Auth Actions */}
            <motion.li
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {token ? (
                <Link
                  to="/dashboard"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-400"
                >
                  <FaTrophy />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/signup"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl font-black shadow-xl transition-all hover:bg-emerald-400"
                >
                  <FaUserPlus />
                  <span>Join Club</span>
                </Link>
              )}
            </motion.li>

            {token && (
              <motion.li>
                <button
                  onClick={() => {
                    logout();
                    handleLinkClick();
                    navigate('/');
                  }}
                  className="text-gray-400 hover:text-red-400 px-3 transition-colors"
                >
                  ESC
                </button>
              </motion.li>
            )}
          </motion.ul>

          {/* Enhanced Mobile Menu Toggle Button */}
          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl z-[100] relative p-2 rounded-lg bg-emerald-500/10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {menuOpen ? <FaTimes className="text-emerald-400" /> : <FaBars className="text-emerald-500" />}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            />

            <motion.div
              variants={staggerContainer}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden fixed top-0 right-0 w-72 h-full bg-[#052e16] p-8 z-40 border-l border-emerald-500/20 shadow-2xl flex flex-col pt-24"
            >
              <ul className="space-y-6 text-2xl font-black italic uppercase tracking-tighter">
                {[
                  { to: "/", icon: FaHome, text: "Arena" },
                  { href: "/#how", icon: FaInfoCircle, text: "Protocol" },
                  { href: "/#modes", icon: FaGamepad, text: "Lobby" },
                ].map((item) => (
                  <motion.li key={item.text} variants={menuItemVariants}>
                    {item.to ? (
                      <Link to={item.to} onClick={handleLinkClick} className="flex items-center gap-4 text-white hover:text-emerald-400">
                        <item.icon className="text-emerald-500" />
                        <span>{item.text}</span>
                      </Link>
                    ) : (
                      <a href={item.href} onClick={handleLinkClick} className="flex items-center gap-4 text-white hover:text-emerald-400">
                        <item.icon className="text-emerald-500" />
                        <span>{item.text}</span>
                      </a>
                    )}
                  </motion.li>
                ))}

                <motion.li variants={menuItemVariants}>
                  <Link
                    to={token ? "/dashboard" : "/signup"}
                    onClick={handleLinkClick}
                    className="flex items-center justify-center gap-3 bg-emerald-500 text-black p-4 rounded-2xl w-full mt-8"
                  >
                    <span>{token ? 'Go to Dashboard' : 'Join Now'}</span>
                  </Link>
                </motion.li>

                {token && (
                  <motion.li variants={menuItemVariants}>
                    <button
                      onClick={() => { logout(); handleLinkClick(); navigate('/'); }}
                      className="w-full text-red-500 border-2 border-red-500/20 p-4 rounded-2xl"
                    >
                      LOGOUT
                    </button>
                  </motion.li>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;