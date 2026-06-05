import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Scale, Award } from 'lucide-react';

const LegalModal = ({ isOpen, onClose, type }) => {
    if (!isOpen) return null;

    const getContent = () => {
        switch (type) {
            case 'privacy':
                return {
                    title: 'Privacy Policy',
                    icon: <ShieldCheck className="w-8 h-8 text-purple-400" />,
                    sections: [
                        {
                            title: '1. Information We Collect',
                            body: 'We collect registration data (name, email, phone number), payment details, game telemetry (shots taken, moves, game duration), and device details (IP addresses, connection logs) to provide matchmaking services and ensure anti-fraud safety.'
                        },
                        {
                            title: '2. How We Use Information',
                            body: 'Your information is used to match games, coordinate commissions and referral payouts, manage ledger deposits/withdrawals, prevent self-play or farming, and contact you regarding support.'
                        },
                        {
                            title: '3. Data Security and Sharing',
                            body: 'All transactions are encrypted. We share details with payment processors (e.g. Paystack) and security services to complete payouts. We never sell your personal data to advertisers.'
                        },
                        {
                            title: '4. Cookies Policy',
                            body: 'Potta uses local storage and cookies to maintain authenticated sessions and capture connection IPs to block collusion or multi-account farming.'
                        }
                    ]
                };
            case 'terms':
                return {
                    title: 'Terms of Service',
                    icon: <Scale className="w-8 h-8 text-blue-400" />,
                    sections: [
                        {
                            title: '1. User Eligibility',
                            body: 'You must be at least 18 years of age or the legal age of majority in your jurisdiction to deposit funds, host cash lobbies, or request payouts. Accounts are personal and non-transferable.'
                        },
                        {
                            title: '2. Stake and Balances',
                            body: 'Stakes for cash matches are locked in a secure wallet upon joining a matchmaking queue. The winner takes the stakes minus a 10% platform fee. Influencer creators receive a commission split based on their current tier.'
                        },
                        {
                            title: '3. Anti-Fraud & Self-Play Restrictions',
                            body: 'Users are strictly prohibited from participating in self-play, IP matching, multi-accounting, or intentional forfeits to transfer funds. Suspicious games will trigger automatic Fraud Alerts, locking affected wallets until review.'
                        },
                        {
                            title: '4. Withdrawals & Payouts',
                            body: 'Withdrawals are processed through connected wallets after system reconciliation. System administrators verify matching integrity and reserve the right to deny payouts for games flagged as fraudulent.'
                        }
                    ]
                };
            case 'fairplay':
                return {
                    title: 'Fair Play Policy',
                    icon: <Award className="w-8 h-8 text-green-400" />,
                    sections: [
                        {
                            title: '1. Zero Collusion Tolerance',
                            body: 'Collusion—such as sharing IP addresses, playing against your referred sub-accounts, or matching with friends repeatedly to artificially boost earnings—is immediately flagged. Offending users will be banned.'
                        },
                        {
                            title: '2. Latency and Connection Abuse',
                            body: 'Intentionally delaying shots, toggling connection state, or abusing websocket transport to trigger timeouts is forbidden. Matches that time out are automatically resolved by the game engine.'
                        },
                        {
                            title: '3. Code of Conduct',
                            body: 'All game lobbies must remain positive. Respect opponents and creators. We enforce a friendly environment; toxicity or harassment can lead to account suspension.'
                        },
                        {
                            title: '4. Integrity Audits',
                            body: 'Potta operates automated verification agents. These checks monitor matchmaking IPs, shot velocities, and referral commission patterns to guarantee payouts belong to genuine gameplay.'
                        }
                    ]
                };
            default:
                return { title: 'Legal', icon: null, sections: [] };
        }
    };

    const content = getContent();

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 text-white flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-950/40">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5">
                                {content.icon}
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">{content.title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body (Scrollable) */}
                    <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                        {content.sections.map((sec, idx) => (
                            <div key={idx} className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-200">{sec.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{sec.body}</p>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/5 bg-slate-950/40 flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 text-sm"
                        >
                            I Understand
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LegalModal;
