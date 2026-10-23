(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const run = (element, frames, options) => {
    if (motion.matches || !element.animate) return null;
    const animation = element.animate(frames, options);
    active.add(animation);
    animation.finished.then(() => active.delete(animation), () => active.delete(animation));
    return animation;
  };
  const ease = 'cubic-bezier(.22, 1, .36, 1)';

  // Animate from the normal rendered layout; no hidden class or JS dependency
  // is needed to keep the page readable if an animation is interrupted.
  document.querySelectorAll('.intro > *').forEach((element, i) => {
    run(element, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 850, delay: i * 65, easing: ease, fill: 'backwards' });
  });

  let observer;
  if ('IntersectionObserver' in window && !motion.matches) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        run(target, [{ opacity: .25, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 750, easing: ease });
      });
    }, { threshold: .12 });
    document.querySelectorAll('.project, .earlier, .education, .outside-grid, .contact').forEach(el => observer.observe(el));
  }

  document.querySelectorAll('details').forEach(details => {
    const summary = details.querySelector('summary');
    let transition;
    let desiredOpen = details.open;
    summary.addEventListener('click', event => {
      if (motion.matches || !details.animate) return;
      event.preventDefault();
      const from = details.getBoundingClientRect().height;
      transition?.cancel();
      desiredOpen = !desiredOpen;
      details.open = true;
      const to = desiredOpen ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height;
      transition = run(details, [{ height: `${from}px` }, { height: `${to}px` }], { duration: 360, easing: ease });
      transition.onfinish = () => { details.open = desiredOpen; transition = null; };
      transition.oncancel = () => { if (motion.matches) details.open = desiredOpen; };
    });
  });

  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    observer?.disconnect();
    active.forEach(animation => animation.cancel());
    active.clear();
  });
})();
