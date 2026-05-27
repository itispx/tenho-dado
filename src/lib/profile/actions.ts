"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/game";

export interface ProfileFormState {
  error: string | null;
}

export async function createProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Você precisa estar logado." };
  }

  const username = (formData.get("username") as string).trim().toLowerCase();

  if (!username) {
    return { error: "Escolha um nome de usuário." };
  }

  if (username.length < 3 || username.length > 20) {
    return { error: "O nome deve ter entre 3 e 20 caracteres." };
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return { error: "Apenas letras minúsculas, números e _." };
  }

  const { error } = await supabase.from("profile").insert({ id: user.id, username });

  if (error) {
    if (error.code === "23505") {
      return { error: "Este nome já está em uso. Tente outro." };
    }
    return { error: "Erro ao salvar. Tente novamente." };
  }

  revalidatePath("/", "layout");
  redirect("/game");
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from("profile").select("*").eq("id", user.id).single();

  return data ?? null;
}

export async function findProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data } = await supabase.from("profile").select("*").eq("username", username.trim().toLowerCase()).single();

  return data ?? null;
}
