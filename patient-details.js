// =====================================================================
// CUSTOMER & LOCATION DETAILS (Google Sheets Integration)
// =====================================================================

// IMPORTANT: Replace the URL below with your actual Google Apps Script Web App URL
// Example: "https://script.google.com/macros/s/AKfycb.../exec"
const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyD26G_gNDTbMZKebGUUfmYIs2voSO6gRa3OmyNYjY2gFDpf7hnkukb7JGAWarAIF27Xw/exec";

/**
 * Silently submits checkout data to a Google Sheet in the background.
 */
async function recordPatientDetails(customerData) {
    if (!GOOGLE_SHEETS_WEB_APP_URL || GOOGLE_SHEETS_WEB_APP_URL.includes("https://script.google.com/macros/s/AKfycbyD26G_gNDTbMZKebGUUfmYIs2voSO6gRa3OmyNYjY2gFDpf7hnkukb7JGAWarAIF27Xw/exec")) {
        console.warn("Google Sheets URL not configured. Skipping background tracking.");
        return;
    }

    try {
        // Send the data invisibly using 'no-cors' to bypass browser security blocks
        await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // CRITICAL: This bypasses the CORS block on static sites
            body: JSON.stringify(customerData)
        });
        
        console.log("Order successfully logged to Google Sheets.");
    } catch (error) {
        console.error("Error submitting to Google Sheets:", error);
    }
}
