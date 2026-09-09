const TARGET_DATE = new Date("2027-02-19T00:00:00+01:00");
const SECOND_IN_MILLISECONDS = 1000;
const MINUTE_IN_MILLISECONDS = 60 * SECOND_IN_MILLISECONDS;
const HOUR_IN_MILLISECONDS = 60 * MINUTE_IN_MILLISECONDS;
const DAY_IN_MILLISECONDS = 24 * HOUR_IN_MILLISECONDS;
const TWELVE_WEEKS_IN_MILLISECONDS = 12 * 7 * DAY_IN_MILLISECONDS;
const TARGET_CALENDAR_DATE = new Date(Date.UTC(2027, 1, 19));

// SHA-256 of the codeword. The codeword itself is not stored in the page source.
const CODEWORD_HASH =
  "a48970091e11fac6f269d63c61d50d600866550e643327ff6504c3c306f44e5a";

const gate = document.querySelector("#gate");
const countdown = document.querySelector("#countdown");
const form = document.querySelector("#codeword-form");
const input = document.querySelector("#codeword");
const message = document.querySelector("#form-message");
const timeGrid = document.querySelector("#time-grid");
const submitButton = form.querySelector("button[type='submit']");
const numberFormatter = new Intl.NumberFormat("en");
const amsterdamDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Amsterdam",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

function getUnitLabel(value, singular) {
  return value === 1 ? singular : `${singular}s`;
}

function createTimeUnit(value, singular, padWithZero = false) {
  const unit = document.createElement("span");
  const valueElement = document.createElement("span");
  const labelElement = document.createElement("span");

  unit.className = "time-unit";
  valueElement.className = "time-value";
  labelElement.className = "time-label";

  valueElement.textContent = padWithZero
    ? String(value).padStart(2, "0")
    : numberFormatter.format(value);
  labelElement.textContent = getUnitLabel(value, singular);

  unit.append(valueElement, labelElement);
  return unit;
}

function renderCountdown(units, mode) {
  timeGrid.dataset.mode = mode;
  timeGrid.replaceChildren(
    ...units.map(({ value, singular, padWithZero }) =>
      createTimeUnit(value, singular, padWithZero),
    ),
  );

  const spokenTime = units
    .map(({ value, singular }) => `${value} ${getUnitLabel(value, singular)}`)
    .join(", ");

  countdown.setAttribute(
    "aria-label",
    `${spokenTime} left until freedom, on 19 February 2027.`,
  );
}

function getAmsterdamCalendarDate(date) {
  const dateParts = {};

  for (const part of amsterdamDateFormatter.formatToParts(date)) {
    if (part.type !== "literal") {
      dateParts[part.type] = Number(part.value);
    }
  }

  return new Date(
    Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day),
  );
}

function addCalendarMonths(date, monthsToAdd) {
  const originalDay = date.getUTCDate();
  const unnormalisedMonth = date.getUTCMonth() + monthsToAdd;
  const year = date.getUTCFullYear() + Math.floor(unnormalisedMonth / 12);
  const month = ((unnormalisedMonth % 12) + 12) % 12;
  const finalDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return new Date(
    Date.UTC(year, month, Math.min(originalDay, finalDayOfMonth)),
  );
}

function getCalendarBreakdown(now) {
  const currentDate = getAmsterdamCalendarDate(now);
  let months =
    (TARGET_CALENDAR_DATE.getUTCFullYear() - currentDate.getUTCFullYear()) * 12 +
    TARGET_CALENDAR_DATE.getUTCMonth() -
    currentDate.getUTCMonth();
  let monthAnchor = addCalendarMonths(currentDate, months);

  while (monthAnchor > TARGET_CALENDAR_DATE) {
    months -= 1;
    monthAnchor = addCalendarMonths(currentDate, months);
  }

  const remainingDays = Math.max(
    0,
    Math.floor(
      (TARGET_CALENDAR_DATE.getTime() - monthAnchor.getTime()) /
        DAY_IN_MILLISECONDS,
    ),
  );

  return {
    months,
    weeks: Math.floor(remainingDays / 7),
    days: remainingDays % 7,
  };
}

function updateCountdown() {
  const now = new Date();
  const millisecondsRemaining = Math.max(
    0,
    TARGET_DATE.getTime() - now.getTime(),
  );

  if (millisecondsRemaining > TWELVE_WEEKS_IN_MILLISECONDS) {
    const { months, weeks, days } = getCalendarBreakdown(now);

    renderCountdown(
      [
        { value: months, singular: "month" },
        { value: weeks, singular: "week" },
        { value: days, singular: "day" },
      ],
      "calendar",
    );
    return;
  }

  const totalSeconds = Math.ceil(
    millisecondsRemaining / SECOND_IN_MILLISECONDS,
  );
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  renderCountdown(
    [
      { value: days, singular: "day" },
      { value: hours, singular: "hour", padWithZero: true },
      { value: minutes, singular: "minute", padWithZero: true },
      { value: seconds, singular: "second", padWithZero: true },
    ],
    "detailed",
  );
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function showCountdown() {
  updateCountdown();
  gate.classList.add("is-leaving");

  window.setTimeout(() => {
    gate.hidden = true;
    countdown.hidden = false;
    countdown.classList.add("is-visible");
  }, 320);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  submitButton.disabled = true;

  try {
    const submittedHash = await sha256(input.value.trim());

    if (submittedHash === CODEWORD_HASH) {
      showCountdown();
      return;
    }

    message.textContent = "That codeword isn’t right. Try again.";
    input.value = "";
    input.focus();
    gate.classList.remove("is-wrong");
    void gate.offsetWidth;
    gate.classList.add("is-wrong");
  } catch {
    message.textContent = "This browser could not check the codeword.";
  } finally {
    submitButton.disabled = false;
  }
});

window.setInterval(updateCountdown, SECOND_IN_MILLISECONDS);
