# Datastraw Support CRM

A lightweight customer support ticket management system developed as part of the Datastraw Technologies assessment.

## Overview

The application allows support teams to create, view, search, filter, and update customer support tickets. Ticket data and internal notes are stored in Google Sheets, while Google Apps Script provides the backend services and web application.

## Features

- Create support tickets
- Automatically generate ticket IDs (`TKT-001`, `TKT-002`, etc.)
- View all support tickets
- Search tickets
- Filter tickets by status
- View complete ticket details
- Update ticket status
- Add internal notes
- Store ticket and note data in Google Sheets
- Responsive web interface

## Technology Stack

- Google Apps Script
- JavaScript
- HTML
- CSS
- Google Sheets

## Architecture

```text
Web Interface
     ↓
Google Apps Script
     ↓
Service Layer
     ↓
Google Sheets

API Operations
Create Ticket

Creates a new support ticket and generates a unique ticket ID.

List Tickets

Returns tickets with optional search and status filtering.

Ticket Details

Returns complete ticket information along with associated notes.

Update Ticket

Updates the ticket status and optionally adds an internal note.

```

Database      Structure
Tickets        Sheet
Field	     Description
id	          Internal record ID
ticket_id	     Unique ticket identifier
customer_name	Customer name
customer_email	Customer email
subject	     Ticket subject
description	Ticket description
status	     Open / In Progress / Closed
created_at	Ticket creation time
updated_at	Last update time

Notes           Sheet
Field	     Description
id	          Note ID
ticket_id	     Associated ticket
note_text	     Internal note
created_at	Note creation time


Application URL : https://script.google.com/macros/s/AKfycbxqFzdGKBb-1KrME_1itOAPzN68SIPkWIxTG6ckMYr1XllmXEkttelnwzU8n1COce43oQ/exec
