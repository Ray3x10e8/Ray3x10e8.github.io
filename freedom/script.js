const TARGET_DATE = new Date("2027-02-19T00:00:00+01:00");
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// SHA-256 of the codeword. The codeword itself is not stored in the page source.
const CODEWORD_HASH =
  "a48970091e11fac6f269d63c61d50d600866550e643327ff6504c3c306f44e5a";

const gate = document.querySelector("#gate");
const countdown = document.querySelector("#countdown");
const form = document.querySelector("#codeword-form");
const input = document.querySelector("#codeword");
const message = document.querySelector("#form-message");
const daysElement = document.querySelector("#days");
const submitButton = form.querySelector("button[type='submit']");

function getDaysRemaining() {
  const millisecondsRemaining = TARGET_DATE.getTime() - Date.now();
  return Math.max(0, Math.ceil(millisecondsRemaining / DAY_IN_MILLISECONDS));
}

function updateCountdown() {
  const daysRemaining = getDaysRemaining();
  daysElement.textContent = new Intl.NumberFormat("en").format(daysRemaining);
  countdown.setAttribute(
    "aria-label",
    `${daysRemaining} days left until freedom, on 19 February 2027.`,
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

window.setInterval(updateCountdown, 60 * 1000);
