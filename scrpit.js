// Configuration: Customize these values
const CONFIG = {
  girlfriendName: "Hafazeba",
  yourName: "",
  messageLines: [
    "ሄ ፍቅዬ...",
    "ይህን አገልግሎት ለአንቺ ብቻ አዘጋጅሁ።",
    "ስንኳ እንደገና እንደምንሠራ፣ ልቤ ዝቅ አለችና ድምጿ አውራለች።",
    "ሣቅሽን፣ ድምጽሽንና ለእኔ ያለ የምናሳምንበት ቀን የሚችልብሽን ሁሉን እወዳለሁ።",
    "",
    "እድሜ እየተሻሽሁ ስላለሁ፣ ንጹሕነትሽን፣ ንስሐሽን እና ልብሽን እገናኛለሁ።",
    "",
    "አንቺ በዓለም ላይ እንደኔ የተመረጠው ሰው ነሽ።",
  ],
  photos: [
    "img/img_1.webp",
    "img/img_2.webp",
    "img/img_3.webp",
    "img/img_4.webp",
    "img/img_5.webp",
    "img/img_6.webp",
    "img/img_7.webp",
    "img/img_8.webp",
    "img/img_9.webp",
    "img/img_10.webp",
    "img/img_11.webp",
    "img/img_12.webp",
  ],
  sweetThings: [
    "ለእኔ እሱ ድርቅ የሆንሽ ሴት።",
    "በትንሽ ነገርም ሣቅሽን እወዳለሁ።",
    "እንደምንወቅ ደስ ብሎኛል።",
    "አንቺ የእኔ እርህበት ነሽ።",
    "እንባ ስታሳይ ጊዜን እቆም ነበር።",
    "ከአንቺ ጋር ያለው የቋሚ ሁኔታ የምፈልጋችው ቅርጸ ታሪክ ነው።",
    "እርስዎን የማወቅ ይፈልጋሉ።",
  ],
};

// State variables
let photoIndex = 0;
let started = false;

// Utility functions
const getElement = (id) => document.getElementById(id);

// cache references to frequently used DOM elements
const elements = {};
const _ids = [
  'heroImg',
  'herNameInline',
  'herNameLetter',
  'yourNameInline',
  'yourNameLetter',
  'typedLetter',
  'gallery',
  'letterModal',
  'namesModal',
  'lightbox',
  'lightboxImg',
  // additional controls used later
  'openLetterBtn',
  'yesBtn',
  'changeNamesBtn',
  'saveNamesBtn',
  'sparkleBtn',
  'musicBtn',
  'todayBadge',
  'herNameInput',
  'yourNameInput',
  'heartsCanvas'
];
_ids.forEach(id => { elements[id] = getElement(id); });

/**
 * Initializes the application
 */
function init() {
  if (!validateElements()) return;

  setNames();
  buildGallery();
  setHeroImage();
  preloadImages();
  setupEventListeners();
  initCanvasAnimations();
}

/**
 * Validates required DOM elements
 */
function validateElements() {
  const required = ['heroImg', 'herNameInline', 'herNameLetter', 'yourNameInline', 'yourNameLetter', 'typedLetter', 'gallery', 'letterModal', 'namesModal', 'lightbox', 'lightboxImg'];
  return required.every(id => elements[id]);
}

/**
 * Sets names in the DOM
 */
function setNames() {
  const { girlfriendName, yourName } = CONFIG;
  elements.herNameInline.textContent = girlfriendName;
  elements.herNameLetter.textContent = girlfriendName;
  elements.yourNameInline.textContent = yourName || "me";
  elements.yourNameLetter.textContent = yourName || "me";

  document.querySelectorAll(".js-her-name").forEach(node => node.textContent = girlfriendName);
  document.querySelectorAll(".js-your-name").forEach(node => node.textContent = yourName || "me");
}

/**
 * Builds the photo gallery
 */
function buildGallery() {
  elements.gallery.innerHTML = "";

  const heartsContainer = document.createElement("div");
  heartsContainer.className = "gallery-hearts";
  elements.gallery.appendChild(heartsContainer);

  CONFIG.photos.forEach((src, index) => {
    const picture = createGalleryItem(src, index);
    elements.gallery.appendChild(picture);
  });

  createGalleryHearts(heartsContainer);
  addScrollWaveEffect();
}

/**
 * Creates a gallery item (picture element)
 */
function createGalleryItem(src, index) {
  const picture = document.createElement("picture");
  picture.className = "gallery-item";
  picture.dataset.index = index;

  const source = document.createElement("source");
  source.srcset = src;
  source.type = "image/webp";

  const img = document.createElement("img");
  img.src = src.replace('.webp', '.png');
  img.alt = `Memory ${index + 1}`;
  img.loading = "lazy";
  img.style.animationDelay = `${index * 0.5}s`;

  img.addEventListener("click", () => openLightbox(index));
  picture.addEventListener("mousemove", handleMouseMove);
  picture.addEventListener("mouseleave", handleMouseLeave);

  picture.appendChild(source);
  picture.appendChild(img);

  return picture;
}

/**
 * Handles mouse move for magnetic effect
 */
function handleMouseMove(e) {
  const img = e.currentTarget.querySelector('img');
  const rect = e.currentTarget.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = (e.clientX - centerX) / 10;
  const deltaY = (e.clientY - centerY) / 10;

  img.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`;
}

/**
 * Handles mouse leave for magnetic effect
 */
function handleMouseLeave(e) {
  const img = e.currentTarget.querySelector('img');
  img.style.transform = "";
}

/**
 * Preloads images for better performance
 */
function preloadImages() {
  // skip in environments without Image (e.g. server-side tests)
  if (typeof Image === 'undefined') return;

  CONFIG.photos.forEach(src => {
    const webpImg = new Image();
    webpImg.src = src;

    const pngImg = new Image();
    pngImg.src = src.replace('.webp', '.png');
  });
}

/**
 * Creates floating hearts around the gallery
 */
function createGalleryHearts(container) {
  const emojis = ["💖", "💕", "💗", "💓", "💘", "💝", "💞", "💟", "🦋", "⭐", "✨", "🌟", "💫", "🌈", "🎀"];

  const createHeart = () => {
    const heart = document.createElement("div");
    heart.className = "gallery-heart";
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = Math.random() * 100 + "%";
    heart.style.animationDelay = Math.random() * 8 + "s";
    heart.style.fontSize = (Math.random() * 15 + 12) + "px";
    heart.style.animationDuration = (Math.random() * 4 + 6) + "s";
    container.appendChild(heart);

    setTimeout(() => heart.remove(), 10000);
  };

  setInterval(createHeart, 1500);
  for (let i = 0; i < 8; i++) {
    setTimeout(createHeart, i * 300);
  }

  createFloatingFlowers(container);
}

/**
 * Opens the letter modal and types the message
 */
async function openLetter() {
  elements.letterModal.showModal();
  if (!started) {
    started = true;
    await typeText(CONFIG.messageLines);
  }
}

/**
 * Types text with animation
 */
async function typeText(lines) {
  const full = lines.join("\n");
  elements.typedLetter.textContent = "";

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const baseDelay = prefersReduced ? 0 : 18;

  for (let i = 0; i < full.length; i++) {
    elements.typedLetter.textContent += full[i];
    const delay = full[i] === "\n" ? baseDelay * 6 : baseDelay;
    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Opens the lightbox for a photo
 */
function openLightbox(index) {
  photoIndex = index;
  elements.lightboxImg.src = CONFIG.photos[photoIndex];
  elements.lightboxImg.onerror = () => {
    elements.lightboxImg.src = CONFIG.photos[photoIndex].replace('.webp', '.png');
  };

  createParticleExplosion(index);
  elements.lightbox.showModal();
}

/**
 * Creates particle explosion effect
 */
function createParticleExplosion(index) {
  const galleryItems = document.querySelectorAll('.gallery picture');
  const targetItem = galleryItems[index];
  if (!targetItem) return;

  const rect = targetItem.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const particles = ["💖", "💕", "✨", "⭐", "🌟", "💫", "🦋"];

  for (let i = 0; i < 12; i++) {
    const particle = document.createElement("div");
    particle.textContent = particles[Math.floor(Math.random() * particles.length)];
    particle.style.position = "fixed";
    particle.style.left = centerX + "px";
    particle.style.top = centerY + "px";
    particle.style.fontSize = (Math.random() * 20 + 15) + "px";
    particle.style.pointerEvents = "none";
    particle.style.zIndex = "1000";
    particle.style.animation = `particleExplosion 1s ease-out forwards`;

    const angle = (Math.PI * 2 * i) / 12;
    const distance = Math.random() * 100 + 50;
    particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
    particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }

  createClickFlower(centerX, centerY);
}

/**
 * Creates a blooming flower at click location
 */
function createClickFlower(x, y) {
  const flowerContainer = document.createElement("div");
  flowerContainer.className = "flower-container";
  flowerContainer.style.position = "fixed";
  flowerContainer.style.left = x + "px";
  flowerContainer.style.top = y + "px";
  flowerContainer.style.zIndex = "1001";
  flowerContainer.style.transform = "translate(-50%, -50%)";

  const center = document.createElement("div");
  center.className = "flower-center";
  flowerContainer.appendChild(center);

  for (let i = 0; i < 8; i++) {
    const petal = document.createElement("div");
    petal.className = "flower-petal";
    flowerContainer.appendChild(petal);
  }

  document.body.appendChild(flowerContainer);
  setTimeout(() => flowerContainer.remove(), 6000);
}

/**
 * Cycles to next photo in hero
 */
function nextPhoto() {
  photoIndex = (photoIndex + 1) % CONFIG.photos.length;
  setHeroImage();
}

/**
 * Sets the hero image
 */
function setHeroImage() {
  elements.heroImg.src = CONFIG.photos[photoIndex];
  elements.heroImg.onerror = () => {
    elements.heroImg.src = CONFIG.photos[photoIndex].replace('.webp', '.png');
  };
}

/**
 * Opens the names modal
 */
function openNamesModal() {
  const herNameInput = getElement("herNameInput");
  const yourNameInput = getElement("yourNameInput");
  if (!herNameInput || !yourNameInput) return;

  herNameInput.value = CONFIG.girlfriendName;
  yourNameInput.value = CONFIG.yourName;
  elements.namesModal.showModal();
}

/**
 * Saves names from modal
 */
function saveNames() {
  const herNameInput = getElement("herNameInput");
  const yourNameInput = getElement("yourNameInput");
  if (!herNameInput || !yourNameInput) return;

  const newHerName = herNameInput.value.trim();
  const newYourName = yourNameInput.value.trim();

  if (newHerName) {
    CONFIG.girlfriendName = newHerName;
    elements.herNameInline.textContent = newHerName;
    elements.herNameLetter.textContent = newHerName;
  }
  if (newYourName) {
    CONFIG.yourName = newYourName;
    elements.yourNameInline.textContent = newYourName;
    elements.yourNameLetter.textContent = newYourName;
  }

  elements.namesModal.close();
}

/**
 * Creates sparkle/hearts effect
 */
function createSparkles() {
  const canvas = elements.heartsCanvas;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const hearts = Array.from({ length: 50 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 15 + 5,
    speed: Math.random() * 2 + 1,
    opacity: Math.random(),
    rotation: Math.random() * Math.PI * 2
  }));

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    hearts.forEach(heart => {
      ctx.save();
      ctx.translate(heart.x, heart.y);
      ctx.rotate(heart.rotation);
      ctx.globalAlpha = heart.opacity;
      ctx.fillStyle = "#ff4d8d";

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-heart.size/2, -heart.size/2, -heart.size, heart.size/3, 0, heart.size);
      ctx.bezierCurveTo(heart.size, heart.size/3, heart.size/2, -heart.size/2, 0, 0);
      ctx.fill();

      ctx.restore();

      heart.y -= heart.speed;
      heart.opacity -= 0.005;

      if (heart.opacity <= 0 || heart.y < -50) {
        heart.x = Math.random() * canvas.width;
        heart.y = canvas.height + 50;
        heart.opacity = Math.random();
      }
    });

    requestAnimationFrame(animate);
  };

  animate();
}

/**
 * Sets up event listeners
 */
function setupEventListeners() {
  elements.openLetterBtn?.addEventListener("click", openLetter);
  elements.yesBtn?.addEventListener("click", () => {
    createSparkles();
    alert("I like you too! ❤️");
  });
  elements.changeNamesBtn?.addEventListener("click", openNamesModal);
  elements.saveNamesBtn?.addEventListener("click", saveNames);
  elements.sparkleBtn?.addEventListener("click", createSparkles);

  document.addEventListener("keydown", (e) => {
    if (!started) return;
    if (e.key === "ArrowRight") nextPhoto();
  });

  window.addEventListener("resize", () => {
    elements.heartsCanvas.width = window.innerWidth;
    elements.heartsCanvas.height = window.innerHeight;
  });
}

/**
 * Initializes canvas animations
 */
function initCanvasAnimations() {
  // skip canvas animations if canvas isn't available (e.g. non-browser or headless)
  if (!elements.heartsCanvas || typeof elements.heartsCanvas.getContext !== 'function') return;
  initFloatingHearts();
}

/**
 * Initializes floating hearts on canvas
 */
function initFloatingHearts() {
  const canvas = elements.heartsCanvas;
  if (!canvas || typeof canvas.getContext !== 'function') return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const floatingHearts = Array.from({ length: 15 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 20 + 10,
    speed: Math.random() * 1.5 + 0.5,
    drift: (Math.random() - 0.5) * 2,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    opacity: Math.random() * 0.5 + 0.3,
    fadeIn: true
  }));

  const animateHearts = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    floatingHearts.forEach(heart => {
      ctx.save();
      ctx.translate(heart.x, heart.y);
      ctx.rotate(heart.rotation);
      ctx.globalAlpha = heart.opacity;
      ctx.fillStyle = "#ff4d8d";

      const s = heart.size;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.3, 0, s);
      ctx.bezierCurveTo(s, s * 0.3, s * 0.5, -s * 0.3, 0, s * 0.3);
      ctx.fill();

      ctx.restore();

      heart.y -= heart.speed;
      heart.x += heart.drift;
      heart.rotation += heart.rotationSpeed;

      if (heart.fadeIn && heart.opacity < 0.7) {
        heart.opacity += 0.01;
      }

      if (heart.y < -50) {
        Object.assign(heart, {
          x: Math.random() * canvas.width,
          y: canvas.height + 30,
          size: Math.random() * 20 + 10,
          speed: Math.random() * 1.5 + 0.5,
          drift: (Math.random() - 0.5) * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          opacity: 0,
          fadeIn: true
        });
      }
    });

    requestAnimationFrame(animateHearts);
  };

  animateHearts();
}

/**
 * Creates floating flowers
 */
function createFloatingFlowers(container) {
  const createFlower = () => {
    const flower = document.createElement("div");
    flower.className = "floating-flower";
    flower.style.left = Math.random() * 100 + "%";
    flower.style.animationDelay = Math.random() * 12 + "s";
    flower.style.transform = `scale(${0.8 + Math.random() * 0.4})`;
    container.appendChild(flower);

    setTimeout(() => flower.remove(), 12000);
  };

  setInterval(createFlower, 8000);
  for (let i = 0; i < 3; i++) {
    setTimeout(createFlower, i * 2000);
  }

  setInterval(createBloomingFlower, 25000);
}

/**
 * Creates a blooming flower animation
 */
function createBloomingFlower() {
  const flowerContainer = document.createElement("div");
  flowerContainer.className = "flower-container";
  flowerContainer.style.left = Math.random() * 80 + 10 + "%";
  flowerContainer.style.top = Math.random() * 60 + 20 + "%";

  const center = document.createElement("div");
  center.className = "flower-center";
  flowerContainer.appendChild(center);

  for (let i = 0; i < 8; i++) {
    const petal = document.createElement("div");
    petal.className = "flower-petal";
    flowerContainer.appendChild(petal);
  }

  elements.gallery.appendChild(flowerContainer);
  setTimeout(() => flowerContainer.remove(), 8000);
}

/**
 * Adds scroll wave effect (placeholder)
 */
function addScrollWaveEffect() {
  // Implementation for scroll wave effect if needed
}

// Initialize the application
init();
