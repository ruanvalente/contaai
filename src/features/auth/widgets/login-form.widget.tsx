"use client";

import { useState, useTransition } from "react";
import { Button } from "@/shared/ui/button.ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/features/notifications";
import { Book } from "lucide-react";
import { signInWithEmail } from "@/features/auth/actions/auth.actions";

export function LoginFormWidget() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      toast.loading("Entrando...");
      const result = await signInWithEmail(email, password);

      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Book className="w-10 h-10 text-primary" />
              <span className="text-2xl font-bold text-gray-900">ContaAI</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-500 mt-2">
              Entre para acessar sua biblioteca
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-error/10 text-error rounded-lg text-sm" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end text-sm">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
