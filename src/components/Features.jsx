import { FaShieldAlt, FaUsers, FaCashRegister, FaDice } from 'react-icons/fa';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <FaShieldAlt className="text-blue-400 text-4xl mb-4" />,
    title: "Secure Wallet",
    desc: "Your funds are encrypted and stored safely—transact with peace of mind.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    glowColor: "shadow-blue-500/50",
  },
  {
    icon: <FaUsers className="text-green-400 text-4xl mb-4" />,
    title: "Instant Matchmaking",
    desc: "Get matched with opponents within seconds for swift gameplay.",
    gradient: "from-green-500/20 to-emerald-500/20",
    glowColor: "shadow-green-500/50",
  },
  {
    icon: <FaCashRegister className="text-yellow-400 text-4xl mb-4" />,
    title: "Real Cash Rewards",
    desc: "Win real money for your skillful shots—no gimmicks, just hustle.",
    gradient: "from-yellow-500/20 to-orange-500/20",
    glowColor: "shadow-yellow-500/50",
  },
  {
    icon: <FaDice className="text-red-400 text-4xl mb-4" />,
    title: "Fair Play",
    desc: "Our systems ensure every match is legitimate and competitive.",
    gradient: "from-red-500/20 to-pink-500/20",
    glowColor: "shadow-red-500/50",
  },
];

const Features = () => (
  <section id="features" className="relative py-24 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-6 overflow-hidden">
    {/* Animated background elements */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>

    <div className="relative z-10 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="inline-block mb-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <span className="text-blue-400 text-sm font-bold uppercase tracking-wider px-4 py-2 bg-blue-400/10 rounded-full border border-blue-400/30">
            Premium Features
          </span>
        </motion.div>
        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Why Choose POTTA?
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Designed for pros, hustlers, and everyone in between. Here's what makes us stand out.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="group relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
          >
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            {/* Card */}
            <div className="relative bg-[#1e293b]/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 h-full">
              {/* Icon container with animated background */}
              <motion.div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${f.gradient} mb-6`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                {f.icon}
              </motion.div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                {f.title}
              </h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {f.desc}
              </p>

              {/* Decorative corner accent */}
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-400/50 group-hover:scale-150 group-hover:bg-blue-400 transition-all duration-300"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="text-center mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        viewport={{ once: true }}
      >
        <p className="text-gray-400 text-sm">
          Join thousands of players already winning on POTTA
        </p>
      </motion.div>
    </div>
  </section>
);

export default Features;