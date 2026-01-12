import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
