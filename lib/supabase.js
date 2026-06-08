import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('plan, is_admin, full_name, avatar_url, email, stripe_customer_id, stripe_subscription_id, subscription_ends_at, stripe_status')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

const ADMIN_EMAILS = ['familycabanellascapo@gmail.com']

export function isUnlimited(profile, userEmail) {
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) return true
  if (profile?.is_admin === true) return true
  if (!profile?.plan || profile.plan === 'free') return false

  // Check subscription hasn't expired
  if (profile.subscription_ends_at) {
    const expiresAt = new Date(profile.subscription_ends_at)
    if (expiresAt < new Date()) return false
  }

  return true
}

export function getActivePlan(profile, userEmail) {
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) return 'premium'
  if (profile?.is_admin === true) return 'premium'
  if (!profile?.plan || profile.plan === 'free') return 'free'
  if (profile.subscription_ends_at && new Date(profile.subscription_ends_at) < new Date()) return 'free'
  return profile.plan
}
