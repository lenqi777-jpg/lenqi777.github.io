/* Workflow view state and return history only: no research data, storage, or network. */
(() => {
  'use strict';
  const DEFAULT_ORDER = ['task', 'events', 'causes', 'patterns', 'directions', 'strategies'];
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const unique = values => [...new Set(values.filter(value => typeof value === 'string' && value))];
  const copy = value => {
    if (Array.isArray(value)) return value.map(copy);
    if (value && Object.getPrototypeOf(value) === Object.prototype) {
      const result = {};
      for (const key of Object.keys(value)) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
        const item = value[key];
        if (item === null || ['string', 'number', 'boolean'].includes(typeof item)) result[key] = item;
        else if (Array.isArray(item) || (item && Object.getPrototypeOf(item) === Object.prototype)) result[key] = copy(item);
      }
      return result;
    }
    return value;
  };
  function rect(value) {
    if (!value) return { left: 0, top: 0, right: 0, bottom: 0 };
    const left = finite(value.left), top = finite(value.top);
    const right = Number.isFinite(Number(value.right)) ? Number(value.right) : left + Math.max(0, finite(value.width));
    const bottom = Number.isFinite(Number(value.bottom)) ? Number(value.bottom) : top + Math.max(0, finite(value.height));
    return { left, top, right: Math.max(left, right), bottom: Math.max(top, bottom) };
  }
  function intersectionArea(viewport, section) {
    const a = rect(viewport), b = rect(section);
    return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
      Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  }
  function visibleAreas(viewport, sections) {
    const areaByStage = new Map();
    for (const section of sections || []) {
      if (!section || !section.stage || section.hidden || section.collapsed) continue;
      const area = intersectionArea(viewport, section.rect);
      // A stage is one continuous section; duplicate measurements must not inflate its share.
      areaByStage.set(section.stage, Math.max(area, areaByStage.get(section.stage) || 0));
    }
    const total = [...areaByStage.values()].reduce((sum, area) => sum + area, 0);
    return [...areaByStage].map(([stage, area]) => ({ stage, area, share: total ? area / total : 0 }));
  }
  function dominantStage(viewport, sections, current, options = {}) {
    const rows = visibleAreas(viewport, sections);
    if (!rows.length) return current;
    const minShare = clamp(finite(options.minShare, .55), .5, 1);
    const margin = clamp(finite(options.margin, .10), 0, 1);
    let candidate = rows[0];
    for (const row of rows) {
      if (row.area > candidate.area || (row.area === candidate.area && row.stage === current)) candidate = row;
    }
    if (candidate.stage === current || candidate.area <= 0) return current;
    const currentShare = rows.find(row => row.stage === current)?.share || 0;
    // Hysteresis avoids flicker at boundaries and retains the current stage when none dominates.
    return candidate.share >= minShare && candidate.share - currentShare >= margin ? candidate.stage : current;
  }
  function pickStage(root, elements, current, options = {}) {
    if (!root || typeof root.getBoundingClientRect !== 'function') return current;
    const outer = rect(root.getBoundingClientRect());
    // clientWidth/clientHeight exclude borders and scrollbars from the reading viewport.
    const left = outer.left + finite(root.clientLeft), top = outer.top + finite(root.clientTop);
    const viewport = {
      left, top,
      right: left + (Number.isFinite(Number(root.clientWidth)) ? Math.max(0, Number(root.clientWidth)) : outer.right - left),
      bottom: top + (Number.isFinite(Number(root.clientHeight)) ? Math.max(0, Number(root.clientHeight)) : outer.bottom - top)
    };
    const sections = Array.from(elements || []).map(element => ({
      stage: element.dataset?.flowStage || element.dataset?.stage,
      rect: element.getBoundingClientRect(),
      hidden: Boolean(element.hidden),
      collapsed: Boolean(element.classList?.contains('is-collapsed') || element.querySelector?.('.stage-body')?.hidden)
    }));
    return dominantStage(viewport, sections, current, options);
  }
  function create(options = {}) {
    const stages = unique(options.order || DEFAULT_ORDER);
    const known = new Set(stages);
    let activeStage = known.has(options.activeStage) ? options.activeStage : stages[0] || null;
    let open = new Set((Array.isArray(options.open) ? options.open : [activeStage]).filter(stage => known.has(stage)));
    let pinned = new Set((options.pinned || []).filter(stage => known.has(stage)));
    for (const stage of pinned) open.add(stage);
    const limit = clamp(Math.trunc(finite(options.maxHistory, 10)), 1, 10);
    const history = [];
    const snapshot = () => ({
      activeStage,
      open: stages.filter(stage => open.has(stage)),
      pinned: stages.filter(stage => pinned.has(stage))
    });
    const entryCopy = entry => ({
      projectId: entry.projectId, stage: entry.stage, records: copy(entry.records),
      offsetX: entry.offsetX, offsetY: entry.offsetY,
      focusId: entry.focusId, focus: copy(entry.focus), workflow: copy(entry.workflow)
    });
    const validEntry = (entry, settings = {}) => {
      if (!entry || !known.has(entry.stage)) return false;
      if (settings.projectId != null && entry.projectId !== String(settings.projectId)) return false;
      if (typeof settings.validate !== 'function') return true;
      try { return Boolean(settings.validate(entryCopy(entry))); } catch (_) { return false; }
    };
    function restore(value) {
      if (!value || typeof value !== 'object') return snapshot();
      activeStage = known.has(value.activeStage) ? value.activeStage : activeStage;
      open = new Set((Array.isArray(value.open) ? value.open : [activeStage]).filter(stage => known.has(stage)));
      pinned = new Set((Array.isArray(value.pinned) ? value.pinned : []).filter(stage => known.has(stage)));
      for (const stage of pinned) open.add(stage);
      return snapshot();
    }
    return Object.freeze({
      activate(stage) {
        if (!known.has(stage)) return null;
        activeStage = stage;
        open = new Set(pinned);
        open.add(stage);
        return snapshot();
      },
      setActive(stage) {
        if (!known.has(stage)) return false;
        activeStage = stage;
        return true;
      },
      toggle(stage) {
        if (!known.has(stage)) return false;
        if (open.has(stage)) { open.delete(stage); pinned.delete(stage); }
        else open.add(stage);
        return open.has(stage);
      },
      pin(stage, value) {
        if (!known.has(stage)) return false;
        const shouldPin = value === undefined ? !pinned.has(stage) : Boolean(value);
        if (shouldPin) { pinned.add(stage); open.add(stage); }
        else pinned.delete(stage);
        return pinned.has(stage);
      },
      isOpen: stage => open.has(stage),
      isPinned: stage => pinned.has(stage),
      snapshot,
      restore,
      capture(input = {}) {
        if (!known.has(input.stage) || input.projectId == null || String(input.projectId) === '') return null;
        const entry = {
          projectId: String(input.projectId), stage: input.stage,
          records: copy(input.records || {}),
          offsetX: Math.max(0, finite(input.offsetX)), offsetY: finite(input.offsetY),
          focusId: typeof input.focusId === 'string' ? input.focusId : null,
          focus: copy(input.focus || null),
          workflow: copy(input.workflow || snapshot())
        };
        history.push(entry);
        if (history.length > limit) history.shift();
        return entryCopy(entry);
      },
      peek(settings = {}) {
        for (let i = history.length - 1; i >= 0; i--) if (validEntry(history[i], settings)) return entryCopy(history[i]);
        return null;
      },
      canBack(settings = {}) { return history.some(entry => validEntry(entry, settings)); },
      back(settings = {}) {
        while (history.length) {
          const entry = history.pop();
          if (validEntry(entry, settings)) return entryCopy(entry);
        }
        return null;
      },
      historyCount: () => history.length,
      discard(predicate) {
        if (typeof predicate !== 'function') return 0;
        let removed = 0;
        for (let i = history.length - 1; i >= 0; i--) {
          if (predicate(entryCopy(history[i]))) { history.splice(i, 1); removed++; }
        }
        return removed;
      },
      clearHistory() { history.length = 0; },
      reset(value = {}) {
        history.length = 0;
        return restore({
          activeStage: value.activeStage || stages[0],
          open: value.open || [value.activeStage || stages[0]],
          pinned: value.pinned || []
        });
      }
    });
  }
  const api = Object.freeze({
    create, intersectionArea, visibleAreas, dominantStage, pickStage,
    defaultOrder: Object.freeze(DEFAULT_ORDER.slice())
  });
  if (typeof window !== 'undefined') window.PrototypeWorkflow = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
