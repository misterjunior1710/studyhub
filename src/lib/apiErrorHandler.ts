import { sendErrorAlert } from "./emailAlerts";

/**
 * Wrapper for API calls that automatically sends error alerts on failure
 */
export const withErrorAlert = async <T>(
  route: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || "Unknown error";
    
    // Send error alert (non-blocking)
    sendErrorAlert(route, errorMessage).catch(console.error);
    
    // Re-throw the error so the calling code can handle it
    throw error;
  }
};

/**
 * Helper to manually report an API error
 */
export const reportApiError = (route: string, errorMessage: string) => {
  sendErrorAlert(route, errorMessage).catch(console.error);
};
