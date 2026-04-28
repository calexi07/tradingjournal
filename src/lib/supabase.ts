import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://ukqyrudisnvstdlzsqsq.supabase.co',
    'sb_publishable_jw-BS8GquyOL2jIG_kvtYQ_G9kYqMng',
    {
      auth: {
        flowType: 'implicit',
        detectSessionInUrl: true,
        persistSession: true,
      }
    }
  )
}

export const supabase = createClient()
