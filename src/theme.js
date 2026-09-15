export const initTheme = () => {
  const savedTheme = localStorage.getItem("devresolve_theme") || "dark";
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const toggleTheme = () => {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("devresolve_theme", isDark ? "dark" : "light");
};