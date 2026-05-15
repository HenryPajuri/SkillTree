import { createClient } from "@supabase/supabase-js";

// Public, anon-key client — safe to bundle. Database access is gated by
// row-level-security policies on the Supabase side, not by hiding this key.
const SUPABASE_URL = "https://zphrmhkeshfbyizjmldi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_eMb-uoZWSGfGQU6qVsZw2w_j4kDytT9";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
