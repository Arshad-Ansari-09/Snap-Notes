// Keep your original profile edit toggle logic EXACTLY (ids unchanged)
const edit = document.getElementById("EditUserInfo");
const userInfo = document.getElementById("userInfo");
const userUpdateForm = document.getElementById("userUpdateForm");

edit.addEventListener("click", (e) => {
  e.preventDefault();
  if (
    !userInfo.classList.contains("hidden") &&
    userUpdateForm.classList.contains("hidden")
  ) {
    userInfo.classList.add("hidden");
    userUpdateForm.classList.remove("hidden");
  } else {
    userInfo.classList.remove("hidden");
    userUpdateForm.classList.add("hidden");
  }
});

// Theme toggle (same behavior as your home page)
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
