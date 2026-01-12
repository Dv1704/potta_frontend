import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullScreen = true, text = 'Loading...' }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50"
    : "flex flex-col items-center justify-center py-12";

  return (
    <div className={containerClasses}>
      <motion.div
        className="w-16 h-16 border-4 border-gray-700 border-t-indigo-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <motion.p 
          className="mt-4 text-gray-400 font-medium animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
