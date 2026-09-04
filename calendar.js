document.addEventListener("DOMContentLoaded", () => {
  // Replace this value with the deployed Google Apps Script Web App URL.
  const appsScriptUrl = "https://script.google.com/macros/s/AKfycbxZyjskdgcUunx8YxE4vPTh6DGV-rBkRn77FdfR0Xt1o59c_2iWa_F5_p3c0SbEDmcG/exec";
  const form = document.getElementById("calendarForm");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const emailInput = document.getElementById("email");
  const status = document.getElementById("formStatus");
  const confirmButton = document.getElementById("confirmBtn");

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().slice(0, 10);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "form-status";

    if (!form.reportValidity()) {
      status.textContent = "Please check the information you entered.";
      status.classList.add("error");
      return;
    }

    const selectedDate = new Date(`${dateInput.value}T${timeInput.value}`);
    if (selectedDate < new Date()) {
      status.textContent = "Please choose a future date and time.";
      status.classList.add("error");
      return;
    }

    if (appsScriptUrl.startsWith("YOUR_")) {
      status.textContent = "The calendar is not configured yet. Replace the Apps Script URL in calendar.js.";
      status.classList.add("error");
      return;
    }

    const formData = new FormData(form);
    confirmButton.disabled = true;
    confirmButton.querySelector("span").textContent = "Sending...";
    status.textContent = "Preparing your invitation...";

    try {
      // URL-encoded data avoids a CORS preflight with the Apps Script endpoint.
      const response = await fetch(appsScriptUrl, {
        method: "POST",
        body: new URLSearchParams(formData),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "The date could not be confirmed.");
      }

      form.reset();
      status.textContent = "It's confirmed! The invitation has been sent to your calendar 💖";
      status.classList.add("success");
      confirmButton.querySelector("span").textContent = "Invitation sent";
    } catch (error) {
      status.textContent = error.message || "Something went wrong. Please try again in a moment.";
      status.classList.add("error");
      confirmButton.disabled = false;
      confirmButton.querySelector("span").textContent = "Confirm our date";
    }
  });

  emailInput.addEventListener("input", () => {
    status.textContent = "";
    status.className = "form-status";
  });
});
