import emailjs from '@emailjs/browser';

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
 * Sends an email alert via EmailJS
 * Only triggers for: "payment", "error", "flagged_post", "manual_alert"
 * All other event types are automatically ignored
 */
export const sendAlert = async (
  eventType: string,
  details: AlertDetails
): Promise<{ success: boolean; message: string }> => {
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
