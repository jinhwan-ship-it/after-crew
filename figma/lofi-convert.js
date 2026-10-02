// Lo-fi · hi-fi 내보내기 JSON(figma/export/<id>.json) → 회색 블록 와이어프레임 JSON (figma/lofi/<id>.json)
// 규칙: 색은 회색 6단으로, 지도·썸네일·코스 그림은 X 박스, 아이콘은 원, 컴포넌트(버튼·칩·배지·탭바·상태바·토글·프로필)는 블록으로,
//       글꼴은 Noto Sans KR 1종(숫자 글꼴 Archivo도 Noto로). 문구·크기·자동 레이아웃은 hi-fi와 같다 (구조 검토용).
// 사용: node figma/lofi-convert.js            → 32화면 전부
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, 'export'), OUT = path.join(__dirname, 'lofi');
fs.mkdirSync(OUT, { recursive: true });

const INK = '262626', SUB = '737373', LINE = 'D4D4D4', FILL = 'E5E5E5', BG = 'F4F4F4', MID = '8C8C8C', WHITE = 'FFFFFF';
const MAPV = { text: INK, 'text-muted': SUB, surface: WHITE, bg: BG, border: LINE, accent: INK, 'accent-soft': FILL, 'text-on-dark-muted': 'BDBDBD', error: INK, 'act-walk': MID, 'act-jog': MID, 'act-run': MID, 'act-bike': MID, 'map-water': 'D9D9D9', 'map-park': 'D9D9D9' };
const MAPH = { '1E3A4C': INK, '5B6F7C': SUB, FFFFFF: WHITE, F2F4F5: BG, D5DBDF: LINE, FFB547: INK, FFF1D6: FILL, B7C3CB: 'BDBDBD', B3261E: INK, '2E7D66': MID, '2E6AAE': MID, C2452B: MID, D3DEE6: 'D9D9D9', E0E8DE: 'D9D9D9' };
const lum = h => { const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16); return 0.299 * r + 0.587 * g + 0.114 * b; };
function lo(c) {
  if (!c) return c;
  if (c.startsWith('v:')) return MAPV[c.slice(2)] || SUB;
  const [h0, a] = c.split('@'); const h = h0.toUpperCase();
  let g = MAPH[h];
  if (!g) { const y = Math.round(lum(h)).toString(16).padStart(2, '0').toUpperCase(); g = y + y + y; }
  if (a !== undefined && h === '1E3A4C') g = '000000';   // 시트 바탕 스크림
  return a !== undefined ? g + '@' + a : g;
}
const isAccent = c => c && (c === 'v:accent' || c.split('@')[0].toUpperCase() === 'FFB547');
const darkHex = c => { if (!c) return false; const [h, a] = c.split('@'); return (a === undefined || +a >= 0.5) && lum(h) < 110; };

function convert(J) {
  const S = J.S.map(s => ['K', s[1], s[2], s[3], s[4], lo(s[5]), s[6] || '']);
  const sIdx = st => { const k = JSON.stringify(st); let i = S.findIndex(x => JSON.stringify(x) === k); if (i < 0) { S.push(st); i = S.length - 1; } return i; };
  const ST = (w, size, lh, color) => sIdx(['K', w, size, lh, 0, color, '']);
  const txt = (v, w, size, lh, color, extra = {}) => Object.assign({ t: 'T', v, f: ST(w, size, lh, color), s: 'HH' }, extra);
  // 어두운 바탕 안의 어두운 글자는 흰색으로
  const fixT = (fi, dark) => { const st = S[fi]; if (dark && lum(st[5].split('@')[0]) < 128) { return sIdx([st[0], st[1], st[2], st[3], st[4], WHITE, st[6]]); } return fi; };
  const onCol = dark => (dark ? WHITE : INK);

  function inst(n, dark) {
    const v = n.v, base = { n: n.n || n.c, w: n.w, h: n.h, s: n.s || 'HH', x: n.x, y: n.y, abs: n.abs };
    if (n.c === 'status') {
      const c = v.d ? WHITE : INK;
      return Object.assign(base, { t: 'F', L: 'H', ja: 'SB', ia: 'C', p: [0, 24, 0, 24], fill: v.d ? INK : undefined, k: [txt('18:55', 700, 15, 20, c), { t: 'F', n: 'signal', w: 48, h: 12, r: 3, fill: v.d ? '5C5C5C' : LINE, L: 'N', k: [] }] });
    }
    if (n.c === 'tab') {
      const tabs = ['찾기', '지도', '채팅', '나'];
      return Object.assign(base, { t: 'F', n: 'tabbar', L: 'H', fill: WHITE, st: LINE, sw: [1, 0, 0, 0], k: tabs.map(l => {
        const on = l === v.cur, c = on ? INK : '9E9E9E';
        let ico = { t: 'O', n: 'icon', w: 24, h: 24, c, s: 'XX' };
        if (l === '채팅' && v.cnt) ico = { t: 'F', n: 'ico', w: 24, h: 24, L: 'N', k: [Object.assign(ico, { x: 0, y: 0 }), { t: 'F', n: 'count', x: 14, y: -8, w: 20, h: 20, r: 10, fill: INK, L: 'H', ja: 'C', ia: 'C', k: [txt(v.cnt, 700, 12, 16, WHITE)] }] };
        return { t: 'F', n: 'tab/' + l, w: 97.5, h: 63, L: 'V', ja: 'C', ia: 'C', g: 4, s: 'FF', k: [ico, txt(l, on ? 700 : 500, 12, 17, on ? INK : SUB)] };
      }) });
    }
    if (n.c === 'btn') {
      let fill = null, st = null, c = INK;
      if (v.st === 'Accent') { fill = dark ? WHITE : INK; c = dark ? INK : WHITE; }
      else if (v.st === 'Primary') { fill = 'BFBFBF'; c = INK; }
      else { st = dark ? WHITE : INK; c = dark ? WHITE : INK; }
      return Object.assign(base, { t: 'F', L: 'H', ja: 'C', ia: 'C', r: 999, p: [0, 20, 0, 20], fill, st, sw: st ? 1.5 : undefined, op: v.dis ? 0.4 : undefined, s: (n.s || 'HH')[0] + 'X', k: [txt(v.l, 700, 16, 24, c)] });
    }
    if (n.c === 'chip') {
      const k = [];
      if (v.dot) k.push({ t: 'F', n: 'dot', w: 8, h: 8, r: 4, fill: MID, L: 'N', k: [] });
      k.push(txt(v.l, 500, v.sz === 'M' ? 15 : 14, v.sz === 'M' ? 22 : 20, INK));
      return Object.assign(base, { t: 'F', L: 'H', ia: 'C', g: 6, r: 999, p: [0, v.pl || 12, 0, v.pl || 12], fill: v.on ? FILL : WHITE, st: v.on ? INK : LINE, sw: 1, s: 'HX', k });
    }
    if (n.c === 'badge') {
      const dk = v.st === 'Dark' || v.st === 'Error';
      return Object.assign(base, { t: 'F', L: 'H', ja: 'C', ia: 'C', r: 999, p: [0, 10, 0, 10], fill: dk ? INK : v.st === 'Line' ? WHITE : FILL, st: v.st === 'Line' ? 'BDBDBD' : undefined, sw: v.st === 'Line' ? 1 : undefined, s: 'HX', k: [txt(v.l, 500, v.sz === 'XS' ? 12 : 14, v.sz === 'XS' ? 16 : 20, dk ? WHITE : INK)] });
    }
    if (n.c === 'toggle') return Object.assign(base, { t: 'F', L: 'N', w: 44, h: 26, r: 13, fill: v.on ? INK : LINE, s: 'XX', k: [{ t: 'F', n: 'knob', x: v.on ? 20 : 2, y: 2, w: 22, h: 22, r: 11, fill: WHITE, L: 'N', k: [] }] });
    if (n.c === 'pi') return Object.assign(base, { t: 'F', L: 'N', w: v.s, h: v.s, r: v.s / 2, fill: 'D9D9D9', s: 'XX', k: [] });
    return Object.assign(base, { t: 'X' });
  }

  function walk(n, dark) {
    if (n.t === 'SP') return n;
    if (n.t === 'T') {
      const o = Object.assign({}, n);
      if (o.f !== undefined) o.f = fixT(o.f, dark);
      if (o.r) o.r = o.r.map(([s, i]) => [s, fixT(i, dark)]);
      return o;
    }
    if (n.t === 'IC') { let c = lo(n.v.c || '1E3A4C'); if (dark && lum(c) < 128) c = WHITE; return { t: 'O', n: n.n, w: n.w, h: n.h, c, s: n.s, x: n.x, y: n.y, abs: n.abs }; }
    if (n.t === 'S') return { t: 'X', n: n.n === 'course-thumb' ? '썸네일' : n.n, w: n.w, h: n.h, s: n.s, x: n.x, y: n.y, abs: n.abs, dark };
    if (n.t === 'MP') return { t: 'X', n: '지도', lab: '지도', w: n.w, h: n.h, s: n.s, x: n.x, y: n.y, abs: n.abs, dark };
    if (n.t === 'I') return inst(n, dark);
    // 프레임
    const o = Object.assign({}, n);
    delete o.k;
    if (o.grad) { const c0 = (o.grad.stops.find(st => !String(st[0]).includes('@')) || o.grad.stops[0])[0]; delete o.grad; o.fill = lo(c0.split('@')[0]); }
    if (o.fill) o.fill = isAccent(n.fill) ? (dark ? WHITE : INK) : lo(o.fill);
    if (o.st) o.st = isAccent(n.st) ? INK : lo(o.st);
    const d2 = o.fill ? (o.fill.includes('@') ? dark : darkHex(o.fill)) : dark;
    o.k = (n.k || []).map(k => walk(k, d2));
    // 내용에 맞춰 줄어드는 세로 프레임 안의 채움 글자는 hug로 (Noto 숫자가 Archivo보다 넓어 고정폭이면 줄이 바뀜)
    if ((o.s || 'HH')[0] === 'H' && o.L === 'V') o.k.forEach(k => { if (k.t === 'T' && (k.s || 'HH')[0] === 'F' && !k.ml) { k.s = 'H' + (k.s || 'HH')[1]; k.tw = 'H'; } });
    return o;
  }
  const root = walk(J, false);
  root.S = S;
  return root;
}

const only = process.argv.slice(2);
const ids = fs.readdirSync(SRC).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')).filter(id => !only.length || only.includes(id));
for (const id of ids) {
  const J = JSON.parse(fs.readFileSync(path.join(SRC, id + '.json'), 'utf8'));
  const L = convert(J);
  const s = JSON.stringify(L, (k, v) => (v === undefined ? undefined : v));
  fs.writeFileSync(path.join(OUT, id + '.json'), s);
  console.log(id, (s.length / 1024).toFixed(1) + 'KB');
}
