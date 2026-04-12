function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var currentDate = new Date();
  
  try {
    // 1. EXTENDED SELF-DEBUGGER: Catch the payload wherever the browser dropped it
    var rawData = "";
    
    if (e && e.postData && e.postData.contents) {
      rawData = e.postData.contents;
    } else if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      // If the browser converted the JSON into a form URL-encoded key during redirect
      rawData = Object.keys(e.parameter)[0]; 
    }

    if (!rawData) {
      // Dump the entire event object to see exactly what Google received
      var eventDump = JSON.stringify(e) || "Empty Event";
      sheet.appendRow([currentDate, "DEBUG ERROR", "Payload missing. Dump:", eventDump, "", "", "", "", "", ""]);
      return ContentService.createTextOutput("No data").setMimeType(ContentService.MimeType.JSON);
    }

    var data;
    // 2. SELF-DEBUGGER: Catch if the data isn't perfectly formatted JSON
    try {
      data = JSON.parse(rawData);
    } catch (parseError) {
      sheet.appendRow([currentDate, "JSON PARSE ERROR", rawData, "Check your patient-details.js file", "", "", "", "", "", ""]);
      return ContentService.createTextOutput("Parse Error").setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if we need to insert a blank row to visually separate a new day
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var lastDateValue = sheet.getRange(lastRow, 1).getValue();
      if (lastDateValue instanceof Date) {
        var lastDateString = Utilities.formatDate(lastDateValue, Session.getScriptTimeZone(), "yyyy-MM-dd");
        var currentDateString = Utilities.formatDate(currentDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
        
        if (lastDateString !== currentDateString) {
          // Push 10 empty strings to match our 10 columns for a clean break
          sheet.appendRow(["", "", "", "", "", "", "", "", "", ""]);
        }
      }
    }
    
    // Append the actual order data into the 10 columns (A through J)
    sheet.appendRow([
      currentDate,               // A: Timestamp
      data.name || "N/A",        // B: Customer Name
      data.age || "N/A",         // C: Age
      data.gender || "N/A",      // D: Gender
      data.mobile || "N/A",      // E: Mobile Number
      data.email || "N/A",       // F: Email Address
      data.address || "N/A",     // G: Address Note
      data.gpsLink || "N/A",     // H: GPS Location Link
      data.tests || "N/A",       // I: Tests Booked
      data.totalAmount || 0      // J: Total Amount (₹)
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch(error) {
    // 3. SELF-DEBUGGER: Catch deep system errors
    sheet.appendRow([currentDate, "SYSTEM ERROR", error.toString(), "", "", "", "", "", "", ""]);
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": error.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
