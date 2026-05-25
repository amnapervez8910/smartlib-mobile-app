

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://axdzozdrsseddyxezojw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__AioXwMW1CSOrFJow8DW2w_fDTyQGba";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
