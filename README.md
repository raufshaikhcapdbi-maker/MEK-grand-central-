# MEK Grand Central Landing Page

Static landing page with a Vercel serverless lead endpoint.

## Local Preview

```powershell
node local-server.js
```

Open `http://localhost:4173`.

## Google Sheets Lead Webhook

Create a Google Sheet with these columns:

```text
timestamp, project, name, phone, email, interest, page_url, referrer, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term
```

Open Extensions > Apps Script and paste:

```javascript
const SHEET_NAME = "Leads";

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = JSON.parse(e.postData.contents);
  const headers = [
    "timestamp",
    "project",
    "name",
    "phone",
    "email",
    "interest",
    "page_url",
    "referrer",
    "source",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];

  sheet.appendRow(headers.map((header) => data[header] || ""));

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Deploy the script as a web app:

- Execute as: Me
- Who has access: Anyone

Add the web app URL in Vercel as:

```text
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/...
```

## Production Deploy

```powershell
npx vercel --prod
```
