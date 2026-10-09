/** Reveal each entire greeting phrase using the existing typeface. */
class GreetingMotion {
  constructor(heading) {
    this.heading = heading;
    this.phrases = [...heading.querySelectorAll('.greeting-phrase')];
    this.animations = [];
    this.timer = null;
    this.sequence = 0;
    this.timings = { hello: 500, gap: 500, welcome: 1000 };
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._onPreference = () => this.play();
    this._onVisibility = () => {
      if (document.hidden && this.heading.dataset.playing === 'true') this._finish();
    };
    this.motionQuery.addEventListener('change', this._onPreference);
    document.addEventListener('visibilitychange', this._onVisibility);
  }

  stop() {
    this.sequence += 1;
    clearTimeout(this.timer);
    this.timer = null;
    for (const animation of this.animations) animation.cancel();
    this.animations = [];
    this.heading.dataset.playing = 'false';
  }

  _finish() {
    this.stop();
    this.heading.dispatchEvent(new CustomEvent('greeting-complete'));
  }

  setTimings(timings = {}) {
    for (const key of ['hello', 'gap', 'welcome']) {
      const value = timings[key];
      if (typeof value === 'number' && Number.isFinite(value)) this.timings[key] = Math.max(0, Math.min(2000, value));
    }
  }

  play(timings = this.timings) {
    this.setTimings(timings);
    this.stop();
    this.heading.dispatchEvent(new CustomEvent('greeting-start'));
    if (this.motionQuery.matches || document.hidden) {
      this._finish();
      return;
    }
    this.heading.dataset.playing = 'true';
    const sequence = this.sequence;
    let delay = 250;
    let end = 0;
    this.phrases.forEach((phrase, index) => {
      const duration = index === 0 ? this.timings.hello : this.timings.welcome;
      // One continuous diagonal brush for the whole phrase, without character delays.
      this.animations.push(phrase.animate([
        { clipPath: 'polygon(-5% -20%, -5% -20%, -5% -20%, -5% -20%)' },
        { clipPath: 'polygon(-5% -20%, 105% -20%, -5% 120%, -5% 120%)', offset: .5 },
        { clipPath: 'polygon(-5% -20%, 105% -20%, 105% 120%, -5% 120%)' }
      ], { duration, delay, easing: 'cubic-bezier(.3,.1,.2,1)', fill: 'both' }));
      end = delay + duration;
      delay = end + this.timings.gap;
    });
    this.timer = setTimeout(() => {
      if (sequence === this.sequence) this._finish();
    }, end + 150);
  }

  destroy() {
    this.stop();
    this.motionQuery.removeEventListener('change', this._onPreference);
    document.removeEventListener('visibilitychange', this._onVisibility);
  }
}
