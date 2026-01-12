import { useState, useEffect, useRef } from 'react';
import { ChevronDown, HelpCircle, Shield, Wallet, Scale, Zap, Trophy, Users } from 'lucide-react';

const questions = [
  {
    q: "Is POTTA legal to play?",
    a: "Yes, POTTA operates under the laws of your jurisdiction. Please check local regulations before playing.",
    icon: Scale,
    color: "from-blue-500 to-cyan-500"
  },
  {
    q: "How do payouts work?",
    a: "Winnings are instantly added to your wallet. You can withdraw once you meet the minimum threshold.",
    icon: Wallet,
    color: "from-green-500 to-emerald-500"
  },
  {
    q: "Is my money safe?",
    a: "Absolutely. We use encrypted transactions and secure wallet infrastructure to protect your funds.",
    icon: Shield,
    color: "from-purple-500 to-pink-500"
  },
  {
    q: "How do I start playing?",
    a: "Simply create an account, deposit funds to your wallet, choose a game mode, and start competing against players worldwide!",
    icon: Zap,
    color: "from-yellow-500 to-orange-500"
  },
  {
    q: "What happens if I lose connection during a game?",
    a: "Your game state is automatically saved. If you disconnect, you have 60 seconds to reconnect. After that, the game may be forfeited.",
    icon: Users,
    color: "from-red-500 to-rose-500"
  },
  {
    q: "How are winners determined?",
    a: "Winners are determined by game-specific rules. In Speed Arena, the first player to pot all 8 balls or the highest score when time expires wins.",
    icon: Trophy,
    color: "from-amber-500 to-yellow-500"
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [visibleItems, setVisibleItems] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger animation for FAQ items
            questions.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems(prev => [...new Set([...prev, index])]);
              }, index * 150);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={sectionRef} id="faq" className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 animate-bounce-slow">
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Got questions? We've got answers. Find everything you need to know about POTTA.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-4xl mx-auto space-y-4">
          {questions.map((item, i) => {
            const Icon = item.icon;
            const isOpen = openIndex === i;
            const isVisible = visibleItems.includes(i);

            return (
              <div
                key={i}
                className={`group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ 
                  transitionDelay: isVisible ? '0ms' : `${i * 100}ms`
                }}
              >
                <button
                  onClick={() => toggleQuestion(i)}
                  className="w-full p-4 sm:p-6 flex items-start gap-3 sm:gap-4 text-left transition-all"
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center transition-transform ${isOpen ? 'scale-110' : 'scale-100'}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>

                  {/* Question */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                      {item.q}
                    </h3>
                    {!isOpen && (
                      <p className="text-xs sm:text-sm text-gray-400">
                        Click to expand
                      </p>
                    )}
                  </div>

                  {/* Toggle Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-700/50 flex items-center justify-center transition-all ${isOpen ? 'rotate-180 bg-purple-500/20' : ''}`}>
                      <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${isOpen ? 'text-purple-400' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pl-16 sm:pl-20">
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 sm:mt-16 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
          <div className="inline-block bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Still have questions?</h3>
            <p className="text-gray-400 text-sm sm:text-base mb-6">
              Our support team is here to help you 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="mailto:Pottagames1@gmail.com"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 animate-pulse-slow"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Contact Support</span>
              </a>
              <a
                href="tel:+233552713108"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg font-bold transition-all flex items-center justify-center gap-2 hover:scale-105"
              >
                <span>Call Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default FAQ;