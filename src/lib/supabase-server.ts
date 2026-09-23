import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

// Server-side client (Server Components, Route Handlers, Server Actions)
// Uses cookies for session — must only be imported in server context.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore — setAll called from a Server Component
        }
      },
    },
  });
}

// Service role client (bypasses RLS — only for admin operations in API routes)
export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }
  return createClient(supabaseUrl!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}