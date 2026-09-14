import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingOverlay() {
  const { globalLoading, loadingProgress } = useAppSelector((state: any) => state.ui);
  const [isBackground, setIsBackground] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smoothly increment the displayed progress to catch up with the actual loadingProgress
  useEffect(() => {
    if (loadingProgress === null) {
      // Reset after a short delay so the 100% can be seen before it disappears
      const resetTimer = setTimeout(() => setDisplayProgress(0), 500);
      return () => clearTimeout(resetTimer);
    }

    if (displayProgress === loadingProgress) return;

    // Real-time animation illusion: 60ms per tick means 0-95% takes ~5.7 seconds smoothly
    const msPerStep = loadingProgress === 100 ? 10 : 60;

    const timer = setTimeout(() => {
      setDisplayProgress((prev) => {
        if (prev < loadingProgress) return prev + 1;
        if (prev > loadingProgress) return prev - 1;
        return prev;
      });
    }, msPerStep);

    return () => clearTimeout(timer);
  }, [loadingProgress, displayProgress]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (globalLoading) {
      timer = setTimeout(() => {
        setIsBackground(true);
      }, 1500); // give it a bit more time in foreground to show the beautiful progress bar
    } else {
      setIsBackground(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [globalLoading]);

  if (!globalLoading) return null;

  // Background mode: small toast in corner
  if (isBackground) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-4 px-5 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50"
      >
        <div className="relative flex items-center justify-center w-8 h-8">
          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin absolute" />
          {loadingProgress !== null && (
            <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300 absolute">
              {displayProgress}%
            </span>
          )}
        </div>
        <div className="flex flex-col min-w-[160px]">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {loadingProgress !== null ? "Processing Document" : "Processing..."}
          </p>
          {loadingProgress !== null ? (
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${displayProgress}%` }}
                  transition={{ ease: "linear", duration: 0.1 }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Please wait in background...</p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
        style={{ pointerEvents: "auto" }}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="flex flex-col items-center gap-6 p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-700/50"
        >
          {/* Glassmorphic progress circle container */}
          <div className="relative w-24 h-24 flex items-center justify-center bg-blue-50/50 dark:bg-slate-800/50 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border border-blue-100/50 dark:border-slate-700/50">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin absolute" />
            
            {loadingProgress !== null ? (
              <motion.span 
                key={displayProgress}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute text-sm font-black text-blue-700 dark:text-blue-300 tracking-tighter"
              >
                {displayProgress}%
              </motion.span>
            ) : (
              <div className="w-12 h-12 bg-blue-100 dark:bg-slate-700 rounded-full blur-xl animate-pulse" />
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              {loadingProgress !== null 
                ? (displayProgress === 100 ? "Finalizing..." : "Uploading Data...") 
                : "Please wait..."}
            </h3>
            
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[200px]">
              {loadingProgress !== null 
                ? "Connecting to server and encrypting files safely."
                : "Synchronizing with the system..."}
            </p>

            {loadingProgress !== null && (
              <div className="flex flex-col items-center w-56 gap-2 mt-4">
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                  <motion.div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 bg-[length:200%_100%] shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                    initial={{ width: 0, backgroundPosition: "100% 0" }}
                    animate={{ 
                      width: `${displayProgress}%`,
                      backgroundPosition: ["100% 0", "0% 0"]
                    }}
                    transition={{ 
                      width: { ease: "linear", duration: 0.1 },
                      backgroundPosition: { repeat: Infinity, duration: 2, ease: "linear" }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
