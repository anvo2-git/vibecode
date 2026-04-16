"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

// Browser-side Supabase client authed with the Clerk session token.
// Clerk issues a JWT whose `sub` claim Supabase maps to auth.jwt() ->> 'sub',
// which RLS policies on `favorites` / `perfume_notes` rely on.
//
// Requires: Clerk → Supabase Third-Party Auth integration configured in both
// dashboards. The `accessToken` callback is called on every request.
export function useSupabase(): SupabaseClient {
  const { session } = useSession();

  return useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          accessToken: async () => (await session?.getToken()) ?? null,
        }
      ),
    [session]
  );
}
