import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('plan, is_admin, full_name, avatar_url, email')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

const ADMIN_EMAILS = ['familycabanellascapo@gmail.com']

export function isUnlimited(profile, userEmail) {
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) return true
  return profile?.is_admin === true || (profile?.plan && profile.plan !== 'free')
}
