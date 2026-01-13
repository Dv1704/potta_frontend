import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Link } from 'react-router-dom';
import { FaPlayCircle, FaGamepad, FaTimes, FaComments, FaPaperPlane, FaShieldAlt, FaBolt } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
  const { token } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hey! Welcome to POTTA 🎮 How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    'How do I get started?',
    'What are the game modes?',
    'Is it safe to play?',
    'How do I deposit?',
    'Hello',
    'Hi',
    'Who are you',
    'Is it Possible to make money with potta',
  ];

  const botResponses = {
    'how do i get started': 'Getting started is easy! Click the "Get Started" button above to create your account. You\'ll be playing within minutes! 🚀',
    'what are the game modes': 'POTTA offers multiple exciting game modes including 1v1 battles, tournaments, and practice mode. Check out the Game Modes section below! 🎯',
    'is it safe to play': 'Absolutely! POTTA uses bank-level encryption and secure payment processing. Your funds and data are completely safe. 🔒',
    'how do i deposit': 'You can deposit using various methods including cards, bank transfers, and e-wallets. All transactions are secure and instant! 💳',
    'hello': 'Hello how can i help you ??',
    'hi': 'Hi there How can i Help you ??',
    'is it possible to make money with potta': 'Of cause it is',
    'who are you': 'Am Potta and am Built to Help with the game and answer some important questions',
    'default': 'Great question! Our support team is here to help. You can also explore our FAQ section or contact us directly for personalized assistance. 😊'
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = { type: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const lowerInput = inputValue.toLowerCase();
      let botResponse = botResponses.default;

      for (const [key, value] of Object.entries(botResponses)) {
        if (key !== 'default' && lowerInput.includes(key)) {
          botResponse = value;
          break;
        }
      }

      setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
    }, 800);

    setInputValue('');
  };

  const handleQuickReply = (reply) => {
    setInputValue(reply);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <section className="h-screen min-h-screen bg-black pt-4 relative overflow-hidden flex items-center">

      {/* Animated Glow Effects */}
      <motion.div
        className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-[120px] opacity-20"
        animate={{
          y: [0, -20, 0],
          x: [0, 20, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500 rounded-full blur-[120px] opacity-15"
        animate={{
          y: [0, 15, 0],
          x: [0, -15, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Win GH₵ while <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                playing pool.
              </span>
            </h1>

            <div className="h-16 mb-8 mt-4">
              <TypeAnimation
                sequence={[
                  'Play 1v1 Battles', 2000,
                  'Win Instant Cash', 2000,
                  'Fast Matchmaking', 2000,
                  'Secure Payouts', 2000,
                ]}
                wrapper="span"
                speed={50}
                className="text-2xl md:text-3xl font-bold text-gray-400"
                repeat={Infinity}
              />
            </div>

            <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto md:mx-0">
              Join the most exciting pool arena in Ghana. Compete with top players,
              climb the leaderboards, and turn your skills into real earnings.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center md:justify-start">
              <Link
                to={token ? "/dashboard" : "/signup"}
                className="px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black text-xl rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <span>Get Started</span>
                <FaPlayCircle size={24} />
              </Link>
              <a
                href="#how"
                className="px-8 py-5 border-2 border-white/10 hover:border-white/20 text-white font-bold text-lg rounded-2xl transition-all"
              >
                Learn More
              </a>
            </div>

            <div className="mt-12 flex items-center gap-6 justify-center md:justify-start text-xs text-gray-500 uppercase tracking-widest font-bold">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-blue-500" />
                Secure Payouts
              </div>
              <div className="flex items-center gap-2">
                <FaBolt className="text-yellow-500" />
                Instant Matching
              </div>
            </div>
          </motion.div>
        </div>

        <div className="md:w-1/2 relative flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative z-20 w-full max-w-md aspect-square bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
          >
            <div className="w-full h-full bg-slate-900/50 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center gap-6">
              <FaGamepad className="text-blue-500 text-8xl" />
              <div className="text-center">
                <p className="text-3xl font-black text-white italic">POTTA POOL</p>
                <p className="text-xs text-blue-400 font-bold tracking-[0.3em] uppercase mt-1">Arena Elite</p>
              </div>
            </div>
          </motion.div>

          {/* Background Halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        </div>
      </div>

      {/* Chat Support Bubble */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="absolute bottom-20 right-0 w-80 max-w-[90vw] bg-[#1e293b] rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
            >
              <div className="bg-blue-600 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <FaComments className="text-white" />
                  </div>
                  <span className="font-bold text-white">POTTA Support</span>
                </div>
                <button onClick={() => setIsChatOpen(false)}>
                  <FaTimes className="text-white hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: msg.type === 'bot' ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-800 text-gray-200 rounded-bl-none'
                      }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                <div className="flex flex-wrap gap-2 mb-4">
                  {quickReplies.slice(0, 3).map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-xl text-white transition-colors"
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 relative z-10"
        >
          {isChatOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
        </motion.button>
      </div>

    </section>
  );
};

export default Hero;