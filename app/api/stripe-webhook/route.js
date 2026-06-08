import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Lazy-init so module evaluation during build doesn't throw on missing env vars
let _stripe, _supabaseAdmin
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  return _stripe
}
function getAdmin() {
  if (!_supabaseAdmin)
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  return _supabaseAdmin
}

// Map Stripe product metadata → plan name
// Set metadata key "plan" on each Stripe product: premium | premium_annual | teams | teams_annual
function planFromSession(session) {
  const meta = session?.line_items?.data?.[0]?.price?.product?.metadata?.plan
  if (meta) return meta

  const amount = session?.amount_total ?? 0
  if (amount <= 0)   return 'premium'
  if (amount < 1000) return 'premium'
  if (amount < 5000) return 'premium_annual'
  if (amount < 7000) return 'teams'
  return 'teams_annual'
}

function planFromSubscription(subscription) {
  const meta = subscription?.items?.data?.[0]?.price?.product?.metadata?.plan
  if (meta) return meta

  const amount = subscription?.items?.data?.[0]?.price?.unit_amount ?? 0
  if (amount < 1000) return 'premium'
  if (amount < 5000) return 'premium_annual'
  if (amount < 7000) return 'teams'
  return 'teams_annual'
}

async function updateProfile(userId, updates) {
  console.log('[stripe-webhook] updateProfile', userId, updates)
  const { error } = await getAdmin()
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) console.error('[stripe-webhook] updateProfile error', error)
}

async function findUserByCustomer(customerId) {
  const { data } = await getAdmin()
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.id ?? null
}

export async function POST(req) {
  const stripe = getStripe()
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  console.log('[stripe-webhook] event', event.type)

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      const expanded = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items.data.price.product'],
      })

      const userId     = expanded.client_reference_id
      const customerId = expanded.customer
      const subId      = expanded.subscription
      const plan       = planFromSession(expanded)

      console.log('[stripe-webhook] checkout.completed', { userId, customerId, subId, plan })

      if (!userId) {
        console.warn('[stripe-webhook] no client_reference_id — cannot link to user')
        return new Response('ok', { status: 200 })
      }

      let endsAt = null
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId)
        endsAt = new Date(sub.current_period_end * 1000).toISOString()
      } else {
        endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      await updateProfile(userId, {
        plan,
        stripe_customer_id:     customerId,
        stripe_subscription_id: subId ?? null,
        subscription_ends_at:   endsAt,
        stripe_status:          'active',
      })
    }

    else if (event.type === 'customer.subscription.updated') {
      const sub        = event.data.object
      const customerId = sub.customer
      const userId     = await findUserByCustomer(customerId)
      const plan       = planFromSubscription(sub)
      const endsAt     = new Date(sub.current_period_end * 1000).toISOString()
      const status     = sub.status

      console.log('[stripe-webhook] subscription.updated', { customerId, userId, plan, status })

      if (!userId) {
        console.warn('[stripe-webhook] unknown customer', customerId)
        return new Response('ok', { status: 200 })
      }

      if (status === 'active' || status === 'trialing') {
        await updateProfile(userId, {
          plan,
          stripe_subscription_id: sub.id,
          subscription_ends_at:   endsAt,
          stripe_status:          status,
        })
      } else {
        await updateProfile(userId, {
          stripe_status:        status,
          subscription_ends_at: endsAt,
        })
      }
    }

    else if (event.type === 'customer.subscription.deleted') {
      const sub        = event.data.object
      const customerId = sub.customer
      const userId     = await findUserByCustomer(customerId)

      console.log('[stripe-webhook] subscription.deleted', { customerId, userId })

      if (!userId) {
        console.warn('[stripe-webhook] unknown customer', customerId)
        return new Response('ok', { status: 200 })
      }

      await updateProfile(userId, {
        plan:                   'free',
        stripe_subscription_id: null,
        subscription_ends_at:   null,
        stripe_status:          'canceled',
      })
    }

  } catch (err) {
    console.error('[stripe-webhook] handler error', err)
    return new Response('Internal error', { status: 500 })
  }

  return new Response('ok', { status: 200 })
}
