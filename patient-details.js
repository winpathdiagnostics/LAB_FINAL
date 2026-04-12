// =====================================================================
// CUSTOMER & LOCATION DETAILS (Google Sheets Integration)
// =====================================================================

// IMPORTANT: Replace the URL below with your actual Google Apps Script Web App URL
// This URL is obtained after clicking Deploy > New Deployment in Google Apps Script.
const GOOGLE_SHEETS_WEB_APP_URL = "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE";

/**
 * Silently submits checkout data to a Google Sheet in the background.
 * Uses the 'Super-Catcher' URL parameter logic to bypass body-stripping issues.
 */
async function recordPatientDetails(customerData) {
    if (!GOOGLE_SHEETS_WEB_APP_URL || GOOGLE_SHEETS_WEB_APP_URL.includes("YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE")) {
        console.warn("Google Sheets URL not configured. Skipping background tracking.");
        return;
    }

    try {
        // --- NEW BYPASS LOGIC ---
        // We convert the JSON data into a URL-safe string and append it to the URL.
        // This ensures the data survives the redirect even if the browser strips the POST body.
        const payload = encodeURIComponent(JSON.stringify(customerData));
        const finalUrl = `${GOOGLE_SHEETS_WEB_APP_URL}?payload=${payload}`;

        await fetch(finalUrl, {
            method: 'POST',
            mode: 'no-cors' // Bypasses CORS blocks on static sites
        });
        
        console.log("Customer data successfully dispatched to Google Sheets via payload parameter.");
    } catch (error) {
        console.error("Error submitting to Google Sheets:", error);
    }
}
