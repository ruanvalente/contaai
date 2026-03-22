"use client";

import { Container } from "@/shared/ui/container";
import { BookCard } from "@/shared/ui/book-card";
import { motion } from "framer-motion";

const books = [
  { id: "1", title: "O último suspiro", author: "Maria Silva", coverColor: "#8B4513" },
  { id: "2", title: "Noites de luar", author: "João Pedro", coverColor: "#2F4F4F" },
  { id: "3", title: "Fragmentos", author: "Ana Clara", coverColor: "#800020" },
  { id: "4", title: "Travessias", author: "Ricardo Borges", coverColor: "#1E3A5F" },
  { id: "5", title: "Sinais de fumaça", author: "Carla Mendes", coverColor: "#4A4A4A" },
];

export function BookCarousel() {
  return (
    <section className="py-20 bg-primary-200 relative overflow-hidden">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4">
            Obras em Destaque
          </h2>
          <p className="text-gray-700 max-w-xl mx-auto">
            Explore as contribuições mais recentes da nossa comunidade literária
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-4 md:gap-8 overflow-x-auto pb-8 px-4 scrollbar-hide">
          {books.map((book, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="shrink-0"
            >
              <BookCard
                id={book.id}
                title={book.title}
                author={book.author}
                coverColor={book.coverColor}
                isFeatured={index === 2}
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
