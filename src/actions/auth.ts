"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { EMAIL_DOMAIN } from "@/lib/constants";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { userFormSchema } from "@/schemas/user";

export interface AuthActionState {
  error: string | null;
  userId?: string;
}

export interface AuthFormState {
  error: string | null;
}

/**
 * Ação de formulário (progressiva): funciona sem JavaScript, porque o próprio
 * navegador envia o POST e o Next executa a action no servidor.
 */
export async function signInFormAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = userFormSchema.safeParse({
    username: String(formData.get("username") ?? "").replace(/\s/g, ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Confira os dados informados." };
  }

  return signInAction(parsed.data.username, parsed.data.password);
}

export async function registerFormAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = userFormSchema.safeParse({
    username: String(formData.get("username") ?? "").replace(/\s/g, ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Confira os dados informados." };
  }

  return registerAction(parsed.data.username, parsed.data.password);
}

export async function signInAction(username: string, password: string): Promise<AuthActionState> {
  const supabase = await createClient();

  const email = `${username}@${EMAIL_DOMAIN}`;

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    console.error("[signIn] error", signInError);
    return { error: "Usuário ou senha incorretos." };
  }

  revalidatePath("/", "layout");
  redirect("/game");
}

export async function signUpAction(username: string, password: string): Promise<AuthActionState> {
  const supabase = await createClient();
  const email = `${username}@${EMAIL_DOMAIN}`;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

  if (signUpError) {
    console.error("[signUp] signUp error", signUpError);
    return { error: signUpError.message };
  }
  if (!signUpData.user) return { error: "Falha ao criar usuário." };

  const { error: updateUserError } = await adminClient.auth.admin.updateUserById(signUpData.user.id, {
    email_confirm: true,
  });

  if (updateUserError) {
    console.error("[signUp] updateUser error", updateUserError);
    return { error: updateUserError.message };
  }

  const { error: profileError } = await adminClient.from("profile").insert({ id: signUpData.user.id, username });

  if (profileError) {
    console.error("[signUp] profile insert error", profileError);
    return { error: profileError.message };
  }

  return { error: null, userId: signUpData.user.id };
}

export async function registerAction(username: string, password: string): Promise<AuthActionState> {
  const { error: signUpError } = await signUpAction(username, password);
  if (signUpError) return { error: signUpError };

  return signInAction(username, password);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
