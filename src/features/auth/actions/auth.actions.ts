"use server";

import { redirect } from "next/navigation";

async function getSupabaseServerClient() {
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore errors from Server Components
        }
      },
    },
  });
}

export type SignInResult = 
  | { success: true; user: { id: string; email: string } }
  | { success: false; error: string };

export async function signInWithEmail(
  email: string,
  password: string
): Promise<SignInResult> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: getErrorMessage(error.code) };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
      },
    };
  } catch (err) {
    console.error("Error in signInWithEmail:", err);
    return { success: false, error: "Erro interno. Tente novamente." };
  }
}

export type SignUpResult = 
  | { success: true; needsConfirmation: boolean }
  | { success: false; error: string };

export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<SignUpResult> {
  try {
    if (password.length < 6) {
      return { success: false, error: "A senha deve ter pelo menos 6 caracteres" };
    }

    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || "",
        },
      },
    });

    if (error) {
      return { success: false, error: getErrorMessage(error.code) };
    }

    if (data.user && !data.session) {
      return { success: true, needsConfirmation: true };
    }

    return { success: true, needsConfirmation: false };
  } catch (err) {
    console.error("Error in signUpWithEmail:", err);
    return { success: false, error: "Erro interno. Tente novamente." };
  }
}

export type SignOutResult = { success: boolean };

export async function signOutAction(): Promise<SignOutResult> {
  try {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (err) {
    console.error("Error in signOutAction:", err);
    return { success: false };
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
    const { data: { session } } = await supabase.auth.getSession();
    return { authenticated: !!session };
  } catch {
    return { authenticated: false };
  }
}
