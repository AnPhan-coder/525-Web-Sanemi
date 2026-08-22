import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import TrailerPlayer from "./TrailerPlayer"; // Đường dẫn trỏ tới TrailerPlayer của bạn

const TrailerModal = ({ isOpen, onClose, movie }) => {
  // Đóng modal khi bấm ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && movie && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()} // Ngăn chặn click xuyên thấu
            className="bg-neutral-900 rounded-2xl border border-neutral-700 w-full max-w-4xl shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/80">
              <h3 className="font-display font-bold text-white uppercase tracking-wide text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                TRAILER — {movie.title}
              </h3>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-neutral-800"
                title="Đóng (ESC)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player */}
            <div className="p-1 bg-black aspect-video">
              <TrailerPlayer
                key={isOpen ? "open" : "closed"}
                trailerUrl={movie.trailerUrl}
                title={movie.title}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrailerModal;