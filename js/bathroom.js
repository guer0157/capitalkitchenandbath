const parallax = document.querySelector(".parallax-bg");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  parallax.style.transform = `translateY(${scrollY * 0.3}px)`;
});
