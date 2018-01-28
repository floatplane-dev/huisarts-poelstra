// TODO
// import config from "../../config/environment.js";

const addDays = require("date-fns/add_days");
const addHours = require("date-fns/add_hours");
const endOfDay = require("date-fns/end_of_day");
const format = require("date-fns/format");
const isAfter = require("date-fns/is_after");
const isBefore = require("date-fns/is_before");
const startOfDay = require("date-fns/start_of_day");
const googleAnalytics = require("./google-analytics");

// TODO
// console.log(process.env.NODE_ENV);
// console.log("--", config.environment);
// console.log("--", config.googleAnalyticsID);

const environment = "/* @echo environment */";
const googleAnalyticsID = "/* @echo googleAnalyticsID */";
const language = location.pathname.indexOf("/nl") > -1 ? "nl" : "en";

const utcOffset = 1; // Netherlands is GMT+1 (+2 in summer)
const date = new Date(); // Now on this device
const utc = date.getTime() + date.getTimezoneOffset() * 60000;
const now = new Date(utc + 3600000 * utcOffset); // Now in the Netherlands

let carousel;
let photos;
let currentPhoto = 0;
let showingNav = false;

function init() {
  sendPageViewToGA();
  checkForCalendarEvents();
  bindMobileNavEvents();
  bindCarouselEvents();
}

// Fire page view to Google Analytics
// Only fire if ga is present and not removed by privacy guarding browser plugins
// Only continue if a the UA-ID was correctly embedded in this file (sometime fails)
function sendPageViewToGA() {
  googleAnalytics;
  if (ga && googleAnalyticsID.indexOf("UA") > -1) {
    ga("create", googleAnalyticsID, "auto");
    ga("set", { dimension1: environment });
    ga("send", "pageview");
  }
}

// https://date-fns.org/
// https://github.com/date-fns/date-fns/issues/556
// https://www.techrepublic.com/article/convert-the-local-time-to-another-time-zone-with-this-javascript/
// https://www.npmjs.com/package/time
function checkForCalendarEvents() {
  var request = new XMLHttpRequest();
  request.open(
    "GET",
    "https://www.googleapis.com/calendar/v3/calendars/vnsb3jtqormqe6b7ri8hf0k4nc@group.calendar.google.com/events?key=AIzaSyDQIL_K-T2_LkG3HekTMjaabuV90sN51P8"
  );
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      const response = JSON.parse(request.response);
      evaluateEvents(response);
    }
  };
  request.send();
}

function evaluateEvents(response) {
  // Filter calendar events to those events that are occuring now
  const eventsRightNow = response.items.filter(item => {
    const startTime = item.start.date
      ? startOfDay(item.start.date)
      : item.start.dateTime;
    const endTime = item.end.date ? endOfDay(item.end.date) : item.end.dateTime;
    const isToday = !isBefore(now, startTime) && !isAfter(now, endTime);
    return isToday;
  });

  // Continue only if there is an event occuring right now (in the Netherlands)
  console.log(eventsRightNow);
  if (eventsRightNow.length) {
    const firstEvent = eventsRightNow[0];
    const dismissed = JSON.parse(sessionStorage.getItem("dismissed")) || [];
    const wasDismissed = dismissed.some(event => event === firstEvent.id);
    if (wasDismissed) {
      return;
    }
    showCalendarMessage(firstEvent);
  }
}

function showCalendarMessage(event) {
  const element = document.createElement("div");
  element.setAttribute("id", "calendar-event");
  const startDate = event.start.date
    ? format(event.start.date, "DD/MM/YYYY")
    : format(addHours(event.start.dateTime, 1), "DD/MM/YYYY, HH:mm");
  const endDate = event.end.date
    ? format(addDays(event.end.date, -1), "DD/MM/YYYY")
    : format(addHours(event.end.dateTime, 1), "DD/MM/YYYY, HH:mm");
  const dates =
    startDate === endDate
      ? `Gedurende ${startDate}`
      : `Van: ${startDate}</br>Tot: ${endDate}`;
  const description = event.description
    .replace(/\n\n/g, "<p/><p>")
    .replace(/\n/g, "<br/>");
  const buttonLabel =
    language === "nl" ? "Begrepen, sluit venster" : "Understood, close message";
  element.innerHTML = `
    <div>
      <div>
        <h1>${event.summary}</h1>
        <p>${dates}</p>
        <p>${description}</p>
        <button>${buttonLabel}</button>
      </div>
    </div>
  `;
  const closeButton = element.querySelector("button");
  const close = () => {
    element.classList.add("outro");
    let dismissed = JSON.parse(sessionStorage.getItem("dismissed")) || [];
    dismissed.push(event.id);
    sessionStorage.setItem("dismissed", JSON.stringify(dismissed));
    setTimeout(() => {
      element.remove();
    }, 500);
  };
  closeButton.addEventListener("click", close, false);
  document.body.appendChild(element);
}

function bindMobileNavEvents() {
  const btn = document.querySelector(`header button`);
  btn.addEventListener(
    "click",
    event => {
      event.stopPropagation();
      toggleMobileNav();
    },
    false
  );
  document.querySelector("nav").addEventListener(
    "click",
    event => {
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
  btnPrev.addEventListener("mouseover", function() {
    carousel.classList.add("prev");
    carousel.classList.remove("next");
  });
  btnNext.addEventListener("click", nextPhoto);
  btnNext.addEventListener("mouseover", function() {
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

// Only init() once the DOM is ready for interaction.
// A common mistake is to wait for "complete", but we don't need images and styles to be complete.
const domIsInteractive = ["interactive", "complete"].includes(
  document.readyState
);
if (domIsInteractive) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
