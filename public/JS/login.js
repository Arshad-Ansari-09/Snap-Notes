// ✅ Keep your original logic EXACTLY (only moved here)
const passInput = document.getElementById("passInput");
const passUnVisibler = document.getElementById("passUnVisibler");
const passVisibler = document.getElementById("passVisibler");

passUnVisibler.addEventListener("click", () => {
  if (passUnVisibler.classList.contains("hidden")) {
    passUnVisibler.classList.remove("hidden");
    passVisibler.classList.add("hidden");
  } else {
    passUnVisibler.classList.add("hidden");
    passVisibler.classList.remove("hidden");
    passInput.type = "text";
  }
});

passVisibler.addEventListener("click", () => {
  if (passVisibler.classList.contains("hidden")) {
    passUnVisibler.classList.add("hidden");
    passVisibler.classList.remove("hidden");
  } else {
    passUnVisibler.classList.remove("hidden");
    passVisibler.classList.add("hidden");
    passInput.type = "password";
  }
});

// Theme toggle (same behavior as home page)
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
