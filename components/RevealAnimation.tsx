"use client";

import { motion } from "framer-motion";

export function RevealAnimation() {
  return (
    <motion.section
      className="reveal-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      aria-live="polite"
    >
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.35 }} className="reveal-line" />
      <p>BUILDER DETECTED / SIGNAL LOCKED</p>
      <motion.h1 initial={{ y: 45, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.42 }}>
        YOU’RE<br /><em>GOA</em><br />READY.
      </motion.h1>
      <motion.div className="reveal-stamp" initial={{ scale: 2, rotate: -18, opacity: 0 }} animate={{ scale: 1, rotate: 8, opacity: 1 }} transition={{ delay: 0.42, type: "spring", stiffness: 420, damping: 22 }}>
        HH<br /><small>GOA / 26</small>
      </motion.div>
    </motion.section>
  );
}
