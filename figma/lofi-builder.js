// Lo-fi · 회색 블록 와이어프레임 빌더 (use_figma 안에서 실행, figma/make-lofi.js가 함수로 감싸 페이지 plugin data에 저장)
// 입력: J(figma/lofi/<id>.json), POS(위치), PARENT(섹션 id), PAGE(로우 피델리티 페이지 id)
// hi-fi builder.js와 같은 자동 레이아웃 규칙. 다른 점: 변수·텍스트 스타일·컴포넌트 없음, 글꼴 Noto Sans KR 1종, X 박스·원 아이콘
const page = await figma.getNodeByIdAsync(PAGE);
await figma.setCurrentPageAsync(page);
const S = J.S;
const WT = { 400: 'Regular', 500: 'Medium', 600: 'Bold', 700: 'Bold' };
const fontOf = st => ({ family: 'Noto Sans KR', style: WT[st[1]] || 'Regular' });
await Promise.all(['Regular', 'Medium', 'Bold'].map(style => figma.loadFontAsync({ family: 'Noto Sans KR', style })));
const rgbOf = h => ({ r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 });
const paint = c => { const [h, a] = c.split('@'); return { type: 'SOLID', color: rgbOf(h), opacity: a === undefined ? 1 : +a }; };
const ALN = { MIN: 'MIN', C: 'CENTER', MAX: 'MAX', SB: 'SPACE_BETWEEN', BL: 'BASELINE' };
const off = [];

function mkFrame(n) {
  const f = figma.createFrame();
  f.name = n.n || 'frame';
  f.fills = n.fill ? [paint(n.fill)] : [];
  if (n.st) {
    f.strokes = [paint(n.st)]; f.strokeAlign = 'INSIDE';
    if (Array.isArray(n.sw)) { f.strokeTopWeight = n.sw[0]; f.strokeRightWeight = n.sw[1]; f.strokeBottomWeight = n.sw[2]; f.strokeLeftWeight = n.sw[3]; } else f.strokeWeight = n.sw || 1;
  }
  if (n.r) { if (Array.isArray(n.r)) { f.topLeftRadius = n.r[0]; f.topRightRadius = n.r[1]; f.bottomRightRadius = n.r[2]; f.bottomLeftRadius = n.r[3]; } else f.cornerRadius = n.r; }
  f.clipsContent = !!n.clip;
  if (n.op) f.opacity = n.op;
  f.resize(Math.max(n.w, 0.01), Math.max(n.h, 0.01));
  if (n.L && n.L !== 'N') {
    f.layoutMode = n.L === 'V' ? 'VERTICAL' : 'HORIZONTAL';
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    const p = n.p || [0, 0, 0, 0];
    f.paddingTop = p[0]; f.paddingRight = p[1]; f.paddingBottom = p[2]; f.paddingLeft = p[3];
    f.itemSpacing = n.g || 0;
    if (n.wr !== undefined) { f.layoutWrap = 'WRAP'; f.counterAxisSpacing = n.wr; }
    f.primaryAxisAlignItems = ALN[n.ja || 'MIN'];
    f.counterAxisAlignItems = ALN[n.ia || 'MIN'];
    f.resize(Math.max(n.w, 0.01), Math.max(n.h, 0.01));
  }
  if (n.dash) { f.layoutMode = 'NONE'; f.clipsContent = false; const ln = figma.createLine(); ln.name = 'dash'; ln.resize(n.w, 0); ln.strokes = [paint('737373')]; ln.strokeWeight = n.h; ln.dashPattern = [3, 5]; f.appendChild(ln); ln.x = 0; ln.y = n.h / 2; }
  return f;
}
function mkText(n) {
  const t = figma.createText();
  const runs = n.r ? n.r.map(([s, i]) => [s, S[i]]) : [[n.v, S[n.f]]];
  const st0 = runs[0][1];
  t.fontName = fontOf(st0); t.fontSize = st0[2]; t.lineHeight = { unit: 'PIXELS', value: st0[3] }; t.letterSpacing = { unit: 'PERCENT', value: st0[4] };
  t.characters = runs.map(r => r[0]).join('');
  if (runs.length > 1) {
    let i = 0;
    for (const [s, st] of runs) {
      const j = i + s.length;
      if (j > i) { t.setRangeFontName(i, j, fontOf(st)); t.setRangeFontSize(i, j, st[2]); t.setRangeLineHeight(i, j, { unit: 'PIXELS', value: st[3] }); t.setRangeFills(i, j, [paint(st[5])]); if (st[6] === 'u') t.setRangeTextDecoration(i, j, 'UNDERLINE'); }
      i = j;
    }
  } else { t.fills = [paint(st0[5])]; if (st0[6] === 'u') t.textDecoration = 'UNDERLINE'; }
  t.textAlignHorizontal = { L: 'LEFT', C: 'CENTER', R: 'RIGHT' }[n.al || 'L'];
  if (n.tw === 'F' || n.tw === 'X') { t.textAutoResize = 'HEIGHT'; t.resize(Math.max(n.w, 1), Math.max(n.h, 1)); t.textAutoResize = 'HEIGHT'; }
  else t.textAutoResize = 'WIDTH_AND_HEIGHT';
  if (n.tr) { t.textTruncation = 'ENDING'; t.maxLines = 1; }
  return t;
}
/* 지도·썸네일·코스 그림 = X 박스 */
function mkX(n) {
  const f = figma.createFrame(); f.name = 'x · ' + (n.n || 'image'); f.resize(Math.max(n.w, 1), Math.max(n.h, 1)); f.clipsContent = true;
  f.fills = [paint(n.dark ? '3A3A3A' : 'EDEDED')]; f.strokes = [paint(n.dark ? '5C5C5C' : 'C8C8C8')]; f.strokeAlign = 'INSIDE'; f.strokeWeight = 1;
  if (n.r) f.cornerRadius = n.r;
  const v = figma.createVector(); v.name = 'x';
  v.vectorPaths = [{ windingRule: 'NONE', data: `M 0 0 L ${n.w} ${n.h} M ${n.w} 0 L 0 ${n.h}` }];
  v.strokes = [paint(n.dark ? '5C5C5C' : 'C8C8C8')]; v.strokeWeight = 1; v.fills = [];
  f.appendChild(v); v.x = 0; v.y = 0;
  if (n.lab) {
    const t = figma.createText(); t.fontName = { family: 'Noto Sans KR', style: 'Medium' }; t.fontSize = 14; t.characters = n.lab; t.fills = [paint(n.dark ? 'BDBDBD' : '737373')];
    const pad = figma.createFrame(); pad.name = 'label'; pad.layoutMode = 'HORIZONTAL'; pad.primaryAxisSizingMode = 'AUTO'; pad.counterAxisSizingMode = 'AUTO';
    pad.paddingLeft = pad.paddingRight = 8; pad.paddingTop = pad.paddingBottom = 2; pad.cornerRadius = 4; pad.fills = [paint(n.dark ? '3A3A3A' : 'EDEDED')];
    pad.appendChild(t); f.appendChild(pad); pad.x = Math.round((n.w - pad.width) / 2); pad.y = Math.round((n.h - pad.height) / 2);
  }
  return f;
}
/* 아이콘 = 원 */
function mkO(n) {
  const f = figma.createFrame(); f.name = n.n || 'icon'; f.fills = []; f.resize(Math.max(n.w, 1), Math.max(n.h, 1)); f.clipsContent = false;
  const d = Math.max(6, Math.round(Math.min(n.w, n.h) * 0.72));
  const e = figma.createEllipse(); e.name = 'o'; e.resize(d, d); e.fills = []; e.strokes = [paint(n.c || '262626')]; e.strokeWeight = n.w <= 16 ? 1.25 : 1.5;
  f.appendChild(e); e.x = (n.w - d) / 2; e.y = (n.h - d) / 2;
  return f;
}
function mkSpacer(n) { const f = figma.createFrame(); f.name = n.n || 'space'; f.fills = []; f.resize(n.d === 'V' ? 1 : n.v, n.d === 'V' ? n.v : 1); return f; }
function tryHug(node, ax, target) {
  const prop = ax === 'h' ? 'layoutSizingHorizontal' : 'layoutSizingVertical';
  node[prop] = 'HUG';
  const got = ax === 'h' ? node.width : node.height;
  /* 로우 피델리티는 글꼴이 하나라 글자가 코드보다 넓을 수 있다 · 넓어지면 hug 유지, 좁아질 때만 코드 크기로 고정 */
  if (got < target - 1.5) { node[prop] = 'FIXED'; if (ax === 'h') node.resize(target, node.height); else node.resize(node.width, target); }
}
let count = 0;
const built = [];
async function B(n, parent) {
  let node;
  if (n.t === 'F') node = mkFrame(n);
  else if (n.t === 'T') node = mkText(n);
  else if (n.t === 'X') node = mkX(n);
  else if (n.t === 'O') node = mkO(n);
  else node = mkSpacer(n);
  count++;
  parent.appendChild(node);
  const s = n.s || 'HH';
  const al = parent.layoutMode && parent.layoutMode !== 'NONE';
  if (n.abs) { if (al) node.layoutPositioning = 'ABSOLUTE'; node.x = n.x; node.y = n.y; }
  else if (!al) { node.x = n.x || 0; node.y = n.y || 0; }
  else if (n.t !== 'SP') {
    if (s[0] === 'F') node.layoutSizingHorizontal = 'FILL';
    if (s[1] === 'F' && n.t !== 'T') node.layoutSizingVertical = 'FILL';
  } else if (n.fill) node.layoutGrow = 1;
  if (n.t === 'F' && n.k) for (const k of n.k) await B(k, node);
  if (n.t === 'F' && node.layoutMode !== 'NONE' && parent.type !== 'PAGE' && parent.type !== 'SECTION') {
    const kf = i => (n.k || []).some(k => !k.abs && k.t !== 'SP' && (k.s || 'HH')[i] === 'F');
    if (s[0] === 'H' && !kf(0)) tryHug(node, 'h', n.w);
    if (s[1] === 'H' && !kf(1)) tryHug(node, 'v', n.h);
  }
  if (n.t === 'F' || n.t === 'T') built.push([node, n]);
  return node;
}
const host = PARENT ? await figma.getNodeByIdAsync(PARENT) : page;
const old = host.children.find(c => c.name === J.n);
const root = await B(Object.assign({}, J, { abs: 0, s: 'XX' }), host);
root.name = J.n; root.x = POS[0]; root.y = POS[1]; root.clipsContent = true;
if (old) { root.x = old.x; root.y = old.y; old.remove(); }
for (const [node, n] of built) if (!n.abs && (Math.abs(node.width - n.w) > 2 || Math.abs(node.height - n.h) > 2)) off.push(`${n.n || (n.v || '').slice(0, 12)} ${Math.round(node.width)}x${Math.round(node.height)} (코드 ${Math.round(n.w)}x${Math.round(n.h)})`);
return { id: root.id, name: root.name, nodes: count, replacedOld: old ? old.id : null, off: off.slice(0, 12) };
