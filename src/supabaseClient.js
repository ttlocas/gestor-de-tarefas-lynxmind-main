import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfinwjsmjauucwrdwqux.supabase.com';  // ← substitui pelo teu URL do Supabase (vem do dashboard)
const supabaseAnonKey = 'sb_publishable_ReftqLWb3SGWKvXIDvOwgQ_V7KLAI7y';  // ← substitui pela tua chave anon (também do dashboard, em Settings > API)

export const supabase = createClient(supabaseUrl, supabaseAnonKey);