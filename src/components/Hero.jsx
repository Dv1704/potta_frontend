import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Link } from 'react-router-dom';
import { FaPlayCircle, FaGamepad, FaShieldAlt, FaTrophy, FaBolt } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
  const { token } = useAuth();

  return (
    <section className="min-h-screen bg-[#052e16] pt-20 relative overflow-hidden flex items-center">

      {/* Premium Felt Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/felt.pattern')]"></div>
      </div>

      {/* Atmospheric Glows */}
      <motion.div
        className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-green-600/20 rounded-full blur-[120px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">

        {/* Left Side: Text Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-950/50 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
              <FaShieldAlt className="text-emerald-500" />
              SERVER-AUTHORITATIVE PVP POOL
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
              Potta <br />
              <span className="text-emerald-500">Arena</span>
            </h1>

            <div className="h-20 mt-6">
              <TypeAnimation
                sequence={[
                  'DOMINATE THE GREEN FELT', 2000,
                  'WIN REAL CASH PRIZES', 2000,
                  'COMPETE IN SPEED BLITZ', 2000,
                  'STAKE GH₵ & POT BALLS', 2000,
                ]}
                wrapper="span"
                speed={50}
                className="text-2xl md:text-3xl font-black text-white/40 italic uppercase tracking-tighter"
                repeat={Infinity}
              />
            </div>

            <p className="text-gray-400 text-lg max-w-lg mb-10 font-medium leading-relaxed">
              Experience the next generation of competitive mobile pool.
              Server-verified physics, instant Paystack payouts, and 100% skill-based PvP.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link
                to={token ? "/dashboard" : "/signup"}
                className="group relative px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-[#052e16] font-black text-xl italic uppercase tracking-tighter rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
              >
                <span>Enter Arena</span>
                <FaPlayCircle size={24} />
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-[200%] transition-all duration-700 ease-in-out"></div>
              </Link>

              <Link
                to="/how-it-works"
                className="px-8 py-5 border-2 border-white/10 hover:border-emerald-500/50 text-white font-bold text-lg uppercase tracking-widest rounded-2xl transition-all"
              >
                View Rules
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Visual Asset */}
        <div className="md:w-1/2 relative lg:h-[600px] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative z-20 w-full max-w-md aspect-square bg-gradient-to-br from-emerald-600 to-emerald-950 rounded-[3rem] p-4 shadow-[0_50px_100px_rgba(0,0,0,0.6)] border-8 border-emerald-500/20"
          >
            {/* 3D Pool Table Asset Representation */}
            <div className="w-full h-full bg-[#065f46] rounded-[2rem] relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.pattern')] opacity-40"></div>

              {/* Balls */}
              <motion.div
                animate={{ x: [0, 50, -30, 0], y: [0, -40, 60, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 bg-white rounded-full shadow-2xl relative"
              >
                <div className="absolute top-2 right-2 w-3 h-3 bg-white/40 rounded-full"></div>
              </motion.div>

              <motion.div
                animate={{ x: [0, -100, 40, 0], y: [0, 80, -20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 bg-black rounded-full shadow-2xl absolute"
              >
                <div className="absolute top-2 right-2 w-3 h-3 bg-white/20 rounded-full"></div>
              </motion.div>

              <FaTrophy className="absolute bottom-6 right-6 text-yellow-500/50 text-6xl" />
              <FaBolt className="absolute top-6 left-6 text-emerald-500/30 text-5xl" />
            </div>
          </motion.div>

          {/* Background Orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        </div>
      </div>

      {/* Trusted Stats Bar */}
      <div className="absolute bottom-0 w-full bg-black/40 backdrop-blur-xl border-t border-white/5 py-8">
        <div className="container mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8">
          <StatItem label="Player Liquidity" value="GH₵ 1.2M+" color="text-emerald-500" />
          <StatItem label="Active Pro Matches" value="12,400+" color="text-white" />
          <StatItem label="Avg Payout Time" value="< 5 MINS" color="text-yellow-500" />
          <StatItem label="Physics Accuracy" value="99.9%" color="text-emerald-400" />
        </div>
      </div>

    </section>
  );
};

const StatItem = ({ label, value, color }) => (
  <div className="text-center md:text-left">
    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className={`text-2xl font-black italic tracking-tighter ${color}`}>{value}</p>
  </div>
);

export default Hero;