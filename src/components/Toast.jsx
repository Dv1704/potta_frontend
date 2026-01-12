import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({ id, message, type, onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, onClose, duration]);

    const variants = {
        initial: { opacity: 0, y: -20, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -20, scale: 0.9 }
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500/10 border-green-500/50 text-green-400';
            case 'error':
                return 'bg-red-500/10 border-red-500/50 text-red-400';
            default:
                return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5" />;
            case 'error': return <XCircle className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    return (
        <motion.div
            layout
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg 
        min-w-[300px] max-w-md pointer-events-auto
        ${getTypeStyles()}
      `}
        >
            {getIcon()}
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
                <X className="w-4 h-4 opacity-70" />
            </button>
        </motion.div>
    );
};

export default Toast;
