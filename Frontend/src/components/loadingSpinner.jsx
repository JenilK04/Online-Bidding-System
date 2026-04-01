import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900">
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-24 h-24 rounded-full border border-blue-500/30"
        />

        {/* Inner Spinning Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        />
      </div>

      {/* Futuristic Text Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 flex flex-col items-center"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 animate-pulse">
          Synchronizing Ledger
        </p>
        <div className="mt-2 w-32 h-[1px] bg-slate-800 overflow-hidden">
          <motion.div
            animate={{ x: [-128, 128] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full bg-blue-500"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;