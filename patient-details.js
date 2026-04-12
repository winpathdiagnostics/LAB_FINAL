// =====================================================================
// CUSTOMER & LOCATION DETAILS (Google Sheets Integration)
// =====================================================================

// IMPORTANT: Replace the URL below with your actual Google Apps Script Web App URL
// This URL is obtained after clicking Deploy > New Deployment in Google Apps Script.
const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyD26G_gNDTbMZKebGUUfmYIs2voSO6gRa3OmyNYjY2gFDpf7hnkukb7JGAWarAIF27Xw/exec";

/**
 * Silently submits checkout data to a Google Sheet in the background.
 * Uses the 'GET' method with URL parameters for maximum reliability.
 */
async function recordPatientDetails(customerData) {
    if (!GOOGLE_SHEETS_WEB_APP_URL || GOOGLE_SHEETS_WEB_APP_URL.includes("https://script.google.com/macros/s/AKfycbyD26G_gNDTbMZKebGUUfmYIs2voSO6gRa3OmyNYjY2gFDpf7hnkukb7JGAWarAIF27Xw/exec")) {
        console.warn("Google Sheets URL not configured. Skipping background tracking.");
        return;
    }

    try {
        // --- FINAL RELIABILITY LOGIC ---
        // We use GET because it is the most robust way to ensure data survives 
        // the Google Apps Script security redirect across all browsers.
        const payload = encodeURIComponent(JSON.stringify(customerData));
        const finalUrl = `${GOOGLE_SHEETS_WEB_APP_URL}?payload=${payload}`;

        await fetch(finalUrl, {
            method: 'GET',
            mode: 'no-cors' // Allows the request to be sent silently without security errors
        });
        
        console.log("Customer data successfully dispatched to Google Sheets via GET payload.");
    } catch (error) {
        console.error("Error submitting to Google Sheets:", error);
    }
}
