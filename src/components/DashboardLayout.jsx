import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Home, Menu } from 'lucide-react';
import logo from '../assets/Logo.png';

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show layout on specific full-screen game paths if needed, 
    // but for now user requested global consistency.
    // We can hide back button on root dashboard if we want.
    const isRoot = location.pathname === '/games' || location.pathname === '/dashboard';

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 w-full h-16 bg-slate-900/90 backdrop-blur-md border-b border-white/10 z-50 px-4 flex items-center justify-between">

                {/* Left: Back Button */}
                <div className="flex items-center gap-4 w-24">
                    {!isRoot && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            aria-label="Go Back"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-300 hover:text-white" />
                        </button>
                    )}
                </div>

                {/* Center: Logo/Home */}
                <Link to="/games" className="flex items-center gap-2">
                    <img src={logo} alt="Potta" className="h-8 w-auto object-contain" />
                </Link>

                {/* Right: Home / Menu */}
                <div className="flex items-center justify-end gap-2 w-24">
                    <Link
                        to="/games"
                        className={`p-2 hover:bg-white/10 rounded-full transition-colors ${location.pathname === '/games' ? 'text-green-400' : 'text-gray-300'}`}
                        aria-label="Home"
                    >
                        <Home className="w-6 h-6" />
                    </Link>
                </div>
            </nav>

            {/* Main Content Area - padded for navbar */}
            <main className="pt-16 min-h-screen">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
