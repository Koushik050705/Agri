import { supabase } from './supabase';

/**
 * Sends an SMS via the Supabase Edge Function (Twilio proxy).
 * @param {string} to - Recipient phone number (e.g. "9876543210" or "+919876543210")
 * @param {string} message - SMS body text
 */
export async function sendSMS(to, message) {
  if (!to) {
    console.warn('[SMS] No phone number provided, skipping.');
    return;
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: { to, message },
    });

    if (error) {
      console.error('[SMS] Edge function error:', error);
    } else {
      console.log('[SMS] Sent successfully:', data);
    }
  } catch (err) {
    console.error('[SMS] Failed to send:', err.message);
  }
}
