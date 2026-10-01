// =====================================================
// Image Gallery - filters + lightbox (vanilla JavaScript)
// =====================================================

// ---------- 1. Grab the elements we need ----------
const filterButtons = document.querySelectorAll(".filter");
const items = Array.from(document.querySelectorAll(".item"));

const lightbox = document.getElementById("Manish kumar");
const lbImg = document.getElementById("lbImg");
const lbTitle = document.getElementById("lbTitle");
const lbCategory = document.getElementById("lbCategory");
const lbCount = document.getElementById("lbCount");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");

// ---------- 2. State ----------
let visibleItems = items.slice(); // items currently shown (changes with the filter)
let currentIndex = 0;             // position inside visibleItems
let lastFocused = null;           // remember what was focused so we can return to it

// ---------- 3. Filtering ----------

// Play the "pop" animation again on an item (with a small delay per item)
function playPop(item, position) {
  item.style.setProperty("--i", position);
  item.classList.remove("pop");
  void item.offsetWidth; // forces the browser to restart the animation
  item.classList.add("pop");
}

function filterGallery(category) {
  // Show or hide each item
  items.forEach(function (item) {
    item.hidden = !(category === "All" || item.dataset.category === category);
  });

  // Keep an up-to-date list of what is visible, and animate it in
  visibleItems = items.filter(function (item) {
    return !item.hidden;
  });
  visibleItems.forEach(playPop);

  // Highlight the active button
  filterButtons.forEach(function (button) {
    const isActive = button.dataset.filter === category;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive);
  });
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filterGallery(button.dataset.filter);
  });
});

// Animate all images in when the page first loads
visibleItems.forEach(playPop);

// ---------- 4. Lightbox ----------

// Fill the lightbox with the image at currentIndex
function showImage() {
  const item = visibleItems[currentIndex];
  const thumb = item.querySelector("img");

  // Use data-full (a bigger image) if the item has one, otherwise the normal image
  lbImg.src = item.dataset.full || thumb.src;
  lbImg.alt = thumb.alt;
  lbTitle.textContent = item.dataset.title;
  lbCategory.textContent = item.dataset.category;
  lbCount.textContent = currentIndex + 1 + " / " + visibleItems.length;

  // Restart the fade animation for a smooth image change
  lbImg.classList.remove("fade");
  void lbImg.offsetWidth;
  lbImg.classList.add("fade");
}

function openLightbox(item) {
  lastFocused = document.activeElement;
  currentIndex = visibleItems.indexOf(item);
  showImage();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll"); // stop the page scrolling behind
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  if (lastFocused) {
    lastFocused.focus();
  }
}

function showNext() {
  currentIndex = (currentIndex + 1) % visibleItems.length; // wrap to the first image
  showImage();
}

function showPrevious() {
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; // wrap to the last image
  showImage();
}

// Open the lightbox when an image is clicked
items.forEach(function (item) {
  item.addEventListener("click", function () {
    openLightbox(item);
  });
});

// Lightbox buttons
lbClose.addEventListener("click", closeLightbox);
lbNext.addEventListener("click", showNext);
lbPrev.addEventListener("click", showPrevious);

// Clicking the dark background (not the image) closes the lightbox
lightbox.addEventListener("click", function (event) {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

// ---------- 5. Keyboard support ----------
document.addEventListener("keydown", function (event) {
  if (!lightbox.classList.contains("open")) {
    return; // only react while the lightbox is open
  }

  if (event.key === "ArrowRight") {
    showNext();
  } else if (event.key === "ArrowLeft") {
    showPrevious();
  } else if (event.key === "Escape") {
    closeLightbox();
  }
});

// ---------- 6. Swipe support on touch screens ----------
let touchStartX = 0;

lightbox.addEventListener("touchstart", function (event) {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener("touchend", function (event) {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (distance < -50) {
    showNext();      // swipe left
  } else if (distance > 50) {
    showPrevious();  // swipe right
  }
}, { passive: true });