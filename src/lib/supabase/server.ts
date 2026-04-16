import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// Server-side Supabase client for React Server Components and route handlers.
// Pulls the Clerk token from the incoming request via auth().getToken().
export async function createServerSupabaseClient() {
  const { getToken } = await auth();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      accessToken: async () => (await getToken()) ?? null,
    }
  );
}
