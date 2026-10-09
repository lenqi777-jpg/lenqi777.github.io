'use strict';
const svgNS = 'http://www.w3.org/2000/svg';
const graphSvg = document.querySelector('#workflow-svg');
const viewport = document.querySelector('#graph-viewport');
const inspector = document.querySelector('#node-details');
const nodeSelector = document.querySelector('#node-selector');
const graphState = document.querySelector('#graph-state');
const caseError = document.querySelector('#case-error');
let workflowsPromise, researchPromise;
let workflowData = [], researchData = [];
let currentWorkflow = null, currentArtifact = null, graphGroup = null;
let layoutNodes = new Map(), nodeGroups = new Map(), edgeGroups = [];
let graphBounds = { width: 1, height: 1 };
let graphView = { x: 0, y: 0, scale: 1 };
let drag = null, ignoreClick = false;

function element(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function svgElement(tag, attributes = {}, text) {
  const el = document.createElementNS(svgNS, tag);
  for (const [key, value] of Object.entries(attributes)) el.setAttribute(key, String(value));
  if (text !== undefined) el.textContent = text;
  return el;
}
async function readJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.json();
}
function showError(message) {
  caseError.textContent = message;
  caseError.hidden = false;
}
async function showCase() {
  const requested = location.hash.slice(1);
  const selected = ['workflows', 'prototype', 'research'].includes(requested) ? requested : 'workflows';
  caseError.hidden = true;
  for (const section of document.querySelectorAll('.case-section')) section.hidden = section.id !== selected;
  for (const link of document.querySelectorAll('[data-case]')) {
    if (link.dataset.case === selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (selected !== 'research') document.querySelector('#research-video').pause();
  try {
    if (selected === 'workflows') {
      workflowsPromise ??= readJSON('./materials/workflows/workflows.json');
      workflowData = (await workflowsPromise).workflows;
      if (!currentWorkflow) renderWorkflow(0);
      else fitGraph();
    } else if (selected === 'research') {
      researchPromise ??= readJSON('./materials/robam/cases.json');
      researchData = (await researchPromise).cases;
      if (!currentArtifact) renderArtifact(0);
    } else {
      const frame = document.querySelector('#prototype-frame');
      if (!frame.hasAttribute('src')) frame.src = frame.dataset.src;
    }
  } catch (error) {
    if (selected === 'workflows') { graphState.textContent = '暂时无法读取工作流'; graphState.hidden = false; }
    showError('项目素材暂时无法读取。请使用作品集的本地预览服务打开此页面，再刷新重试。');
  }
}
for (const link of document.querySelectorAll('[data-case]')) {
  link.addEventListener('click', event => {
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    showCase();
    window.scrollTo({ top: 0, behavior: 'auto' });
  });
}
window.addEventListener('hashchange', showCase);
window.addEventListener('popstate', showCase);

function typeColor(type) {
  const colors = { IMAGE: '#398e89', MASK: '#398e89', MODEL: '#7e6cc4', CLIP: '#7e6cc4', VAE: '#ad7b47', LATENT: '#4b7fc9', CONDITIONING: '#b38648', CONTROL_NET: '#8b69b2' };
  return colors[String(type)] || '#7893b1';
}
function nodeName(node) { return node.title || node.type; }
function abbreviate(text, length = 26) { return String(text).length > length ? String(text).slice(0, length - 1) + '…' : String(text); }

function computeLayout(workflow) {
  const nodes = new Map(workflow.nodes.map(node => [node.id, { ...node, rank: 0 }]));
  const incoming = new Map(workflow.nodes.map(node => [node.id, 0]));
  const outgoing = new Map(workflow.nodes.map(node => [node.id, []]));
  for (const link of workflow.links) {
    if (!nodes.has(link[1]) || !nodes.has(link[3])) throw new Error('Invalid connection');
    incoming.set(link[3], incoming.get(link[3]) + 1);
    outgoing.get(link[1]).push(link[3]);
  }
  const queue = [...incoming].filter(([, count]) => count === 0).map(([id]) => id);
  let traversed = 0;
  for (let index = 0; index < queue.length; index++) {
    const id = queue[index];
    traversed++;
    for (const target of outgoing.get(id)) {
      nodes.get(target).rank = Math.max(nodes.get(target).rank, nodes.get(id).rank + 1);
      incoming.set(target, incoming.get(target) - 1);
      if (incoming.get(target) === 0) queue.push(target);
    }
  }
  if (traversed !== nodes.size) throw new Error('Cyclic workflow cannot be arranged');
  const columns = new Map();
  for (const node of nodes.values()) {
    if (!columns.has(node.rank)) columns.set(node.rank, []);
    columns.get(node.rank).push(node);
  }
  let maxHeight = 0;
  for (const [rank, column] of columns) {
    column.sort((a, b) => (a.pos?.[1] || 0) - (b.pos?.[1] || 0));
    let y = 25;
    for (const node of column) {
      node.x = 25 + rank * 345;
      node.y = y;
      node.width = 255;
      node.height = Math.max(112, 66 + Math.max(node.inputs.length, node.outputs.length) * 24);
      y += node.height + 38;
    }
    maxHeight = Math.max(maxHeight, y);
  }
  return { nodes, width: 305 + Math.max(...columns.keys()) * 345, height: maxHeight };
}

function renderWorkflow(index) {
  const workflow = workflowData[index];
  if (!workflow) return;
  currentWorkflow = workflow;
  for (const button of document.querySelectorAll('[data-workflow]')) button.setAttribute('aria-pressed', String(Number(button.dataset.workflow) === index));
  document.querySelector('#workflow-summary').textContent = workflow.summary;
  document.querySelector('#graph-counts').textContent = `${workflow.nodes.length} 个节点 · ${workflow.links.length} 条连接`;
  const layout = computeLayout(workflow);
  layoutNodes = layout.nodes;
  graphBounds = { width: layout.width, height: layout.height };
  graphSvg.replaceChildren();
  graphSvg.append(svgElement('title', {}, `${workflow.title}，${workflow.nodes.length} 个节点，${workflow.links.length} 条连接`));
  graphGroup = svgElement('g');
  graphSvg.append(graphGroup);
  nodeGroups = new Map();
  edgeGroups = [];
  for (const link of workflow.links) {
    const source = layoutNodes.get(link[1]), target = layoutNodes.get(link[3]);
    const sx = source.x + source.width, sy = source.y + 62 + link[2] * 24;
    const tx = target.x, ty = target.y + 62 + link[4] * 24;
    const bend = Math.max(50, (tx - sx) * .48);
    const path = svgElement('path', { d: `M ${sx} ${sy} C ${sx + bend} ${sy}, ${tx - bend} ${ty}, ${tx} ${ty}`, class: 'graph-edge', stroke: typeColor(link[5]), 'data-link-id': link[0] });
    path.append(svgElement('title', {}, `${nodeName(source)} → ${nodeName(target)} · ${link[5]} · 连接 ${link[0]}`));
    graphGroup.append(path);
    edgeGroups.push({ path, link });
  }
  nodeSelector.replaceChildren(element('option', '查看工作流概览'));
  nodeSelector.firstElementChild.value = '';
  for (const node of layoutNodes.values()) {
    const group = svgElement('g', { transform: `translate(${node.x} ${node.y})`, class: 'graph-node', 'data-node-id': node.id, tabindex: '0', role: 'button', 'aria-label': `节点 ${node.id}，${nodeName(node)}，查看参数`, 'aria-pressed': 'false' });
    group.append(svgElement('title', {}, nodeName(node)));
    group.append(svgElement('rect', { width: node.width, height: node.height, rx: 11, class: 'node-box' }));
    group.append(svgElement('rect', { x: 1, y: 1, width: node.width - 2, height: 38, rx: 10, class: 'node-heading' }));
    group.append(svgElement('text', { x: 13, y: 25, 'font-size': 13, 'font-weight': 600 }, abbreviate(nodeName(node), 29)));
    group.append(svgElement('text', { x: node.width - 12, y: node.height - 12, 'font-size': 11, 'text-anchor': 'end', opacity: '.45' }, `#${node.id}`));
    for (const [ports, direction] of [[node.inputs, 'input'], [node.outputs, 'output']]) {
      ports.forEach((port, slot) => {
        const isInput = direction === 'input', y = 62 + slot * 24;
        group.append(svgElement('circle', { cx: isInput ? 0 : node.width, cy: y, r: 4, fill: typeColor(port.type), stroke: 'white', 'stroke-width': 1 }));
        const text = svgElement('text', { x: isInput ? 13 : node.width - 13, y: y + 4, 'text-anchor': isInput ? 'start' : 'end', 'font-size': 12 }, abbreviate(port.label || port.name, 15));
        text.append(svgElement('title', {}, `${port.name} · ${port.type}`));
        group.append(text);
      });
    }
    group.addEventListener('click', () => { if (!ignoreClick) selectNode(node.id); });
    group.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectNode(node.id); }
    });
    graphGroup.append(group);
    nodeGroups.set(node.id, group);
    const option = element('option', `#${node.id} · ${nodeName(node)}`); option.value = String(node.id); nodeSelector.append(option);
  }
  graphState.hidden = true;
  selectNode(null);
  fitGraph();
}

function appendPortDetails(node, title, ports, direction) {
  if (!ports.length) return;
  inspector.append(element('h3', title));
  const list = element('ul');
  ports.forEach((port, slot) => {
    const relevant = currentWorkflow.links.filter(link => direction === 'input' ? link[3] === node.id && link[4] === slot : link[1] === node.id && link[2] === slot);
    const peers = relevant.map(link => layoutNodes.get(direction === 'input' ? link[1] : link[3])).map(other => `#${other.id} ${nodeName(other)}`);
    list.append(element('li', `${port.name} · ${port.type}${peers.length ? '\n' + (direction === 'input' ? '来自：' : '连接到：') + peers.join('；') : ' · 未连接'}`));
  });
  inspector.append(list);
}
function selectNode(id) {
  const node = id == null ? null : layoutNodes.get(Number(id));
  const linked = new Set();
  if (node) {
    linked.add(node.id);
    for (const link of currentWorkflow.links) if (link[1] === node.id || link[3] === node.id) { linked.add(link[1]); linked.add(link[3]); }
  }
  for (const [nodeId, group] of nodeGroups) {
    group.classList.toggle('selected', node?.id === nodeId);
    group.classList.toggle('dimmed', !!node && !linked.has(nodeId));
    group.setAttribute('aria-pressed', String(node?.id === nodeId));
  }
  for (const { path, link } of edgeGroups) {
    const connected = node && (link[1] === node.id || link[3] === node.id);
    path.classList.toggle('selected', !!connected);
    path.classList.toggle('dimmed', !!node && !connected);
  }
  nodeSelector.value = node ? String(node.id) : '';
  document.querySelector('#focus-node').disabled = !node;
  document.querySelector('#node-kicker').textContent = node ? `NODE #${node.id}` : currentWorkflow.sourceFile;
  document.querySelector('#node-title').textContent = node ? nodeName(node) : currentWorkflow.title;
  inspector.replaceChildren();
  if (!node) {
    inspector.append(element('p', currentWorkflow.summary));
    inspector.append(element('p', '点选节点，查看原文件中的参数，以及它与前后节点的连接。也可以在上方列表中选择节点。'));
    inspector.append(element('h3', '数据流'));
    inspector.append(element('p', '由输入图像、模型和控制条件，经过采样与解码，形成输出图像。完整连接以画布中的连线为准。'));
    return;
  }
  if (node.type !== nodeName(node)) inspector.append(element('p', node.type));
  appendPortDetails(node, '输入', node.inputs, 'input');
  appendPortDetails(node, '输出', node.outputs, 'output');
  if (node.widgets_values.length) {
    inspector.append(element('h3', '原文件参数（按保存顺序）'));
    node.widgets_values.forEach((value, index) => {
      inspector.append(element('p', `参数 ${index + 1}`));
      inspector.append(element('pre', typeof value === 'string' ? value : JSON.stringify(value, null, 2)));
    });
  }
}
nodeSelector.addEventListener('change', () => selectNode(nodeSelector.value === '' ? null : Number(nodeSelector.value)));
document.querySelector('#focus-node').addEventListener('click', () => {
  const node = layoutNodes.get(Number(nodeSelector.value));
  if (!node) return;
  const width = viewport.clientWidth, height = viewport.clientHeight;
  const scale = Math.min(1.45, (width - 40) / node.width, (height - 40) / node.height);
  graphView = { scale, x: width / 2 - (node.x + node.width / 2) * scale, y: height / 2 - (node.y + node.height / 2) * scale };
  updateView();
  viewport.scrollIntoView({ block: 'center', behavior: 'auto' });
  viewport.focus({ preventScroll: true });
});
for (const button of document.querySelectorAll('[data-workflow]')) button.addEventListener('click', () => renderWorkflow(Number(button.dataset.workflow)));

function updateView() {
  if (!graphGroup) return;
  graphGroup.setAttribute('transform', `translate(${graphView.x} ${graphView.y}) scale(${graphView.scale})`);
  document.querySelector('#zoom-label').value = `${Math.round(graphView.scale * 100)}%`;
}
function fitGraph() {
  if (!graphGroup || viewport.clientWidth === 0) return;
  const width = viewport.clientWidth, height = viewport.clientHeight;
  graphSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const scale = Math.max(.04, Math.min(1, (width - 36) / graphBounds.width, (height - 36) / graphBounds.height));
  graphView = { scale, x: (width - graphBounds.width * scale) / 2, y: (height - graphBounds.height * scale) / 2 };
  updateView();
}
function zoomGraph(factor, point = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 }) {
  const scale = Math.max(.04, Math.min(2.5, graphView.scale * factor));
  const ratio = scale / graphView.scale;
  graphView.x = point.x - (point.x - graphView.x) * ratio;
  graphView.y = point.y - (point.y - graphView.y) * ratio;
  graphView.scale = scale;
  updateView();
}
document.querySelector('#zoom-in').addEventListener('click', () => zoomGraph(1.3));
document.querySelector('#zoom-out').addEventListener('click', () => zoomGraph(1 / 1.3));
document.querySelector('#fit-graph').addEventListener('click', fitGraph);
viewport.addEventListener('pointerdown', event => {
  if (event.button !== 0 || !graphGroup) return;
  ignoreClick = false;
  drag = { pointer: event.pointerId, startX: event.clientX, startY: event.clientY, viewX: graphView.x, viewY: graphView.y, nodeId: event.target.closest('[data-node-id]')?.dataset.nodeId };
  viewport.setPointerCapture(event.pointerId);
});
viewport.addEventListener('pointermove', event => {
  if (!drag || drag.pointer !== event.pointerId) return;
  const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
  if (Math.hypot(dx, dy) > 4) { ignoreClick = true; viewport.classList.add('is-dragging'); }
  if (ignoreClick) { graphView.x = drag.viewX + dx; graphView.y = drag.viewY + dy; updateView(); }
});
function endDrag(event) {
  if (event.type === 'pointerup' && drag?.nodeId && !ignoreClick) selectNode(Number(drag.nodeId));
  drag = null;
  viewport.classList.remove('is-dragging');
}
viewport.addEventListener('pointerup', endDrag);
viewport.addEventListener('pointercancel', endDrag);
viewport.addEventListener('lostpointercapture', endDrag);
viewport.addEventListener('wheel', event => {
  if (!graphGroup) return;
  event.preventDefault();
  const bounds = viewport.getBoundingClientRect();
  zoomGraph(Math.exp(-event.deltaY * .0018), { x: event.clientX - bounds.left, y: event.clientY - bounds.top });
}, { passive: false });
viewport.addEventListener('keydown', event => {
  if (event.target !== viewport) return;
  const offsets = { ArrowLeft: [35, 0], ArrowRight: [-35, 0], ArrowUp: [0, 35], ArrowDown: [0, -35] };
  if (offsets[event.key]) { event.preventDefault(); graphView.x += offsets[event.key][0]; graphView.y += offsets[event.key][1]; updateView(); }
  if (event.key === 'Home') { event.preventDefault(); fitGraph(); }
  if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomGraph(1.3); }
  if (event.key === '-') { event.preventDefault(); zoomGraph(1 / 1.3); }
});
new ResizeObserver(() => { if (!drag) fitGraph(); }).observe(viewport);

const stageGuidance = {
  task: '先看任务中的目标用户、目标产品和希望形成的体验。',
  events: '选择一个情感事件，查看生活资料与事件描述，也可以尝试编辑。',
  causes: '核查情感原因与评价依据，体验人工确认与原文回查。',
  patterns: '查看同情感事件的评价关系，理解模式如何从事件中归纳。',
  directions: '查看评价关系如何与目标产品的性质关联，保留尚待核查的转译假设。',
  strategies: '选择具体设计措施，点击原型中的“预览策略方案”，查看六章方案。'
};
for (const button of document.querySelectorAll('[data-stage]')) {
  button.addEventListener('click', () => {
    for (const item of document.querySelectorAll('[data-stage]')) item.setAttribute('aria-pressed', String(item === button));
    document.querySelector('#stage-guidance').textContent = stageGuidance[button.dataset.stage];
    const frame = document.querySelector('#prototype-frame');
    const target = `./demos/emotion/index.html#project/demo/${button.dataset.stage}`;
    if (frame.getAttribute('src') !== target) frame.src = target;
  });
}

function renderArtifact(index) {
  const artifact = researchData[index];
  if (!artifact) return;
  currentArtifact = artifact;
  document.querySelector('.source-excerpts').open = false;
  for (const button of document.querySelectorAll('[data-artifact]')) button.setAttribute('aria-pressed', String(Number(button.dataset.artifact) === index));
  const image = document.querySelector('#artifact-image');
  image.src = `./materials/robam/${encodeURIComponent(artifact.image)}`;
  image.alt = `${artifact.name}，研究 PPT 中的器物资料图片`;
  document.querySelector('#artifact-period').textContent = artifact.periodLabel;
  document.querySelector('#artifact-name').textContent = artifact.name;
  document.querySelector('#artifact-summary').textContent = artifact.summary;
  document.querySelector('#artifact-source').textContent = `研究 PPT 第 ${artifact.sourcePages.join('、')} 页 · 点击图片放大`;
  document.querySelector('#artifact-boundary').textContent = artifact.boundary;
  const details = document.querySelector('#artifact-details'), excerpts = document.querySelector('#artifact-excerpts');
  details.replaceChildren(); excerpts.replaceChildren();
  for (const item of artifact.details) {
    const row = element('div'); row.append(element('dt', item.label), element('dd', item.text)); details.append(row);
    const quote = element('blockquote');
    quote.append(element('p', item.originalExcerpt + (item.additionalExcerpt ? '\n' + item.additionalExcerpt : '')), element('cite', `PPT 第 ${item.page} 页 · ${item.label}`));
    excerpts.append(quote);
  }
}
for (const button of document.querySelectorAll('[data-artifact]')) button.addEventListener('click', () => renderArtifact(Number(button.dataset.artifact)));
const imageDialog = document.querySelector('#image-dialog');
document.querySelector('#enlarge-artifact').addEventListener('click', () => {
  if (!currentArtifact) return;
  document.querySelector('#dialog-image').src = document.querySelector('#artifact-image').src;
  document.querySelector('#dialog-image').alt = currentArtifact.name;
  document.querySelector('#dialog-caption').textContent = `${currentArtifact.name} · 研究 PPT 第 ${currentArtifact.sourcePages.join('、')} 页`;
  imageDialog.showModal();
});
document.querySelector('#close-image').addEventListener('click', () => imageDialog.close());
imageDialog.addEventListener('click', event => { if (event.target === imageDialog) imageDialog.close(); });
document.querySelector('#research-video').addEventListener('error', () => { document.querySelector('.video-feedback').hidden = false; });
window.addEventListener('load', () => window.scrollTo({ top: 0, behavior: 'auto' }), { once: true });
showCase();
