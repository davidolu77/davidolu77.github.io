document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    const viewport = carousel.querySelector("[data-carousel-viewport]");
    const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
    const previousButton = carousel.querySelector("[data-carousel-previous]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const toggleButton = carousel.querySelector("[data-carousel-toggle]");
    const toggleIcon = toggleButton.querySelector("i");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeIndex = 0;
    let autoplayTimer = null;
    let isPaused = reduceMotion;

    function setActiveSlide(index, behavior) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      const activeSlide = slides[activeIndex];
      viewport.scrollTo({
        left: activeSlide.offsetLeft - ((viewport.clientWidth - activeSlide.offsetWidth) / 2),
        behavior: behavior
      });
    }

    function startAutoplay() {
      window.clearInterval(autoplayTimer);
      if (!isPaused) {
        autoplayTimer = window.setInterval(function () {
          setActiveSlide(activeIndex + 1, "smooth");
        }, 4500);
      }
    }

    function updateToggleButton() {
      toggleButton.setAttribute("aria-pressed", String(isPaused));
      toggleButton.setAttribute("aria-label", isPaused ? "Play automatic slideshow" : "Pause automatic slideshow");
      toggleButton.setAttribute("title", isPaused ? "Play slideshow" : "Pause slideshow");
      toggleIcon.className = isPaused ? "fa fa-play" : "fa fa-pause";
    }

    previousButton.addEventListener("click", function () {
      setActiveSlide(activeIndex - 1, "smooth");
      startAutoplay();
    });

    nextButton.addEventListener("click", function () {
      setActiveSlide(activeIndex + 1, "smooth");
      startAutoplay();
    });

    toggleButton.addEventListener("click", function () {
      isPaused = !isPaused;
      updateToggleButton();
      startAutoplay();
    });

    viewport.addEventListener("scroll", function () {
      window.requestAnimationFrame(function () {
        const viewportCenter = viewport.getBoundingClientRect().left + (viewport.clientWidth / 2);
        let closestIndex = activeIndex;
        let closestDistance = Number.POSITIVE_INFINITY;

        slides.forEach(function (slide, index) {
          const rect = slide.getBoundingClientRect();
          const distance = Math.abs((rect.left + (rect.width / 2)) - viewportCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        if (closestIndex !== activeIndex) {
          activeIndex = closestIndex;
          slides.forEach(function (slide, index) {
            slide.classList.toggle("is-active", index === activeIndex);
          });
        }
      });
    }, { passive: true });

    updateToggleButton();
    setActiveSlide(0, "auto");
    startAutoplay();
  });
});
