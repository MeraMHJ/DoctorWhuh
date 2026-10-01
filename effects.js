(function () {
    const themeKey = "doctorwhuh-theme";
    const themeButtons = Array.from(document.querySelectorAll(".theme-option"));

    function isValidTheme(theme) {
        return themeButtons.some(function (button) { return button.dataset.theme === theme; });
    }

    function updateThemeLinks(theme) {
        const currentUrl = new URL(window.location.href);
        const currentDirectory = currentUrl.pathname.slice(0, currentUrl.pathname.lastIndexOf("/"));
        currentUrl.searchParams.set("theme", theme);
        try {
            window.history.replaceState(null, "", currentUrl.href);
        } catch (error) {}

        document.querySelectorAll("a[href]").forEach(function (link) {
            const targetUrl = new URL(link.href, currentUrl);
            const targetDirectory = targetUrl.pathname.slice(0, targetUrl.pathname.lastIndexOf("/"));
            if (targetUrl.protocol !== currentUrl.protocol || targetUrl.host !== currentUrl.host ||
                targetDirectory !== currentDirectory || !targetUrl.pathname.toLowerCase().endsWith(".html")) return;
            targetUrl.searchParams.set("theme", theme);
            link.href = targetUrl.href;
        });
    }

    function applyTheme(theme) {
        if (!isValidTheme(theme)) return;
        document.body.dataset.theme = theme;
        themeButtons.forEach(function (button) {
            button.classList.toggle("active", button.dataset.theme === theme);
        });
        try {
            localStorage.setItem(themeKey, theme);
        } catch (error) {}
        updateThemeLinks(theme);
    }

    const themeFromUrl = new URLSearchParams(window.location.search).get("theme");
    let savedTheme = themeFromUrl;
    if (!isValidTheme(savedTheme)) {
        try {
            savedTheme = localStorage.getItem(themeKey);
        } catch (error) {}
    }
    applyTheme(savedTheme);

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