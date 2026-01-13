import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Home, User, Wallet } from 'lucide-react';
import logo from '../assets/Logo.png';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Paths where the back button should NOT show
    const isRoot = location.pathname === '/success' || location.pathname === '/';

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Top Navigation Bar - Premium Glassmorphism */}
            <nav className="fixed top-0 left-0 w-full h-20 bg-black/60 backdrop-blur-xl border-b border-white/5 z-[60] px-6 md:px-12 flex items-center justify-between">

                {/* Left: Dynamic Navigation Group */}
                <div className="flex items-center gap-6 w-32">
                    <AnimatePresence mode="wait">
                        {!isRoot && (
                            <motion.button
                                key="back"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onClick={() => navigate(-1)}
                                className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-white/20"
                                aria-label="Go Back"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="hidden md:block text-xs font-black uppercase tracking-widest">Back</span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Center: Centered Logo/Branding - Links to Stats (Success) Page if logged in */}
                <Link
                    to={localStorage.getItem('token') ? "/success" : "/"}
                    className="flex items-center transition-transform hover:scale-105 active:scale-95"
                >
                    <img src={logo} alt="Potta" className="h-12 md:h-14 w-auto object-contain filter brightness-110" />
                </Link>

                {/* Right: Quick Action Group */}
                <div className="flex items-center justify-end gap-3 w-32">
                    <Link
                        to="/success"
                        className={`p-3 rounded-xl transition-all ${location.pathname === '/success' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5 border border-transparent'}`}
                        title="User Stats"
                    >
                        <Home className="w-6 h-6" />
                    </Link>
                    <Link
                        to="/wallet"
                        className={`hidden md:flex p-3 rounded-xl transition-all ${location.pathname === '/wallet' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5 border border-transparent'}`}
                        title="Wallet"
                    >
                        <Wallet className="w-6 h-6" />
                    </Link>
                </div>
            </nav>

            {/* Main Content Area - with smooth page transitions */}
            <main className="pt-20 min-h-screen relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default DashboardLayout;
