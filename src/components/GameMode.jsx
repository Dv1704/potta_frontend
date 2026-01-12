// src/components/GameModes.jsx
import { FaBolt, FaExchangeAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const GameModes = () => {
  return (
    <section
      id="modes"
      className="relative bg-[#0f172a] text-white py-24 px-6 overflow-hidden"
    >
      {/* Floating Icons (Animated) */}
      <FaBolt className="absolute text-yellow-400 text-5xl opacity-10 animate-float-slow left-10 top-10 z-0" />
      <FaExchangeAlt className="absolute text-green-400 text-6xl opacity-10 animate-float-reverse right-12 top-1/3 z-0" />
      <FaBolt className="absolute text-blue-500 text-7xl opacity-5 animate-float-small bottom-20 left-1/4 z-0" />
      <FaExchangeAlt className="absolute text-purple-500 text-4xl opacity-10 animate-float-slower right-1/4 bottom-10 z-0" />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-blue-400">Game Modes</h2>
          <p className="text-gray-300 text-lg">
            Whether you're a strategist or a speed demon, there's a mode for you.
            Potta lets you stake, play, and earn while mastering your skills. It’s
            not just a game — it’s a way of life.
          </p>

          <Link
            to="/signup"
            className="inline-block mt-4 bg-blue-600 text-white px-8 py-4 rounded-full text-lg hover:bg-blue-700 transition"
          >
            Start Playing
          </Link>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-10">
          {/* Speed Mode */}
          <motion.div
            className="bg-[#1e293b]/80 backdrop-blur p-6 rounded-xl border border-yellow-500 shadow hover:shadow-yellow-400/30 transition"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-4">
              <FaBolt className="text-yellow-400 text-3xl mt-1" />
              <div>
                <h3 className="text-2xl font-bold mb-1">⚡ Speed Mode</h3>
                <p className="text-gray-300">
                  This mode is all about adrenaline and precision. You and your opponent
                  have 60 seconds to pot every ball. The fastest wins — no second chances,
                  no excuses.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Turn-Turn Mode */}
          <motion.div
            className="bg-[#1e293b]/80 backdrop-blur p-6 rounded-xl border border-green-500 shadow hover:shadow-green-400/30 transition"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-start gap-4">
              <FaExchangeAlt className="text-green-400 text-3xl mt-1" />
              <div>
                <h3 className="text-2xl font-bold mb-1">🔁 Turn-Turn Mode</h3>
                <p className="text-gray-300">
                  Classic 8-ball rules. Take turns potting your assigned balls, strategize
                  your shots, and defeat your opponent with skill and accuracy. Perfect
                  for thinkers and planners.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GameModes;
