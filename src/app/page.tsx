import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/game");
  }

  redirect("/login");
}

export default RootPage;
