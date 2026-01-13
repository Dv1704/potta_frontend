import { FaBolt, FaExchangeAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GameModes = () => {
  const { token } = useAuth();
  return (
    <section
      id="modes"
      className="relative bg-[#0f172a] text-white py-24 px-6 overflow-hidden"
    >
      {/* Floating Icons (Animated) */}
      <FaBolt className="absolute text-yellow-400 text-5xl opacity-10 left-10 top-10 z-0 animate-pulse" />
      <FaExchangeAlt className="absolute text-green-400 text-6xl opacity-10 right-12 top-1/3 z-0 animate-pulse" />

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
          <p className="text-gray-300 text-lg leading-relaxed">
            Whether you're a strategist or a speed demon, there's a mode for you.
            Potta lets you stake, play, and earn while mastering your skills. It’s
            not just a game — it’s a way of life.
          </p>

          <Link
            to={token ? "/dashboard" : "/login"}
            className="inline-block mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl transition-all hover:scale-105"
          >
            {token ? "Go to Arena" : "Start Playing"}
          </Link>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-10">
          {/* Speed Mode */}
          <motion.div
            className="bg-[#1e293b]/80 backdrop-blur p-6 rounded-2xl border border-yellow-500/30 shadow-lg hover:shadow-yellow-500/20 transition-all duration-300"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <FaBolt className="text-yellow-400 text-3xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">⚡ Speed Mode</h3>
                <p className="text-gray-400 leading-relaxed">
                  This mode is all about adrenaline and precision. You and your opponent
                  have 60 seconds to pot every ball. The fastest wins — no second chances.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Turn-Turn Mode */}
          <motion.div
            className="bg-[#1e293b]/80 backdrop-blur p-6 rounded-2xl border border-green-500/30 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FaExchangeAlt className="text-green-400 text-3xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">🔁 Turn-Turn Mode</h3>
                <p className="text-gray-400 leading-relaxed">
                  Classic 8-ball rules. Take turns potting your assigned balls, strategize
                  your shots, and defeat your opponent with skill and accuracy.
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
