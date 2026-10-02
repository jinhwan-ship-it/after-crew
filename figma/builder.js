// M5 · use_figma 안에서 도는 화면 빌더 (figma/make-call.js가 JSON과 합쳐 호출 코드를 만든다)
// 입력: J(qa/figma-export.js 출력), POS(페이지 위 위치), PARENT(섹션 id)
const page = await figma.getNodeByIdAsync('50:571');
await figma.setCurrentPageAsync(page);
const VID = { primary: '3:3', accent: '3:4', white: '3:5', muted: '3:6', ondark: '3:7', bg: '3:8', line: '3:9', 'accent-soft': '51:571', error: '51:572', 'act-walk': '51:573', 'act-jog': '51:574', 'act-run': '51:575', 'act-bike': '51:576', 'map-water': '51:577', 'map-park': '51:578' };
const VV = {};
await Promise.all(Object.entries(VID).map(async ([k, id]) => { VV[k] = await figma.variables.getVariableByIdAsync('VariableID:' + id); }));
const CSSV = { text: 'primary', 'text-muted': 'muted', surface: 'white', bg: 'bg', border: 'line', accent: 'accent', 'accent-soft': 'accent-soft', 'text-on-dark-muted': 'ondark', error: 'error', 'act-walk': 'act-walk', 'act-jog': 'act-jog', 'act-run': 'act-run', 'act-bike': 'act-bike', 'map-water': 'map-water', 'map-park': 'map-park' };
const HEXV = { '1E3A4C': 'primary', FFB547: 'accent', FFFFFF: 'white', '5B6F7C': 'muted', B7C3CB: 'ondark', F2F4F5: 'bg', D5DBDF: 'line', FFF1D6: 'accent-soft', B3261E: 'error', '2E7D66': 'act-walk', '2E6AAE': 'act-jog', C2452B: 'act-run', D3DEE6: 'map-water', E0E8DE: 'map-park' };
const SID = { icon: '52:644', pi: '52:718', toggle: '52:724', chip: '52:738', badge: '52:756', status: '52:778', tab: '53:635', map: '53:586', btn: '5:39' };
const SN = {};
await Promise.all(Object.entries(SID).map(async ([k, id]) => { SN[k] = await figma.getNodeByIdAsync(id); }));
const variant = (set, name) => set.children.find(c => c.name === name);
const S = J.S;
const FAM = f => f === 'A' ? 'Archivo' : 'Noto Sans KR';
const WT = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };
const fontOf = st => ({ family: FAM(st[0]), style: WT[st[1]] || 'Regular' });
await Promise.all([...new Set(S.map(st => JSON.stringify(fontOf(st))).concat(['{"family":"Noto Sans KR","style":"Bold"}', '{"family":"Noto Sans KR","style":"Medium"}', '{"family":"Archivo","style":"Bold"}']))].map(k => figma.loadFontAsync(JSON.parse(k))));
// 텍스트 스타일 (DESIGN 2칸 역할 · family, weight, size, lh px, ls %)
const TSM = [['K', 700, 28, 37.8, -1.5, 'b093d5a0bca53afaa59df9b8b3a4cb343d36a07e'], ['K', 700, 22, 30.8, -1, '727eee9ae411f3d56db38c84f1934489d0b93ce7'], ['K', 700, 18, 25.2, -1, '393ee5df3ae2dcccb7c739434fa3530ab82f21c1'], ['K', 400, 16, 25.6, -0.5, '5da415a4c17142f525e5cb554e1ab605bc9bf4a9'], ['K', 700, 16, 24, -0.5, '1cad1fe278fe1b1e7dcaa2a2701a3395df94bc6d'], ['K', 700, 16, 22.4, -0.5, 'b045e219db0a3bb583d47aef9dd891841539f71f'], ['K', 500, 14, 21, 0, '2fa798b324f34610d00b7a26970c3b6ab255ac6b'], ['K', 500, 12, 16.8, 0, '627c4333f77db6886f93c833d7ef9d52dea83968'], ['A', 700, 36, 39.6, -2, '1d88312d0e74005135a7a21614040f5c5d362494'], ['A', 500, 14, 19.6, 0, 'd31350f9f24478f52e6974d2b8a940c5dc9ec6df'], ['A', 700, 14, 19.6, 0, '54674092a4e53eaebd3318198df2c2e055556126']];
const tsOf = st => { const m = TSM.find(x => x[0] === st[0] && x[1] === st[1] && x[2] === st[2] && Math.abs(x[3] - st[3]) < 0.7 && Math.abs(x[4] - st[4]) < 0.7); return m ? 'S:' + m[5] + ',' : null; };
const rgbOf = h => ({ r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 });
const hexOf = c => [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const paint = c => {
  let v = null, rgb = { r: 0, g: 0, b: 0 }, a = 1;
  if (c.startsWith('v:')) v = CSSV[c.slice(2)];
  else { const [h, al] = c.split('@'); rgb = rgbOf(h); a = al === undefined ? 1 : +al; v = HEXV[h]; }
  const base = { type: 'SOLID', color: rgb, opacity: a };
  // 투명도가 있는 색은 변수에 묶지 않는다 (변수 바인딩이 paint opacity를 1로 되돌림) · 스크림·지도 라벨 바탕 등 파생값
  return v && a >= 1 ? figma.variables.setBoundVariableForPaint(base, 'color', VV[v]) : base;
};
const rebind = (node, hv) => {
  ['fills', 'strokes'].forEach((prop, i) => {
    if (!(prop in node) || !Array.isArray(node[prop]) || !node[prop].length) return;
    node[prop] = node[prop].map(p => {
      if (p.type !== 'SOLID') return p;
      const v = hv && hv[i] ? CSSV[hv[i]] : HEXV[hexOf(p.color)];
      return v ? figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: p.color, opacity: p.opacity === undefined ? 1 : p.opacity }, 'color', VV[v]) : p;
    });
  });
};
const setProp = (inst, name, val) => { const key = Object.keys(inst.componentProperties).find(k => k.split('#')[0] === name); if (key) inst.setProperties({ [key]: val }); };
const off = [];
const ALN = { MIN: 'MIN', C: 'CENTER', MAX: 'MAX', SB: 'SPACE_BETWEEN', BL: 'BASELINE' };

function mkFrame(n) {
  const f = figma.createFrame();
  f.name = n.n || 'frame';
  f.fills = n.fill ? [paint(n.fill)] : [];
  if (n.grad) {
    const st = n.grad.stops.map(([c, p]) => { const [h, a] = c.split('@'); const g = rgbOf(h); return { color: { r: g.r, g: g.g, b: g.b, a: a === undefined ? 1 : +a }, position: n.grad.dir === 'up' ? 1 - p : p }; }).sort((a, b) => a.position - b.position);
    f.fills = [{ type: 'GRADIENT_LINEAR', gradientTransform: [[0, 1, 0], [-1, 0, 1]], gradientStops: st }];
  }
  if (n.st) {
    f.strokes = [paint(n.st)]; f.strokeAlign = 'INSIDE';
    if (Array.isArray(n.sw)) { f.strokeTopWeight = n.sw[0]; f.strokeRightWeight = n.sw[1]; f.strokeBottomWeight = n.sw[2]; f.strokeLeftWeight = n.sw[3]; } else f.strokeWeight = n.sw;
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
  if (n.scroll) f.overflowDirection = 'VERTICAL';
  /* 범례 점선: 자동 레이아웃이면 선이 y=0에 붙어 반쪽만 보여서 레이아웃을 끈다 */
  if (n.dash) { f.layoutMode = 'NONE'; f.clipsContent = false; const ln = figma.createLine(); ln.name = 'dash'; ln.resize(n.w, 0); ln.strokes = [paint('v:text-muted')]; ln.strokeWeight = n.h; ln.dashPattern = [3, 5]; f.appendChild(ln); ln.x = 0; ln.y = n.h / 2; }
  return f;
}
async function mkText(n) {
  const t = figma.createText();
  const runs = n.r ? n.r.map(([s, i]) => [s, S[i]]) : [[n.v, S[n.f]]];
  const st0 = runs[0][1];
  const sid = runs.length === 1 ? tsOf(st0) : null;
  if (sid) await t.setTextStyleIdAsync(sid);
  else { t.fontName = fontOf(st0); t.fontSize = st0[2]; t.lineHeight = { unit: 'PIXELS', value: st0[3] }; t.letterSpacing = { unit: 'PERCENT', value: st0[4] }; }
  t.characters = runs.map(r => r[0]).join('');
  if (runs.length > 1) {
    let i = 0;
    for (const [s, st] of runs) {
      const j = i + s.length;
      if (j > i) {
        const rs = tsOf(st);
        if (rs) await t.setRangeTextStyleIdAsync(i, j, rs);
        else { t.setRangeFontName(i, j, fontOf(st)); t.setRangeFontSize(i, j, st[2]); t.setRangeLineHeight(i, j, { unit: 'PIXELS', value: st[3] }); t.setRangeLetterSpacing(i, j, { unit: 'PERCENT', value: st[4] }); }
        t.setRangeFills(i, j, [paint(st[5])]);
        if (st[6] === 'u') t.setRangeTextDecoration(i, j, 'UNDERLINE');
      }
      i = j;
    }
  } else { t.fills = [paint(st0[5])]; if (st0[6] === 'u') t.textDecoration = 'UNDERLINE'; }
  t.textAlignHorizontal = { L: 'LEFT', C: 'CENTER', R: 'RIGHT' }[n.al || 'L'];
  if (n.tw === 'F' || n.tw === 'X') { t.textAutoResize = 'HEIGHT'; t.resize(Math.max(n.w, 1), Math.max(n.h, 1)); t.textAutoResize = 'HEIGHT'; }
  else t.textAutoResize = 'WIDTH_AND_HEIGHT';
  if (n.tr) { t.textTruncation = 'ENDING'; t.maxLines = 1; }
  return t;
}
function mkSvg(n) {
  const f = figma.createNodeFromSvg(n.svg);
  f.name = n.n || 'svg'; f.fills = [];
  const sc = n.w / n.vb[0];
  if (Math.abs(sc - 1) > 0.01) f.rescale(sc);
  const shapes = f.findAll(x => x.type !== 'FRAME' && x.type !== 'GROUP' && ('fills' in x));
  shapes.forEach((s, i) => rebind(s, n.vars && n.vars[i]));
  return f;
}
function mkIcon(n) {
  const c = variant(SN.icon, 'Name=' + n.v.i) || variant(SN.icon, 'Name=alert');
  const inst = c.createInstance(); inst.name = n.n;
  if (Math.abs(n.w - 24) > 0.5) inst.rescale(n.w / 24);
  if (n.v.rot) inst.rotation = n.v.rot;   // 선택창 chevron = fwd를 -90° 돌려 씀
  const p = paint(n.v.c || '1E3A4C');
  for (const v of inst.findAll(x => 'strokes' in x && x.strokes.length)) v.strokes = [p];
  return inst;
}
function mkInst(n) {
  const v = n.v; let inst;
  if (n.c === 'status') inst = variant(SN.status, 'Theme=' + (v.d ? 'Dark' : 'Light')).createInstance();
  else if (n.c === 'tab') {
    inst = (variant(SN.tab, 'Current=' + v.cur) || SN.tab.children[0]).createInstance();
    /* v1.4 채팅 탭 안 읽은 수 배지 (컴포넌트 기본 숨김) */
    if (v.cnt) { figma.skipInvisibleInstanceChildren = false; const cb = inst.findOne(x => x.name === 'count'); const ct = inst.findOne(x => x.name === 'count-label'); if (cb && ct) { cb.visible = true; ct.characters = v.cnt; } }
  }
  else if (n.c === 'btn') {
    inst = variant(SN.btn, `Style=${v.st}, Size=${v.sz}`).createInstance();
    setProp(inst, 'Label', v.l);
    if (v.st === 'Accent') { inst.paddingTop = inst.paddingBottom = 14; inst.paddingLeft = inst.paddingRight = 24; }
    if (v.dis) inst.opacity = 0.4;
    // 코드 .btn.outline은 border-box 44px · 1.5px 선이 높이를 늘리지 않는다
    if (v.st === 'Outline Light') inst.strokesIncludedInLayout = false;
    if (v.st === 'Outline Light' && v.c && v.c !== 'FFFFFF') { inst.strokes = [paint(v.c)]; for (const x of inst.findAll(y => y.type === 'TEXT')) x.fills = [paint(v.c)]; }
  } else if (n.c === 'chip') {
    inst = variant(SN.chip, `State=${v.on ? 'Selected' : 'Default'}, Size=${v.sz}`).createInstance();
    setProp(inst, 'Label', v.l); setProp(inst, 'Dot', !!v.dot);
    if (v.dot) { const d = inst.findOne(x => x.name === 'dot'); if (d) d.fills = [paint('v:' + v.dot)]; }
    const dp = v.sz === 'M' ? 16 : 12;
    if (v.pl && Math.abs(v.pl - dp) > 0.5) { inst.paddingLeft = v.pl; inst.paddingRight = v.pl; }
  } else if (n.c === 'badge') { inst = variant(SN.badge, `Style=${v.st}, Size=${v.sz}`).createInstance(); setProp(inst, 'Label', v.l); }
  else if (n.c === 'toggle') inst = variant(SN.toggle, 'On=' + (v.on ? 'true' : 'false')).createInstance();
  else if (n.c === 'pi') { inst = variant(SN.pi, 'Shape=' + (v.i || 1)).createInstance(); if (Math.abs(v.s - 40) > 0.5) inst.rescale(v.s / 40); }
  inst.name = n.n || inst.name;
  return inst;
}
function mkMap(n) {
  const h = figma.createFrame(); h.name = n.n || 'map-view'; h.resize(n.w, n.h); h.fills = []; h.clipsContent = true;
  const inst = variant(SN.map, 'Theme=' + (n.d ? 'Dark' : 'Light')).createInstance();
  h.appendChild(inst); inst.resize(n.b[2], n.b[3]); inst.x = n.b[0]; inst.y = n.b[1];
  let body = '';
  for (const [pts, sw] of n.rt) body += `<polyline points="${pts}" fill="none" stroke="#1E3A4C" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  for (const [x, y, r] of n.dt) body += `<circle cx="${x}" cy="${y}" r="${r}" fill="#1E3A4C"/>`;
  if (body) {
    const g = figma.createNodeFromSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${n.w}" height="${n.h}" viewBox="0 0 ${n.w} ${n.h}">${body}</svg>`);
    g.name = 'courses'; g.fills = []; g.clipsContent = false; h.appendChild(g); g.x = 0; g.y = 0;
    const vs = g.findAll(x => x.type === 'VECTOR' || x.type === 'ELLIPSE');
    n.rt.forEach(([, , c, todo], i) => { const s = vs[i]; if (!s) return; s.name = todo ? 'course · 미완주' : 'course · ' + c; s.strokes = [paint('v:' + c)]; if (todo) s.dashPattern = [0.1, 9]; });
    n.dt.forEach(([, , , c], i) => { const s = vs[n.rt.length + i]; if (!s) return; s.name = 'course dot'; s.fills = [paint('v:' + c)]; });
  }
  return h;
}
function mkSpacer(n) { const f = figma.createFrame(); f.name = n.n || 'space'; f.fills = []; f.resize(n.d === 'V' ? 1 : n.v, n.d === 'V' ? n.v : 1); return f; }
function tryHug(node, ax, target) {
  const prop = ax === 'h' ? 'layoutSizingHorizontal' : 'layoutSizingVertical';
  node[prop] = 'HUG';
  const got = ax === 'h' ? node.width : node.height;
  if (Math.abs(got - target) > 1.5) { node[prop] = 'FIXED'; if (ax === 'h') node.resize(target, node.height); else node.resize(node.width, target); }
}
let count = 0;
const built = [];
async function B(n, parent) {
  let node;
  if (n.t === 'F') node = mkFrame(n);
  else if (n.t === 'T') node = await mkText(n);
  else if (n.t === 'S') node = mkSvg(n);
  else if (n.t === 'IC') node = mkIcon(n);
  else if (n.t === 'I') node = mkInst(n);
  else if (n.t === 'MP') node = mkMap(n);
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
  } else if (n.fill) node.layoutGrow = 1;   /* 빈 .grow (상단 바 동네 선택과 아이콘 사이) */
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
return { id: root.id, name: root.name, nodes: count, replacedOld: old ? old.id : null, off: off.slice(0, 25) };
