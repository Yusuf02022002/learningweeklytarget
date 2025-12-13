import { createClient } from "@supabase/supabase-js";
console.log("URL:", process.env.SUPABASE_URL);
console.log(
  "KEY:",
  process.env.SUPABASE_SERVICE_KEY ? "KEY OK" : "KEY MISSING"
);

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
