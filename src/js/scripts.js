const environment = '/* @echo environment */';
const googleAnalyticsID = '/* @echo googleAnalyticsID */';

// Fire page view to Google Analytics
if (ga && googleAnalyticsID) {
  ga('create', googleAnalyticsID, 'auto');
  ga('set', { dimension1: environment });
  ga('send', 'pageview');
}

let carousel;
let photos;
let currentPhoto = 0;

function init() {
  carousel = document.querySelector(`.carousel`);
  if (carousel) {
    bindCarouselEvents();
  }
}

function bindCarouselEvents() {
  photos = document.querySelectorAll(`.carousel img`);
  const btnNext = document.querySelector(`.carousel button.next`);
  const btnPrev = document.querySelector(`.carousel button.prev`);
  btnPrev.addEventListener('click', prevPhoto);
  btnPrev.addEventListener('mouseover', function() {
    carousel.classList.add('prev');
    carousel.classList.remove('next');
  });
  btnNext.addEventListener('click', nextPhoto);
  btnNext.addEventListener('mouseover', function() {
    carousel.classList.add('next');
    carousel.classList.remove('prev');
  });
  carousel.addEventListener('mouseover', () => {
    carousel.classList.add('hover');
  });
  carousel.addEventListener('mouseout', () => {
    carousel.classList.remove('hover');
    carousel.classList.add('next');
    carousel.classList.remove('prev');
  });
  setInterval(() => {
    if (carousel.className.indexOf('hover') < 0) {
      nextPhoto();
    }
  }, 4000);
  photos[currentPhoto].className = 'active';
}

function nextPhoto() {
  outroPhoto(currentPhoto, 'next');
  currentPhoto = ++currentPhoto;
  currentPhoto = currentPhoto >= photos.length ? 0 : currentPhoto;
  introPhoto(currentPhoto, 'next');
}

function prevPhoto() {
  outroPhoto(currentPhoto, 'prev');
  currentPhoto = --currentPhoto;
  currentPhoto = currentPhoto < 0 ? (photos.length - 1) : currentPhoto;
  introPhoto(currentPhoto, 'prev');
}

function introPhoto(i, direction) {
  photos[i].classList.add('active');
}

function outroPhoto(i, direction) {
  photos[i].classList.remove('active');
  photos[i].classList.add('outro');
  setTimeout(() => {
    photos[i].classList.remove('outro');
  }, 900);
}

const domIsInteractive = ['interactive', 'complete'].includes(document.readyState);
if (domIsInteractive) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
