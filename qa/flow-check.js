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
  await go('#/host/new/3'); R.suggestedEnd = await p.inputValue('#he2');
  await p.fill('#he2', '19:00'); await p.waitForTimeout(100); R.endErr = await p.evaluate(() => [document.getElementById('cta3').disabled, document.getElementById('cta3').textContent, !document.getElementById('he2msg').hidden]);
  await p.fill('#he2', '20:30'); await p.waitForTimeout(100); R.endOk = await p.evaluate(() => document.getElementById('cta3').disabled);
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
  await p.evaluate(() => courseSheet('c1')); await p.waitForTimeout(200);
  const hasOpen = await p.evaluate(() => !!document.querySelector('.sheet') && document.querySelector('.sheet').innerText.includes('이 코스로 회차 열기'));
  R.courseSheetOpenCTA = hasOpen;
  // 7 .ics
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 3000 }).catch(() => null), p.evaluate(() => icsFor('s2'))]);
  if (dl) { const t = require('fs').readFileSync(await dl.path(), 'utf8'); R.ics = /DTSTART;TZID=Asia\/Seoul:20260930T190000/.test(t) && /DTEND;TZID=Asia\/Seoul:20260930T193000/.test(t) && !t.includes('undefined'); }
  R.errors = errs;
  console.log(JSON.stringify(R, null, 1)); await b.close();
})();
