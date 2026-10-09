const field = new DotField(document.querySelector('.dot-field'), { color: '#4b7fc9' });
const heading = document.querySelector('.greeting');
const greetingMotion = new GreetingMotion(heading);
// Preserve the final values selected in the animation controls (milliseconds).
greetingMotion.setTimings({ hello: 1000, gap: 0, welcome: 1500 });
const introEntries = [...document.querySelectorAll('.intro-entry')];
let introAnimations = [];
const scrollEntries = [...document.querySelectorAll('.scroll-reveal')];
let scrollObserver = null;

function configureScrollReveal() {
  scrollObserver?.disconnect();
  scrollObserver = null;
  if (greetingMotion.motionQuery.matches || !('IntersectionObserver' in window)) {
    for (const entry of scrollEntries) entry.dataset.reveal = 'shown';
    return;
  }
  scrollObserver = new IntersectionObserver(entries => {
    for (const item of entries) {
      if (!item.isIntersecting) continue;
      item.target.dataset.reveal = 'shown';
      scrollObserver.unobserve(item.target);
    }
  }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  for (const entry of scrollEntries) {
    if (entry.dataset.reveal === 'shown') continue;
    entry.dataset.reveal = 'pending';
    scrollObserver.observe(entry);
  }
}

function resetIntro() {
  for (const animation of introAnimations) animation.cancel();
  introAnimations = [];
  document.documentElement.dataset.intro = 'pending';
  for (const entry of introEntries) entry.inert = true;
}

function revealIntro() {
  document.documentElement.dataset.intro = 'ready';
  for (const entry of introEntries) entry.inert = false;
  if (greetingMotion.motionQuery.matches || document.hidden) return;
  introEntries.forEach((entry, index) => {
    introAnimations.push(entry.animate([
      { opacity: 0, transform: 'translateY(10px)', filter: 'blur(3px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
    ], { duration: 1100, delay: index * 180, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' }));
  });
}

heading.addEventListener('greeting-start', resetIntro);
heading.addEventListener('greeting-complete', revealIntro);
greetingMotion.motionQuery.addEventListener('change', configureScrollReveal);
configureScrollReveal();
greetingMotion.play();

window.addEventListener('pagehide', event => {
  if (!event.persisted) {
    field.destroy();
    greetingMotion.destroy();
    scrollObserver?.disconnect();
    greetingMotion.motionQuery.removeEventListener('change', configureScrollReveal);
    for (const animation of introAnimations) animation.cancel();
  }
});
