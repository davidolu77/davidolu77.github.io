document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    const viewport = carousel.querySelector("[data-carousel-viewport]");
    const originalSlides = Array.from(carousel.querySelectorAll(".carousel-slide"));
    const previousButton = carousel.querySelector("[data-carousel-previous]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const toggleButton = carousel.querySelector("[data-carousel-toggle]");

    if (!viewport || originalSlides.length < 2 || !previousButton || !nextButton || !toggleButton) {
      return;
    }

    const toggleIcon = toggleButton.querySelector("i");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slideCount = originalSlides.length;
    const beforeSlides = originalSlides.map(function (slide) {
      const clone = slide.cloneNode(true);
      clone.classList.remove("is-active");
      clone.setAttribute("aria-hidden", "true");
      return clone;
    });
    const afterSlides = originalSlides.map(function (slide) {
      const clone = slide.cloneNode(true);
      clone.classList.remove("is-active");
      clone.setAttribute("aria-hidden", "true");
      return clone;
    });

    originalSlides.forEach(function (slide) {
      slide.classList.remove("is-active");
      slide.removeAttribute("aria-hidden");
    });
    viewport.replaceChildren.apply(viewport, beforeSlides.concat(originalSlides, afterSlides));

    const slides = Array.from(viewport.querySelectorAll(".carousel-slide"));
    let activeIndex = slideCount;
    let autoplayTimer = null;
    let animationFrame = null;
    let scrollFrame = null;
    let isAnimating = false;
    let isDragging = false;
    let isPaused = reduceMotion;
    let pointerStartX = 0;
    let pointerStartScrollLeft = 0;

    function targetScrollLeft(slide) {
      const viewportRect = viewport.getBoundingClientRect();
      const slideRect = slide.getBoundingClientRect();
      return viewport.scrollLeft +
        (slideRect.left + (slideRect.width / 2)) -
        (viewportRect.left + (viewport.clientWidth / 2));
    }

    function nearestSlideIndex() {
      const viewportRect = viewport.getBoundingClientRect();
      const viewportCenter = viewportRect.left + (viewport.clientWidth / 2);
      let nearestIndex = activeIndex;
      let nearestDistance = Number.POSITIVE_INFINITY;

      slides.forEach(function (slide, index) {
        const rect = slide.getBoundingClientRect();
        const distance = Math.abs((rect.left + (rect.width / 2)) - viewportCenter);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      return nearestIndex;
    }

    function updateActiveSlide(index) {
      activeIndex = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
    }

    function rebaseInfiniteRail() {
      const firstMiddleSlide = slides[slideCount];
      const firstLastSlide = slides[slideCount * 2];
      if (!firstMiddleSlide || !firstLastSlide) return;

      const setWidth = firstLastSlide.offsetLeft - firstMiddleSlide.offsetLeft;
      const nearestIndex = nearestSlideIndex();

      if (nearestIndex < slideCount) {
        viewport.scrollLeft += setWidth;
      } else if (nearestIndex >= slideCount * 2) {
        viewport.scrollLeft -= setWidth;
      }
    }

    function syncFromScroll(allowRebase) {
      if (allowRebase) rebaseInfiniteRail();
      updateActiveSlide(nearestSlideIndex());
    }

    function clearAutoplay() {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }

    function scheduleAutoplay(delay) {
      clearAutoplay();
      if (isPaused || isDragging || document.hidden) return;
      autoplayTimer = window.setTimeout(function () {
        animateToSlide(activeIndex + 1);
      }, delay || 4200);
    }

    function stopAnimation() {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      isAnimating = false;
    }

    function animateToSlide(index) {
      stopAnimation();
      clearAutoplay();

      let targetIndex = index;
      if (targetIndex < 0) targetIndex = slideCount - 1;
      if (targetIndex >= slides.length) targetIndex = slideCount;
      const targetSlide = slides[targetIndex];
      if (!targetSlide) return;

      if (reduceMotion) {
        viewport.scrollLeft = targetScrollLeft(targetSlide);
        rebaseInfiniteRail();
        syncFromScroll(false);
        scheduleAutoplay();
        return;
      }

      isAnimating = true;
      const startLeft = viewport.scrollLeft;
      const destination = targetScrollLeft(targetSlide);
      const distance = destination - startLeft;
      const startTime = performance.now();
      const duration = 760;

      function step(time) {
        const progress = Math.min((time - startTime) / duration, 1);
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        viewport.scrollLeft = startLeft + (distance * eased);
        syncFromScroll(false);

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(step);
        } else {
          animationFrame = null;
          isAnimating = false;
          rebaseInfiniteRail();
          syncFromScroll(false);
          scheduleAutoplay();
        }
      }
      animationFrame = window.requestAnimationFrame(step);
    }

    function updateToggleButton() {
      toggleButton.setAttribute("aria-pressed", String(isPaused));
      toggleButton.setAttribute("aria-label", isPaused ? "Play automatic slideshow" : "Pause automatic slideshow");
      toggleButton.setAttribute("title", isPaused ? "Play slideshow" : "Pause slideshow");
      if (toggleIcon) toggleIcon.className = isPaused ? "fa fa-play" : "fa fa-pause";
    }

    previousButton.addEventListener("click", function () {
      animateToSlide(activeIndex - 1);
    });
    nextButton.addEventListener("click", function () {
      animateToSlide(activeIndex + 1);
    });
    toggleButton.addEventListener("click", function () {
      isPaused = !isPaused;
      updateToggleButton();
      if (isPaused) {
        clearAutoplay();
        stopAnimation();
        syncFromScroll(true);
      } else {
        scheduleAutoplay(800);
      }
    });

    viewport.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      stopAnimation();
      clearAutoplay();
      isDragging = true;
      pointerStartX = event.clientX;
      pointerStartScrollLeft = viewport.scrollLeft;
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener("pointermove", function (event) {
      if (!isDragging) return;
      viewport.scrollLeft = pointerStartScrollLeft - (event.clientX - pointerStartX);
      syncFromScroll(false);
    });

    function endDrag(event) {
      if (!isDragging) return;
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      isDragging = false;
      viewport.classList.remove("is-dragging");
      rebaseInfiniteRail();
      syncFromScroll(false);
      scheduleAutoplay(5200);
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);

    viewport.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      animateToSlide(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
    });
    viewport.addEventListener("scroll", function () {
      if (scrollFrame !== null) return;
      scrollFrame = window.requestAnimationFrame(function () {
        scrollFrame = null;
        syncFromScroll(!isAnimating && !isDragging);
        if (!isAnimating && !isDragging) scheduleAutoplay(5200);
      });
    }, { passive: true });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        clearAutoplay();
        stopAnimation();
      } else {
        syncFromScroll(true);
        scheduleAutoplay();
      }
    });

    updateToggleButton();
    window.requestAnimationFrame(function () {
      viewport.scrollLeft = targetScrollLeft(slides[slideCount]);
      updateActiveSlide(slideCount);
      scheduleAutoplay();
    });
  });
});
