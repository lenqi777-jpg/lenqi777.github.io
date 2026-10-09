/* Second-version motion presents UI state only; no network, storage, or business actions. */
(() => {
  'use strict';
  const media = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const effects = new WeakMap();
  const active = new Set();
  const disclosureGoals = new WeakMap();
  const dialogStates = new WeakMap();
  const statusValues = new WeakMap();
  const pressed = new Set();
  const selectionTimers = new Map();
  let selectionIntent = null, intentTimer = null;
  const selectionSelector = 'button[aria-pressed], button[aria-selected], button[data-stage], button[data-hub-view], .strategy-card, .record-button, .tabs button, [role="tab"]';
  const discreteDialogs = Boolean(window.CSS?.supports?.('transition-behavior', 'allow-discrete'));
  const ease = 'cubic-bezier(.22,.68,.25,1)';
  const root = document.documentElement;
  root.classList.add('motion-runtime-active');
  const reduced = () => Boolean(media && media.matches);
  const channels = element => {
    let map = effects.get(element);
    if (!map) { map = new Map(); effects.set(element, map); }
    return map;
  };

  function stopRecord(record, settle) {
    if (!record || record.stopped) return;
    record.stopped = true;
    const map = effects.get(record.element);
    if (map && map.get(record.channel) === record) map.delete(record.channel);
    active.delete(record);
    try { record.animation.cancel(); } catch (_) {}
    if (record.cleanup) record.cleanup();
    if (settle && record.settle) record.settle();
  }

  function effect(element, keyframes, settings = {}) {
    if (!element) return null;
    const channel = settings.channel || 'main';
    stopRecord(effects.get(element)?.get(channel), false);
    if (reduced() || !element.isConnected || typeof element.animate !== 'function') {
      if (settings.cleanup) settings.cleanup();
      if (settings.settle) settings.settle();
      return null;
    }
    let animation;
    try {
      const options = { duration: settings.duration ?? 160, easing: settings.easing || 'ease-out', fill: 'none' };
      if (settings.pseudoElement) options.pseudoElement = settings.pseudoElement;
      animation = element.animate(keyframes, options);
    } catch (_) {
      if (settings.cleanup) settings.cleanup();
      if (settings.settle) settings.settle();
      return null;
    }
    const record = { element, channel, animation, cleanup: settings.cleanup, settle: settings.settle, stopped: false };
    channels(element).set(channel, record);
    active.add(record);
    animation.finished.then(() => {
      if (!record.stopped && effects.get(element)?.get(channel) === record) stopRecord(record, true);
    }).catch(() => {});
    return animation;
  }

  function dismiss(scope, settle = true) {
    for (const record of [...active]) {
      if (!scope || record.element === scope || scope.contains(record.element)) stopRecord(record, settle);
    }
  }

  function cancelAll() {
    dismiss(null, true);
    for (const element of [...selectionTimers.keys()]) clearSelection(element);
    if (intentTimer !== null) clearTimeout(intentTimer);
    intentTimer = null; selectionIntent = null;
    for (const element of pressed) element.classList.remove('is-motion-pressed');
    pressed.clear();
  }

  function revealCard(body) {
    return effect(body, [{ opacity: 0.45 }, { opacity: 1 }], { duration: 120 });
  }

  function revealDialogContent(body) {
    return effect(body, [{ opacity: 0.6, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 180 });
  }

  function animateDialog(dialog) {
    if (!dialog.isConnected) return;
    const wasOpen = dialogStates.get(dialog) || false;
    dialogStates.set(dialog, dialog.open);
    if (!dialog.open) { dismiss(dialog, true); return; }
    if (wasOpen || discreteDialogs) return;
    effect(dialog, [{ opacity: 0.5, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 180 });
    effect(dialog, [{ opacity: 0 }, { opacity: 1 }], { duration: 180, channel: 'backdrop', pseudoElement: '::backdrop' });
  }

  function menuPresentation(body, fallbackOpacity, fallbackTransform) {
    const style = window.getComputedStyle?.(body);
    return { opacity: style?.opacity || String(fallbackOpacity), transform: style?.transform || fallbackTransform };
  }

  function disarmMenu(menu, body) {
    menu.querySelector(':scope > summary')?.setAttribute('aria-expanded', 'false');
    body.setAttribute('aria-hidden', 'true');
    body.inert = true;
    body.style.pointerEvents = 'none';
  }

  function closeMenu(menu, immediate = false) {
    const body = menu.querySelector(':scope > .project-menu-panel');
    if (!body) { menu.open = false; return; }
    if (disclosureGoals.get(menu) === false && !immediate && !reduced()) return;
    const before = menuPresentation(body, 1, 'translateY(0)');
    dismiss(menu, false);
    disclosureGoals.set(menu, false);
    disarmMenu(menu, body);
    const finish = () => {
      menu.open = false;
      disclosureGoals.delete(menu);
      body.style.pointerEvents = '';
      // A closed native details body is hidden. Reopening re-enables it explicitly.
    };
    if (immediate || reduced() || !menu.isConnected) { finish(); return; }
    effect(body, [before, { opacity: 0, transform: 'translateY(-4px)' }], {
      duration: 100, channel: 'menu', settle: finish
    });
  }

  function toggleMenu(menu) {
    const opening = disclosureGoals.has(menu) ? !disclosureGoals.get(menu) : !menu.open;
    const body = menu.querySelector(':scope > .project-menu-panel');
    if (!body) { menu.open = opening; return; }
    if (!opening) { closeMenu(menu); return; }
    const before = menu.open ? menuPresentation(body, 0, 'translateY(-4px)') : { opacity: 0, transform: 'translateY(-4px)' };
    dismiss(menu, false);
    disclosureGoals.delete(menu);
    menu.open = true;
    body.style.pointerEvents = '';
    body.inert = false;
    body.setAttribute('aria-hidden', 'false');
    menu.querySelector(':scope > summary')?.setAttribute('aria-expanded', 'true');
    effect(body, [before, { opacity: 1, transform: 'translateY(0)' }], { duration: 160, channel: 'menu' });
  }

  function toggleEditorDetails(details) {
    const summary = details.querySelector(':scope > summary');
    if (!summary) return;
    const opening = disclosureGoals.has(details) ? !disclosureGoals.get(details) : !details.open;
    const currentHeight = details.getBoundingClientRect().height;
    dismiss(details, false);
    disclosureGoals.set(details, opening);
    const oldOverflow = details.style.overflow;
    let targetHeight;
    if (opening) {
      details.open = true;
      targetHeight = details.getBoundingClientRect().height;
    } else {
      details.open = false;
      targetHeight = details.getBoundingClientRect().height;
      details.open = true;
    }
    summary.setAttribute('aria-expanded', String(opening));
    const finish = () => {
      details.open = opening;
      disclosureGoals.delete(details);
      details.style.overflow = oldOverflow;
    };
    if (reduced()) { finish(); return; }
    details.style.overflow = 'hidden';
    effect(details, [{ height: currentHeight + 'px' }, { height: targetHeight + 'px' }], {
      duration: opening ? 200 : 160, easing: ease,
      cleanup: () => { details.style.overflow = oldOverflow; },
      settle: finish
    });
    for (const child of details.children) {
      if (child === summary) continue;
      effect(child, [{ opacity: opening ? 0 : 1 }, { opacity: opening ? 1 : 0 }], { duration: opening ? 200 : 160 });
    }
  }

  // Animate selected surfaces only after a real user action changes their state.
  // Stable keys follow replaced cards across render(), while a fresh page stays quiet.
  function selectionKey(element) {
    const scope = element.closest('[data-flow-stage]')?.getAttribute('data-flow-stage') || 'shell';
    const value = name => element.getAttribute(name) || '';
    if (value('data-stage')) return 'stage:' + value('data-stage');
    if (value('data-hub-view')) return 'hub:' + value('data-hub-view');
    if (value('data-appraisal-key')) return scope + ':appraisal:' + value('data-id') + ':' + value('data-appraisal-key');
    if (value('data-strategy-id')) return scope + ':strategy:' + value('data-strategy-id');
    if (value('data-view')) return 'view:' + value('data-view');
    if (element.id) return scope + ':id:' + element.id;
    if (value('aria-controls')) return scope + ':controls:' + value('aria-controls');
    if (value('data-id')) return scope + ':record:' + value('data-id');
    if (value('data-api-settings-action')) return scope + ':api-control:' + value('data-api-settings-action');
    if (value('data-tab')) return scope + ':tab:' + value('data-tab');
    return null;
  }

  function selected(element) {
    return element.getAttribute('aria-pressed') === 'true' ||
      element.getAttribute('aria-selected') === 'true' ||
      element.classList.contains('active') || element.classList.contains('selected');
  }

  function selectionSnapshot() {
    const snapshot = new Map();
    for (const element of document.querySelectorAll(selectionSelector)) {
      const key = selectionKey(element);
      if (key) snapshot.set(key, selected(element));
    }
    return snapshot;
  }

  function clearSelection(element) {
    const timer = selectionTimers.get(element);
    if (timer !== undefined) clearTimeout(timer);
    selectionTimers.delete(element);
    element.classList.remove('is-selection-feedback');
  }

  function selection(element) {
    if (!element || !element.isConnected || element.disabled ||
        element.getAttribute('aria-disabled') === 'true' ||
        element.matches('input, .event-return-control, .appraisal-card-static')) return;
    clearSelection(element);
    if (reduced()) return;
    void element.offsetWidth;
    element.classList.add('is-selection-feedback');
    selectionTimers.set(element, setTimeout(() => clearSelection(element), 260));
  }

  function finishSelectionIntent() {
    const intent = selectionIntent;
    if (!intent || reduced()) return;
    for (const element of document.querySelectorAll(selectionSelector)) {
      const key = selectionKey(element);
      if (!selected(element)) { if (selectionTimers.has(element)) clearSelection(element); continue; }
      if (!key || intent.played.has(key)) continue;
      if (intent.before.has(key) && intent.before.get(key) !== true) {
        intent.played.add(key);
        selection(element);
      }
    }
  }

  function beginSelectionIntent(event) {
    if (!event.isTrusted || reduced()) return;
    const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement;
    const control = target?.closest('button, input[data-selection], [role="tab"], .record-button, .select-option');
    if (!control || control.disabled || control.getAttribute('aria-disabled') === 'true' ||
        control.matches('.event-return-control, .appraisal-card-static')) return;
    if (event.type === 'keydown' && !['Enter', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    if (intentTimer !== null) clearTimeout(intentTimer);
    selectionIntent = { before: selectionSnapshot(), played: new Set() };
    intentTimer = setTimeout(() => {
      finishSelectionIntent();
      selectionIntent = null; intentTimer = null;
    }, 0);
  }

  function statusChanged(element, initial = false) {
    if (!element || !element.matches || !element.matches('#toast, .api-settings-status, #upload-status, #project-delete-status, #save-status, [role="alert"]')) return;
    const value = element.textContent.trim();
    const before = statusValues.get(element);
    statusValues.set(element, value);
    if (element.hidden || !value) { dismiss(element, false); return; }
    if (!initial && before !== value) effect(element, [{ opacity: 0.5 }, { opacity: 1 }], { duration: element.matches('[role="alert"], [data-state="error"]') ? 120 : 160 });
  }

  function scan(node, initial = false) {
    if (!node || node.nodeType !== 1) return;
    if (node.matches('dialog')) animateDialog(node);
    node.querySelectorAll('dialog').forEach(animateDialog);
    statusChanged(node, initial);
    node.querySelectorAll('#toast, .api-settings-status, #upload-status, #project-delete-status, #save-status, [role="alert"]').forEach(element => statusChanged(element, true));
  }

  const observer = new MutationObserver(records => {
    const dialogs = new Set(), statuses = new Set();
    for (const record of records) {
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      if (!target) continue;
      if (target.matches('dialog')) dialogs.add(target);
      const status = target.closest('#toast, .api-settings-status, #upload-status, #project-delete-status, #save-status, [role="alert"]');
      if (status) statuses.add(status);
      for (const node of record.addedNodes || []) scan(node, true);
    }
    dialogs.forEach(animateDialog);
    finishSelectionIntent();
    for (const element of [...selectionTimers.keys()]) if (!element.isConnected) clearSelection(element);
    statuses.forEach(element => statusChanged(element));
    for (const record of [...active]) if (!record.element.isConnected) stopRecord(record, false);
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['open', 'hidden', 'data-state', 'aria-pressed', 'aria-selected', 'class'] });
  scan(document.body, true);

  document.addEventListener('click', event => {
    const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement;
    if (!target) return;
    document.querySelectorAll('details.project-menu[open]').forEach(menu => {
      if (!menu.contains(target)) closeMenu(menu);
    });
    const option = target.closest('.project-menu-panel button');
    if (option && !option.disabled && option.getAttribute('aria-disabled') !== 'true') {
      const menu = option.closest('details.project-menu');
      if (menu) closeMenu(menu);
    }
    const summary = target.closest('summary');
    const details = summary?.parentElement;
    if (!details || !details.matches('details.project-menu, details.appraisal-edit')) return;
    event.preventDefault();
    if (details.matches('.project-menu')) toggleMenu(details);
    else toggleEditorDetails(details);
  }, true);

  function keyControl(event) {
    const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement;
    const control = target?.closest('button, summary, [role="button"]');
    return control && !control.disabled && control.getAttribute('aria-disabled') !== 'true' ? control : null;
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const menus = [...document.querySelectorAll('details.project-menu[open]')];
      for (const menu of menus) closeMenu(menu);
      menus.at(-1)?.querySelector(':scope > summary')?.focus({ preventScroll: true });
      return;
    }
    if (!['Enter', ' '].includes(event.key) || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    const control = keyControl(event);
    if (control) { control.classList.add('is-motion-pressed'); pressed.add(control); }
  }, true);
  const releasePressed = () => {
    for (const control of pressed) control.classList.remove('is-motion-pressed');
    pressed.clear();
  };
  document.addEventListener('keyup', releasePressed, true);
  document.addEventListener('pointerup', releasePressed, true);
  document.addEventListener('pointercancel', releasePressed, true);
  window.addEventListener('blur', releasePressed);
  const preferenceChanged = () => { if (reduced()) cancelAll(); };
  if (media?.addEventListener) media.addEventListener('change', preferenceChanged);
  else if (media?.addListener) media.addListener(preferenceChanged);

  document.addEventListener('click', beginSelectionIntent, true);
  document.addEventListener('change', beginSelectionIntent, true);
  document.addEventListener('keydown', beginSelectionIntent, true);
  document.addEventListener('animationend', event => {
    if (event.animationName === 'selection-sweep' && selectionTimers.has(event.target)) clearSelection(event.target);
  }, true);
  window.PrototypeMotion = Object.freeze({ effect, selection, revealCard, revealDialogContent, dismiss, cancelAll, isReduced: reduced });
})();
