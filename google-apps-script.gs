const CONFIG = {
  calendarId: "primary",
  organizerName: "Heythem",
  eventTitle: "Our date 💖",
  timeZone: "Europe/Paris",
};

function doPost(event) {
  try {
    const data = event && event.parameter;
    validateRequest(data);

    const start = parseDateTime(data.date, data.time);
    const end = new Date(start.getTime() + Number(data.duration) * 60 * 1000);
    const calendar = CalendarApp.getCalendarById(CONFIG.calendarId);

    if (!calendar) {
      throw new Error("Calendar not found.");
    }

    const calendarEvent = calendar.createEvent(CONFIG.eventTitle, start, end, {
      description: "Invitation sent from our website 💌",
      location: data.location || "",
      guests: data.email,
      sendInvites: true,
    });

    return jsonResponse({
      success: true,
      eventId: calendarEvent.getId(),
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message || "Unable to create the invitation.",
    });
  }
}

function validateRequest(data) {
  if (!data || !data.date || !data.time || !data.email || !data.duration) {
    throw new Error("Missing information.");
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
    throw new Error("Invalid email address.");
  }

  const duration = Number(data.duration);
  if (![60, 90, 120, 180].includes(duration)) {
    throw new Error("Invalid duration.");
  }

  if (parseDateTime(data.date, data.time) <= new Date()) {
    throw new Error("The date must be in the future.");
  }
}

function parseDateTime(date, time) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match || !timeMatch) {
    throw new Error("Invalid date or time.");
  }

  const parsed = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(timeMatch[1]),
    Number(timeMatch[2]),
  );
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date.");
  }
  return parsed;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
