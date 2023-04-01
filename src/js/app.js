// Environment variables
const NODE_ENV = process.env.NODE_ENV;

import {
  addDays,
  addHours,
  endOfDay,
  format,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";

const language = location.pathname.indexOf("/nl") > -1 ? "nl" : "en";

const utcOffset = 1; // Netherlands is GMT+1 (+2 in summer)
const date = new Date(); // Now on this device
const utc = date.getTime() + date.getTimezoneOffset() * 60000;
const now = new Date(utc + 3600000 * utcOffset); // Now in the Netherlands

let carousel;
let photos;
let currentPhoto = 0;
let showingNav = false;

function onPageLoad() {
  bindMobileNavEvents();
  bindCarouselEvents();
  setupContactForm();
  setupRegistrationForm();
  setupCheckBox();
}

function bindMobileNavEvents() {
  const btn = document.querySelector(`header button`);
  btn.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
      toggleMobileNav();
    },
    false
  );
  document.querySelector("nav").addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
      openMobileNav();
    },
    false
  );
  document.body.addEventListener("click", closeMobileNav, false);
}

function toggleMobileNav() {
  if (showingNav) {
    closeMobileNav();
  } else {
    openMobileNav();
  }
}

function openMobileNav() {
  document.body.classList.add("show-mobile-nav");
  showingNav = true;
}

function closeMobileNav() {
  document.body.classList.remove("show-mobile-nav");
  showingNav = false;
}

function bindCarouselEvents() {
  carousel = document.querySelector(`.carousel`);
  // Continue only if this page has a Carousel
  if (!carousel) {
    return;
  }
  photos = document.querySelectorAll(`.carousel img`);
  const btnNext = document.querySelector(`.carousel button.next`);
  const btnPrev = document.querySelector(`.carousel button.prev`);
  btnPrev.addEventListener("click", prevPhoto);
  btnPrev.addEventListener("mouseover", function () {
    carousel.classList.add("prev");
    carousel.classList.remove("next");
  });
  btnNext.addEventListener("click", nextPhoto);
  btnNext.addEventListener("mouseover", function () {
    carousel.classList.add("next");
    carousel.classList.remove("prev");
  });
  carousel.addEventListener("mouseover", () => {
    carousel.classList.add("hover");
  });
  carousel.addEventListener("mouseout", () => {
    carousel.classList.remove("hover");
    carousel.classList.add("next");
    carousel.classList.remove("prev");
  });
  setInterval(() => {
    if (carousel.className.indexOf("hover") < 0) {
      nextPhoto();
    }
  }, 4000);
  photos[currentPhoto].className = "active";
}

function nextPhoto() {
  outroPhoto(currentPhoto, "next");
  currentPhoto = ++currentPhoto;
  currentPhoto = currentPhoto >= photos.length ? 0 : currentPhoto;
  introPhoto(currentPhoto, "next");
}

function prevPhoto() {
  outroPhoto(currentPhoto, "prev");
  currentPhoto = --currentPhoto;
  currentPhoto = currentPhoto < 0 ? photos.length - 1 : currentPhoto;
  introPhoto(currentPhoto, "prev");
}

function introPhoto(i) {
  photos[i].classList.add("active");
}

function outroPhoto(i) {
  photos[i].classList.remove("active");
  photos[i].classList.add("outro");
  setTimeout(() => {
    photos[i].classList.remove("outro");
  }, 900);
}

function setupContactForm() {
  const button = document.querySelector("#contact #form button");
  if (button) {
    button.addEventListener("click", submitContactForm);
  }
}

function setupRegistrationForm() {
  const button = document.querySelector(
    "#registration-form button.green-button"
  );
  if (button) {
    button.addEventListener("click", submitRegistrationForm);
  }
}

let submitting = false;

async function submitContactForm() {
  if (submitting) {
    return;
  }
  const form = document.querySelector("#contact #form");
  const nameInput = document.querySelector("#contact #form input#name");
  const emailInput = document.querySelector("#contact #form input#email");
  const messageInput = document.querySelector("#contact #form textarea");
  const name = nameInput.value;
  const email = emailInput.value;
  const message = messageInput.value;
  console.log("sending...");
  console.log(name);
  console.log(email);
  console.log(message);
  nameInput.disabled = true;
  emailInput.disabled = true;
  messageInput.disabled = true;
  submitting = true;
  form.classList.replace("idle", "sending");
  try {
    const response = await fetch(
      "https://api.huisartspoelstra.nl/submit-contact-form",
      {
        method: "POST",
        body: JSON.stringify({ name, email, message }),
      }
    );
    const content = await response.json();
    if (content.success) {
      form.classList.replace("sending", "success");
    } else {
      form.classList.replace("sending", "fail");
    }
  } catch (e) {
    form.classList.replace("sending", "fail");
  }
}

async function submitRegistrationForm() {
  if (submitting) {
    return;
  }

  const form = document.querySelector("#registration-form");

  const firstNameInput = form.querySelector("input#first-name");
  const lastNameInput = form.querySelector("input#last-name");
  const genderInput = form.querySelector("input#gender");
  const dobInput = form.querySelector("input#dob");
  const addressInput = form.querySelector("textarea#address");
  const emailInput = form.querySelector("input#email");
  const phoneInput = form.querySelector("input#phone");
  const bsnInput = form.querySelector("input#bsn");
  const agreement1 = form.querySelector("#agreement-1");
  const agreement2 = form.querySelector("#agreement-2");
  const firstName = firstNameInput.value;
  const lastName = lastNameInput.value;
  const gender = genderInput.value;
  const dob = dobInput.value;
  const address = addressInput.value;
  const email = emailInput.value;
  const phone = phoneInput.value;
  const bsn = bsnInput.value;
  const agreed1 = agreement1.classList.contains("checked");
  const agreed2 = agreement2.classList.contains("checked");

  const payload = {
    firstName,
    lastName,
    gender,
    dob,
    address,
    email,
    phone,
    bsn,
    agreed1,
    agreed2,
  };

  console.log("sending...");
  console.log(payload);

  firstNameInput.disabled = true;
  lastNameInput.disabled = true;
  genderInput.disabled = true;
  dobInput.disabled = true;
  addressInput.disabled = true;
  emailInput.disabled = true;
  phoneInput.disabled = true;
  bsnInput.disabled = true;
  agreement1.disabled = true;
  agreement2.disabled = true;

  submitting = true;
  form.classList.replace("idle", "sending");
  try {
    const response = await fetch(
      "https://api.huisartspoelstra.nl/submit-registration-form",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    const content = await response.json();
    if (content.success) {
      form.classList.replace("sending", "success");
    } else {
      form.classList.replace("sending", "fail");
    }
  } catch (e) {
    form.classList.replace("sending", "fail");
  }
}

function setupCheckBox() {
  document.querySelectorAll("button.checkbox").forEach((button) => {
    button.onclick = toggleCheckedIcon;
  });
}

function toggleCheckedIcon(event) {
  const button = event.currentTarget;
  const boxIsChecked = button.classList.contains("checked");

  if (boxIsChecked) {
    button.classList.add("unchecked");
    button.classList.remove("checked");
  } else {
    button.classList.remove("unchecked");
    button.classList.add("checked");
  }
}

// Only init() once the DOM is ready for interaction.
// A common mistake is to wait for "complete", but we don't need images and styles to be complete.
const domIsInteractive = ["interactive", "complete"].includes(
  document.readyState
);
if (domIsInteractive) {
  onPageLoad();
} else {
  document.addEventListener("DOMContentLoaded", onPageLoad);
}
