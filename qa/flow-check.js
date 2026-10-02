// r4 상태 흐름 검증 · node qa/flow-check.js
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.route('**/fonts.g*/**', r => r.abort());
  await p.goto('file://' + path.resolve(__dirname, '../app/index.html')); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
  const R = {}; const go = async h => { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(250); };
  const txt = () => p.evaluate(() => document.getElementById('view').innerText);
  // 1 신청 → 대화 → 보내기 → 취소
  await p.evaluate(() => doApply('s1')); await go('#/session/s1/chat');
  await p.fill('#msg-in', '곧 도착해요'); await p.click('#msg-send'); await p.waitForTimeout(200);
  R.sent = (await txt()).includes('곧 도착해요');
  await p.evaluate(() => doCancel('s1')); await go('#/session/s1/chat');
  R.chatBlockedAfterCancel = (await txt()).includes('신청한 사람만');
  await go('#/find'); R.pinnedGone = !(await txt()).includes('회차 대화방');
  // 2 초안은 방마다
  await p.evaluate(() => { S.applied.push('s1', 's2'); save(); }); await go('#/session/s1/chat'); await p.fill('#msg-in', '초안A');
  await go('#/session/s2/chat'); R.draftPerRoom = (await p.inputValue('#msg-in')) === '';
  // 3 길잡이 흐름 + 새 코스 + 새로고침
  await p.evaluate(() => { resetAll(); S.verified = true; save(); H = newDraft(); H.act = 'jog'; H.courseMode = 'new'; H.start = '합정역 7번 출구'; H.end = '당인리 발전소 앞'; H.km = '2.4'; H.d = 1; H.t = '19:00'; H.e = '19:30'; H.cap = 6; createSession(); });
  await p.waitForTimeout(300); const hid = await p.evaluate(() => S.created[0].id);
  await p.reload(); await p.waitForTimeout(300); await go('#/find'); R.findAfterReload = (await txt()).includes('합정역 7번 출구');
  await go('#/map'); R.mapAfterReload = (await p.$$('.map svg')).length === 1;
  // 뒤로가기로 /host/new/4 복귀 시 가드
  await go('#/host/new/4'); await p.waitForTimeout(300); R.guardTo = await p.evaluate(() => location.hash);
  // 당일 흐름 (오늘 회차로 새로 열기)
  await p.evaluate(() => { H = newDraft(); H.act = 'walk'; H.courseMode = 'pick'; H.course = 'c1'; H.d = 0; H.t = '19:40'; H.e = ''; });
  await go('#/host/new/3'); R.suggestedEnd = await p.evaluate(() => selTime('he2'));
  // 출발을 바꾸면(해산을 직접 고치기 전) 해산 제안도 따라 움직인다 · 10분 단위로 올림
  await p.selectOption('#hth', '20'); await p.waitForTimeout(100); R.startMovesEnd = await p.evaluate(() => selTime('he2'));
  await p.selectOption('#hth', '19'); await p.waitForTimeout(100);
  const setEnd = async (h, m) => { await p.selectOption('#he2h', h); await p.selectOption('#he2m', m); await p.waitForTimeout(100); };
  await setEnd('19', '00'); R.endErr = await p.evaluate(() => [document.getElementById('cta3').disabled, document.getElementById('cta3').textContent, !document.getElementById('he2msg').hidden, document.getElementById('he2h').getAttribute('aria-invalid')]);
  await setEnd('20', '30'); R.endOk = await p.evaluate(() => document.getElementById('cta3').disabled);
  // 자정: 손대지 않은 제안은 23:50을 넘지 않는다
  R.midnight = await p.evaluate(() => [suggestEnd('23:30', 45), suggestEnd('21:40', 45), endHint('23:30', 45).includes('자정 전')]);
  // 24시간 표기: 선택창 글자가 기기 언어와 관계없이 "19"·"30" 숫자뿐
  R.time24 = await p.evaluate(() => [...document.querySelectorAll('.tsel select')].every(el => /^\d{2}$/.test(el.options[el.selectedIndex].text)) && document.querySelectorAll('input[type=time]').length === 0);
  await p.evaluate(() => createSession()); await p.waitForTimeout(300); const tid = await p.evaluate(() => S.created[S.created.length - 1].id);
  await p.evaluate(i => { hostSimCheck(i); hostSimCheck(i); hostStart(i); hostEnd(i); doCloseChat(i); }, tid);
  await go('#/session/' + tid + '/chat'); R.closed = (await txt()).includes('대화방을 닫았어요');
  // 회차 취소 뒤 길잡이도 상태·대화 확인
  await p.evaluate(i => hostCancel(i), hid); await p.waitForTimeout(300); R.cancelNav = await p.evaluate(() => location.hash);
  R.cancelBadge = (await txt()).includes('취소됨'); await go('#/session/' + hid + '/chat'); R.cancelChat = (await txt()).includes('회차가 취소됐어요');
  await go('#/me'); R.meShowsCancelled = (await txt()).includes('취소됨');
  // 4 새 코스 입력: 포커스 유지 (render 없음)
  await p.evaluate(() => { H = newDraft(); H.act = 'walk'; }); await go('#/host/new/2'); await p.click('[data-fk="enew"]'); await p.waitForTimeout(150);
  await p.fill('#hs', '망원역'); await p.click('#he'); await p.keyboard.type('망원나들목'); R.endTyped = await p.inputValue('#he');
  await p.click('#hk'); await p.keyboard.type('abc'); await p.click('#hs'); await p.waitForTimeout(100);
  R.kmErr = await p.evaluate(() => [document.getElementById('hk').getAttribute('aria-invalid'), document.getElementById('cta2').textContent]);
  // 5 프로필: 한 번 탭으로 저장
  await go('#/me/edit'); await p.fill('#nick', '노을러너'); await p.click('#savebtn'); await p.waitForTimeout(250);
  R.saveOneTap = await p.evaluate(() => S.profile.nick === '노을러너' && location.hash === '#/me');
  await go('#/me/edit'); await p.fill('#nick', 'a'); await p.click('#gu'); await p.waitForTimeout(100);
  R.nickErr = await p.evaluate(() => [document.getElementById('nick').getAttribute('aria-invalid'), document.getElementById('savebtn').disabled]);
  await p.evaluate(() => { PD.nick = '노을러너'; PD.gu = '서대문구'; saveProfile(); }); await go('#/find');
  R.guChange = (await txt()).includes('서대문구 모임');
  // 6 코스 시트 → 이 코스로 회차 열기
  await p.evaluate(() => { S.profile.gu = '마포구'; save(); }); await go('#/map');
  // 열린 회차가 없는 코스 → "이 코스로 회차 열기", 있는 코스(c1) → "이 코스로 열린 회차"
  const noOpen = await p.evaluate(() => (allCourses().find(c => !openSessionsOf(c.id).length) || {}).id);
  await p.evaluate(i => courseSheet(i), noOpen); await p.waitForTimeout(200);
  R.courseSheetOpenCTA = await p.evaluate(() => !!document.querySelector('.sheet') && document.querySelector('.sheet').innerText.includes('이 코스로 회차 열기'));
  await p.evaluate(() => { closeSheet(); courseSheet('c1'); }); await p.waitForTimeout(200);
  R.courseSheetListsOpen = await p.evaluate(() => document.querySelector('.sheet').innerText.includes('이 코스로 열린 회차'));
  await p.evaluate(() => closeSheet());
  // 7 .ics
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 3000 }).catch(() => null), p.evaluate(() => icsFor('s2'))]);
  if (dl) { const t = require('fs').readFileSync(await dl.path(), 'utf8'); R.ics = /DTSTART;TZID=Asia\/Seoul:20260930T190000/.test(t) && /DTEND;TZID=Asia\/Seoul:20260930T193000/.test(t) && !t.includes('undefined'); }
  // 8 r6: 하단 탭 4 · 채팅 목록 · 알림 · 동네 선택 · 검색
  await p.evaluate(() => { resetAll(); S.applied = ['s1', 's2']; save(); }); await go('#/find');
  const tabs = await p.evaluate(() => [...document.querySelectorAll('#tabbar button')].map(x => x.querySelector('span:not(.ico):not(.sr):not(.count)').textContent));
  R.tabs4 = tabs.join('·') === '찾기·지도·채팅·나';
  const badge = () => p.evaluate(() => { const c = document.querySelector('#tabbar .count'); return c ? c.textContent : ''; });
  R.chatBadge = await badge();                                       // s1 길잡이·동행자 3 + s2 길잡이 1 = 4
  await go('#/chats'); R.chatRooms = await p.evaluate(() => document.querySelectorAll('.list-row.room').length);
  R.chatNoNick = await p.evaluate(() => !/저녁바람|망원산책|퇴근후한바퀴/.test(document.getElementById('view').innerText));   // 목록에 닉네임 없음(F-12)
  await go('#/session/s1/chat'); await go('#/chats'); R.chatBadgeAfterRead = await badge();   // 4 - 3 = 1
  await go('#/find'); R.bellDot = await p.evaluate(() => !!document.querySelector('.topbar .dot-new'));
  await go('#/notifications'); R.notiRows = await p.evaluate(() => document.querySelectorAll('.list-row').length);
  R.notiNoRelative = await p.evaluate(() => !/뒤 출발|전에|후에|분 뒤|시간 뒤/.test(document.getElementById('view').innerText) && document.querySelector('.list-row .stamp').textContent.trim() === '9/29 (화) 18:55');   // 받은 시각 >= 신청 시각
  R.tabCurrentOnlyRoot = await p.evaluate(() => !document.querySelector('#tabbar [aria-current]'));   // 탭 밖 화면엔 aria-current 없음
  await go('#/chats'); R.tabCurrentOnRoot = await p.evaluate(() => { const c = document.querySelector('#tabbar [aria-current="page"]'); return c ? c.children[1].textContent : ''; });
  await go('#/find'); R.bellClearedAfterRead = await p.evaluate(() => !document.querySelector('.topbar .dot-new'));
  await p.evaluate(() => { guSheet(); }); await p.waitForTimeout(150); await p.evaluate(() => setGu('서대문구')); await p.waitForTimeout(250);
  R.guFocusBack = await p.evaluate(() => document.activeElement && document.activeElement.classList.contains('locbtn'));
  R.guChanged = await p.evaluate(() => [document.querySelector('.locbtn span').textContent, S.profile.gu, document.querySelector('h1').textContent].join('/'));
  await p.evaluate(() => setGu('마포구')); await p.waitForTimeout(200);
  await go('#/search'); const sBefore = await p.evaluateHandle(() => document.getElementById('search-in'));
  R.searchFocus = await p.evaluate(() => document.activeElement && document.activeElement.id === 'search-in');
  await p.keyboard.type('망원'); await p.waitForTimeout(150);
  R.searchKeepsInput = await p.evaluate(el => el === document.getElementById('search-in') && document.activeElement === el, sBefore);   // 입력 중 전체 다시 그리기 없음
  R.searchResults = await p.evaluate(() => [document.querySelectorAll('#search-results .card').length, document.querySelectorAll('#search-results .list-row').length].join('/'));
  R.searchCountLive = await p.evaluate(() => [document.getElementById('search-count').textContent, document.getElementById('search-results').hasAttribute('aria-live')].join('/'));
  await p.fill('#search-in', '없는코스'); await p.waitForTimeout(150); R.searchNone = await p.evaluate(() => document.getElementById('search-results').innerText.includes('맞는 회차와 코스가 없어요'));
  // 9 r7: 대화 입력 바 (DESIGN 3d v1.5) · 문구 칩은 가로 스크롤 없이 줄바꿈, 줄마다 입력 줄 좌우 끝까지 · 보내기 = 입력창 높이
  //   overscroll (DESIGN 7칸): 폰 폭은 html · #view none + 시트 contain, 데스크톱 1440은 모두 기본값(폰 위에서 굴려도 페이지가 내려감)
  const overscrollOf = pg => pg.evaluate(() => { const sh = document.querySelector('.sheet'); return [document.documentElement, document.getElementById('view'), sh].map(e => e ? getComputedStyle(e).overscrollBehaviorY : '시트 없음').join('/'); });
  await go('#/session/s1/chat');
  const cb = await p.evaluate(() => {
    const r = q => document.querySelector(q).getBoundingClientRect(); const s = document.querySelector('.composer .strip'); const send = r('.composer .send'), inp = r('.composer .in');
    const rows = {}; [...s.children].forEach(c => { const b = c.getBoundingClientRect(), k = Math.round(b.top); rows[k] = rows[k] ? [Math.min(rows[k][0], b.left), Math.max(rows[k][1], b.right)] : [b.left, b.right]; });
    return { noScroll: s.scrollWidth <= s.clientWidth, rowsFill: Object.values(rows).every(([l, rt]) => Math.abs(l - inp.left) < 1 && Math.abs(rt - send.right) < 1),
      sendEq: Math.abs(send.top - inp.top) < 1 && Math.abs(send.bottom - inp.bottom) < 1 };
  });
  R.quickNoScroll = cb.noScroll; R.quickRowsFill = cb.rowsFill; R.sendMatchesInput = cb.sendEq;
  await p.evaluate(() => msgSheet('s1', 1)); await p.waitForTimeout(150); R.overscroll = await overscrollOf(p); await p.evaluate(() => closeSheet());
  const dk = await b.newPage({ viewport: { width: 1440, height: 900 } }); dk.on('pageerror', e => errs.push('1440 ' + e)); await dk.route('**/fonts.g*/**', r => r.abort());
  await dk.goto('file://' + path.resolve(__dirname, '../app/index.html')); await dk.evaluate(() => { S.applied = ['s1']; save(); location.hash = '#/session/s1/chat'; }); await dk.waitForTimeout(250);
  await dk.evaluate(() => msgSheet('s1', 1)); await dk.waitForTimeout(150); R.overscrollDesk = await overscrollOf(dk);
  // 10 r8: "오늘" 없음 (MANUAL v1.7 §11 · DESIGN 7칸) · 화면 글자와 읽기 이름(aria-label) 모두. 찾기(고정 카드 · 날짜 줄) · 회차 상세 · 데모 패널
  const noToday = pg => pg.evaluate(() => { const t = document.body.innerText + ' ' + [...document.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label')).join(' '); return !/오늘/.test(t); });
  await go('#/find'); const nt1 = await noToday(p); await go('#/session/s1'); const nt2 = await noToday(p);
  await dk.evaluate(() => closeSheet()); const nt3 = await noToday(dk); await dk.close();
  R.noToday = nt1 && nt2 && nt3;
  R.errors = errs;
  console.log(JSON.stringify(R, null, 1)); await b.close();
  // 판정 · 불리언은 true여야 통과(endOk만 false = 해산 시각이 맞으면 버튼이 풀림) · 값 항목은 아래 기대값과 같아야 통과
  const EQ = { guardTo: '#/host/new/1', suggestedEnd: '20:30', startMovesEnd: '21:30', endTyped: '망원나들목', chatBadge: '4', chatRooms: 2, chatBadgeAfterRead: '1', notiRows: 1, tabCurrentOnRoot: '채팅', guChanged: '서대문구/서대문구/서대문구 모임', searchResults: '2/2', searchCountLive: '열린 회차 2개, 코스 2개/false', overscroll: 'none/none/contain', overscrollDesk: 'auto/auto/auto',
    endErr: [true, '해산은 출발보다 늦어야 해요', true, 'true'], midnight: ['23:50', '22:30', true], kmErr: ['true', '거리를 숫자로 넣어 주세요'], nickErr: ['true', true] };
  const fails = [];
  for (const [k, v] of Object.entries(R)) {
    if (k in EQ) { if (JSON.stringify(v) !== JSON.stringify(EQ[k])) fails.push(k); }
    else if (typeof v === 'boolean') { if (v !== (k !== 'endOk')) fails.push(k); }
  }
  for (const k of Object.keys(EQ)) if (!(k in R)) fails.push(k + '(없음)');
  if (!String(R.cancelNav || '').startsWith('#/session/')) fails.push('cancelNav');
  if (errs.length) fails.push('errors');
  if (fails.length) { console.error('FAIL ' + fails.join(', ')); process.exitCode = 1; } else console.log('PASS ' + Object.keys(R).length + '항목');
})().catch(e => { console.error(e); process.exitCode = 1; });
