const isAfter = require("date-fns/is_after");
const isBefore = require("date-fns/is_before");
const startOfDay = require("date-fns/start_of_day");
const endOfDay = require("date-fns/end_of_day");
const ga = require("./vendor/google-analytics");

const environment = "/* @echo environment */";
const googleAnalyticsID = "/* @echo googleAnalyticsID */";

// Fire page view to Google Analytics
if (ga && googleAnalyticsID.startsWith("UA")) {
  ga("create", googleAnalyticsID, "auto");
  ga("set", { dimension1: environment });
  ga("send", "pageview");
}

const utcOffset = 1; // Netherlands is GMT+1 (+2 in summer)
const date = new Date(); // Now on this device
const utc = date.getTime() + date.getTimezoneOffset() * 60000;
const now = new Date(utc + 3600000 * utcOffset); // Now in the Netherlands

let carousel;
let photos;
let currentPhoto = 0;
let showingNav = false;

function init() {
  bindMobileNavEvents();
  checkForCalendarEvents();
  bindCarouselEvents();
}

function checkForCalendarEvents() {
  var request = new XMLHttpRequest();
  request.open(
    "GET",
    "https://www.googleapis.com/calendar/v3/calendars/vnsb3jtqormqe6b7ri8hf0k4nc@group.calendar.google.com/events?key=AIzaSyDQIL_K-T2_LkG3HekTMjaabuV90sN51P8"
  );
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      const response = JSON.parse(request.response);
      const todayEvents = response.items.filter(item => {
        const isPast = isBefore(now, startOfDay(item.start.date));
        const isFuture = isAfter(now, endOfDay(item.end.date));
        console.log(item.start.date, item.end.date, isPast, isFuture);
        return !isPast && !isFuture;
      });
      console.log(todayEvents);
    }
  };
  request.onerror = function() {
    debugger;
  };
  request.send();
  const dismissed = sessionStorage.getItem("dismissedCalendar");
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

const domIsInteractive = ["interactive", "complete"].includes(
  document.readyState
);
if (domIsInteractive) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
