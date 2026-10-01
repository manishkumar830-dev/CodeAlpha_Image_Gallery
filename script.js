// =====================================================
// Image Gallery - filters + lightbox (vanilla JavaScript)
// =====================================================

// ---------- 1. Grab the elements we need ----------
const filterButtons = document.querySelectorAll(".filter");
const items = Array.from(document.querySelectorAll(".item"));

const lightbox = document.getElementById("lightbox");
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
/* ===== LIGHTBOX + "VIEW IMAGE" BUTTONS (append to the END of script.js) ===== */
(function () {
  'use strict';

  // If your gallery cards use a different class, change ONLY this line
  // (and the matching selector at the top of the lightbox CSS block).
  var ITEM_SELECTOR = '.gallery-item';

  // ---------- Build the lightbox DOM (no HTML changes needed) ----------
  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Image preview');
  lb.innerHTML =
    '<button class="lb-btn lb-close" type="button" aria-label="Close">&times;</button>' +
    '<button class="lb-btn lb-prev" type="button" aria-label="Previous image">&#8592;</button>' +
    '<button class="lb-btn lb-next" type="button" aria-label="Next image">&#8594;</button>' +
    '<figure class="lb-figure">' +
      '<img class="lb-img" alt="">' +
      '<figcaption class="lb-caption"></figcaption>' +
    '</figure>';
  document.body.appendChild(lb);

  var imgEl = lb.querySelector('.lb-img');
  var capEl = lb.querySelector('.lb-caption');
  var closeBtn = lb.querySelector('.lb-close');
  var prevBtn = lb.querySelector('.lb-prev');
  var nextBtn = lb.querySelector('.lb-next');

  var list = [];     // gallery items currently visible (respects filters)
  var index = 0;
  var lastFocus = null;

  function isOpen() {
    return lb.classList.contains('open');
  }

  function getVisibleItems() {
    return Array.prototype.slice
      .call(document.querySelectorAll(ITEM_SELECTOR))
      .filter(function (el) { return el.getClientRects().length > 0; });
  }

  function readItem(item) {
    var img = item.querySelector('img');
    var titleEl = item.querySelector('figcaption, h3, h4, .title, .gallery-title, .caption');
    var title = titleEl ? titleEl.textContent.trim() : (img && img.alt) || '';
    var category = item.getAttribute('data-category') || item.getAttribute('data-filter') || '';
    var src = img ? (img.getAttribute('data-full') || img.currentSrc || img.src) : '';
    return { src: src, title: title, category: category };
  }

  function show(i) {
    index = (i + list.length) % list.length; // wraps last <-> first
    var data = readItem(list[index]);

    imgEl.classList.add('is-loading');
    imgEl.onload = imgEl.onerror = function () {
      imgEl.classList.remove('is-loading');
    };
    imgEl.src = data.src;
    imgEl.alt = data.title || 'Gallery image';

    capEl.textContent = '';
    if (data.title) { capEl.appendChild(document.createTextNode(data.title)); }
    if (data.category) {
      var cat = document.createElement('span');
      cat.className = 'lb-cat';
      cat.textContent = data.category;
      capEl.appendChild(cat);
    }

    prevBtn.style.display = nextBtn.style.display = list.length < 2 ? 'none' : '';
  }

  function open(item) {
    list = getVisibleItems();
    var i = list.indexOf(item);
    if (i === -1) { return; }
    lastFocus = document.activeElement;
    show(i);
    document.body.classList.add('lb-open');
    requestAnimationFrame(function () {   // next frame so the CSS transition runs
      lb.classList.add('open');
      closeBtn.focus();
    });
  }

  function close() {
    lb.classList.remove('open');           // fades/scales out via CSS
    document.body.classList.remove('lb-open');
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  function next() { show(index + 1); }
  function prev() { show(index - 1); }

  // ---------- "View Image" button on every card ----------
  function addViewButton(item) {
    if (item.querySelector('.lb-view-btn') || !item.querySelector('img')) { return; }

    // The button is positioned over the card; make sure the card is a positioning context.
    if (window.getComputedStyle(item).position === 'static') {
      item.style.position = 'relative';
    }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lb-view-btn';
    btn.setAttribute('data-lb-open', '');
    btn.setAttribute('aria-label', 'View image in full screen');
    btn.innerHTML = '<span class="lb-view-icon" aria-hidden="true">&#128269;</span> View Image';

    // Each button gets its own click listener bound to its own card.
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      open(item);
    });
    item.appendChild(btn);
  }

  function addAllViewButtons() {
    Array.prototype.forEach.call(document.querySelectorAll(ITEM_SELECTOR), addViewButton);
  }

  addAllViewButtons();

  // If your gallery cards are created later by JavaScript, give them buttons too.
  if (window.MutationObserver) {
    var pending = false;
    new MutationObserver(function () {
      if (pending) { return; }
      pending = true;
      requestAnimationFrame(function () { pending = false; addAllViewButtons(); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ---------- Clicking anywhere on a card opens the viewer ----------
  document.addEventListener('click', function (e) {
    if (isOpen() || !e.target.closest) { return; }
    var item = e.target.closest(ITEM_SELECTOR);
    if (!item || !item.querySelector('img')) { return; }
    e.preventDefault();
    open(item);
  });

  // ---------- Lightbox controls ----------
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prev(); });
  nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next(); });
  lb.addEventListener('click', function (e) {
    if (e.target === lb) { close(); }       // click on dark backdrop closes
  });

  // ---------- Keyboard ----------
  document.addEventListener('keydown', function (e) {
    if (!isOpen()) { return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') {                // keep focus inside the lightbox
      var f = [closeBtn, prevBtn, nextBtn].filter(function (b) { return b.style.display !== 'none'; });
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ---------- Touch swipe (mobile) ----------
  var startX = null;
  lb.addEventListener('touchstart', function (e) {
    startX = e.changedTouches[0].clientX;
  }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (startX === null) { return; }
    var dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) { if (dx < 0) { next(); } else { prev(); } }
  }, { passive: true });
})();
/* ===== Lightbox (uses the existing #lightbox in index.html) ===== */
(function () {
  'use strict';

  var ITEM_SELECTOR = '.item';
  var OPEN_CLASS = 'active'; // must match the class your CSS uses to show #lightbox

  var lightbox   = document.getElementById('lightbox');
  var lbImg      = document.getElementById('lbImg');
  var lbTitle    = document.getElementById('lbTitle');
  var lbCategory = document.getElementById('lbCategory');
  var lbCount    = document.getElementById('lbCount');
  var lbClose    = document.getElementById('lbClose');
  var lbPrev     = document.getElementById('lbPrev');
  var lbNext     = document.getElementById('lbNext');

  if (!lightbox || !lbImg) return;

  var list = [];
  var current = 0;

  // Add a "View Image" button to every card (skips cards that already have one)
  document.querySelectorAll(ITEM_SELECTOR).forEach(function (item) {
    if (item.querySelector('.view-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'view-btn';
    btn.textContent = 'View Image';
    item.appendChild(btn);
  });

  // Only cards currently shown by the category filter
  function getVisibleItems() {
    return Array.prototype.filter.call(
      document.querySelectorAll(ITEM_SELECTOR),
      function (el) {
        return !el.hidden && getComputedStyle(el).display !== 'none';
      }
    );
  }

  function cap(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }

  function show(index) {
    var item = list[index];
    var img = item && item.querySelector('img');
    if (!img) return;
    current = index;

    var heading = item.querySelector('h3, h4, figcaption');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
    if (lbTitle)    lbTitle.textContent = item.dataset.title ||
                      (heading ? heading.textContent.trim() : img.alt) || '';
    if (lbCategory) lbCategory.textContent = cap(item.dataset.category || '');
    if (lbCount)    lbCount.textContent = (index + 1) + ' / ' + list.length;
  }

  function open(item) {
    list = getVisibleItems();
    var index = list.indexOf(item);
    if (index === -1) return;
    show(index);
    lightbox.classList.add(OPEN_CLASS);
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove(OPEN_CLASS);
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function isOpen() { return lightbox.classList.contains(OPEN_CLASS); }
  function next() { show((current + 1) % list.length); }
  function prev() { show((current - 1 + list.length) % list.length); }

  // One delegated listener: card click and "View Image" button both land here
  document.addEventListener('click', function (e) {
    var item = e.target.closest(ITEM_SELECTOR);
    if (item && !lightbox.contains(e.target)) open(item);
  });

  if (lbClose) lbClose.addEventListener('click', close);
  if (lbPrev)  lbPrev.addEventListener('click', prev);
  if (lbNext)  lbNext.addEventListener('click', next);

  // Click on the dark backdrop closes it
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape')           close();
    else if (e.key === 'ArrowRight')  next();
    else if (e.key === 'ArrowLeft')   prev();
  });
})();