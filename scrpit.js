// Customize these: names + message.
let girlfriendName = "Hafazeba";
let yourName = "";

const messageLines = [
  "ሄ ፍቅዬ...",
  "ይህን አገልግሎት ለአንቺ ብቻ አዘጋጅሁ።",
  "ስንኳ እንደገና እንደምንሠራ፣ ልቤ ዝቅ አለችና ድምጿ አውራለች።",
  "ሣቅሽን፣ ድምጽሽንና ለእኔ ያለ የምናሳምንበት ቀን የሚችልብሽን ሁሉን እወዳለሁ።",
  "",
  "እድሜ እየተሻሽሁ ስላለሁ፣ ንጹሕነትሽን፣ ንስሐሽን እና ልብሽን እገናኛለሁ።",
  "",
  "አንቺ በዓለም ላይ እንደኔ የተመረጠው ሰው ነሽ።",
];

const photos = [
  "img/img_1.jpg",
  "img/img_2.jpg",
  "img/img_3.jpg",
  "img/img_4.jpg",
  "img/img_5.jpg",
  "img/img_6.jpg",
  "img/img_7.jpg",
  "img/img_8.jpg",
  "img/img_9.jpg",
  "img/img_10.jpg",
  "img/img_11.jpg",
  "img/img_12.jpg",
];

const sweetThings = [
  "ለእኔ እሱ ድርቅ የሆንሽ ሴት።",
  "በትንሽ ነገርም ሣቅሽን እወዳለሁ።",
  "እንደምንወቅ ደስ ብሎኛል።",
  "አንቺ የእኔ እርህበት ነሽ።",
  "እንባ ስታሳይ ጊዜን እቆም ነበር።",
  "ከአንቺ ጋር ያለው የቋሚ ሁኔታ የምፈልጋችው ቅርጸ ታሪክ ነው።",
  "እርስዎን የማወቅ ይፈልጋሉ።",
];

// DOM Elements
const el = (id) => document.getElementById(id);

// Hero elements
const heroImg = el("heroImg");
const herNameInline = el("herNameInline");
const herNameLetter = el("herNameLetter");
const yourNameInline = el("yourNameInline");
const yourNameLetter = el("yourNameLetter");

// Modal elements
const letterModal = el("letterModal");
const namesModal = el("namesModal");
const typedLetter = el("typedLetter");
const lightbox = el("lightbox");
const lightboxImg = el("lightboxImg");

// Buttons
const openLetterBtn = el("openLetterBtn");
const musicBtn = el("musicBtn");
const yesBtn = el("yesBtn");
const changeNamesBtn = el("changeNamesBtn");
const saveNamesBtn = el("saveNamesBtn");
const sparkleBtn = el("sparkleBtn");

// Gallery
const gallery = el("gallery");

// State
let photoIndex = 0;
let sweetIndex = 0;
let started = false;

// Initialize
function init() {
  if (!heroImg || !herNameInline || !herNameLetter || !yourNameInline || !yourNameLetter) return;
  if (!typedLetter || !gallery || !letterModal || !namesModal || !lightbox || !lightboxImg) return;

  // Set names
  herNameInline.textContent = girlfriendName;
  herNameLetter.textContent = girlfriendName;
  yourNameInline.textContent = yourName || "me";
  yourNameLetter.textContent = yourName || "me";

  document.querySelectorAll(".js-her-name").forEach((node) => {
    node.textContent = girlfriendName;
  });
  document.querySelectorAll(".js-your-name").forEach((node) => {
    node.textContent = yourName || "me";
  });
  
  // Build gallery
  buildGallery();
  
  // Set first hero image
  heroImg.src = photos[0];
  
  // Preload images
  preloadImages();
}

// Build gallery from photos
function buildGallery() {
  gallery.innerHTML = "";
  photos.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Memory ${index + 1}`;
    img.loading = "lazy";
    img.addEventListener("click", () => openLightbox(index));
    gallery.appendChild(img);
  });
}

// Preload images for faster display
function preloadImages() {
  photos.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

// Open letter modal
async function openLetter() {
  letterModal.showModal();
  if (!started) {
    started = true;
    await typeText(messageLines);
  }
}

// Type text animation
async function typeText(lines) {
  const full = lines.join("\n");
  typedLetter.textContent = "";
  
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const baseDelay = prefersReduced ? 0 : 18;

  for (let i = 0; i < full.length; i++) {
    typedLetter.textContent += full[i];
    const ch = full[i];
    const delay = ch === "\n" ? baseDelay * 6 : baseDelay;
    if (delay) await new Promise((r) => setTimeout(r, delay));
  }
}

// Open lightbox
function openLightbox(index) {
  photoIndex = index;
  lightboxImg.src = photos[photoIndex];
  lightbox.showModal();
}

// Next photo in hero
function nextPhoto() {
  photoIndex = (photoIndex + 1) % photos.length;
  heroImg.src = photos[photoIndex];
}

// Change names
function openNamesModal() {
  const herNameInput = el("herNameInput");
  const yourNameInput = el("yourNameInput");
  if (!herNameInput || !yourNameInput) return;

  herNameInput.value = girlfriendName;
  yourNameInput.value = yourName;
  namesModal.showModal();
}

function saveNames() {
  const herNameInput = el("herNameInput");
  const yourNameInput = el("yourNameInput");
  if (!herNameInput || !yourNameInput) return;

  const newHerName = herNameInput.value.trim();
  const newYourName = yourNameInput.value.trim();
  
  if (newHerName) {
    girlfriendName = newHerName;
    herNameInline.textContent = newHerName;
    herNameLetter.textContent = newHerName;
  }
  if (newYourName) {
    yourName = newYourName;
    yourNameInline.textContent = newYourName;
    yourNameLetter.textContent = newYourName;
  }

  namesModal.close();
}

// Sparkle/hearts effect
function createSparkles() {
  const canvas = el("hearts");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const hearts = [];
  
  for (let i = 0; i < 50; i++) {
    hearts.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 15 + 5,
      speed: Math.random() * 2 + 1,
      opacity: Math.random(),
      rotation: Math.random() * Math.PI * 2
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    hearts.forEach(heart => {
      ctx.save();
      ctx.translate(heart.x, heart.y);
      ctx.rotate(heart.rotation);
      ctx.globalAlpha = heart.opacity;
      ctx.fillStyle = "#ff4d8d";
      
      // Draw heart shape
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
  }
  
  animate();
}

// Event Listeners
openLetterBtn?.addEventListener("click", openLetter);
yesBtn?.addEventListener("click", () => {
  createSparkles();
  alert("I love you too! ❤️");
});
changeNamesBtn?.addEventListener("click", openNamesModal);
saveNamesBtn?.addEventListener("click", saveNames);
sparkleBtn?.addEventListener("click", createSparkles);

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (!started) return;
  if (e.key === "ArrowRight") nextPhoto();
});

// Handle resize
window.addEventListener("resize", () => {
  const canvas = el("hearts");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Start canvas animation for floating hearts
(function initHearts() {
  const canvas = el("hearts");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const floatingHearts = [];
  
  function createHeart() {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 30,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 1.5 + 0.5,
      drift: (Math.random() - 0.5) * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: 0,
      fadeIn: true
    };
  }
  
  for (let i = 0; i < 15; i++) {
    const h = createHeart();
    h.y = Math.random() * canvas.height;
    h.opacity = Math.random() * 0.5 + 0.3;
    floatingHearts.push(h);
  }
  
  function animateHearts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    floatingHearts.forEach(heart => {
      ctx.save();
      ctx.translate(heart.x, heart.y);
      ctx.rotate(heart.rotation);
      ctx.globalAlpha = heart.opacity;
      ctx.fillStyle = "#ff4d8d";
      
      // Draw heart
      ctx.beginPath();
      const s = heart.size;
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
        Object.assign(heart, createHeart());
      }
    });
    
    requestAnimationFrame(animateHearts);
  }
  
  animateHearts();
})();

// Initialize on load
init();
