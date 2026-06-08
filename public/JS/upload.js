// ✅ Logic unchanged (your original upload compression + fetch submit)
const form = document.querySelector("form");
const fileInput = document.querySelector('input[name="notesImages"]');
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  submitButton.textContent = "Compressing & Uploading...";
  submitButton.disabled = true;

  const originalFiles = Array.from(fileInput.files);

  if (originalFiles.length === 0) {
    alert("Please select files to upload.");
    resetFormState();
    return;
  }

  try {
    const compressedFiles = await compressAllFiles(originalFiles);
    await submitCompressedData(compressedFiles);
  } catch (error) {
    console.error("Upload failed:", error);
    alert("An error occurred during upload or compression.");
    resetFormState();
  }
});

function resetFormState() {
  submitButton.textContent = "Upload";
  submitButton.disabled = false;
}

function compressAllFiles(files) {
  const compressionPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.7,
        maxWidth: 1400,
        mimeType: "image/jpeg",
        convertSize: Infinity,
        success(result) {
          resolve(result);
        },
        error(err) {
          console.error("Compression failed for a file:", err.message);
          reject(err);
        },
      });
    });
  });
  return Promise.all(compressionPromises);
}

async function submitCompressedData(files) {
  const formData = new FormData();

  formData.append("classname", form.elements.classname.value);
  formData.append("notesInfo", form.elements.notesInfo.value);

  files.forEach((file) => {
    formData.append("notesImages", file, file.name);
  });

  const response = await fetch(form.action, {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    window.location.href = "/";
  } else {
    throw new Error(`Server returned status: ${response.status}`);
  }
}

// Theme toggle (same as home page)
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
