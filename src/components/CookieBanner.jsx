import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check, Shield } from 'lucide-react';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showCustomize, setShowCustomize] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true, // Always true
        analytics: true,
        marketing: false,
    });

    useEffect(() => {
        const consent = localStorage.getItem('potta_cookies_consent');
        if (!consent) {
            // Show banner after a brief delay
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem('potta_cookies_consent', JSON.stringify({
            essential: true,
            analytics: true,
            marketing: true,
            acceptedAt: new Date().toISOString()
        }));
        setIsVisible(false);
    };

    const handleDeclineAll = () => {
        localStorage.setItem('potta_cookies_consent', JSON.stringify({
            essential: true,
            analytics: false,
            marketing: false,
            acceptedAt: new Date().toISOString()
        }));
        setIsVisible(false);
    };

    const handleSaveCustom = () => {
        localStorage.setItem('potta_cookies_consent', JSON.stringify({
            ...preferences,
            acceptedAt: new Date().toISOString()
        }));
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl z-[100] text-white"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20 flex-shrink-0">
                            <Cookie className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-lg flex items-center gap-2">
                                    Cookie Consent
                                </h4>
                                <button 
                                    onClick={handleDeclineAll}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                We use cookies to verify sessions, protect transactions from fraud, and optimize matches. Customize your choice below.
                            </p>
                        </div>
                    </div>

                    {showCustomize && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-4 pt-4 border-t border-white/5 space-y-3"
                        >
                            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                                <div>
                                    <p className="text-xs font-bold">Session & Security (Essential)</p>
                                    <p className="text-[10px] text-gray-400">Required for wallets and matching.</p>
                                </div>
                                <div className="text-green-400 p-1">
                                    <Check className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                                <div>
                                    <p className="text-xs font-bold">Analytics & Performance</p>
                                    <p className="text-[10px] text-gray-400">Helps us refine game latency.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.analytics}
                                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                                <div>
                                    <p className="text-xs font-bold">Marketing & Referrals</p>
                                    <p className="text-[10px] text-gray-400">Tracks referral clicks and payouts.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.marketing}
                                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                            </div>
                        </motion.div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-2 justify-end">
                        <button
                            onClick={() => setShowCustomize(!showCustomize)}
                            className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                        >
                            {showCustomize ? 'Simple Mode' : 'Customize'}
                        </button>
                        {showCustomize ? (
                            <button
                                onClick={handleSaveCustom}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            >
                                Save Preferences
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleDeclineAll}
                                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20"
                                >
                                    Accept All
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;
