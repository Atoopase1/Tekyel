import { NextResponse } from 'next/server';
import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Setup Web Push
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

// If you want to use the push service, you MUST set a subject (mailto: or https://)
webPush.setVapidDetails(
  'mailto:admin@tekyel.com',
  vapidPublicKey,
  vapidPrivateKey
);

// We need a service-role supabase client to fetch all subscriptions for a user,
// since RLS might prevent User A from reading User B's push subscriptions.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('[Web Push] VAPID keys not configured');
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { userId, title, body: messageBody, icon, url } = body;

    if (!userId || !title) {
      return NextResponse.json({ error: 'Missing userId or title' }, { status: 400 });
    }

    // 1. Fetch the user's active push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', userId);

    if (error) {
      console.error('[Web Push] DB Error fetching subscriptions:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'No active subscriptions for user' });
    }

    // 2. Prepare the payload
    const payload = JSON.stringify({
      title,
      body: messageBody,
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
      url: url || '/',
    });

    // 3. Send to all devices the user has registered
    const promises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webPush.sendNotification(pushSubscription, payload);
      } catch (err: any) {
        // If the subscription is expired or invalid (410 or 404), delete it from DB
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log('[Web Push] Subscription expired, deleting endpoint:', sub.endpoint);
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
        } else {
          console.error('[Web Push] Error sending to endpoint:', err);
        }
      }
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true, sentCount: subscriptions.length });
  } catch (error: any) {
    console.error('[Web Push] Fatal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
