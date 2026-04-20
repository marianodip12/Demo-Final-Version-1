import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://emmqrzqxlkqvsqbihwdt.supabase.co'
const SUPABASE_KEY = 'sb_publishable_viHL4H6Hdsc6IZtqebOAxg_N5N__3fA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})
