"use client";

import { Container } from "@/shared/ui/container.ui";
import { Button } from "@/shared/ui/button.ui";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-display font-bold text-gray-900 opacity-[0.03] whitespace-nowrap">
          CONTOS & HISTÓRIAS
        </span>
      </div>

      <Container className="relative z-10 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gray-900 leading-tight mb-6"
          >
            Descubra Autores e Suas{" "}
            <span className="text-accent-500">Contribuições</span> Literárias
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Uma plataforma de compartilhamento de contos, histórias e o que você
            quiser mais contar. De forma simples, gratuita e elegante.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="primary" className="px-8 py-4 text-lg">
              Explorar
            </Button>
            <Button variant="secondary" className="px-8 py-4 text-lg">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Assistir vídeo
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}