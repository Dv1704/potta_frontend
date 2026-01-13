import { FaBolt, FaExchangeAlt, FaTrophy, FaGamepad, FaClock, FaChessBoard } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GameModes = () => {
  const { token } = useAuth();

  const modes = [
    {
      id: 'speed',
      name: 'Speed Arena',
      tag: '60s CHALLENGE',
      icon: <FaBolt className="text-yellow-400" />,
      desc: 'High-pressure blitz. Every second counts. Pot all balls in under 1 minute to claim the pot. No breaks, no mercy.',
      color: 'border-yellow-500/30',
      accent: 'text-yellow-400',
      bg: 'bg-yellow-400/5'
    },
    {
      id: 'turn',
      name: 'Turn Masters',
      tag: '8-BALL RULES',
      icon: <FaChessBoard className="text-emerald-400" />,
      desc: 'Professional turn-based pool. Strategize every shot with server-verified physics. Outplay your opponent ball by ball.',
      color: 'border-emerald-500/30',
      accent: 'text-emerald-400',
      bg: 'bg-emerald-400/5'
    }
  ];

  return (
    <section id="modes" className="relative bg-[#022c22] text-white py-32 px-6 overflow-hidden">

      {/* Decorative Background Icons */}
      <FaTrophy className="absolute text-yellow-500/5 text-[200px] -right-20 top-20 rotate-12" />
      <FaGamepad className="absolute text-emerald-500/5 text-[300px] -left-40 bottom-0 -rotate-12" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-[0.3em] mb-4 text-xs"
            >
              <span className="w-10 h-[2px] bg-emerald-500"></span>
              Arena Specializations
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
              Select Your <br />
              <span className="text-emerald-500">Battleground</span>
            </h2>
          </div>
          <Link
            to={token ? "/dashboard" : "/signup"}
            className="px-8 py-4 bg-white text-emerald-950 font-black italic uppercase tracking-tighter text-lg rounded-2xl hover:bg-emerald-400 transition-all active:scale-95"
          >
            Start Competing
          </Link>
        </div>

        {/* Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {modes.map((mode, idx) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className={`group relative p-10 rounded-[3rem] border-2 ${mode.color} ${mode.bg} hover:border-emerald-500/50 transition-all duration-500 overflow-hidden`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="p-5 bg-black/40 rounded-3xl text-4xl">
                    {mode.icon}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] bg-white/5 px-4 py-2 rounded-full text-gray-400">
                    {mode.tag}
                  </div>
                </div>

                <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-4 group-hover:text-emerald-400 transition-colors">
                  {mode.name}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md">
                  {mode.desc}
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Entry From</span>
                    <span className="text-2xl font-black italic">GH₵ 10.00</span>
                  </div>
                  <div className="w-px h-10 bg-white/10 mx-4"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Payouts</span>
                    <span className="text-2xl font-black italic text-emerald-400">90%</span>
                  </div>
                </div>
              </div>

              {/* Decorative Corner Glow */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all"></div>
            </motion.div>
          ))}
        </div>

        {/* Quick Match CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 bg-emerald-950/40 p-12 rounded-[4rem] border-2 border-emerald-500/10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
        >
          <div>
            <h4 className="text-3xl font-black italic uppercase italic tracking-tighter mb-2">Ready for instant Pairing?</h4>
            <p className="text-gray-400">Quick Match pairs you with a pro opponent in seconds.</p>
          </div>
          <Link
            to="/quick-match"
            className="flex items-center gap-4 px-10 py-5 bg-emerald-500 text-emerald-950 rounded-3xl font-black italic uppercase tracking-tighter text-xl transition-all hover:scale-105"
          >
            <FaBolt />
            <span>Quick Match</span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default GameModes;
