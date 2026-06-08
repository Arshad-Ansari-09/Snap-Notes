// Get the form and file input elements
const form = document.querySelector("form");
const fileInput = document.querySelector('input[name="notesImages"]');
const submitButton = form.querySelector('button[type="submit"]');
const uploadStatus = document.getElementById("uploadStatus");

// ----------------------------------------------------
// 1. Intercept the Form Submission
// ----------------------------------------------------
form.addEventListener("submit", async function (e) {
  e.preventDefault(); // <-- STOP the default browser submission

  // Disable button and show loading state
  submitButton.textContent = "Compressing & Uploading...";
  submitButton.disabled = true;

  uploadStatus.classList.remove("hidden");
  uploadStatus.textContent = "Preparing files. Please don't close this page.";

  const originalFiles = Array.from(fileInput.files);

  if (originalFiles.length === 0) {
    alert("Please select files to upload.");
    resetFormState();
    return;
  }

  try {
    let finalFiles = [];

    for (const file of originalFiles) {
      // PDF Files
      if (file.type === "application/pdf") {
        const pdfImages = await convertPdfToImages(file);

        // DON'T compress again
        finalFiles.push(...pdfImages);
      } else {
        // Only compress normal images
        const compressed = await compressAllFiles([file]);

        finalFiles.push(...compressed);
      }
    }

    uploadStatus.textContent = `Uploading ${finalFiles.length} pages. Please Don't leave, This may take some time for large fIles.`;

    await submitCompressedData(finalFiles);
  } catch (error) {
    console.error("Upload failed:", error);
    alert("An error occurred during upload or compression.");
    resetFormState();
  }
});

function resetFormState() {
  submitButton.textContent = "Upload";
  submitButton.disabled = false;
  uploadStatus.classList.add("hidden");
  uploadStatus.textContent = "";
}

async function convertPdfToImages(file) {
  const pdfjsLib = window.pdfjsLib;

  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;

  const imageFiles = [];

  // Process pages in parallel batches
  const batchSize = 3;

  for (let i = 1; i <= pdf.numPages; i += batchSize) {
    const batch = [];

    for (
      let pageNum = i;
      pageNum < i + batchSize && pageNum <= pdf.numPages;
      pageNum++
    ) {
      uploadStatus.textContent = `Converting PDF pages... ${pageNum}/${pdf.numPages}`;

      batch.push(
        (async () => {
          const page = await pdf.getPage(pageNum);

          const viewport = page.getViewport({ scale: 2.5 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.92),
          );

          return new File([blob], `${file.name}-page-${pageNum}.jpg`, {
            type: "image/jpeg",
          });
        })(),
      );
    }

    const results = await Promise.all(batch);

    imageFiles.push(...results);
  }

  return imageFiles;
}

// Compression Helper Function (Using Compressor.js)
function compressAllFiles(files) {
  const compressionPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.7, // Compress to 70% quality (major size reduction)
        maxWidth: 1400, // Limit width to 1400px (good for handwritten notes)
        mimeType: "image/jpeg", // Force output format for consistency
        convertSize: Infinity, // Apply compression to all files
        success(result) {
          // result is the compressed File object
          resolve(result);
        },
        error(err) {
          console.error("Compression failed for a file:", err.message);
          reject(err);
        },
      });
    });
  });
  // Wait for all files to be compressed concurrently
  return Promise.all(compressionPromises);
}

// ----------------------------------------------------
// 3. Submission Helper Function (Fetch API)
// ----------------------------------------------------
async function submitCompressedData(files) {
  const formData = new FormData();

  // Append the text fields (classname, notesInfo)
  formData.append("classname", form.elements.classname.value);
  formData.append("notesInfo", form.elements.notesInfo.value);

  // Append the COMPRESSED files
  files.forEach((file) => {
    // The name "notesImages" MUST match the name expected by your Multer middleware
    formData.append("notesImages", file, file.name);
  });

  // Send the data using Fetch API
  const response = await fetch(form.action, {
    method: "POST",
    body: formData, // Send the compressed data
  });

  if (response.ok) {
    uploadStatus.textContent = "Upload complete. Redirecting...";
    // Assuming your server responds with a redirect or a JSON success message
    window.location.href = "/"; // Manually redirect to the homepage
  } else {
    throw new Error(`Server returned status: ${response.status}`);
  }
}
// logic for upload
const uploadBtn = document.getElementById("upload-btn");
const uploadPreview = document.getElementById("upload-preview");
uploadBtn.addEventListener("click", () => {
  uploadPreview.classList.toggle("hidden");
});
const uploadClose = document.getElementById("upload-close");

uploadClose.addEventListener("click", () => {
  uploadPreview.classList.add("hidden");
});

/* =========================== THEME TOGGLE LOGIC (from Code 1) =========================== */
const themeToggleBtn = document.getElementById("themeToggle");
const htmlElement = document.documentElement;

const setThemeIcon = (name) => {
  // re-inject <i> so lucide can recreate it (more reliable)
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

// init all icons
lucide.createIcons();

/* =========================== CODE 2 LOGIC (EXACT) =========================== */

// Logic for Filter
const classFilter = document.getElementById("class-filter");
const semFilter = document.getElementById("sem-filter");
const container = document.querySelectorAll("#Container > div"); // each card
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

// Logic for Image preview
document.querySelectorAll(".preview-img").forEach((img) => {
  img.addEventListener("click", () => {
    const images = JSON.parse(img.dataset.images);
    let currentIndex = 0;

    // ✅ Preload ALL images immediately
    images.forEach((src) => {
      const preload = new Image();
      preload.src = src;
    });

    // Create overlay
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    // ✅ Notes info label (top-left)
    const title = document.createElement("div");
    title.className = "overlay-title";
    title.textContent = img.dataset.notesinfo || "Notes Preview";
    title.addEventListener("click", (e) => e.stopPropagation()); // don't close overlay if clicked
    overlay.appendChild(title);

    // Create counter
    const counter = document.createElement("div");
    counter.className = "image-counter";
    counter.textContent = `${currentIndex + 1} / ${images.length}`; // e.g., 1 / 8
    overlay.appendChild(counter);

    const showImage = (index) => {
      displayImg.src = images[index];
      counter.textContent = `${index + 1} / ${images.length}`;
    };

    // ✅ Loader skeleton
    const loader = document.createElement("div");
    loader.className = "image-loader";
    overlay.appendChild(loader);

    // ✅ Actual Image
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
    prevBtn.innerHTML = "&#10094;"; // Left arrow
    overlay.appendChild(prevBtn);

    const nextBtn = document.createElement("button");
    nextBtn.id = "nextBtn";
    nextBtn.classList.add("nav-btn");
    nextBtn.innerHTML = "&#10095;"; // Right arrow
    overlay.appendChild(nextBtn);

    // Show next image
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

        if (swipeDistance > 60) {
          // ✅ Swipe Right → Previous Image
          prevBtn.click();
        }
        if (swipeDistance < -60) {
          // ✅ Swipe Left → Next Image
          nextBtn.click();
        }
      }

      e.stopPropagation();
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
      displayImg.style.opacity = "0";
      setTimeout(() => {
        displayImg.src = images[currentIndex];
      }, 80);

      // ⭐ NEW: Start preloading the image that comes AFTER the next one
      const preloadIndex = (currentIndex + 1) % images.length;
      preloadImage(images[preloadIndex]);
    });

    // Show previous image
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

        if (swipeDistance > 60) {
          // ✅ Swipe Right → Previous Image
          prevBtn.click();
        }
        if (swipeDistance < -60) {
          // ✅ Swipe Left → Next Image
          nextBtn.click();
        }
      }

      e.stopPropagation();
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(currentIndex);
      displayImg.style.opacity = "0";
      setTimeout(() => {
        displayImg.src = images[currentIndex];
      }, 80);

      // ⭐ NEW: Start preloading the image that comes BEFORE the previous one
      const preloadIndex = (currentIndex - 1 + images.length) % images.length;
      preloadImage(images[preloadIndex]);
    });

    // ⭐ NEW FUNCTION: Function to handle the actual preloading
    const preloadImage = (url) => {
      // 1. Check if the image is already in the cache (optional but good practice)
      if (!preloadImage.cache) preloadImage.cache = {};
      if (preloadImage.cache[url]) return;

      // 2. Create a temporary Image object
      const img = new Image();
      img.onload = () => {
        // Image loaded successfully, now it's in the browser cache!
        preloadImage.cache[url] = true;
      };
      img.onerror = () => {
        // Handle error if needed
        preloadImage.cache[url] = false;
      };

      // 3. Set the source to start downloading the file in the background
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

// Logic for Image download as PDF
document.querySelectorAll(".download-pdf-btn").forEach((btn) => {
  // Get the necessary child and sibling elements
  const menu = btn.parentElement.querySelector(".download-menu");
  const icon = btn.querySelector(".btn-icon");
  const spinner = btn.querySelector(".btn-spinner");
  // FIX 1: Correctly select the progress text element INSIDE the button
  const progressText = btn.querySelector(".btn-progress-text");

  // Toggle dropdown menu on button click (This is essential for the menu to appear)
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevents the click from immediately triggering the window-wide close handler
    menu.classList.toggle("hidden");
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add("hidden");
    }
  });

  // Handle PDF download
  menu
    .querySelector(".download-as-pdf")
    .addEventListener("click", async (e) => {
      e.stopPropagation(); // Stop click from propagating up and immediately re-hiding the menu
      menu.classList.add("hidden");

      icon.classList.add("hidden");
      spinner.classList.remove("hidden");
      progressText.classList.remove("hidden");

      const { jsPDF } = window.jspdf;
      // Setting PDF to 'l' (landscape) or checking image size might be needed for larger images
      const pdf = new jsPDF();
      const images = JSON.parse(btn.dataset.images);
      const totalImages = images.length;

      const classname = btn.dataset.classname || "Notes";
      const info = btn.dataset.info || "User";
      const filename = `${classname}-${info}.pdf`.replace(/\s+/g, "_");

      let currentImageCount = 0;

      // --- PHASE 1: Fetching Images (Concurrent Download) ---
      const fetchImageWithProgress = async (url, index) => {
        progressText.textContent = `Fetching ${index + 1}/${totalImages}`;
        const response = await fetch(url);
        return response.blob();
      };

      const fetchPromises = images.map((url, index) =>
        fetchImageWithProgress(url, index),
      );
      const blobs = await Promise.all(fetchPromises);

      // --- PHASE 2: Processing Images & Generating PDF ---
      progressText.textContent = `Processing 0/${totalImages} Images`;
      currentImageCount = 0;

      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i];

        // Convert blob to Data URL
        const imgData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        // 🎯 ASPECT RATIO CALCULATION FIX (from previous step) 🎯
        const imgDimensions = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () =>
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.src = imgData;
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgAspect = imgDimensions.width / imgDimensions.height;
        const pdfAspect = pdfWidth / pdfHeight;

        let finalWidth, finalHeight;
        let xPos = 0,
          yPos = 0;

        if (imgAspect > pdfAspect) {
          // Image is wider (landscape or wide portrait) than the page
          finalWidth = pdfWidth;
          finalHeight = pdfWidth / imgAspect;
          yPos = (pdfHeight - finalHeight) / 2; // Center vertically
        } else {
          // Image is taller (portrait or square) than the page
          finalHeight = pdfHeight;
          finalWidth = pdfHeight * imgAspect;
          xPos = (pdfWidth - finalWidth) / 2; // Center horizontally
        }

        // ----------------------------------------------------
        // Update processing progress
        currentImageCount = i + 1;
        progressText.textContent = `Processing ${currentImageCount}/${totalImages} Images`;

        pdf.addImage(
          imgData,
          "JPEG",
          xPos,
          yPos,
          finalWidth,
          finalHeight,
          null,
          "NONE",
          0,
          { quality: 1.0 },
        );
        if (i < totalImages - 1) pdf.addPage();
      }

      pdf.save(filename);

      // Hide all indicators upon completion
      spinner.classList.add("hidden");
      icon.classList.remove("hidden");
      progressText.classList.add("hidden");
    });

  // Handle Images download
  menu
    .querySelector(".download-as-images")
    .addEventListener("click", async () => {
      menu.classList.add("hidden");

      const images = JSON.parse(btn.dataset.images);
      const classname = btn.dataset.classname || "Notes";

      icon.classList.add("hidden");
      spinner.classList.remove("hidden");

      for (let i = 0; i < images.length; i++) {
        const response = await fetch(images[i], { mode: "cors" });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${classname}-${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url); // cleanup
      }

      spinner.classList.add("hidden");
      icon.classList.remove("hidden");
    });
});

// Optional: make "View note" open the preview
// document.querySelectorAll(".view-note-btn").forEach(btn => {
//   btn.addEventListener("click", (e) => {
//     e.preventDefault();
//     const img = btn.closest(".note-card")?.querySelector(".preview-img");
//     if (img) img.click();
//   });
// });

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
