// =====================================================================
// PATIENT & LOCATION DETAILS (Google Sheets Integration)
// =====================================================================
// IMPORTANT: Replace the URL below with your actual Google Apps Script Web App URL
// See the setup guide to learn how to generate this URL.

const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxBANlQ3bOSxO0-rGPyN2Hkd8jH7g7Q6ytMUziusu81ZeVW2Azodrv-cUkv6iZ9vBvV/exec";

/**
 * Sends patient details, cart summary, and location data to Google Sheets.
 * Uses text/plain to seamlessly bypass CORS restrictions on static GitHub Pages.
 */
async function recordPatientDetails(patientData) {
    if (!GOOGLE_SHEETS_WEB_APP_URL || GOOGLE_SHEETS_WEB_APP_URL === "https://script.google.com/macros/s/AKfycbxBANlQ3bOSxO0-rGPyN2Hkd8jH7g7Q6ytMUziusu81ZeVW2Azodrv-cUkv6iZ9vBvV/exec") {
        console.warn("Google Sheets URL not configured. Skipping database record.");
        return; // Exits gracefully so WhatsApp handoff isn't interrupted
    }

    try {
        await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
            method: 'POST',
            headers: {
                // Using text/plain is a standard workaround to prevent preflight CORS errors from static sites
                'Content-Type': 'text/plain;charset=utf-8', 
            },
            body: JSON.stringify(patientData)
        });
        console.log("Patient details successfully recorded in Google Sheets.");
    } catch (error) {
        console.error("Error recording to Google Sheets:", error);
        // We catch and log the error silently so the user still proceeds to WhatsApp
    }
}
