import { FaUserPlus, FaMoneyBillWave, FaTrophy, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: <FaUserPlus className="text-5xl" />,
    title: "Create an Account",
    desc: "Join the Potta community. It's fast, secure and easy to start.",
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    glowColor: "shadow-blue-500/40",
    number: "01",
  },
  {
    icon: <FaMoneyBillWave className="text-5xl" />,
    title: "Deposit Funds",
    desc: "Fund your wallet safely and stake in skill-based competitions.",
    color: "green",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
    glowColor: "shadow-green-500/40",
    number: "02",
  },
  {
    icon: <FaTrophy className="text-5xl" />,
    title: "Compete & Win",
    desc: "Pick your mode, challenge others, and win real cash prizes.",
    color: "yellow",
    gradient: "from-yellow-500 to-orange-500",
    bgGradient: "from-yellow-500/20 to-orange-500/20",
    borderColor: "border-yellow-500/30",
    glowColor: "shadow-yellow-500/40",
    number: "03",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how"
      className="relative py-24 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-6 overflow-hidden"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block text-blue-400 text-sm font-bold uppercase tracking-widest mb-4 px-4 py-2 bg-blue-400/10 rounded-full border border-blue-400/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Simple Process
          </motion.span>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Three easy steps to start winning. No complicated setup, just pure competition.
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1">
            <div className="relative h-full max-w-5xl mx-auto">
              <motion.div
                className="absolute top-0 left-1/4 right-1/4 h-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 opacity-30"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                viewport={{ once: true }}
              ></motion.div>
            </div>
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="group relative h-full"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.bgGradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                {/* Card */}
                <div className={`relative bg-[#1e293b]/90 backdrop-blur-xl p-8 rounded-3xl border ${step.borderColor} hover:border-opacity-60 transition-all duration-300 h-full flex flex-col`}>
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center font-bold text-2xl text-white shadow-xl`}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    >
                      {step.number}
                    </motion.div>
                  </div>

                  {/* Icon Container */}
                  <motion.div
                    className={`mb-6 mx-auto inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${step.bgGradient} text-${step.color}-400`}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {step.icon}
                  </motion.div>

                  {/* Content */}
                  <h3 className={`text-2xl font-bold mb-4 group-hover:bg-gradient-to-r group-hover:${step.gradient} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300 flex-grow">
                    {step.desc}
                  </p>

                  {/* Arrow indicator */}
                  {i < steps.length - 1 && (
                    <motion.div
                      className="hidden md:block absolute -right-8 top-1/2 transform -translate-y-1/2"
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FaArrowRight className={`text-3xl text-${step.color}-400/50`} />
                    </motion.div>
                  )}

                  {/* Decorative corner elements */}
                  <div className={`absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gradient-to-br ${step.gradient} opacity-50 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300`}></div>
                  <div className={`absolute top-4 left-4 w-2 h-2 rounded-full bg-gradient-to-br ${step.gradient} opacity-30 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300`}></div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now
          </motion.button>
          <p className="text-gray-500 text-sm mt-4">
            No credit card required • Start in under 2 minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;