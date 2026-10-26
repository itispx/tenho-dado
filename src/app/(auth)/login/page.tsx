import type { Metadata } from "next";

import AuthForm from "@/components/features/auth-form/auth-form";
import Card from "@/components/ui/card/card";
import Title from "@/components/ui/title/title";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre com seu usuário e senha.",
};

function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ink-950 px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <Title title="Tenho Dado" subtitle="Você tem dado?" />

        <Card className="p-6">
          <AuthForm />
        </Card>
      </div>
    </main>
  );
}

export default LoginPage;
