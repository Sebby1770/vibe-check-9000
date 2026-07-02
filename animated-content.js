/*
 * AnimatedContent — vanilla JS port of the ReactBits <AnimatedContent /> component.
 * https://reactbits.dev/animations/animated-content
 *
 * Mirrors the ReactBits prop API via data attributes, driven by
 * IntersectionObserver + the Web Animations API (no GSAP dependency):
 *
 *   data-animate                     opt-in marker
 *   data-animate-direction          "vertical" | "horizontal"   (default: vertical)
 *   data-animate-distance           px offset to slide from      (default: 100)
 *   data-animate-duration           ms                           (default: 800)
 *   data-animate-ease               CSS easing                   (default: power3.out equivalent)
 *   data-animate-delay              ms                           (default: 0)
 *   data-animate-threshold          0..1 visibility to trigger   (default: 0.1)
 *   data-animate-initial-opacity    starting opacity             (default: 0)
 *   data-animate-opacity            "false" disables the fade    (default: animate opacity)
 *   data-animate-scale              starting scale               (default: 1)
 *   data-animate-reverse            "true" flips slide direction (default: false)
 *
 * Respects prefers-reduced-motion: content simply appears.
 */

const AnimatedContent = (() => {
    // cubic-bezier approximation of GSAP's power3.out, the ReactBits default
    const DEFAULT_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const observers = new Map(); // threshold -> IntersectionObserver

    function config(el) {
        const d = el.dataset;
        return {
            direction: d.animateDirection === "horizontal" ? "horizontal" : "vertical",
            distance: Number.parseFloat(d.animateDistance ?? "100"),
            duration: Number.parseFloat(d.animateDuration ?? "800"),
            ease: d.animateEase || DEFAULT_EASE,
            delay: Number.parseFloat(d.animateDelay ?? "0"),
            threshold: Math.min(1, Math.max(0, Number.parseFloat(d.animateThreshold ?? "0.1"))),
            initialOpacity: Number.parseFloat(d.animateInitialOpacity ?? "0"),
            animateOpacity: d.animateOpacity !== "false",
            scale: Number.parseFloat(d.animateScale ?? "1"),
            reverse: d.animateReverse === "true",
        };
    }

    function hiddenTransform(cfg) {
        const offset = cfg.reverse ? -cfg.distance : cfg.distance;
        const translate = cfg.direction === "horizontal"
            ? `translateX(${offset}px)`
            : `translateY(${offset}px)`;
        return `${translate} scale(${cfg.scale})`;
    }

    function prepare(el) {
        if (el.dataset.animateState === "ready" || el.dataset.animateState === "done") return;
        const cfg = config(el);
        el.dataset.animateState = "ready";
        if (reduceMotion.matches) return;
        el.style.transform = hiddenTransform(cfg);
        el.style.opacity = cfg.animateOpacity ? String(cfg.initialOpacity) : "";
        el.style.willChange = "transform, opacity";
    }

    function play(el) {
        if (el.dataset.animateState === "done") return;
        el.dataset.animateState = "done";
        const cfg = config(el);

        if (reduceMotion.matches) {
            el.style.transform = "";
            el.style.opacity = "";
            return;
        }

        const keyframes = [
            {
                transform: hiddenTransform(cfg),
                opacity: cfg.animateOpacity ? cfg.initialOpacity : 1,
            },
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
        ];

        const animation = el.animate(keyframes, {
            duration: cfg.duration,
            delay: cfg.delay,
            easing: cfg.ease,
            fill: "backwards",
        });

        animation.addEventListener("finish", () => {
            el.style.transform = "";
            el.style.opacity = "";
            el.style.willChange = "";
            el.dispatchEvent(new CustomEvent("animatedcontent:complete", { bubbles: true }));
        });
    }

    function observerFor(threshold) {
        if (!observers.has(threshold)) {
            observers.set(threshold, new IntersectionObserver((entries, obs) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        obs.unobserve(entry.target);
                        play(entry.target);
                    }
                }
            }, { threshold }));
        }
        return observers.get(threshold);
    }

    /** Register every [data-animate] element inside root (default: whole document). */
    function register(root = document) {
        root.querySelectorAll("[data-animate]").forEach((el) => {
            prepare(el);
            if (el.dataset.animateState === "ready") {
                observerFor(config(el).threshold).observe(el);
            }
        });
    }

    /** Reset elements inside root so they replay the next time they become visible. */
    function reset(root = document) {
        root.querySelectorAll("[data-animate]").forEach((el) => {
            delete el.dataset.animateState;
            prepare(el);
            if (el.dataset.animateState === "ready") {
                observerFor(config(el).threshold).observe(el);
            }
        });
    }

    /** Immediately play everything inside root (for sections revealed via JS, not scroll). */
    function playNow(root = document) {
        root.querySelectorAll("[data-animate]").forEach((el) => {
            prepare(el);
            play(el);
        });
    }

    return { register, reset, playNow };
})();
