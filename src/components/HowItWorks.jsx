import { FaUserPlus, FaMoneyBillWave, FaTrophy, FaArrowRight, FaLock, FaBullseye, FaBolt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: <FaUserPlus className="text-4xl" />,
    title: "Secure Entry",
    desc: "Register your pro profile. Every account is verified for fair PvP matchmaking.",
    accent: "emerald",
    number: "01"
  },
  {
    icon: <FaMoneyBillWave className="text-4xl" />,
    title: "Stake Escrow",
    desc: "Fund your wallet via Paystack. Stakes are locked in secure escrow during play.",
    accent: "yellow",
    number: "02"
  },
  {
    icon: <FaTrophy className="text-4xl" />,
    title: "90% Payouts",
    desc: "Win the match and receive 90% of the total pot instantly to your wallet.",
    accent: "blue",
    number: "03"
  }
];

const HowItWorks = () => {
  return (
    <section id="how" className="relative py-32 bg-[#022c22] text-white px-6 overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.pattern')]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-block bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-full text-emerald-500 text-xs font-black tracking-[0.4em] uppercase mb-8"
          >
            The Platform Protocol
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-6">
            Three Steps to <br />
            <span className="text-emerald-500 text-6xl md:text-8xl">Greatness</span>
          </h2>
          <p className="text-gray-400 text-xl font-medium italic">Professional skill-based wagering, simplified.</p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2 }}
              className="relative group lg:p-12 p-8 bg-black/40 backdrop-blur-3xl rounded-[3rem] border-2 border-white/5 hover:border-emerald-500/30 transition-all duration-500"
            >
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-emerald-500 text-emerald-950 flex items-center justify-center rounded-2xl font-black italic text-2xl shadow-2xl shadow-emerald-500/20 z-20">
                {step.number}
              </div>

              <div className="relative z-10">
                <div className="text-emerald-500 mb-8 p-4 bg-emerald-500/5 inline-block rounded-2xl">
                  {step.icon}
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tight mb-4 group-hover:text-emerald-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  {step.desc}
                </p>
              </div>

              {/* Connecting line for desktop */}
              {i < 2 && (
                <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 z-0">
                  <FaArrowRight className="text-white/5 text-4xl" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Trust Factors */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/5">
          <div className="flex flex-col items-center gap-3 text-center">
            <FaLock className="text-emerald-500 text-2xl" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Encrypted Escrow</span>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <FaBullseye className="text-emerald-500 text-2xl" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Skill-Only Physics</span>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <FaBolt className="text-emerald-500 text-2xl" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Instant Liquidity</span>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <FaShieldAlt className="text-emerald-500 text-2xl" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">No House Edge</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;