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
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block text-blue-400 text-sm font-bold uppercase tracking-widest mb-4 px-4 py-2 bg-blue-400/10 rounded-full border border-blue-400/30"
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

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className={`relative bg-[#1e293b]/90 backdrop-blur-xl p-8 rounded-3xl border ${step.borderColor} h-full flex flex-col group hover:scale-[1.02] transition-transform duration-300`}>
                <div className="absolute -top-4 -right-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center font-bold text-xl text-white shadow-xl`}>
                    {step.number}
                  </div>
                </div>

                <div className={`mb-6 p-4 rounded-2xl bg-gradient-to-br ${step.bgGradient} w-fit text-white`}>
                  {step.icon}
                </div>

                <h3 className={`text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors`}>
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {step.desc}
                </p>

                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-20">
                    <FaArrowRight className="text-gray-700 text-xl" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full font-bold text-lg shadow-2xl transition-all hover:scale-105 active:scale-95">
            Get Started Now
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;