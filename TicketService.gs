/**
 * Generate the next ticket ID.
 * Example: TKT-001, TKT-002, TKT-003
 */
function generateTicketId() {
  const sheet = getSheet(TICKETS_SHEET);
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return CONFIG.TICKET_PREFIX + "001";
  }

  const ticketIds = sheet
    .getRange(2, 2, lastRow - 1, 1)
    .getValues()
    .flat()
    .filter(String);

  if (ticketIds.length === 0) {
    return CONFIG.TICKET_PREFIX + "001";
  }

  const numbers = ticketIds.map(function(ticketId) {
    return parseInt(
      String(ticketId).replace(CONFIG.TICKET_PREFIX, ""),
      10
    );
  });

  const validNumbers = numbers.filter(function(number) {
    return !isNaN(number);
  });

  if (validNumbers.length === 0) {
    return CONFIG.TICKET_PREFIX + "001";
  }

  const maxNumber = Math.max.apply(null, validNumbers);

  return CONFIG.TICKET_PREFIX +
    String(maxNumber + 1).padStart(3, "0");
}


/**
 * Create a new support ticket.
 */
function createTicket(data) {

  if (!data) {
    throw new Error("Ticket data is required.");
  }

  const customerName = String(data.customer_name || "").trim();
  const customerEmail = String(data.customer_email || "").trim();
  const subject = String(data.subject || "").trim();
  const description = String(data.description || "").trim();

  // Validate required fields
  if (!customerName) {
    throw new Error("Customer name is required.");
  }

  if (!customerEmail) {
    throw new Error("Customer email is required.");
  }

  if (!subject) {
    throw new Error("Subject is required.");
  }

  if (!description) {
    throw new Error("Description is required.");
  }

  // Basic email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(customerEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  // Generate ticket ID
  const ticketId = generateTicketId();

  // Current timestamp
  const now = new Date();

  // Get Tickets sheet
  const sheet = getSheet(TICKETS_SHEET);

  // Generate database ID
  const id = sheet.getLastRow();

  // Store ticket
  sheet.appendRow([
    id,
    ticketId,
    customerName,
    customerEmail,
    subject,
    description,
    CONFIG.DEFAULT_STATUS,
    now,
    now
  ]);

  return {
    ticket_id: ticketId,
    created_at: now.toISOString()
  };
}


/**
 * Temporary test function.
 * Delete this after testing.
 */
function testCreateTicket() {

  const testData = {
    customer_name: "Test Customer",
    customer_email: "test@example.com",
    subject: "Test Support Ticket",
    description: "This is a test ticket."
  };

  const result = createTicket(testData);

  Logger.log(result);
}
/**
 * Get all tickets with optional search and status filter.
 *
 * @param {string} search Search text
 * @param {string} status Status filter
 */
function getTickets(search, status) {

  const sheet = getSheet(TICKETS_SHEET);
  const lastRow = sheet.getLastRow();

  // No tickets yet
  if (lastRow <= 1) {
    return [];
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, 9)
    .getValues();

  const searchText = String(search || "").trim().toLowerCase();
  const statusFilter = String(status || "").trim();

  const tickets = values.map(function(row) {

    return {
      id: row[0],
      ticket_id: row[1],
      customer_name: row[2],
      customer_email: row[3],
      subject: row[4],
      description: row[5],
      status: row[6],
      created_at: row[7],
      updated_at: row[8]
    };

  });

  // Apply search and status filtering
  const filteredTickets = tickets.filter(function(ticket) {

    // Status filter
    if (statusFilter && statusFilter !== "All") {
      if (ticket.status !== statusFilter) {
        return false;
      }
    }

    // Search filter
    if (searchText) {

      const searchableText = [
        ticket.ticket_id,
        ticket.customer_name,
        ticket.customer_email,
        ticket.subject,
        ticket.description
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(searchText)) {
        return false;
      }
    }

    return true;
  });

  // Newest tickets first
  filteredTickets.reverse();

  // Return only fields needed by ticket list
  return filteredTickets.map(function(ticket) {

    return {
      ticket_id: ticket.ticket_id,
      customer_name: ticket.customer_name,
      subject: ticket.subject,
      status: ticket.status,
      created_at: formatDate(ticket.created_at)
    };

  });
}
/**
 * Get a single ticket with its notes.
 */
function getTicketById(ticketId) {

  const sheet = getSheet(TICKETS_SHEET);
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    throw new Error("Ticket not found.");
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, 9)
    .getValues();

  let ticket = null;

  for (let i = 0; i < values.length; i++) {

    const row = values[i];

    if (String(row[1]).trim() === String(ticketId).trim()) {

      ticket = {
        id: row[0],
        ticket_id: row[1],
        customer_name: row[2],
        customer_email: row[3],
        subject: row[4],
        description: row[5],
        status: row[6],
        created_at: row[7],
        updated_at: row[8]
      };

      break;
    }
  }

  if (!ticket) {
    throw new Error("Ticket not found: " + ticketId);
  }

  // Get notes
  const notesSheet = getSheet(NOTES_SHEET);
  const notesLastRow = notesSheet.getLastRow();

  const notes = [];

  if (notesLastRow > 1) {

    const noteValues = notesSheet
      .getRange(2, 1, notesLastRow - 1, 4)
      .getValues();

    noteValues.forEach(function(row) {

      if (String(row[1]).trim() === String(ticketId).trim()) {

        notes.push({
          id: row[0],
          ticket_id: row[1],
          note_text: row[2],
          created_at: formatDate(row[3])
        });

      }

    });
  }

  return {
    ticket_id: ticket.ticket_id,
    customer_name: ticket.customer_name,
    customer_email: ticket.customer_email,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    notes: notes,
    created_at: formatDate(ticket.created_at),
    updated_at: formatDate(ticket.updated_at)
  };
}

/**
 * Update ticket status and optionally add a note.
 */
function updateTicket(ticketId, data) {

  if (!data) {
    throw new Error("Update data is required.");
  }

  const newStatus = String(data.status || "").trim();
  const noteText = String(data.notes || "").trim();

  // Validate status
  const allowedStatuses = [
    STATUS.OPEN,
    STATUS.IN_PROGRESS,
    STATUS.CLOSED
  ];

  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(
      "Invalid status. Use Open, In Progress, or Closed."
    );
  }

  const sheet = getSheet(TICKETS_SHEET);
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    throw new Error("Ticket not found.");
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, 9)
    .getValues();

  let ticketRow = -1;

  for (let i = 0; i < values.length; i++) {

    if (
      String(values[i][1]).trim() ===
      String(ticketId).trim()
    ) {
      ticketRow = i + 2;
      break;
    }
  }

  if (ticketRow === -1) {
    throw new Error("Ticket not found: " + ticketId);
  }

  const now = new Date();

  // Update status
  sheet
    .getRange(ticketRow, 7)
    .setValue(newStatus);

  // Update timestamp
  sheet
    .getRange(ticketRow, 9)
    .setValue(now);

  // Add note if provided
  if (noteText) {

    const notesSheet = getSheet(NOTES_SHEET);

    const noteId = Math.max(
      notesSheet.getLastRow(),
      1
    );

    notesSheet.appendRow([
      noteId,
      ticketId,
      noteText,
      now
    ]);
  }

  return {
    success: true,
    updated_at: now.toISOString()
  };
}

/**
 * Format a date for API responses.
 */
function formatDate(date) {

  if (!date) {
    return "";
  }

  if (date instanceof Date) {
    return Utilities.formatDate(
      date,
      Session.getScriptTimeZone(),
      CONFIG.DATE_FORMAT
    );
  }

  return String(date);
}
/**
 * Temporary test for ticket listing.
 */

function testGetTicketById() {

  const result = getTicketById("TKT-001");

  Logger.log(
    JSON.stringify(result, null, 2)
  );
}
