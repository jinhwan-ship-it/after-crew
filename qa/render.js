// impeccable · 390×844 렌더 + 측정 · node qa/render.js r4   (FONT_DIR=<@fontsource node_modules> 있으면 로컬 글꼴 주입)
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
  await page.route('**/fonts.googleapis.com/**', r => r.abort());
  await page.route('**/fonts.gstatic.com/**', r => r.abort());
  await page.goto(FILE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const FD = process.env.FONT_DIR || '';
  if (FD) {
    const ff = (fam, file, w) => `@font-face{font-family:"${fam}";font-weight:${w};src:url("file://${FD}/${file}") format("woff2")}`;
    const kr = w => [ff('Noto Sans KR', `@fontsource/noto-sans-kr/files/noto-sans-kr-korean-${w}-normal.woff2`, w), ff('Noto Sans KR', `@fontsource/noto-sans-kr/files/noto-sans-kr-latin-${w}-normal.woff2`, w)].join('');
    await page.addStyleTag({ content: kr(400) + kr(500) + kr(700) + [400, 500, 700].map(w => ff('Archivo', `@fontsource/archivo/files/archivo-latin-${w}-normal.woff2`, w)).join('') });
    await page.evaluate(() => document.fonts.ready);
  }
  await page.waitForTimeout(500);

  const go = async h => { await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(280); };
  const ev = async (fn, arg) => { await page.evaluate(fn, arg); await page.waitForTimeout(280); };
  async function shot(id, { wait = 0 } = {}) {
    if (wait) await page.waitForTimeout(wait);
    const m = await page.evaluate(() => {
      const phone = document.getElementById('phone'), view = document.getElementById('view');
      const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const els = [...phone.querySelectorAll('button,a,input,select,[role="button"]')].filter(vis);
      const small = els.filter(el => { if (el.matches('input,select,.rt-hit')) return false; const r = el.getBoundingClientRect(); const hitH = el.matches('.chip,.toggle') ? 44 : r.height; return hitH < 44 || r.width < 44; })
        .map(el => `${(el.className && el.className.baseVal === undefined ? el.className : el.tagName)}:${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 10)} ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`);
      const prim = [...phone.querySelectorAll('.btn.primary')].filter(vis).map(b => b.textContent.trim());
      const accentUse = [...phone.querySelectorAll('*')].filter(vis).filter(el => { const cs = getComputedStyle(el); return cs.backgroundColor === 'rgb(255, 181, 71)' || cs.color === 'rgb(255, 181, 71)' || cs.stroke === 'rgb(255, 181, 71)'; }).length;
      const h1 = view.querySelector('h1');
      return { sw: view.scrollWidth, cw: view.clientWidth, dw: document.documentElement.scrollWidth, small, prim, accentUse, title: h1 ? h1.textContent.trim() : '' };
    });
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
  // 360
  await page.setViewportSize({ width: 360, height: 780 });
  const w360 = {};
  for (const [id, h] of [['A-find', '#/find'], ['B-session', '#/session/s3'], ['D-map', '#/map'], ['H-chat', '#/session/s1/chat'], ['I-chats', '#/chats'], ['K-search', '#/search']]) {
    if (id === 'H-chat') await ev(() => { if (!S.applied.includes('s1')) { S.applied.push('s1'); save(); } });
    await go(h); await page.waitForTimeout(200);
    w360[id] = await page.evaluate(() => [document.documentElement.scrollWidth, document.getElementById('view').scrollWidth, document.getElementById('view').clientWidth].join('/'));
    await page.screenshot({ path: path.join(OUT, `${ROUND}-360-${id}.png`), clip: { x: 0, y: 0, width: 360, height: 780 } });
  }
  await browser.close();

  const L = [`# impeccable ${ROUND} · 390×844`, `page errors: ${errors.length}` + (errors.length ? '\n' + errors.map(e => '  - ' + e).join('\n') : ''),
    `360 (doc/view/client): ${Object.entries(w360).map(([k, v]) => k + ' ' + v).join(' · ')}`, '',
    '| 화면 | 가로 스크롤 | 주 버튼 | accent 요소 수 | h1 | 44px 미만 |', '|---|---|---|---|---|---|'];
  for (const r of report) {
    const hs = (r.sw > r.cw || r.dw > 390) ? `✗ ${r.sw}/${r.cw} doc ${r.dw}` : '○';
    const pb = r.prim.length <= 1 ? `${r.prim.length} ${r.prim.join('')}` : `✗ ${r.prim.length}: ${r.prim.join(' / ')}`;
    L.push(`| ${r.id} | ${hs} | ${pb} | ${r.accentUse} | ${r.title || '✗'} | ${r.small.length ? r.small.join(', ') : '○'} |`);
  }
  fs.writeFileSync(path.join(__dirname, `${ROUND}-report.md`), L.join('\n') + '\n');
  console.log(L.join('\n'));
})().catch(e => { console.error(e); process.exit(1); });
