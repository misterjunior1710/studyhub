import emailjs from '@emailjs/browser';
import { supabase } from '@/integrations/supabase/client';

// EmailJS Configuration - User needs to provide these values
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Allowed event types to prevent spam
const ALLOWED_EVENT_TYPES = ['payment', 'error', 'flagged_post', 'manual_alert'] as const;
type AllowedEventType = typeof ALLOWED_EVENT_TYPES[number];

interface AlertDetails {
  [key: string]: any;
}

/**
 * Check if alerts are enabled in admin settings
 */
export const getAlertsEnabled = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'alerts_enabled')
      .single();
    
    if (error || !data) return true; // Default to enabled
    return data.value === true || data.value === 'true';
  } catch {
    return true; // Default to enabled on error
  }
};

/**
 * Set alerts enabled/disabled
 */
export const setAlertsEnabled = async (enabled: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_settings')
      .update({ value: enabled })
      .eq('key', 'alerts_enabled');
    
    return !error;
  } catch {
    return false;
  }
};

/**
 * Increment daily stats counter
 */
export const incrementDailyStat = async (
  field: 'total_users' | 'total_posts' | 'total_flagged' | 'total_errors' | 'total_payments'
): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Try to get today's record
    const { data: existing } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('date', today)
      .single();
    
    if (existing) {
      // Update existing record
      await supabase
        .from('daily_stats')
        .update({ [field]: (existing[field] || 0) + 1 })
        .eq('date', today);
    } else {
      // Create new record for today
      await supabase
        .from('daily_stats')
        .insert({ date: today, [field]: 1 });
    }
  } catch (error) {
    console.error('Failed to increment daily stat:', error);
  }
};

/**
 * Get today's daily stats
 */
export const getTodayStats = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('date', today)
      .single();
    
    if (error || !data) {
      return {
        total_users: 0,
        total_posts: 0,
        total_flagged: 0,
        total_errors: 0,
        total_payments: 0,
      };
    }
    
    return data;
  } catch {
    return {
      total_users: 0,
      total_posts: 0,
      total_flagged: 0,
      total_errors: 0,
      total_payments: 0,
    };
  }
};

/**
 * Sends an email alert via EmailJS
 * Only triggers for: "payment", "error", "flagged_post", "manual_alert"
 * All other event types are automatically ignored
 */
export const sendAlert = async (
  eventType: string,
  details: AlertDetails
): Promise<{ success: boolean; message: string }> => {
  // Check if alerts are enabled
  const alertsEnabled = await getAlertsEnabled();
  if (!alertsEnabled) {
    console.log('Alerts are disabled. Skipping alert.');
    return { success: false, message: 'Alerts are disabled' };
  }

  // Check if event type is allowed
  if (!ALLOWED_EVENT_TYPES.includes(eventType as AllowedEventType)) {
    console.log(`Event type "${eventType}" is not in the allowed list. Ignoring alert.`);
    return { success: false, message: 'Event type not allowed' };
  }

  // Check if EmailJS is configured
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('EmailJS is not configured. Please add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY to your environment.');
    return { success: false, message: 'EmailJS not configured' };
  }

  // Increment daily stats based on event type
  if (eventType === 'payment') await incrementDailyStat('total_payments');
  if (eventType === 'error') await incrementDailyStat('total_errors');
  if (eventType === 'flagged_post') await incrementDailyStat('total_flagged');

  try {
    const templateParams = {
      event_type: eventType,
      details: JSON.stringify(details, null, 2),
      timestamp: new Date().toISOString(),
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Alert sent successfully:', response);
    return { success: true, message: 'Alert sent successfully' };
  } catch (error: any) {
    console.error('Failed to send alert:', error);
    return { success: false, message: error?.text || 'Failed to send alert' };
  }
};

/**
 * Helper functions for specific alert types
 */
export const sendPaymentAlert = (user: string, amount: number | string, plan: string) => {
  return sendAlert('payment', { user, amount, plan });
};

export const sendErrorAlert = (route: string, errorMessage: string) => {
  return sendAlert('error', { route, errorMessage });
};

export const sendFlaggedPostAlert = (postId: string, reason: string) => {
  return sendAlert('flagged_post', { postId, reason });
};

export const sendManualAlert = (message: string) => {
  return sendAlert('manual_alert', { message });
};

/**
 * Send daily summary via edge function
 */
export const sendDailySummary = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-daily-summary', {
      body: {},
    });
    
    if (error) {
      console.error('Failed to send daily summary:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: data?.message || 'Daily summary sent' };
  } catch (error: any) {
    console.error('Failed to send daily summary:', error);
    return { success: false, message: error.message || 'Failed to send daily summary' };
  }
};
