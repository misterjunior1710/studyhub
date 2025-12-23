/**
 * Opens external links in system browser (for WebView compatibility)
 * Internal links use normal navigation
 */
export const openExternalLink = (url: string): void => {
  // Check if running in WebView (Android/iOS)
  const isWebView = /wv|webview/i.test(navigator.userAgent) || 
    (window as unknown as { Android?: unknown }).Android !== undefined;
  
  if (isWebView) {
    // Try to open in system browser
    window.open(url, '_system');
  } else {
    // Regular browser - open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Check if a URL is external
 */
export const isExternalUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
};
