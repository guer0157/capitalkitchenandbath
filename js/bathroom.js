const bg = document.querySelector(".parallax-bg");
const section = document.querySelector(".parallax");

window.addEventListener("scroll", () => {
  const rect = section.getBoundingClientRect();
  const scrollProgress = Math.min(Math.max(rect.top * -0.3, -200), 200);

  bg.style.transform = `translateY(${scrollProgress}px)`;
});
