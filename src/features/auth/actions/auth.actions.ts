"use server";

import { getSupabaseServerClient } from "@/utils/supabase/server";
import type { ActionResult } from "@/shared/types/action-result";
import { success, failure } from "@/shared/types/action-result";
import { signInSchema, signUpSchema } from "@/features/auth/schemas/auth.schema";

type SignInData = {
  user: { id: string; email: string };
};

export async function signInWithEmail(
  email: string,
  password: string
): Promise<ActionResult<SignInData>> {
  const parsed = signInSchema.safeParse({ email, password });
  if (!parsed.success) {
    return failure("INVALID_INPUT", "E-mail ou senha inválidos.");
  }

  try {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return failure("SIGN_IN_FAILED", getErrorMessage(error.code));
    }

    return success({
      user: {
        id: data.user.id,
        email: data.user.email!,
      },
    });
  } catch (err) {
    console.error("[signInWithEmail]", err);
    return failure("SIGN_IN_ERROR", "Erro interno. Tente novamente.");
  }
}

type SignUpData = {
  needsConfirmation: boolean;
};

export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<ActionResult<SignUpData>> {
  const parsed = signUpSchema.safeParse({ email, password, name });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return failure("INVALID_INPUT", issue.message);
  }

  try {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.name || "",
        },
      },
    });

    if (error) {
      return failure("SIGN_UP_FAILED", getErrorMessage(error.code));
    }

    if (data.user && !data.session) {
      return success({ needsConfirmation: true });
    }

    return success({ needsConfirmation: false });
  } catch (err) {
    console.error("[signUpWithEmail]", err);
    return failure("SIGN_UP_ERROR", "Erro interno. Tente novamente.");
  }
}

export async function signOutAction(): Promise<ActionResult> {
  try {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.signOut();
    return success(undefined);
  } catch (err) {
    console.error("[signOutAction]", err);
    return failure("SIGN_OUT_ERROR", "Erro ao sair.");
  }
}

function getErrorMessage(code: string | undefined): string {
  if (!code) return "Erro ao processar solicitação. Tente novamente.";

  const errorMessages: Record<string, string> = {
    "invalid_credentials": "E-mail ou senha incorretos",
    "user_not_found": "Usuário não encontrado",
    "email_not_confirmed": "Por favor, confirme seu e-mail para fazer login",
    "invalid_grant": "E-mail ou senha incorretos",
    "user_already_exists": "Este e-mail já está cadastrado",
    "weak_password": "A senha é muito fraca",
    "invalid_email": "E-mail inválido",
    "over_request_rate_limit": "Muitas tentativas. Tente novamente mais tarde",
  };

  return errorMessages[code] || "Erro ao processar solicitação. Tente novamente.";
}

export async function verifyAuthAction() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return { authenticated: !!user };
  } catch {
    return { authenticated: false };
  }
}
