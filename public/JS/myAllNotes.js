// Keep your existing logic: edit toggle
document.querySelectorAll(".editBtn").forEach((editBtn) => {
  const card = editBtn.closest(".main");
  const updateNotesForm = card.querySelector(".updateNotesForm");
  const noteDetail = card.querySelector(".noteDetail");

  editBtn.addEventListener("click", () => {
    if (
      updateNotesForm.classList.contains("hidden") &&
      !noteDetail.classList.contains("hidden")
    ) {
      updateNotesForm.classList.remove("hidden");
      noteDetail.classList.add("hidden");
    } else {
      updateNotesForm.classList.add("hidden");
      noteDetail.classList.remove("hidden");
    }
  });
});

// Keep your existing image preview logic exactly (only untouched copy)
document.querySelectorAll(".preview-img").forEach((img) => {
  img.addEventListener("click", () => {
    const images = JSON.parse(img.dataset.images);
    let currentIndex = 0;

    // Create overlay
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    // Create counter
    const counter = document.createElement("div");
    counter.className = "image-counter";
    counter.textContent = `${currentIndex + 1} / ${images.length}`;
    overlay.appendChild(counter);

    const showImage = (index) => {
      displayImg.src = images[index];
      counter.textContent = `${index + 1} / ${images.length}`;
    };

    // Loader skeleton
    const loader = document.createElement("div");
    loader.className = "image-loader";
    overlay.appendChild(loader);

    // Actual Image
    const displayImg = document.createElement("img");
    displayImg.style.opacity = "0";
    displayImg.onload = () => {
      loader.remove();
      displayImg.style.opacity = "1";
    };
    displayImg.src = images[currentIndex];
    overlay.appendChild(displayImg);

    // Navigation buttons
    const prevBtn = document.createElement("button");
    prevBtn.id = "prevBtn";
    prevBtn.classList.add("nav-btn");
    prevBtn.innerHTML = "&#10094;";
    overlay.appendChild(prevBtn);

    const nextBtn = document.createElement("button");
    nextBtn.id = "nextBtn";
    nextBtn.classList.add("nav-btn");
    nextBtn.innerHTML = "&#10095;";
    overlay.appendChild(nextBtn);

    // Next
    nextBtn.addEventListener("click", (e) => {
      let touchStartX = 0;
      let touchEndX = 0;

      overlay.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
        },
        false,
      );

      overlay.addEventListener(
        "touchend",
        (e) => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        },
        false,
      );

      function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;

        if (swipeDistance > 60) prevBtn.click();
        if (swipeDistance < -60) nextBtn.click();
      }

      e.stopPropagation();
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
      displayImg.style.opacity = "0";

      setTimeout(() => {
        displayImg.src = images[currentIndex];
      }, 80);

      const preloadIndex = (currentIndex + 1) % images.length;
      preloadImage(images[preloadIndex]);
    });

    // Prev
    prevBtn.addEventListener("click", (e) => {
      let touchStartX = 0;
      let touchEndX = 0;

      overlay.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
        },
        false,
      );

      overlay.addEventListener(
        "touchend",
        (e) => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        },
        false,
      );

      function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;

        if (swipeDistance > 60) prevBtn.click();
        if (swipeDistance < -60) nextBtn.click();
      }

      e.stopPropagation();
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(currentIndex);
      displayImg.style.opacity = "0";

      setTimeout(() => {
        displayImg.src = images[currentIndex];
      }, 80);

      const preloadIndex = (currentIndex - 1 + images.length) % images.length;
      preloadImage(images[preloadIndex]);
    });

    // Preload helper
    const preloadImage = (url) => {
      if (!preloadImage.cache) preloadImage.cache = {};
      if (preloadImage.cache[url]) return;

      const img = new Image();
      img.onload = () => {
        preloadImage.cache[url] = true;
      };
      img.onerror = () => {
        preloadImage.cache[url] = false;
      };
      img.src = url;
    };

    // Keyboard support
    const keyHandler = (e) => {
      if (e.key === "ArrowLeft") prevBtn.click();
      if (e.key === "ArrowRight") nextBtn.click();
      if (e.key === "Escape") closeOverlay();
    };
    document.addEventListener("keydown", keyHandler);

    // Close overlay
    const closeOverlay = () => {
      overlay.remove();
      document.removeEventListener("keydown", keyHandler);
    };

    overlay.addEventListener("click", closeOverlay);
    document.body.appendChild(overlay);
  });
});

// Theme toggle (same as home)
const themeToggleBtn = document.getElementById("themeToggle");
const htmlElement = document.documentElement;

const setThemeIcon = (name) => {
  themeToggleBtn.innerHTML = `<i data-lucide="${name}" style="width:18px;height:18px"></i>`;
  lucide.createIcons();
};

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  htmlElement.setAttribute("data-theme", "light");
  setThemeIcon("moon");
} else {
  htmlElement.removeAttribute("data-theme");
  setThemeIcon("sun");
}

themeToggleBtn.addEventListener("click", () => {
  const currentTheme = htmlElement.getAttribute("data-theme");
  if (currentTheme === "light") {
    htmlElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "dark");
    setThemeIcon("sun");
  } else {
    htmlElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    setThemeIcon("moon");
  }
});

/* ====================== MOBILE MENU LOGIC ====================== */
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileNav = document.getElementById("mobileNav");
const mobileNavOverlay = document.getElementById("mobileNavOverlay");
const mobileNavClose = document.getElementById("mobileNavClose");

// Open mobile menu
mobileMenuBtn?.addEventListener("click", () => {
  mobileNav.classList.add("active");
  mobileNav.classList.remove("hidden");
  mobileNavOverlay.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent background scrolling
});

// Close mobile menu
const closeMobileMenu = () => {
  mobileNav.classList.remove("active");
  mobileNav.classList.add("hidden");
  mobileNavOverlay.classList.remove("active");

  document.body.style.overflow = ""; // Restore scrolling
};

mobileNavClose?.addEventListener("click", closeMobileMenu);
mobileNavOverlay?.addEventListener("click", closeMobileMenu);

// Close menu on ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileNav.classList.contains("active")) {
    closeMobileMenu();
  }
});

lucide.createIcons();
