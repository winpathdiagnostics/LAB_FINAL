// =====================================================================
// PATIENT & LOCATION DETAILS (Google Sheets Integration)
// =====================================================================

// IMPORTANT: Replace the URL below with your actual Google Apps Script Web App URL
const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxBANlQ3bOSxO0-rGPyN2Hkd8jH7g7Q6ytMUziusu81ZeVW2Azodrv-cUkv6iZ9vBvV/exec";

/**
 * Sends patient details, cart summary, and location data to Google Sheets.
 */
async function recordPatientDetails(patientData) {
    if (!GOOGLE_SHEETS_WEB_APP_URL || GOOGLE_SHEETS_WEB_APP_URL === "https://script.google.com/macros/s/AKfycbxBANlQ3bOSxO0-rGPyN2Hkd8jH7g7Q6ytMUziusu81ZeVW2Azodrv-cUkv6iZ9vBvV/exec") {
        console.warn("Google Sheets URL not configured. Skipping database record.");
        return; 
    }

    try {
        await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // <-- THE FIX: This forces the browser to bypass CORS restrictions
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', 
            },
            body: JSON.stringify(patientData)
        });
        
        // Note: With 'no-cors', the browser hides the response, but the data successfully reaches Google!
        console.log("Patient details payload successfully dispatched to Google Sheets.");
    } catch (error) {
        console.error("Error recording to Google Sheets:", error);
    }
}
