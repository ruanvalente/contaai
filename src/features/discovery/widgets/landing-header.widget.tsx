"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui/container.ui";
import { Button } from "@/shared/ui/button.ui";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Home", href: "#hero" },
  { label: "Meus Autores", href: "#my-authors" },
  { label: "Comunidade", href: "#community" },
  { label: "Contribuir", href: "#contributes" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = "mobile-menu";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-100/80 backdrop-blur-md border-b border-primary-300">
      <Container>
        <nav className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold text-gray-900">
              Conta<span className="text-accent-500">AI</span>
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-gray-700 hover:text-accent-500 transition-colors font-sans text-sm"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="secondary" className="px-5 py-2 text-sm">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" className="px-5 py-2 text-sm">
                Criar Conta
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isMenuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </nav>
      </Container>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary-100 border-t border-primary-300"
            role="menu"
          >
            <Container>
              <ul className="py-4 flex flex-col gap-4">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-gray-700 hover:text-accent-500 transition-colors font-sans text-base block py-2"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li className="flex flex-col gap-3 pt-4 border-t border-primary-300">
                  <Link href="/login" className="w-full">
                    <Button variant="secondary" className="w-full">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button variant="primary" className="w-full">
                      Criar Conta
                    </Button>
                  </Link>
                </li>
              </ul>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
