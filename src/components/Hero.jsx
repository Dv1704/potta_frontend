import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { FaPlayCircle, FaGamepad, FaTimes, FaComments, FaPaperPlane } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

const Hero = () => {
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
    <section
      className="h-screen min-h-screen bg-black pt-4 relative overflow-hidden"

    >

      {/* Animated Glow Effects */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-30"
        animate={{
          y: [0, -20, 0],
          x: [0, 20, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 7, repeat: Infinity, repeatType: 'loop' }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-24 h-24 bg-pink-500 rounded-full blur-2xl opacity-25"
        animate={{
          y: [0, 15, 0],
          x: [0, -15, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 9, repeat: Infinity, repeatType: 'loop' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-20 h-20 bg-cyan-400 rounded-full blur-xl opacity-20"
        animate={{
          y: [0, -25, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'loop' }}
      />

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-20"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Main Content */}
      <motion.div
        className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      >
        {/* Logo/Title with Glow */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          <motion.h1
            className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          >
            POTTA
          </motion.h1>
          <motion.div
            className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-30 -z-10"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>

        {/* Enhanced Typing Animation */}
        <div className="h-12 mb-8">
          <TypeAnimation
            sequence={[
              'Not Just a Game,', 2000,
              'Not Just a Game, a Hustle.', 3000,
              'Where Skill Meets Stakes.', 2000,
              'Play. Compete. Win.', 2000,
              '',
            ]}
            speed={50}
            wrapper="p"
            repeat={Infinity}
            className="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 font-bold"
          />
        </div>

        {/* Description with better styling */}
        <motion.p
          className="text-lg text-gray-200 max-w-2xl mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Step into the arena of skill-based competition. Challenge opponents,
          stake real cash, and prove your mastery in every shot. This is where
          players become <span className="text-yellow-400 font-semibold">hustlers</span>.
        </motion.p>

        {/* Enhanced CTA Buttons */}
        <motion.div
          className="flex flex-col md:flex-row gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <a
            href="#signup"
            aria-label="Get Started"
            className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold overflow-hidden transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-blue-500/50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <FaPlayCircle className="relative z-10 text-xl" />
            <span className="relative z-10">Get Started</span>
          </a>

          <a
            href="#modes"
            aria-label="View Game Modes"
            className="group flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 shadow-xl"
          >
            <FaGamepad className="text-xl" />
            <span>View Game Modes</span>
          </a>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          {[
            { label: 'Active Players', value: '50K+' },
            { label: 'Daily Matches', value: '10K+' },
            { label: 'Prize Pool', value: '$1M+' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Chatbot Toggle Button */}
      <motion.button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        aria-label="Toggle Chat"
      >
        <AnimatePresence mode="wait">
          {isChatOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
            >
              <FaTimes className="text-2xl" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
            >
              <FaComments className="text-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-28 right-8 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FaGamepad className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">POTTA Assistant</h3>
                  <p className="text-xs text-blue-100">Always here to help</p>
                </div>
              </div>
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${msg.type === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none'
                          : 'bg-gray-800 text-gray-100 rounded-bl-none'
                        }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-2 flex flex-wrap gap-2"
              >
                {quickReplies.map((reply, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-full transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {reply}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-gray-800/50 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <motion.button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Send message"
                >
                  <FaPaperPlane />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Hero;