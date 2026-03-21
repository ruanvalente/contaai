"use client";

import { motion } from "framer-motion";

type BookCardProps = {
  title: string;
  author: string;
  coverColor: string;
  isFeatured?: boolean;
};

export function BookCard({
  title,
  author,
  coverColor,
  isFeatured = false,
}: BookCardProps) {
  return (
    <motion.div
      className={`relative ${isFeatured ? "scale-110 z-10" : "scale-95"}`}
      whileHover={{ scale: isFeatured ? 1.15 : 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="w-40 h-60 md:w-48 md:h-72 rounded-lg shadow-xl flex flex-col items-center justify-center p-4 text-center"
        style={{ backgroundColor: coverColor }}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center p-2">
            <span className="text-white/90 font-display text-sm md:text-base leading-tight">
              {title}
            </span>
          </div>
        </div>
        <div className="mt-2 w-full border-t border-white/20 pt-2">
          <span className="text-white/70 text-xs font-sans">{author}</span>
        </div>
      </div>
    </motion.div>
  );
}
