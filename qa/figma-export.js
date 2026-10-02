// M5 · 코드 화면 → Figma 재구성용 JSON (원본은 코드, Figma는 사본)
// node qa/figma-export.js [화면id ...]   (FONT_DIR=<@fontsource node_modules> 있으면 로컬 글꼴 주입)
// 출력: figma/export/<id>.json · figma/builder.js가 use_figma에서 편집 가능한 레이어로 다시 짓는다
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = path.resolve(__dirname, '../figma/export');
fs.mkdirSync(OUT, { recursive: true });
const ONLY = process.argv.slice(2);

/* ---------- 브라우저 안에서 도는 추출기 ---------- */
function extract() {
  const phone = document.getElementById('phone');
  const view = document.getElementById('view');
  const r1 = v => Math.round(v * 10) / 10;
  const col = s => {
    if (!s || s === 'none' || s === 'transparent') return null;
    const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    const a = p.length > 3 ? p[3] : 1; if (a < 0.005) return null;
    const h = p.slice(0, 3).map(x => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase();
    return a < 0.999 ? h + '@' + Math.round(a * 100) / 100 : h;
  };
  const varOf = (el, prop) => { const s = el.getAttribute && (el.getAttribute('style') || ''); const m = s.match(new RegExp('(?:^|;)\\s*' + prop + '\\s*:\\s*var\\(--([a-z-]+)\\)')); return m ? m[1] : null; };
  const attrVar = v => { const m = (v || '').match(/var\(--([a-z-]+)\)/); return m ? m[1] : null; };
  const rel = (r, pr) => ({ x: r1(r.left - pr.left), y: r1(r.top - pr.top), w: r1(r.width), h: r1(r.height) });
  const px = v => parseFloat(v) || 0;
  const bw = cs => [px(cs.borderTopWidth), px(cs.borderRightWidth), px(cs.borderBottomWidth), px(cs.borderLeftWidth)];
  const pad = cs => [px(cs.paddingTop), px(cs.paddingRight), px(cs.paddingBottom), px(cs.paddingLeft)];
  const hasBox = cs => !!col(cs.backgroundColor) || cs.backgroundImage !== 'none' || bw(cs).some(v => v > 0 && cs.borderTopStyle !== 'none');
  const tuple = cs => {
    const sz = px(cs.fontSize);
    const lh = cs.lineHeight === 'normal' ? sz * 1.3 : px(cs.lineHeight);
    const ls = cs.letterSpacing === 'normal' ? 0 : px(cs.letterSpacing);
    const fam = /Archivo/.test(cs.fontFamily.split(',')[0]) ? 'A' : 'K';
    const c = col(cs.color) || '1E3A4C';
    return [fam, +cs.fontWeight, sz, r1(lh), Math.round(ls / sz * 1000) / 10, c, cs.textDecorationLine.includes('underline') ? 'u' : ''];
  };
  // 아이콘 이름 표
  const norm = s => s.replace(/\s+/g, ' ').replace(/><\/(path|circle|rect)>/g, '/>').trim();
  const ICON_BY = {};
  const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [k, v] of Object.entries(ICONS)) { tmp.innerHTML = v; ICON_BY[norm(tmp.innerHTML)] = k; }
  const PI_D = window.AC_DATA.icons.map(g => g.d);
  const nameOf = el => {
    if (el.id) return '#' + el.id;
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(c => c && !/^(g\d+|mt\d+|tap)$/.test(c)) : [];
    const lab = el.getAttribute('aria-label');
    return (cls.length ? cls.slice(0, 2).join('.') : el.tagName.toLowerCase()) + (lab ? ' · ' + lab.slice(0, 24) : '');
  };

  // 줄바꿈 위치 (브라우저가 끊은 자리 그대로 → U+2028)
  function breaksOf(el, lh) {
    const set = new Map(); const rg = document.createRange(); let last = null;
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      const s = n.textContent;
      for (let i = 0; i < s.length; i++) {
        if (/\s/.test(s[i])) continue;
        rg.setStart(n, i); rg.setEnd(n, i + 1);
        const rc = rg.getClientRects()[0]; if (!rc) continue;
        if (last !== null && rc.top > last + lh * 0.5) { if (!set.has(n)) set.set(n, new Set()); set.get(n).add(i); }
        last = rc.top;
      }
    }
    return set;
  }
  function runsOf(el, multiline) {
    const cs0 = getComputedStyle(el);
    const lh = cs0.lineHeight === 'normal' ? px(cs0.fontSize) * 1.3 : px(cs0.lineHeight);
    const brk = multiline ? breaksOf(el, lh) : new Map();
    const raw = [];
    const walk = (node, cs) => {
      for (const c of node.childNodes) {
        if (c.nodeType === 3) {
          let s = c.textContent; const b = brk.get(c);
          if (b) { let o = ''; for (let i = 0; i < s.length; i++) { if (b.has(i)) o = o.replace(/\s+$/, '') + '\u2028'; o += s[i]; } s = o; }
          raw.push([s, tuple(cs), 0]);
        } else if (c.nodeType === 1) {
          if (c.tagName === 'BR') raw.push(['\n', tuple(cs), 1]);
          else walk(c, getComputedStyle(c));
        }
      }
    };
    walk(el, cs0);
    const pre = /pre/.test(cs0.whiteSpace);
    const res = [];
    for (const [t, st, br] of raw) {
      let x = br || pre ? t : t.replace(/[ \t\n\r\f]+/g, ' ');
      const prev = res.length ? res[res.length - 1][0] : '';
      if (!br && !pre && (!res.length || /[ \n\u2028]$/.test(prev))) x = x.replace(/^ /, '');
      x = x.replace(/ \u2028/g, '\u2028').replace(/\u2028 /g, '\u2028');
      if (!x) continue;
      const key = JSON.stringify(st);
      if (res.length && res[res.length - 1][2] === key) res[res.length - 1][0] += x; else res.push([x, st, key]);
    }
    while (res.length) { const L = res[res.length - 1]; L[0] = L[0].replace(/[ \u2028]+$/, ''); if (L[0]) break; res.pop(); }
    return res.map(([x, st]) => [x, st]);
  }
  const inlineOnly = el => {
    const cs = getComputedStyle(el);
    if (cs.display !== 'inline' || el.tagName === 'svg' || el.tagName === 'IMG' || hasBox(cs)) return false;
    return [...el.childNodes].every(n => n.nodeType === 3 || n.nodeType === 8 || (n.nodeType === 1 && (n.tagName === 'BR' || inlineOnly(n))));
  };
  const isTextEl = el => el.textContent.trim().length > 0 && !['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName) &&
    [...el.childNodes].every(n => n.nodeType === 3 || n.nodeType === 8 || (n.nodeType === 1 && (n.tagName === 'BR' || inlineOnly(n))));

  function textNode(el, r, cs, name) {
    const p = pad(cs), b = bw(cs);
    const box = { x: r.x + p[3] + b[3], y: r.y + p[0] + b[0], w: r1(r.w - p[1] - p[3] - b[1] - b[3]), h: r1(r.h - p[0] - p[2] - b[0] - b[2]) };
    const lh = cs.lineHeight === 'normal' ? px(cs.fontSize) * 1.3 : px(cs.lineHeight);
    const rg = document.createRange(); rg.selectNodeContents(el);
    const th = rg.getBoundingClientRect().height;
    const ml = th > lh * 1.5;
    const runs = runsOf(el, ml);
    if (!runs.length) return null;
    const n = { t: 'T', n: name, x: r1(box.x), y: r1(box.y), w: box.w, h: box.h };
    if (runs.length === 1) { n.v = runs[0][0]; n.y_ = runs[0][1]; } else n.r = runs;
    const ta = cs.textAlign; n.al = ta === 'center' ? 'C' : (ta === 'right' || ta === 'end') ? 'R' : 'L';
    if (ml) n.ml = 1;
    /* 실제로 잘린 글자만 말줄임 고정폭. 안 잘린 글자는 hug (Figma 글꼴 폭이 브라우저보다 1~2px 넓어도 "마…"가 되지 않게) */
    if (cs.textOverflow === 'ellipsis' && cs.overflow !== 'visible') { n.tr = 1; if (el.scrollWidth > el.clientWidth + 0.5) n.cut = 1; }
    n._block = !cs.display.startsWith('inline');
    return n;
  }

  const pending = [];     // 절대 위치 요소 → 담는 블록으로 옮김
  const nodeOf = new Map();

  function svgMarkup(svg) {
    const vb = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? svg.viewBox.baseVal : { x: 0, y: 0, width: svg.getBoundingClientRect().width, height: svg.getBoundingClientRect().height };
    const vars = [];
    const shapes = [...svg.querySelectorAll('path,circle,rect,polyline,line,ellipse,polygon')].filter(s => !s.classList.contains('rt-hit'));
    let body = '';
    for (const s of shapes) {
      const cs = getComputedStyle(s);
      const at = [...s.attributes].filter(a => !['class', 'style', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-opacity', 'fill-opacity', 'tabindex', 'role', 'aria-label', 'aria-hidden', 'onclick', 'onkeydown'].includes(a.name)).map(a => `${a.name}="${a.value}"`);
      const fill = col(cs.fill), stroke = col(cs.stroke);
      at.push(`fill="${fill ? '#' + fill.split('@')[0] : 'none'}"`);
      if (fill && fill.includes('@')) at.push(`fill-opacity="${fill.split('@')[1]}"`);
      if (stroke) {
        at.push(`stroke="#${stroke.split('@')[0]}"`, `stroke-width="${px(cs.strokeWidth)}"`, `stroke-linecap="${cs.strokeLinecap}"`, `stroke-linejoin="${cs.strokeLinejoin}"`);
        if (stroke.includes('@')) at.push(`stroke-opacity="${stroke.split('@')[1]}"`);
        if (cs.strokeDasharray && cs.strokeDasharray !== 'none') at.push(`stroke-dasharray="${cs.strokeDasharray.replace(/px/g, '')}"`);
      }
      body += `<${s.tagName} ${at.join(' ')}/>`;
      vars.push([attrVar(s.getAttribute('fill')) || varOf(s, 'fill'), attrVar(s.getAttribute('stroke')) || varOf(s, 'stroke')]);
    }
    return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${vb.width}" height="${vb.height}" viewBox="${vb.x} ${vb.y} ${vb.width} ${vb.height}">${body}</svg>`, vb: [vb.width, vb.height], vars: vars.some(v => v[0] || v[1]) ? vars : undefined };
  }

  function mapNode(svg, r) {
    const vb = svg.viewBox.baseVal; const R = svg.getBoundingClientRect();
    const k = Math.max(R.width / vb.width, R.height / vb.height);
    const tx = (R.width - vb.width * k) / 2 - vb.x * k, ty = (R.height - vb.height * k) / 2 - vb.y * k;
    const T = (x, y) => [r1(x * k + tx), r1(y * k + ty)];
    const dark = !!svg.closest('.dark');
    const rt = [], dt = [];
    svg.querySelectorAll('polyline.rt').forEach(p => {
      const st = p.getAttribute('style') || '';
      const pts = p.getAttribute('points').trim().split(/\s+/).map(s => T(...s.split(',').map(Number)).join(',')).join(' ');
      const sw = r1(parseFloat((st.match(/stroke-width:([\d.]+)/) || [0, 3])[1]) * k);
      const todo = p.classList.contains('todo');
      const c = todo ? 'text-muted' : (dark ? 'surface' : attrVar((st.match(/stroke:([^;]+)/) || [])[1]) || 'text');
      rt.push([pts, sw, c, todo ? 1 : 0]);
    });
    svg.querySelectorAll('circle.rt-dot').forEach(c => {
      const st = c.getAttribute('style') || '';
      const [x, y] = T(+c.getAttribute('cx'), +c.getAttribute('cy'));
      dt.push([x, y, r1(+c.getAttribute('r') * k), dark ? 'surface' : attrVar((st.match(/fill:([^;]+)/) || [])[1]) || 'text']);
    });
    return { t: 'MP', n: 'map · ' + (svg.getAttribute('aria-label') || '').slice(0, 30), x: r.x, y: r.y, w: r.w, h: r.h, d: dark ? 1 : 0, b: [r1(-60 * k + tx), r1(-60 * k + ty), r1(1120 * k), r1(960 * k)], rt, dt };
  }

  function comp(el, cs, r) {
    const lab = () => el.textContent.replace(/\s+/g, ' ').trim();
    if (el.classList.contains('statusbar')) return { t: 'I', c: 'status', v: { d: el.classList.contains('dark') ? 1 : 0 } };
    if (el.id === 'tabbar') { const cur = el.querySelector('button.on'); const cnt = el.querySelector('.count'); return { t: 'I', c: 'tab', v: { cur: cur ? cur.children[1].textContent.trim() : '', cnt: cnt ? cnt.textContent.trim() : '' } }; }
    if (el.classList.contains('btn') && !el.querySelector('svg,span,img')) {
      const st = el.classList.contains('primary') ? 'Accent' : el.classList.contains('secondary') ? 'Primary' : el.classList.contains('outline') ? 'Outline Light' : null;
      if (st) return { t: 'I', c: 'btn', v: { st, sz: st === 'Accent' ? 'L' : 'M', l: lab(), dis: el.disabled ? 1 : 0, c: st === 'Outline Light' ? col(cs.color) : undefined } };
    }
    if (el.classList.contains('chip') && !el.querySelector('svg')) {
      const dot = el.querySelector('.dot-act');
      return { t: 'I', c: 'chip', v: { on: el.getAttribute('aria-pressed') === 'true' ? 1 : 0, sz: el.classList.contains('sm') ? 'S' : 'M', l: lab(), dot: dot ? (varOf(dot, '--c') || 'text') : null, pl: px(cs.paddingLeft) } };
    }
    if (el.classList.contains('badge') && !el.querySelector('svg')) {
      const st = el.classList.contains('line') ? 'Line' : el.classList.contains('dark') ? 'Dark' : el.classList.contains('err') ? 'Error' : 'Soft';
      return { t: 'I', c: 'badge', v: { st, sz: el.classList.contains('xs') ? 'XS' : 'M', l: lab() } };
    }
    if (el.classList.contains('toggle')) return { t: 'I', c: 'toggle', v: { on: el.getAttribute('aria-checked') === 'true' ? 1 : 0 } };
    if (el.classList.contains('pi')) { const d = el.querySelector('path').getAttribute('d'); return { t: 'I', c: 'pi', v: { i: PI_D.indexOf(d) + 1, s: r.w } }; }
    return null;
  }

  function walk(el, parentEl) {
    if (el.nodeType !== 1) return null;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || el.classList.contains('sr') || el.id === 'live' || el.classList.contains('rt-hit')) return null;
    const R = el.getBoundingClientRect();
    const pEl = parentEl;
    const PR = pEl ? pEl.getBoundingClientRect() : R;
    const r = rel(R, PR);
    let n;
    const posAbs = cs.position === 'absolute' || cs.position === 'fixed';
    const stickyBottom = cs.position === 'sticky' && cs.bottom !== 'auto';
    // svg
    if (el.tagName === 'svg') {
      if (R.width < 1) return null;
      if (el.closest('.map') && el.parentElement.classList.contains('map')) n = mapNode(el, r);
      else if (el.classList.contains('ic')) {
        const nm = ICON_BY[norm(el.innerHTML)] || 'unknown';
        n = { t: 'IC', n: 'icon/' + nm, x: r.x, y: r.y, w: r.w, h: r.h, v: { i: nm, c: col(cs.stroke) || col(cs.color) } };
      } else n = Object.assign({ t: 'S', n: el.closest('.thumb') ? 'course-thumb' : 'svg', x: r.x, y: r.y, w: r.w, h: r.h }, svgMarkup(el));
    }
    if (!n) {
      const c = comp(el, cs, r);
      if (c) n = Object.assign({ n: nameOf(el), x: r.x, y: r.y, w: r.w, h: r.h }, c);
    }
    // 빈 .grow (가로 flex에서 남는 폭을 먹는 자리) → 채우는 스페이서
    if (!n && (el.tagName === 'SPAN' || el.tagName === 'DIV') && !el.childNodes.length && cs.backgroundColor === 'rgba(0, 0, 0, 0)' && !parseFloat(cs.borderTopWidth) && parentEl && parseFloat(cs.flexGrow) > 0 && getComputedStyle(parentEl).flexDirection.startsWith('row') && R.width > 0.5) return { t: 'SP', n: 'grow', fill: 1, x: r.x, y: r.y, w: r.w, h: 1, v: r.w, d: 'H' };
    if (!n && (R.width < 0.5 || R.height < 0.5) && !el.querySelector('*')) return null;
    // 오늘 날짜 점 (::after)
    if (!n && el.matches('.day.today .d')) {
      const t = textNode(el, { x: 0, y: 0, w: r.w, h: px(cs.lineHeight) || r.h }, cs, 'date');
      t.n = 'd'; t.x = 0; t.y = 0; t.w = r.w; t.h = r1(r.h - 8);
      n = { t: 'F', n: 'd · today', x: r.x, y: r.y, w: r.w, h: r.h, L: 'V', g: 4, ia: 'C', p: [0, 0, 0, 0], k: [Object.assign(t, { s: 'FH', tw: 'F' }), { t: 'F', n: 'today-dot', x: r1(r.w / 2 - 2), y: r1(r.h - 4), w: 4, h: 4, r: 2, fill: col(cs.color), s: 'XX', L: 'N', k: [] }] };
    }
    // 입력칸
    if (!n && ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) {
      let v = el.tagName === 'SELECT' ? (el.selectedOptions[0] || {}).textContent || '' : el.value;
      let st = tuple(cs);
      if (!v && el.placeholder) { v = el.placeholder; st = st.slice(); st[5] = col(getComputedStyle(el, '::placeholder').color) || '5B6F7C'; }
      const p = pad(cs);
      n = { t: 'F', n: nameOf(el), x: r.x, y: r.y, w: r.w, h: r.h, L: 'H', ia: 'C', g: 0, p: [p[0], p[1], p[2], p[3]], k: [] };
      if (el.tagName === 'SELECT') {
        // 선택창: 값 + 오른쪽 chevron(브라우저 기본 화살표 자리 · DESIGN 3b)
        n.ja = 'SB';
        if (v) n.k.push({ t: 'T', n: 'value', x: p[3], y: 0, w: 1, h: st[3], v, y_: st, al: 'L', s: 'HH', tw: 'H' });
        n.k.push({ t: 'IC', n: 'chevron', x: r.w - p[1] - 16, y: (r.h - 16) / 2, w: 16, h: 16, v: { i: 'fwd', c: '1E3A4C', rot: -90 }, s: 'XX' });
      } else if (v) n.k.push({ t: 'T', n: 'value', x: p[3], y: 0, w: r1(r.w - p[1] - p[3]), h: st[3], v, y_: st, al: 'L', s: 'FH', tw: 'F' });
    }
    // 텍스트만 있는 요소
    if (!n && isTextEl(el)) {
      if (hasBox(cs) || pad(cs).some(v => v > 0.5)) {
        const p = pad(cs), b = bw(cs);
        const t = textNode(el, { x: 0, y: 0, w: r.w, h: r.h }, cs, 'label');
        n = frameProps({ t: 'F', n: nameOf(el), x: r.x, y: r.y, w: r.w, h: r.h, L: 'H', g: 0, p: [p[0] + b[0], p[1] + b[1], p[2] + b[2], p[3] + b[3]], ja: cs.textAlign === 'center' ? 'C' : 'MIN', ia: 'C', k: t ? [Object.assign(t, (t.ml || !cs.display.startsWith('inline')) ? { s: 'FH', tw: 'F' } : { s: 'HH', tw: 'H' })] : [] }, el, cs, r);
      } else {
        n = textNode(el, r, cs, nameOf(el));
        if (!n) return null;
      }
    }
    // 일반 프레임
    if (!n) {
      n = frameProps({ t: 'F', n: nameOf(el), x: r.x, y: r.y, w: r.w, h: r.h, k: [] }, el, cs, r);
      const kids = [];
      for (const c of el.childNodes) {
        if (c.nodeType === 3) {
          const s = c.textContent.replace(/\s+/g, ' ').trim(); if (!s) continue;
          const rg = document.createRange(); rg.selectNodeContents(c); const rr = rg.getBoundingClientRect();
          const st = tuple(cs);
          kids.push({ t: 'T', n: 'text', x: r1(rr.left - R.left), y: r1(rr.top - R.top), w: r1(rr.width), h: r1(rr.height), v: s, y_: st, al: 'L', _el: null });
        } else if (c.nodeType === 1) {
          const k = walk(c, el);
          if (k) kids.push(k);
        }
      }
      n.k = kids;
      if (!kids.length && !n.fill && !n.st && !n.grad && (R.width < 0.5 || R.height < 0.5)) return null;
      layoutOf(n, el, cs, R);
    }
    n._el = el;
    nodeOf.set(el, n);
    if (posAbs || stickyBottom) {
      const cb = stickyBottom ? view : (cs.position === 'fixed' ? phone : el.offsetParent || phone);
      if (cb !== pEl) {
        const CR = cb.getBoundingClientRect();
        const inFlow = rel(R, PR);
        Object.assign(n, rel(R, CR));
        pending.push([cb, n]);
        n.abs = 1;
        if (stickyBottom) { n.stick = 1; return { t: 'SP', n: 'space · ' + n.n + ' 자리', v: n.h, x: inFlow.x, y: inFlow.y, w: inFlow.w, h: inFlow.h, _ph: 1 }; }
        return null;
      }
      n.abs = 1;
    }
    return n;
  }

  function frameProps(n, el, cs, r) {
    const fill = varOf(el, '--c') && el.matches('.dot-act,.legend i') ? 'v:' + varOf(el, '--c') : col(cs.backgroundColor);
    if (fill) n.fill = fill;
    if (el.matches('.legend i.dash')) { delete n.fill; n.dash = 1; }
    const bi = cs.backgroundImage;
    if (bi && bi.startsWith('linear-gradient') && !n.dash) {
      const colA = s2 => { const m2 = s2.match(/rgba?\(([^)]+)\)/); const p2 = m2[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat); const h2 = p2.slice(0, 3).map(x => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase(); const a2 = p2.length > 3 ? p2[3] : 1; return a2 < 0.999 ? h2 + '@' + Math.round(a2 * 100) / 100 : h2; };
      const stops = [...bi.matchAll(/(rgba?\([^)]+\))\s*([\d.]+%)?/g)].map((m, i) => [colA(m[1]), m[2] ? parseFloat(m[2]) / 100 : (i === 0 ? 0 : 1)]);
      n.grad = { dir: /to top/.test(bi) ? 'up' : 'down', stops };
    }
    const b = bw(cs);
    if (b.some(v => v > 0) && cs.borderTopStyle !== 'none' || b.some(v => v > 0)) {
      const sides = [['Top', 0], ['Right', 1], ['Bottom', 2], ['Left', 3]].filter(([s, i]) => b[i] > 0 && cs['border' + s + 'Style'] !== 'none');
      if (sides.length) { n.st = col(cs['border' + sides[0][0] + 'Color']); n.sw = b.every(v => v === b[0]) ? b[0] : b; }
      if (!n.st) delete n.sw;
    }
    const rad = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(v => v.endsWith('%') ? Math.min(r.w, r.h) * parseFloat(v) / 100 : Math.min(px(v), Math.min(r.w, r.h) / 2));
    if (rad.some(v => v > 0)) n.r = rad.every(v => v === rad[0]) ? r1(rad[0]) : rad.map(r1);
    if (['hidden', 'auto', 'scroll', 'clip'].includes(cs.overflowY) || ['hidden', 'auto', 'scroll', 'clip'].includes(cs.overflowX)) n.clip = 1;
    if (el === view) n.scroll = 1;
    const op = parseFloat(cs.opacity); if (op < 1) n.op = op;
    return n;
  }

  function layoutOf(n, el, cs, R) {
    const disp = cs.display; const flow = n.k.filter(k => !k.abs);
    const p = pad(cs), b = bw(cs);
    n.p = [p[0] + b[0], p[1] + b[1], p[2] + b[2], p[3] + b[3]].map(r1);
    if (el.classList.contains('map') || (flow.length && flow.every(k => k.t === 'MP'))) { n.L = 'N'; }
    let dir, gap = 0, wrap = 0, cgap = 0, isFlex = false;
    if (disp.includes('flex')) { isFlex = true; dir = cs.flexDirection.startsWith('column') ? 'V' : 'H'; gap = px(dir === 'V' ? cs.rowGap : cs.columnGap); wrap = cs.flexWrap !== 'nowrap' ? 1 : 0; cgap = px(dir === 'V' ? cs.columnGap : cs.rowGap); }
    else if (disp.includes('grid')) { dir = 'H'; wrap = 1; gap = px(cs.columnGap); cgap = px(cs.rowGap); }
    else {
      const rowish = flow.length > 1 && flow.every((k, i) => i === 0 || (k.y < flow[i - 1].y + flow[i - 1].h - 1 && k.x >= flow[i - 1].x + flow[i - 1].w - 1));
      dir = rowish ? 'H' : 'V';
    }
    if (!n.L) n.L = dir;
    n.k.forEach(k => { if (k.t === 'SP') { k.d = n.L; k.v = n.L === 'V' ? k.h : k.w; } });
    if (n.L === 'N') { n.k.forEach(k => { k.s = 'XX'; }); return; }
    n.g = r1(gap); if (wrap) { n.wr = r1(cgap); }
    const jc = cs.justifyContent, ai = cs.alignItems;
    n.ja = /space-between/.test(jc) ? 'SB' : /center/.test(jc) ? 'C' : /end/.test(jc) ? 'MAX' : 'MIN';
    n.ia = /center/.test(ai) ? 'C' : /end/.test(ai) ? 'MAX' : /baseline/.test(ai) && n.L === 'H' ? 'BL' : 'MIN';
    if (!isFlex && !disp.includes('grid') && n.L === 'V' && cs.textAlign === 'center') n.ia = 'C';
    const stretch = isFlex ? !/center|start|end|baseline/.test(ai) : n.L === 'V';
    const cw = R.width - n.p[1] - n.p[3], ch = R.height - n.p[0] - n.p[2];
    for (const k of flow) {
      if (k.t === 'SP') continue;
      const el2 = k._el; const kcs = el2 ? getComputedStyle(el2) : null;
      const grow = isFlex && kcs && parseFloat(kcs.flexGrow) > 0;
      let sh = 'H', sv = 'H';
      if (n.L === 'V') { if (Math.abs(k.w - cw) < 1 && (stretch || (k._block && k.t === 'T'))) sh = 'F'; if (grow) sv = 'F'; }
      else { if (grow && !wrap) sh = 'F'; if (Math.abs(k.h - ch) < 1 && stretch && !wrap) sv = 'F'; }
      if (wrap && disp.includes('grid')) sh = 'X';
      if (['S', 'IC', 'MP'].includes(k.t) || (k.t === 'I' && ['pi', 'toggle', 'status', 'tab'].includes(k.c))) { if (sh === 'H') sh = 'X'; if (sv === 'H') sv = 'X'; }
      if (k.t === 'T') { k.tw = sh === 'F' ? 'F' : k.ml ? 'X' : 'H'; if (k.tr && sh !== 'F') { if (k.cut) k.tw = 'X'; else delete k.tr; } delete k.cut; }
      k.s = sh + sv;
    }
    // space-between + 채우는 자식 → Figma에선 SB가 간격을 무시하므로 MIN + gap
    if (n.ja === 'SB' && flow.some(k => k.t !== 'SP' && (k.s || '')[n.L === 'H' ? 0 : 1] === 'F')) n.ja = 'MIN';
    // 여백(margin) → 스페이서. 간격(gap)이 있는 부모에선 스페이서가 간격을 한 번 더 먹으므로 앞쪽 패딩을 준 감싸개로
    if (!wrap && flow.length && (n.ja === 'MIN')) {
      const A = n.L === 'V' ? 'y' : 'x', S = n.L === 'V' ? 'h' : 'w';
      const out = []; let prevEnd = n.L === 'V' ? n.p[0] : n.p[3]; let first = true;
      for (const k of n.k) {
        if (k.abs) { out.push(k); continue; }
        const g = k[A] - prevEnd - (first ? 0 : gap);
        const end = k[A] + k[S];
        if (g > 0.6 && gap > 0 && !first) {
          const s = k.s || 'HH';
          out.push({ t: 'F', n: 'pad ' + Math.round(g), _w: 1, L: n.L, p: n.L === 'V' ? [r1(g), 0, 0, 0] : [0, 0, 0, r1(g)], k: [k],
            x: n.L === 'V' ? k.x : k.x - g, y: n.L === 'V' ? k.y - g : k.y, w: n.L === 'V' ? k.w : k.w + g, h: n.L === 'V' ? k.h + g : k.h,
            s: n.L === 'V' ? s[0] + 'H' : 'H' + s[1] });
        } else {
          if (g > 0.6) out.push({ t: 'SP', n: 'space ' + Math.round(g), v: r1(g), d: n.L });
          out.push(k);
        }
        prevEnd = end; first = false;
      }
      n.k = out;
    }
    // 자식 하나만 교차축 정렬이 다를 때(margin:0 auto, align-self) → 그 자식만 감싸 정렬
    if (!wrap && n.ia !== 'BL') {
      const cA = n.L === 'V' ? 'x' : 'y', cS = n.L === 'V' ? 'w' : 'h', lead = n.L === 'V' ? n.p[3] : n.p[0];
      const room = n.L === 'V' ? cw : ch, ci = n.L === 'V' ? 0 : 1;
      n.k = n.k.map(k => {
        if (k.abs || k.t === 'SP' || k._w || (k.s || 'HH')[ci] === 'F') return k;
        const free = room - k[cS]; if (free < 2) return k;
        const off = k[cA] - lead;
        const al = Math.abs(off) < 1 ? 'MIN' : Math.abs(off - free / 2) < 1 ? 'C' : Math.abs(off - free) < 1 ? 'MAX' : null;
        const V = n.L === 'V';
        // 교차축 여백(예: 점을 첫 줄 가운데에 맞춘 margin-top) → 앞쪽 패딩 감싸개
        if (!al && (n.ia || 'MIN') === 'MIN' && off > 0.6) return { t: 'F', n: (k.n || 'item').split(' ')[0] + '-pad', _w: 1, L: V ? 'H' : 'V', p: V ? [0, 0, 0, r1(off)] : [r1(off), 0, 0, 0], k: [k],
          x: V ? lead : k.x, y: V ? k.y : lead, w: V ? k.w + off : k.w, h: V ? k.h : k.h + off, s: 'HH' };
        if (!al || al === (n.ia || 'MIN')) return k;
        return { t: 'F', n: (k.n || 'item').split(' ')[0] + '-' + (V ? 'row' : 'col'), _w: 1, L: V ? 'H' : 'V', ja: al, ia: 'C', k: [k],
          x: V ? lead : k.x, y: V ? k.y : lead, w: V ? cw : k.w, h: V ? k.h : ch, s: V ? 'FH' : 'HF' };
      });
    }
  }

  const root = walk(phone, null);
  root.x = 0; root.y = 0;
  // 내용에 맞춰 줄어드는(hug) 프레임 안에서는 자식이 채우기(FILL)를 하지 않는다 · Figma에서 폭이 고정돼 글이 접히는 것을 막음
  const unfill = (n, isRoot) => {
    if (n.t !== 'F' || !n.k) return;
    const s = n.s || 'HH';
    if (!isRoot && !n.abs && n.L === 'V' && s[0] === 'H') {
      const conv = [];
      n.k.forEach(k => { if (k.t !== 'SP' && !k._w && (k.s || 'HH')[0] === 'F') { k.s = 'H' + (k.s || 'HH')[1]; if (k.t === 'T') { k.tw = k.ml ? 'X' : 'H'; conv.push(k); } } });
      const al = [...new Set(conv.map(k => k.al || 'L'))];
      if (conv.length && al.length === 1 && al[0] !== 'L') n.ia = al[0] === 'R' ? 'MAX' : 'C';
    }
    if (!isRoot && !n.abs && n.L === 'H' && s[1] === 'H') n.k.forEach(k => { if (k.t !== 'SP' && !k._w && (k.s || 'HH')[1] === 'F') k.s = (k.s || 'HH')[0] + 'H'; });
    if (!isRoot && n.L === 'V' && (n.s || 'HH')[0] === 'H') {
      const ts = n.k.filter(k => k.t === 'T');
      const al = [...new Set(ts.map(k => k.al || 'L'))];
      if (ts.length && ts.length === n.k.filter(k => k.t !== 'SP').length && al.length === 1 && al[0] !== 'L') n.ia = al[0] === 'R' ? 'MAX' : 'C';
    }
    n.k.forEach(k => unfill(k, false));
  };
  unfill(root, true);
  for (const [cb, n] of pending) {
    const host = nodeOf.get(cb) || root;
    n.s = 'XX';
    host.k.push(n);
  }
  // 압축: 글꼴 표 · 기본값 생략 · 흐름 자식 좌표 생략
  const S = [], SK = {};
  const sidx = t => { const k = JSON.stringify(t); if (!(k in SK)) { SK[k] = S.length; S.push(t); } return SK[k]; };
  const compact = (n, parentL) => {
    const o = {};
    for (const [k, v] of Object.entries(n)) {
      if (k === '_el' || k === '_block' || k === '_ph' || k === '_w' || v === undefined || v === null) continue;
      if (k === 'y_') { o.f = sidx(v); continue; }
      if (k === 'r' && n.t === 'T') { o.r = v.map(([x, st]) => [x, sidx(st)]); continue; }
      if (k === 'k') { o.k = v.map(c => compact(c, n.L)); continue; }
      o[k] = v;
    }
    if (o.t === 'T') delete o.n;
    if (o.p && o.p.every(v => !v)) delete o.p;
    if (o.g === 0) delete o.g;
    if (o.ja === 'MIN') delete o.ja;
    if (o.ia === 'MIN') delete o.ia;
    if (o.al === 'L') delete o.al;
    if (o.tw === 'H') delete o.tw;
    if (o.s === 'HH') delete o.s;
    if (parentL && parentL !== 'N' && !o.abs) { delete o.x; delete o.y; }
    if (o.t === 'SP') { delete o.x; delete o.y; delete o.w; delete o.h; }
    return o;
  };
  const out = compact(root, null);
  out.S = S;
  return out;
}

/* ---------- 화면 목록 (render.js와 같은 순서·상태) ---------- */
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'ko-KR' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route('**/fonts.googleapis.com/**', r => r.abort());
  await page.route('**/fonts.gstatic.com/**', r => r.abort());
  await page.goto('file://' + path.resolve(__dirname, '../app/index.html'));
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const FD = process.env.FONT_DIR || '';
  const fontCss = () => {
    if (!FD) return '';
    const ff = (fam, file, w) => `@font-face{font-family:"${fam}";font-weight:${w};src:url("file://${FD}/${file}") format("woff2")}`;
    const kr = w => [ff('Noto Sans KR', `@fontsource/noto-sans-kr/files/noto-sans-kr-korean-${w}-normal.woff2`, w), ff('Noto Sans KR', `@fontsource/noto-sans-kr/files/noto-sans-kr-latin-${w}-normal.woff2`, w)].join('');
    return kr(400) + kr(500) + kr(700) + [400, 500, 700].map(w => ff('Archivo', `@fontsource/archivo/files/archivo-latin-${w}-normal.woff2`, w)).join('');
  };
  const prep = async () => {
    await page.addStyleTag({ content: fontCss() + '.desk{padding:0!important}.phone{border:0!important;border-radius:0!important}.demo{display:none!important}' });
    await page.evaluate(() => document.fonts.ready);
  };
  await prep();
  await page.waitForTimeout(400);
  const go = async h => { await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(300); };
  const ev = async (fn, arg) => { await page.evaluate(fn, arg); await page.waitForTimeout(300); };
  const done = [];
  const snap = async (id, wait = 0) => {
    if (ONLY.length && !ONLY.includes(id)) return;
    if (wait) await page.waitForTimeout(wait);
    await page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur(); document.getElementById('view').scrollTo(0, 0); });
    const j = await page.evaluate(extract);
    j.n = id;
    const s = JSON.stringify(j, (k, v) => (k === 'cut' ? undefined : v)).replace(/\u2028/g, '\\u2028');
    fs.writeFileSync(path.join(OUT, id + '.json'), s);
    await page.screenshot({ path: path.join(OUT, id + '.png') });
    done.push(`${id} ${(s.length / 1024).toFixed(1)}KB`);
  };
  // 동행자
  await go('#/find'); await snap('A-find');
  await ev(() => { findAct = 'all'; }); await go('#/find/2'); await snap('A-find-empty');
  await go('#/session/s1'); await snap('B-session-walk');
  await go('#/session/s3'); await snap('B-session-bike');
  await go('#/session/s1'); await ev(() => applySheet('s1')); await snap('B1-apply-sheet');
  await ev(() => doApply('s1')); await snap('B-session-applied-today');
  // r6 · 채팅 목록(안 읽은 수 배지) · 알림 · 검색 · 동네 선택 시트
  await go('#/chats'); await snap('I-chats');
  await go('#/notifications'); await snap('J-notifications');
  await go('#/search'); await snap('K-search');
  await ev(() => setSearch('망원')); await snap('K-search-results');
  await ev(() => { searchQ = ''; });
  await go('#/find'); await ev(() => guSheet()); await snap('A1-gu-sheet');
  await ev(() => closeSheet());
  await go('#/session/s1/chat'); await snap('H-chat');
  await ev(() => msgSheet('s1', 1)); await snap('H-msg-sheet');
  await ev(() => reportSheet('s1', 1)); await snap('F-report-msg');
  await ev(() => closeSheet());
  await go('#/today/s1'); await snap('C-today-before');
  await ev(() => checkIn('s1')); await snap('C-today-going');
  await ev(() => endSession('s1')); await snap('C-today-done');
  await go('#/map'); await snap('D-map', 1500);
  await ev(() => courseSheet('c3')); await snap('D1-course-sheet');
  await ev(() => closeSheet());
  // 나
  await go('#/me'); await snap('G-me');
  await go('#/me/edit'); await snap('G1-edit');
  await go('#/me/settings'); await snap('G2-settings');
  // 길잡이
  await ev(() => resetAll());
  await go('#/host/new'); await snap('E0-verify');
  await ev(() => { S.verified = true; save(); }); await go('#/host/new/1'); await ev(() => { H.act = 'walk'; render(); }); await snap('E1-activity');
  await go('#/host/new/2'); await ev(() => { H.courseMode = 'pick'; H.course = 'c1'; H.e = ''; render(); }); await snap('E2-course');
  await go('#/host/new/3'); await ev(() => { H.d = 0; render(); }); await snap('E3-when');
  await go('#/host/new/4'); await snap('E4-preview');
  await ev(() => createSession()); await page.waitForTimeout(300); await snap('E5-created');
  const hid = await page.evaluate(() => S.created[S.created.length - 1].id);
  await ev(() => closeSheet());
  await go('#/find'); await snap('A-find-host-pinned');
  await go('#/host/today/' + hid); await ev(i => { hostSimCheck(i); hostSimCheck(i); }, hid); await snap('Cp-host-checked');
  await ev(i => hostStart(i), hid); await ev(i => hostEnd(i), hid); await snap('Cp-host-ended');
  await ev(i => doCloseChat(i), hid); await go('#/session/' + hid + '/chat'); await snap('H-chat-closed');
  await browser.close();
  console.log(done.join('\n'));
  if (errors.length) console.log('page errors:', errors);
})().catch(e => { console.error(e); process.exit(1); });
