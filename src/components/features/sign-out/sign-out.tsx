"use client";

import { useState } from "react";

import { signOutAction } from "@/actions/auth";
import Button from "@/components/ui/button/button";

function SignOut() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    await signOutAction();
  }

  return (
    <div className="flex justify-center">
      <Button type="button" variant="ghost" size="sm" fullWidth={false} onClick={handleSignOut} isLoading={isLoading}>
        Sair
      </Button>
    </div>
  );
}

export default SignOut;
