const requiredFields = ["name", "phone"];

const sendJson = (response, status, body) => {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
};

const readBody = (request) =>
  new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  let payload;

  try {
    payload = JSON.parse(await readBody(request));
  } catch {
    return sendJson(response, 400, { error: "Invalid form submission." });
  }

  const missing = requiredFields.filter((field) => !String(payload[field] || "").trim());
  if (missing.length) {
    return sendJson(response, 400, { error: "Please fill all required fields." });
  }

  if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    return sendJson(response, 500, {
      error: "Lead sheet is not connected. Add GOOGLE_SHEETS_WEBHOOK_URL in Vercel.",
    });
  }

  const lead = {
    project: "MEK Grand Central",
    name: String(payload.name || "").trim(),
    phone: String(payload.phone || "").trim(),
    email: String(payload.email || "").trim(),
    interest: String(payload.interest || "").trim(),
    page_url: String(payload.page_url || ""),
    referrer: String(payload.referrer || ""),
    source: String(payload.source || ""),
    timestamp: String(payload.timestamp || new Date().toISOString()),
    utm_source: String(payload.utm_source || ""),
    utm_medium: String(payload.utm_medium || ""),
    utm_campaign: String(payload.utm_campaign || ""),
    utm_content: String(payload.utm_content || ""),
    utm_term: String(payload.utm_term || ""),
  };

  try {
    const sheetResponse = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });

    if (!sheetResponse.ok) {
      const message = await sheetResponse.text();
      throw new Error(message || "Sheet webhook rejected the lead.");
    }

    return sendJson(response, 200, { ok: true });
  } catch (error) {
    return sendJson(response, 502, {
      error: "Unable to save the lead right now. Please call us directly.",
      detail: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
