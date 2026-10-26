import type { Metadata } from "next";
import { redirect } from "next/navigation";

import RegisterForm from "@/components/features/register-form/register-form";
import Card from "@/components/ui/card/card";
import Title from "@/components/ui/title/title";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta para jogar.",
};

async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/game");

  const requiresInvite = Boolean(process.env.REGISTRATION_INVITE_CODE?.trim());

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ink-950 px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <Title title="Tenho Dado" subtitle="Crie sua conta para jogar." />

        <Card className="p-6">
          <RegisterForm requiresInvite={requiresInvite} />
        </Card>
      </div>
    </main>
  );
}

export default RegisterPage;
