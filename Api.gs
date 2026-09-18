/**
 * Handle API requests.
 */
function handleApiRequest(action, data) {

  try {

    switch (action) {

      case "create":

        return {
          success: true,
          data: createTicket(data)
        };


      case "list":

        return {
          success: true,
          data: getTickets(
            data && data.search,
            data && data.status
          )
        };


      case "detail":

        return {
          success: true,
          data: getTicketById(
            data.ticket_id
          )
        };


      case "update":

        return updateTicket(
          data.ticket_id,
          data
        );


      default:

        throw new Error(
          "Invalid API action."
        );
    }

  } catch (error) {

    return {
      success: false,
      error: error.message
    };
  }
}
