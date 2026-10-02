// impeccable · 390×844 렌더 + 측정 · node qa/render.js r8   (FONT_DIR=<@fontsource node_modules> 있으면 로컬 글꼴 주입, WEBFONT=1이면 Google Fonts)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROUND = process.argv[2] || 'r4';
const FILE = 'file://' + path.resolve(__dirname, '../app/index.html');
const OUT = path.resolve(__dirname, '../shots');
fs.mkdirSync(OUT, { recursive: true });
const report = [];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_|net::/.test(m.text())) errors.push(m.text()); });
  // WEBFONT=1: Google Fonts를 그대로 받아 실제 글꼴(Noto Sans KR · Archivo)로 렌더. 아니면 막고 FONT_DIR 또는 대체 글꼴
  const WEB = process.env.WEBFONT === '1';
  if (!WEB) {
    await page.route('**/fonts.googleapis.com/**', r => r.abort());
    await page.route('**/fonts.gstatic.com/**', r => r.abort());
  }
  await page.goto(FILE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  if (WEB) await page.evaluate(() => document.fonts.ready);
  const FD = process.env.FONT_DIR || '';
  if (FD) {
    const ff = (fam, file, w) => `@font-face{font-family:"${fam}";font-weight:${w};src:url("file://${FD}/${file}") format("woff2")}`;
    const kr = w => [ff('Noto Sans KR', `@fontsource/noto-sans-kr/files/noto-sans-kr-korean-${w}-normal.woff2`, w), ff('Noto Sans KR', `@fontsource/noto-sans-kr/files/noto-sans-kr-latin-${w}-normal.woff2`, w)].join('');
    await page.addStyleTag({ content: kr(400) + kr(500) + kr(700) + [400, 500, 700].map(w => ff('Archivo', `@fontsource/archivo/files/archivo-latin-${w}-normal.woff2`, w)).join('') });
    await page.evaluate(() => document.fonts.ready);
  }
  await page.waitForTimeout(500);

  // 글자 여백 침범: 버튼 · 칩 안 내용(글자 · 아이콘)이 좌우 패딩 안쪽 선을 넘은 폭. scrollWidth는 패딩까지만 들어가면 못 잡는다
  // (r8 독립 검증: 360 바이크 캘린더 버튼 5px). 잘라 내는 자식(overflow ≠ visible, 말줄임)은 그 상자만, 절대 배치 장식은 뺀다
  const TIGHT = () => {
    const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    return [...document.querySelectorAll('#phone :is(.btn,.chip,.textbtn,.locbtn,.status-pill,.tabs button)')].filter(vis).map(el => {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      const L = r.left + el.clientLeft + parseFloat(cs.paddingLeft), R = r.left + el.clientLeft + el.clientWidth - parseFloat(cs.paddingRight);
      let x0 = Infinity, x1 = -Infinity;
      const add = rs => { for (const q of rs) if (q.width > 0 && q.height > 0) { x0 = Math.min(x0, q.left); x1 = Math.max(x1, q.right); } };
      const walk = n => { for (const c of n.childNodes) {
        if (c.nodeType === 3) { const g = document.createRange(); g.selectNodeContents(c); add(g.getClientRects()); }
        else if (c.nodeType === 1) { const k = getComputedStyle(c); if (k.display === 'none' || k.position === 'absolute' || k.position === 'fixed') continue; if (k.overflowX !== 'visible' || c instanceof SVGElement) add([c.getBoundingClientRect()]); else walk(c); }
      } };
      walk(el);
      return [el, x1 < x0 ? 0 : Math.max(L - x0, x1 - R)];
    }).filter(([, d]) => d > 0.5).map(([el, d]) => `${(el.getAttribute('aria-label') || el.textContent).trim().slice(0, 12)} +${d.toFixed(1)}`);
  };
  // 숫자 + 단위 · 시각이 두 줄로 갈라짐(DESIGN 7칸 "숫자만 다음 줄로" DON'T, r8 360 "4.9k / m"): 인라인은 조각 수, 블록은 높이 > 줄 높이 1.5배
  const SPLIT = () => [...document.querySelectorAll('#phone :is(.num-l,.hero-num,.time)')].filter(el => el.offsetWidth).filter(el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'inline') return el.getClientRects().length > 1;
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
    return el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) > lh * 1.5;
  }).map(el => el.textContent.trim().slice(0, 16));
  const go = async h => { await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(280); };
  const ev = async (fn, arg) => { await page.evaluate(fn, arg); await page.waitForTimeout(280); };
  async function shot(id, { wait = 0 } = {}) {
    if (wait) await page.waitForTimeout(wait);
    const m = await page.evaluate(() => {
      const phone = document.getElementById('phone'), view = document.getElementById('view');
      const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const els = [...phone.querySelectorAll('button,a,input,select,[role="button"]')].filter(vis);
      // 터치 영역 = 경계 상자 ∪ ::before 확장(패딩 상자 기준). 안쪽 줄(#view·시트 밖까지는 안 감)이 잘라 낸 만큼 뺀다.
      // 가로 스크롤 줄은 세로만 자른다(스크롤 위치 때문에 일부만 보이는 칩은 작은 게 아님)
      const hit = el => {
        const r = el.getBoundingClientRect(); let [x0, y0, x1, y1] = [r.left, r.top, r.right, r.bottom];
        const ps = getComputedStyle(el, '::before');
        if (ps.content !== 'none' && ps.display !== 'none' && ps.position === 'absolute' && el.clientHeight) {
          const px = r.left + el.clientLeft, py = r.top + el.clientTop;
          x0 = Math.min(x0, px + parseFloat(ps.left)); y0 = Math.min(y0, py + parseFloat(ps.top));
          x1 = Math.max(x1, px + el.clientWidth - parseFloat(ps.right)); y1 = Math.max(y1, py + el.clientHeight - parseFloat(ps.bottom));
        }
        for (let a = el.parentElement; a && a.id !== 'view' && a.id !== 'phone' && !a.classList.contains('sheet'); a = a.parentElement) {
          const cs = getComputedStyle(a); const ar = a.getBoundingClientRect(); const ax = ar.left + a.clientLeft, ay = ar.top + a.clientTop;
          if (cs.overflowY !== 'visible') { y0 = Math.max(y0, ay); y1 = Math.min(y1, ay + a.clientHeight); }
          if (cs.overflowX === 'hidden' || cs.overflowX === 'clip') { x0 = Math.max(x0, ax); x1 = Math.min(x1, ax + a.clientWidth); }
        }
        return [Math.max(0, x1 - x0), Math.max(0, y1 - y0)];
      };
      const small = els.filter(el => !el.matches('input,select,.rt-hit')).map(el => [el, hit(el)]).filter(([, [w, h]]) => w < 44 || h < 44)
        .map(([el, [w, h]]) => `${(el.className && el.className.baseVal === undefined ? el.className : el.tagName)}:${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 10)} ${Math.round(w)}×${Math.round(h)}`);
      const prim = [...phone.querySelectorAll('.btn.primary')].filter(vis).map(b => b.textContent.trim());
      const accentUse = [...phone.querySelectorAll('*')].filter(vis).filter(el => { const cs = getComputedStyle(el); return cs.backgroundColor === 'rgb(255, 181, 71)' || cs.color === 'rgb(255, 181, 71)' || cs.stroke === 'rgb(255, 181, 71)'; }).length;
      const h1 = view.querySelector('h1');
      return { sw: view.scrollWidth, cw: view.clientWidth, dw: document.documentElement.scrollWidth, small, prim, accentUse, title: h1 ? h1.textContent.trim() : '' };
    });
    m.tight = await page.evaluate(TIGHT); m.split = await page.evaluate(SPLIT);
    const file = `${ROUND}-390-${id}.png`;
    await page.screenshot({ path: path.join(OUT, file), clip: { x: 0, y: 0, width: 390, height: 844 } });
    report.push({ id, file, ...m });
  }

  // A 찾기
  await go('#/find'); await shot('A-find');
  await ev(() => { findAct = 'run'; render(); }); await shot('A-find-run');
  await ev(() => { findAct = 'all'; }); await go('#/find/2'); await shot('A-find-empty');
  await go('#/chats'); await shot('I-chats-empty');
  await go('#/notifications'); await shot('J-noti-empty');
  // B 상세
  await go('#/session/s3'); await shot('B-session-bike');
  await ev(() => document.getElementById('view').scrollTo(0, 560)); await shot('B-session-bike-scroll');
  await go('#/session/s1'); await shot('B-session-walk');
  await ev(() => applySheet('s1')); await shot('B1-apply-sheet');
  await ev(() => doApply('s1')); await shot('B-session-applied-today');
  // H 대화방
  await go('#/session/s1/chat'); await shot('H-chat');
  await ev(() => useQuick('s1', '조금 늦어요')); await shot('H-chat-quick');
  await ev(() => sendMsg('s1')); await shot('H-chat-sent');
  await ev(() => msgSheet('s1', 1)); await shot('H-msg-sheet');
  await ev(() => reportSheet('s1', 1)); await shot('F-report-msg');
  await ev(() => closeSheet());
  await go('#/find'); await shot('A-find-pinned');
  await go('#/chats'); await shot('I-chats');
  await go('#/notifications'); await shot('J-notifications');
  await go('#/find'); await ev(() => guSheet()); await shot('A1-gu-sheet'); await ev(() => closeSheet());
  await go('#/search'); await shot('K-search');
  await page.fill('#search-in', '망원'); await page.waitForTimeout(250); await shot('K-search-results');
  await page.fill('#search-in', '없는코스'); await page.waitForTimeout(250); await shot('K-search-none');
  await ev(() => { searchQ = ''; });
  // C 당일
  await go('#/today/s1'); await shot('C-today-before');
  await ev(() => checkIn('s1')); await shot('C-today-going');
  await ev(() => endSession('s1')); await shot('C-today-done');
  // D 지도 (그리기 연출 끝난 뒤)
  await go('#/map'); await shot('D-map', { wait: 1400 });
  await ev(() => document.getElementById('view').scrollTo(0, 520)); await shot('D-map-list');
  await ev(() => courseSheet('c3')); await shot('D1-course-sheet');
  await ev(() => closeSheet());
  await ev(() => courseSheet('c7')); await shot('D1-course-sheet-other');
  await ev(() => closeSheet());
  // G 나
  await go('#/me'); await shot('G-me');
  await go('#/me/edit'); await shot('G1-edit');
  await ev(() => { PD.nick = 'a'; nickTouched = true; render(); }); await shot('G1-edit-error');
  await ev(() => { PD.nick = '노을러너'; PD.icon = 6; nickTouched = true; render(); }); await ev(() => saveProfile()); await shot('G-me-saved');
  await go('#/me/settings'); await shot('G2-settings');
  // E 길잡이
  await ev(() => resetAll());
  await go('#/host/new'); await shot('E0-verify');
  await ev(() => { S.verified = true; save(); }); await go('#/host/new/1'); await ev(() => { H.act = 'walk'; render(); }); await shot('E1-activity');
  await go('#/host/new/2'); await ev(() => { H.courseMode = 'pick'; H.course = 'c1'; H.e = ''; render(); }); await shot('E2-course');
  await go('#/host/new/3'); await ev(() => { H.d = 0; render(); }); await shot('E3-when');
  await go('#/host/new/4'); await shot('E4-preview');
  await ev(() => createSession()); await page.waitForTimeout(300); await shot('E5-created');
  const hid = await page.evaluate(() => S.created[S.created.length - 1].id);
  await ev(() => closeSheet());
  await go('#/find'); await shot('A-find-host-pinned');
  await go('#/session/' + hid + '/chat'); await shot('H-chat-host-empty');
  await go('#/host/today/' + hid); await ev(i => { hostSimCheck(i); hostSimCheck(i); }, hid); await shot('Cp-host-checked');
  await ev(i => hostStart(i), hid); await shot('Cp-host-going');
  await ev(i => hostEnd(i), hid); await shot('Cp-host-ended');
  await ev(i => closeChatSheet(i), hid); await shot('Cp-close-chat-sheet');
  await ev(i => doCloseChat(i), hid); await go('#/session/' + hid + '/chat'); await shot('H-chat-closed');
  await go('#/nope'); await shot('X-notfound');
  // 360 · 버튼이 가장 많은 회차 상세 상태(신청한 바이크 · 신청한 당일 · 내가 여는 미래 회차)도 잰다
  await page.setViewportSize({ width: 360, height: 780 });
  const w360 = {}, t360 = {};
  const apply = id => ev(i => { if (!S.applied.includes(i)) { S.applied.push(i); save(); } }, id);
  for (const [id, h, setup] of [['A-find', '#/find'], ['B-session', '#/session/s3'],
    ['B-session-bike-applied', '#/session/s3', () => apply('s3')], ['B-session-applied-today', '#/session/s1', () => apply('s1')],
    ['B-session-mine', null, () => ev(() => { S.verified = true; H = newDraft(); H.act = 'walk'; H.courseMode = 'pick'; H.course = 'c1'; H.d = 2; H.e = suggestEnd(H.t, expMin()); save(); createSession(); closeSheet(true); })],
    ['D-map', '#/map'], ['H-chat', '#/session/s1/chat', () => apply('s1')], ['I-chats', '#/chats'], ['K-search', '#/search']]) {
    if (setup) await setup();
    await go(h || '#/session/' + await page.evaluate(() => S.created[S.created.length - 1].id));
    if (setup) await ev(() => render()); // 같은 주소면 hashchange가 없어 상태가 안 그려진다
    await page.waitForTimeout(200);
    w360[id] = await page.evaluate(() => [document.documentElement.scrollWidth, document.getElementById('view').scrollWidth, document.getElementById('view').clientWidth].join('/'));
    t360[id] = [...await page.evaluate(TIGHT), ...(await page.evaluate(SPLIT)).map(x => '갈라짐 ' + x)];
    await page.screenshot({ path: path.join(OUT, `${ROUND}-360-${id}.png`), clip: { x: 0, y: 0, width: 360, height: 780 } });
  }
  await browser.close();

  const L = [`# impeccable ${ROUND} · 390×844`, `글꼴: ${WEB ? '웹폰트(Google Fonts: Noto Sans KR · Archivo)' : FD ? 'FONT_DIR 로컬(@fontsource)' : '대체 글꼴(웹폰트 막음)'} · 44px 미만 = ::before 포함 터치 영역`, `page errors: ${errors.length}` + (errors.length ? '\n' + errors.map(e => '  - ' + e).join('\n') : ''),
    `360 (doc/view/client): ${Object.entries(w360).map(([k, v]) => k + ' ' + v).join(' · ')}`,
    `360 글자 여백 침범 · 숫자 갈라짐: ${Object.values(t360).every(v => !v.length) ? '0' : Object.entries(t360).filter(([, v]) => v.length).map(([k, v]) => k + ' ' + v.join(', ')).join(' · ')}`, '',
    '| 화면 | 가로 스크롤 | 주 버튼 | accent 요소 수 | h1 | 44px 미만 | 글자 여백 침범 | 숫자 갈라짐 |', '|---|---|---|---|---|---|---|---|'];
  for (const r of report) {
    const hs = (r.sw > r.cw || r.dw > 390) ? `✗ ${r.sw}/${r.cw} doc ${r.dw}` : '○';
    const pb = r.prim.length <= 1 ? `${r.prim.length} ${r.prim.join('')}` : `✗ ${r.prim.length}: ${r.prim.join(' / ')}`;
    L.push(`| ${r.id} | ${hs} | ${pb} | ${r.accentUse} | ${r.title || '✗'} | ${r.small.length ? r.small.join(', ') : '○'} | ${r.tight.length ? '✗ ' + r.tight.join(', ') : '○'} | ${r.split.length ? '✗ ' + r.split.join(', ') : '○'} |`);
  }
  fs.writeFileSync(path.join(__dirname, `${ROUND}-report.md`), L.join('\n') + '\n');
  console.log(L.join('\n'));
})().catch(e => { console.error(e); process.exit(1); });
