/* THEME */
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

lucide.createIcons();

/* ===========================
         FILTER LOGIC (unchanged)
      =========================== */
const classFilter = document.getElementById("class-filter");
const semFilter = document.getElementById("sem-filter");
const container = document.querySelectorAll("#Container > div");
const nameInput = document.getElementById("nameInput");

classFilter.addEventListener("change", (e) => {
  container.forEach((box) => {
    const className = box.querySelector(".className");
    if (
      className.textContent
        .toLowerCase()
        .replace(/[\W_]/g, "")
        .includes(e.target.value.toLowerCase().replace(/[\W_]/g, "")) &&
      (semFilter.value.toLowerCase() === "sem" ||
        className.textContent
          .toLowerCase()
          .replace(/[\W_]/g, "")
          .includes(semFilter.value.toLowerCase().replace(/[\W_]/g, "")))
    ) {
      box.style.display = "block";
    } else {
      box.style.display = "none";
    }
  });
});

semFilter.addEventListener("change", (e) => {
  container.forEach((box) => {
    const className = box.querySelector(".className");
    if (
      (classFilter.value.toLowerCase() === "class" ||
        className.textContent
          .toLowerCase()
          .replace(/[\W_]/g, "")
          .includes(classFilter.value.toLowerCase().replace(/[\W_]/g, ""))) &&
      (e.target.value.toLowerCase() === "sem" ||
        className.textContent
          .toLowerCase()
          .replace(/[\W_]/g, "")
          .includes(e.target.value.toLowerCase().replace(/[\W_]/g, "")))
    ) {
      box.style.display = "block";
    } else {
      box.style.display = "none";
    }
  });
});

nameInput.addEventListener("input", () => {
  container.forEach((box) => {
    const username = box.querySelector(".userName");
    const notesInfo = box.querySelector(".notesInfo");
    if (!username && !notesInfo) return;

    if (
      username.textContent
        .toLowerCase()
        .replace(/[\W_]/g, "")
        .includes(nameInput.value.toLowerCase().replace(/[\W_]/g, "")) ||
      notesInfo.textContent
        .toLowerCase()
        .replace(/[\W_]/g, "")
        .includes(nameInput.value.toLowerCase().replace(/[\W_]/g, ""))
    ) {
      box.style.display = "block";
    } else {
      box.style.display = "none";
    }
  });
});

/* ===========================
         Preview logic (kept)
      =========================== */
document.querySelectorAll(".preview-img").forEach((img) => {
  img.addEventListener("click", () => {
    const images = JSON.parse(img.dataset.images);
    let currentIndex = 0;

    images.forEach((src) => {
      const preload = new Image();
      preload.src = src;
    });

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    const counter = document.createElement("div");
    counter.className = "image-counter";
    counter.textContent = `${currentIndex + 1} / ${images.length}`;
    overlay.appendChild(counter);

    const loader = document.createElement("div");
    loader.className = "image-loader";
    overlay.appendChild(loader);

    const displayImg = document.createElement("img");
    displayImg.style.opacity = "0";
    displayImg.onload = () => {
      loader.remove();
      displayImg.style.opacity = "1";
    };
    displayImg.src = images[currentIndex];
    overlay.appendChild(displayImg);

    const showImage = (index) => {
      displayImg.src = images[index];
      counter.textContent = `${index + 1} / ${images.length}`;
    };

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

    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
    });

    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(currentIndex);
    });

    overlay.addEventListener("click", () => overlay.remove());
    document.body.appendChild(overlay);
  });
});

/* ===========================
         ✅ FAST DOWNLOAD (same as home page)
         - toggles menu
         - PDF: fetch all concurrently + progress + aspect fit
         - Images: fetch blob + download each + progress
      =========================== */
document.querySelectorAll(".download-pdf-btn").forEach((btn) => {
  const menu = btn.parentElement.querySelector(".download-menu");
  const icon = btn.querySelector(".btn-icon");
  const spinner = btn.querySelector(".btn-spinner");
  const progressText = btn.querySelector(".btn-progress-text");

  // Toggle menu
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add("hidden");
    }
  });

  // Download as PDF
  menu
    .querySelector(".download-as-pdf")
    .addEventListener("click", async (e) => {
      e.stopPropagation();
      menu.classList.add("hidden");

      icon.classList.add("hidden");
      spinner.classList.remove("hidden");
      progressText.classList.remove("hidden");

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      const images = JSON.parse(btn.dataset.images);
      const total = images.length;

      const classname = btn.dataset.classname || "Notes";
      const info = btn.dataset.info || "User";
      const filename = `${classname}-${info}.pdf`.replace(/\s+/g, "_");

      // Phase 1: fetch all images concurrently
      const fetchOne = async (url, index) => {
        progressText.textContent = `Fetching ${index + 1}/${total}`;
        const response = await fetch(url);
        return response.blob();
      };
      const blobs = await Promise.all(images.map((u, i) => fetchOne(u, i)));

      // Phase 2: process and add to PDF (fit with aspect ratio)
      progressText.textContent = `Processing 0/${total}`;
      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i];

        const imgData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        const dims = await new Promise((resolve) => {
          const im = new Image();
          im.onload = () =>
            resolve({ w: im.naturalWidth, h: im.naturalHeight });
          im.src = imgData;
        });

        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        const imgAspect = dims.w / dims.h;
        const pdfAspect = pdfW / pdfH;

        let w,
          h,
          x = 0,
          y = 0;
        if (imgAspect > pdfAspect) {
          w = pdfW;
          h = pdfW / imgAspect;
          y = (pdfH - h) / 2;
        } else {
          h = pdfH;
          w = pdfH * imgAspect;
          x = (pdfW - w) / 2;
        }

        progressText.textContent = `Processing ${i + 1}/${total}`;
        pdf.addImage(imgData, "JPEG", x, y, w, h);
        if (i < total - 1) pdf.addPage();
      }

      pdf.save(filename);

      spinner.classList.add("hidden");
      icon.classList.remove("hidden");
      progressText.classList.add("hidden");
    });

  // Download as Images
  menu
    .querySelector(".download-as-images")
    .addEventListener("click", async (e) => {
      e.stopPropagation();
      menu.classList.add("hidden");

      icon.classList.add("hidden");
      spinner.classList.remove("hidden");
      progressText.classList.remove("hidden");

      const images = JSON.parse(btn.dataset.images);
      const classname = btn.dataset.classname || "Notes";

      for (let i = 0; i < images.length; i++) {
        progressText.textContent = `Saving ${i + 1}/${images.length}`;
        const response = await fetch(images[i], { mode: "cors" });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${classname}-${i + 1}.jpg`.replace(/\s+/g, "_");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      }

      spinner.classList.add("hidden");
      icon.classList.remove("hidden");
      progressText.classList.add("hidden");
    });
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
