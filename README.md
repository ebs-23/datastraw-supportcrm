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
