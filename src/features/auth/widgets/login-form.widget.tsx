"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button.ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionToast, toast } from "@/features/notifications";
import { Book } from "lucide-react";
import { signInWithEmail } from "@/features/auth/actions/auth.actions";
import {
  getPendingAction,
  clearPendingAction,
} from "@/shared/hooks/use-auth-redirect";
import {
  getPendingActions,
  clearPendingActions,
} from "@/shared/lib/anonymous-persistence";
import { migrateSessionDataAction } from "@/features/auth/actions/migrate-session-data.action";
import { getAnonymousSessionId } from "@/shared/lib/anonymous-session";
import { followAuthor } from "@/features/author-follow/actions/author-follow.actions";
import { addToFavorites } from "@/features/discovery/actions/favorites.actions";
import { rateBook } from "@/features/book-details/actions/rate-book.action";

export function LoginFormWidget() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { withToast } = useActionToast();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  async function syncAnonymousData() {
    const sessionId = getAnonymousSessionId();
    if (sessionId) {
      const migration = await migrateSessionDataAction(sessionId);
      if (migration.success) {
        const total = migration.migrated.follows + migration.migrated.ratings + migration.migrated.favorites;
        if (total > 0) {
          return total;
        }
      }
    }
    return 0;
  }

  async function processPendingActions() {
    let synced = 0;

    // Process legacy single pending action (from useAuthRedirect)
    const legacyAction = getPendingAction();
    if (legacyAction) {
      clearPendingAction();
      try {
        if (legacyAction.type === "follow" && legacyAction.payload.authorName) {
          const result = await followAuthor(legacyAction.payload.authorName as string);
          if (result.success) synced++;
        } else if (legacyAction.type === "favorite" && legacyAction.payload.bookId) {
          await addToFavorites(
            legacyAction.payload.bookId as string,
            (legacyAction.payload.bookTitle as string) || "",
            (legacyAction.payload.bookAuthor as string) || "",
          );
          synced++;
        } else if (legacyAction.type === "rate" && legacyAction.payload.bookId && legacyAction.payload.rating) {
          const result = await rateBook(
            legacyAction.payload.bookId as string,
            legacyAction.payload.rating as number,
          );
          if (result.success) synced++;
        }
      } catch (err) {
        console.error("Error processing legacy pending action:", err);
      }
    }

    // Process array-based pending actions (from anonymous-persistence)
    const pendingActions = getPendingActions();
    if (pendingActions.length > 0) {
      for (const action of pendingActions) {
        try {
          if (action.type === "follow" && action.payload.authorName) {
            const result = await followAuthor(action.payload.authorName as string);
            if (result.success) synced++;
          } else if (action.type === "favorite" && action.payload.bookId) {
            await addToFavorites(
              action.payload.bookId as string,
              (action.payload.bookTitle as string) || "",
              (action.payload.bookAuthor as string) || "",
            );
            synced++;
          } else if (action.type === "rate" && action.payload.bookId && action.payload.rating) {
            const result = await rateBook(
              action.payload.bookId as string,
              action.payload.rating as number,
            );
            if (result.success) synced++;
          }
        } catch (err) {
          console.error("Error processing pending action:", err);
        }
      }
      clearPendingActions();
    }

    return synced;
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await withToast(signInWithEmail(email, password), {
      loadingMessage: "Entrando...",
      successMessage: "Login realizado com sucesso!",
    });

    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Erro ao fazer login");
    } else {
      toast.loading("Sincronizando dados...");

      const [migratedCount, pendingCount] = await Promise.all([
        syncAnonymousData(),
        processPendingActions(),
      ]);

      const total = migratedCount + pendingCount;
      if (total > 0) {
        toast.dismiss();
        toast.success(`${total} ${total === 1 ? 'item sincronizado' : 'itens sincronizados'} com sua conta!`);
      } else {
        toast.dismiss();
      }

      router.push(redirectTo);
      router.refresh();
    }
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
            <div
              className="mb-4 p-4 bg-error/10 text-error rounded-lg text-sm"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
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
