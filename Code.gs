const TICKETS_SHEET = "Tickets";
const NOTES_SHEET = "Notes";

const STATUS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed"
};


/**
 * Get the active spreadsheet.
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}


/**
 * Get a specific sheet by name.
 */
function getSheet(sheetName) {

  const sheet = getSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error("Sheet not found: " + sheetName);
  }

  return sheet;
}


/**
 * Include another HTML file.
 */
function include(filename) {

  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}


/**
 * Handle website requests.
 *
 * Normal request:
 *   Opens the CRM frontend.
 *
 * API request:
 *   ?action=list
 */
function doGet(e) {

  try {

    const action = e && e.parameter
      ? e.parameter.action
      : null;


    // GET /?action=list
    if (action === "list") {

      const search = e.parameter.search || "";
      const status = e.parameter.status || "All";

      const result = handleApiRequest("list", {
        search: search,
        status: status
      });

      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // GET ticket details
    if (action === "detail") {

     const ticketId = e.parameter.ticket_id;

      if (!ticketId) {
     throw new Error("ticket_id is required.");
      }

      const result = handleApiRequest("detail", {
      ticket_id: ticketId
       });

      return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    }

    // Normal website request
    return HtmlService
      .createTemplateFromFile("index")
      .evaluate()
      .setTitle("Datastraw Support CRM")
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );

  } catch (error) {

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * Handle POST API requests.
 */
function doPost(e) {

  try {

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Request body is missing.");
    }

    const requestData = JSON.parse(
      e.postData.contents
    );

    const action = requestData.action;
    const data = requestData.data;

    const result = handleApiRequest(
      action,
      data
    );

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
