(function () {
    const themeKey = "doctorwhuh-theme";
    const themeButtons = Array.from(document.querySelectorAll(".theme-option"));

    function applyTheme(theme) {
        if (!themeButtons.some(function (button) { return button.dataset.theme === theme; })) return;
        document.body.dataset.theme = theme;
        themeButtons.forEach(function (button) {
            button.classList.toggle("active", button.dataset.theme === theme);
        });
    }

    try {
        applyTheme(localStorage.getItem(themeKey));
    } catch (error) {}

    themeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            applyTheme(button.dataset.theme);
            try {
                localStorage.setItem(themeKey, button.dataset.theme);
            } catch (error) {}
        });
    });

    window.addEventListener("storage", function (event) {
        if (event.key === themeKey) applyTheme(event.newValue);
    });

    const images = Array.from(document.querySelectorAll(".section-img"));
    if (!images.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let scheduled = false;
    function updateParallax() {
        let moving = false;
        images.forEach(function (image) {
            const current = Number.parseFloat(image.style.getPropertyValue("--parallax-offset")) || 0;
            const center = image.getBoundingClientRect().top + image.offsetHeight / 2 - current;
            const target = Math.max(-90, Math.min(90, (window.innerHeight / 2 - center) * 0.14));
            const offset = current + (target - current) * 0.18;
            moving = moving || Math.abs(target - offset) > 0.25;
            image.style.setProperty("--parallax-offset", (moving ? offset : target) + "px");
        });
        if (moving) window.requestAnimationFrame(updateParallax);
        else scheduled = false;
    }

    function scheduleParallax() {
        if (!scheduled) {
            scheduled = true;
            window.requestAnimationFrame(updateParallax);
        }
    }

    window.addEventListener("scroll", scheduleParallax, { passive: true });
    window.addEventListener("resize", scheduleParallax);
    window.addEventListener("load", scheduleParallax, { once: true });
    scheduleParallax();
})();