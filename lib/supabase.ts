import { createClient } from '@supabase/supabase-js'

// Sustituye estos dos valores con los de tu proyecto en Supabase
// Los tienes en: Project Settings > API
const supabaseUrl = 'https://ynbwuioflatbfxjgabiw.supabase.co'
const supabaseAnonKey = 'sb_publishable_X5HUuo4hGMYt_rC7ZlmAKw_sA5QIpud'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)