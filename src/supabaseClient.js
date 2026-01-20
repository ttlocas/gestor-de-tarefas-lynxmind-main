import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gfinwjsmjauucwrdwqux.supabase.co";
const supabaseAnonKey = "sb_publishable_ReftqLWb3SGWKvXIDvOwgQ_V7KLAI7y";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
