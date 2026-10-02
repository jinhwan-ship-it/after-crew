// Lo-fi 주석 · 캡션 · 흐름 화살표 · 번호 주석 · 범례 (use_figma에 그대로 붙여 실행, 다시 실행하면 'ann · ' 노드만 지우고 새로 만든다)
// 파일 9eNEAWAgW4rhZ4C1QPz0Hz · 페이지 "Lo-fi r6" 149:571 · 문구 근거는 MANUAL §5 요구사항 ID와 flows/ia.md
const page = await figma.getNodeByIdAsync('149:571');
for (const st of ['Regular', 'Medium', 'Bold']) await figma.loadFontAsync({ family: 'Noto Sans KR', style: st });
const hx = h => ({ r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 });
const P = h => [{ type: 'SOLID', color: hx(h) }];
const INK = '262626', SUB = '737373', LINE = 'D4D4D4', WHITE = 'FFFFFF';
const SEC = { S1: '149:572', S2: '149:573', S3: '149:574', S4: '149:575' }, sec = {};
for (const k in SEC) sec[k] = await figma.getNodeByIdAsync(SEC[k]);
for (const p of [page, ...Object.values(sec)]) for (const c of [...p.children]) if (c.name.startsWith('ann · ')) c.remove();
const scr = (k, n) => { const s = sec[k].children.find(c => c.name === n); if (!s) throw new Error('no screen ' + n); return s; };
function T(v, size, style, color, o = {}) {
  const t = figma.createText(); t.fontName = { family: 'Noto Sans KR', style }; t.fontSize = size;
  t.lineHeight = { unit: 'PIXELS', value: Math.round(size * (o.lh || 1.5)) }; t.characters = v; t.fills = P(color);
  if (o.w) { t.textAutoResize = 'HEIGHT'; t.resize(o.w, t.height); } else t.textAutoResize = 'WIDTH_AND_HEIGHT';
  return t;
}
function AL(name, dir, gap, o = {}) {
  const f = figma.createFrame(); f.name = name; f.layoutMode = dir; f.itemSpacing = gap; f.fills = o.fill ? P(o.fill) : [];
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; if (dir === 'HORIZONTAL') f.counterAxisAlignItems = 'CENTER';
  return f;
}
function badge(n) {
  const f = figma.createFrame(); f.name = '번호 ' + n; f.resize(24, 24); f.cornerRadius = 12; f.fills = P(INK);
  f.layoutMode = 'HORIZONTAL'; f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED'; f.primaryAxisAlignItems = 'CENTER'; f.counterAxisAlignItems = 'CENTER';
  f.appendChild(T(String(n), 13, 'Bold', WHITE, { lh: 1 })); return f;
}
async function vec(name, pts, dash, parent) {
  const v = figma.createVector(); v.name = name;
  const x0 = Math.min(...pts.map(p => p[0])), y0 = Math.min(...pts.map(p => p[1]));
  await v.setVectorNetworkAsync({ vertices: pts.map((p, i) => ({ x: p[0] - x0, y: p[1] - y0, strokeCap: i === pts.length - 1 ? 'ARROW_LINES' : 'NONE' })), segments: pts.slice(1).map((_, i) => ({ start: i, end: i + 1 })), regions: [] });
  v.strokes = P(INK); v.strokeWeight = 2; v.strokeJoin = 'ROUND'; v.fills = []; if (dash) v.dashPattern = [8, 6];
  parent.appendChild(v); v.x = x0; v.y = y0; return v;
}
function label(k, v, cx, y, left) { const t = T(v, 13, 'Medium', INK, { lh: 1.4 }); t.name = 'ann · 화살표 라벨 · ' + v; sec[k].appendChild(t); t.x = left ? cx : Math.round(cx - t.width / 2); t.y = y; }
async function H(k, a, b, lab) {
  const A = scr(k, a), B = scr(k, b), y = A.y + 422;
  await vec('ann · 화살표 · ' + a + ' → ' + b, [[A.x + A.width + 10, y], [B.x - 10, y]], false, sec[k]);
  if (lab) label(k, lab, (A.x + A.width + B.x) / 2, y - 28);
}
async function V(k, a, b, lab, dash) {
  const A = scr(k, a), B = scr(k, b), x = A.x + 195, y1 = A.y + A.height + 10, y2 = B.y - 52;
  await vec('ann · 화살표 · ' + a + ' → ' + b, [[x, y1], [x, y2]], dash, sec[k]);
  if (lab) label(k, lab, x + 12, Math.round((y1 + y2) / 2 - 10), true);
}
const CAP = [
  ['S1', 'A-find', 'A · 모임 찾기', '#/find', 1], ['S1', 'B-session-walk', 'B · 회차 상세', '#/session/:id'], ['S1', 'B1-apply-sheet', 'B-1 · 신청 확인 시트', 'B 위 시트', 2],
  ['S1', 'B-session-applied-today', 'B · 신청한 회차 (당일)', '#/session/:id'], ['S1', 'H-chat', 'H · 회차 대화방', '#/session/:id/chat', 3], ['S1', 'C-today-before', 'C · 당일 · 체크인 전', '#/today/:id'],
  ['S1', 'C-today-going', 'C · 당일 · 진행 중', '#/today/:id'], ['S1', 'C-today-done', 'C · 당일 · 완주', '#/today/:id', 4], ['S1', 'D-map', 'D · 내 동네 지도', '#/map'],
  ['S1', 'B-session-bike', 'B · 회차 상세 (라이트 바이크)', '#/session/:id'], ['S1', 'H-msg-sheet', 'H · 메시지 길게 누르기', 'H 위 시트'], ['S1', 'F-report-msg', 'F · 신고 사유', 'H 위 시트'],
  ['S1', 'D1-course-sheet', 'D-1 · 코스 시트', 'D 위 시트'],
  ['S2', 'A-find-empty', 'A · 빈 상태', '#/find'], ['S2', 'A1-gu-sheet', 'A-1 · 동네 선택 시트', 'A 위 시트'], ['S2', 'K-search', 'K · 검색', '#/search'],
  ['S2', 'K-search-results', 'K · 검색 결과', '#/search'], ['S2', 'J-notifications', 'J · 알림', '#/notifications'], ['S2', 'I-chats', 'I · 채팅', '#/chats', 5],
  ['S3', 'E0-verify', 'E-0 · 본인인증 안내', '#/host/new', 6], ['S3', 'E1-activity', 'E-1 · 활동', '#/host/new/1'], ['S3', 'E2-course', 'E-2 · 코스', '#/host/new/2'],
  ['S3', 'E3-when', 'E-3 · 날짜와 정원', '#/host/new/3'], ['S3', 'E4-preview', 'E-4 · 미리보기', '#/host/new/4'], ['S3', 'E5-created', 'E-5 · 회차 열림 시트', 'A 위 시트'],
  ['S3', 'A-find-host-pinned', 'A · 내가 여는 회차 고정', '#/find'], ['S3', 'Cp-host-checked', 'C′ · 당일 길잡이', '#/host/today/:id', 7], ['S3', 'Cp-host-ended', 'C′ · 해산', '#/host/today/:id'],
  ['S3', 'H-chat-closed', 'H · 대화방 닫힘', '#/session/:id/chat'],
  ['S4', 'G-me', 'G · 나', '#/me', 8], ['S4', 'G1-edit', 'G-1 · 프로필 편집', '#/me/edit'], ['S4', 'G2-settings', 'G-2 · 설정', '#/me/settings']
];
for (const [k, n, title, route, num] of CAP) {
  const s = scr(k, n), f = AL('ann · 캡션 · ' + n, 'HORIZONTAL', 8);
  if (num) f.appendChild(badge(num));
  f.appendChild(T(title, 18, 'Bold', INK, { lh: 1.4 })); f.appendChild(T(route, 13, 'Regular', SUB, { lh: 1.4 }));
  sec[k].appendChild(f); f.x = s.x; f.y = s.y - 44;
}
const S1 = ['A-find', 'B-session-walk', 'B1-apply-sheet', 'B-session-applied-today', 'H-chat', 'C-today-before', 'C-today-going', 'C-today-done', 'D-map'];
for (let i = 0; i < S1.length - 1; i++) await H('S1', S1[i], S1[i + 1]);
await V('S1', 'B-session-walk', 'B-session-bike', '상태 변형', true);
await V('S1', 'H-chat', 'H-msg-sheet', '길게 누르기');
await V('S1', 'D-map', 'D1-course-sheet', '코스 누르기');
await H('S1', 'H-msg-sheet', 'F-report-msg', '신고');
await H('S2', 'A-find-empty', 'A1-gu-sheet', '동네 버튼');
await H('S2', 'K-search', 'K-search-results', '입력');
const S3 = ['E0-verify', 'E1-activity', 'E2-course', 'E3-when', 'E4-preview', 'E5-created', 'A-find-host-pinned', 'Cp-host-checked', 'Cp-host-ended', 'H-chat-closed'];
const L3 = ['인증', '', '', '', '회차 열기', '닫기', '고정 카드', '출발 · 해산', '대화방 닫기'];
for (let i = 0; i < S3.length - 1; i++) await H('S3', S3[i], S3[i + 1], L3[i]);
await H('S4', 'G-me', 'G1-edit', '프로필 편집');
{ const A = scr('S4', 'G-me'), B = scr('S4', 'G2-settings'), y = A.y + A.height + 40;
  await vec('ann · 화살표 · G-me → G2-settings', [[A.x + 195, A.y + A.height + 10], [A.x + 195, y], [B.x + 195, y], [B.x + 195, B.y + B.height + 10]], false, sec.S4);
  label('S4', '설정', (A.x + B.x) / 2 + 195, y - 26); }
const NOTE = [
  ['S1', 1, '모임 찾기', '동네 · 날짜 7일 스트립 · 활동 칩 한 줄로 회차를 찾는다. 오늘 내 회차는 맨 위 카드로 고정된다. 카드의 인원은 "5/8명 신청중"처럼 숫자만 보인다.', 'F-01 · F-12', 80, 1204],
  ['S1', 2, '신청 확인 시트', '회차 단위로 신청한다. 가입도 참가비도 없다. 출발 장소 · 해산 시각 · 이동 기록 · 대화방 안내를 확인하고 신청한다. 시트 안 확인은 보조 버튼이고 주 버튼은 화면당 하나다.', 'F-03 · F-05 · F-11', 1020, 1204],
  ['S1', 3, '회차 대화방', '신청이 확정된 동행자와 그 회차의 길잡이만 들어간다. 늦음 · 불참 전달이 주 용도다. 메시지를 길게 눌러 신고까지 2탭. 해산 24시간 뒤 사라지고 1:1 DM은 없다.', 'F-11 · F-08 · NG-02', 1490, 1204],
  ['S1', 4, '완주에서 내 동네 지도로', '체크인으로 시작하고 해산으로 완주한다. 완주한 코스는 내 동네 지도에 활동별 색으로 채워진다(lo-fi에서는 X 박스). 순위 · 비교는 없다.', 'F-04 · F-06', 3370, 1204],
  ['S2', 5, '채팅 탭', '신청했거나 내가 여는 회차의 대화방만 모인다. 미리보기의 보낸 사람은 역할만 보인다. 닫힌 방과 해산 24시간이 지난 방은 목록에 없다. 상시 채팅방이 아니다.', 'F-11 · F-12 · NG-02', 2430, 1060],
  ['S3', 6, '회차 열기', '본인인증한 사람만 회차를 연다. 활동 · 코스 · 날짜와 정원 · 미리보기 4단계. 여는 순간 그 회차의 길잡이가 되고 회차 대화방이 열린다.', 'F-07 · F-11', 80, 1060],
  ['S3', 7, '당일 길잡이', '체크인 현황은 숫자만 보인다. 길잡이가 출발과 해산을 누른다. 해산 뒤 대화방을 직접 닫을 수 있고, 닫지 않아도 24시간 뒤 사라진다.', 'F-04 · F-07 · F-11', 3370, 1060],
  ['S4', 8, '나', '아이콘과 닉네임은 회차 대화방과 나 화면에서만 보인다. 사진 업로드 없이 아이콘 12종 중 고른다. 설정은 알림 · 이동 기록 공개 범위 · 본인인증.', 'F-12 · F-05 · F-07', 80, 1100]
];
for (const [k, n, title, body, ids, x, y] of NOTE) {
  const f = AL('ann · 주석 ' + n + ' · ' + title, 'VERTICAL', 8, { fill: WHITE });
  f.counterAxisSizingMode = 'FIXED'; f.resize(390, 100); f.primaryAxisSizingMode = 'AUTO';
  f.paddingLeft = f.paddingRight = f.paddingTop = f.paddingBottom = 20; f.cornerRadius = 16; f.strokes = P(LINE); f.strokeWeight = 1;
  const h = AL('head', 'HORIZONTAL', 8); h.appendChild(badge(n)); h.appendChild(T(title, 16, 'Bold', INK, { lh: 1.4 })); f.appendChild(h);
  const b = T(body, 14, 'Regular', INK, { lh: 1.6, w: 350 }); f.appendChild(b); b.layoutSizingHorizontal = 'FILL';
  f.appendChild(T(ids, 12, 'Medium', SUB, { lh: 1.4 }));
  sec[k].appendChild(f); f.x = x; f.y = y;
}
// 범례 (페이지 맨 위)
const lg = AL('ann · 범례', 'VERTICAL', 16, { fill: WHITE });
lg.paddingLeft = lg.paddingRight = lg.paddingTop = lg.paddingBottom = 32; lg.cornerRadius = 24; lg.strokes = P(LINE); lg.strokeWeight = 1;
lg.appendChild(T('Lo-fi · 회색 블록 와이어프레임 · r6 구조 기준 32화면', 32, 'Bold', INK, { lh: 1.3 }));
lg.appendChild(T('hi-fi(페이지 App r4)와 같은 화면 · 문구 · 자동 레이아웃. 색 · 지도 · 아이콘 모양을 걷어 내고 흐름과 정보 구조만 본다. 원본은 코드(app/)다.', 16, 'Regular', SUB, { lh: 1.6 }));
const row = AL('항목', 'HORIZONTAL', 32); lg.appendChild(row);
async function item(sample, txt) { const it = AL('범례 · ' + txt, 'HORIZONTAL', 8); it.appendChild(sample); it.appendChild(T(txt, 14, 'Regular', INK, { lh: 1.4 })); row.appendChild(it); }
{ const x = figma.createFrame(); x.name = 'x'; x.resize(48, 36); x.fills = P('EDEDED'); x.strokes = P('C8C8C8'); x.strokeAlign = 'INSIDE'; x.strokeWeight = 1; x.clipsContent = true;
  const v = figma.createVector(); v.vectorPaths = [{ windingRule: 'NONE', data: 'M 0 0 L 48 36 M 48 0 L 0 36' }]; v.strokes = P('C8C8C8'); v.strokeWeight = 1; v.fills = []; x.appendChild(v); v.x = 0; v.y = 0;
  await item(x, '지도 · 썸네일 자리'); }
{ const o = figma.createEllipse(); o.resize(18, 18); o.fills = []; o.strokes = P(INK); o.strokeWeight = 1.5; await item(o, '아이콘'); }
const pill = (t, fill, color, stroke) => { const p = AL('pill', 'HORIZONTAL', 0, { fill }); p.paddingLeft = p.paddingRight = 14; p.paddingTop = p.paddingBottom = 6; p.cornerRadius = 999; if (stroke) { p.strokes = P(stroke); p.strokeWeight = 1.5; } p.appendChild(T(t, 12, 'Bold', color, { lh: 1.4 })); return p; };
await item(pill('주 버튼', INK, WHITE), '화면당 하나');
await item(pill('보조', 'BFBFBF', INK), '시트 안 확인');
await item(pill('윤곽', null, INK, INK), '보조 동작');
{ const c = figma.createFrame(); c.resize(20, 20); c.cornerRadius = 10; c.fills = P(INK); c.layoutMode = 'HORIZONTAL'; c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'FIXED'; c.primaryAxisAlignItems = 'CENTER'; c.counterAxisAlignItems = 'CENTER'; c.appendChild(T('3', 12, 'Bold', WHITE, { lh: 1 })); await item(c, '새 소식 수'); }
{ const w = AL('a', 'HORIZONTAL', 0); w.paddingTop = w.paddingBottom = 4; await item(w, '화면 이동'); await vec('arrow', [[0, 0], [56, 0]], false, w); }
{ const w = AL('a', 'HORIZONTAL', 0); w.paddingTop = w.paddingBottom = 4; await item(w, '같은 화면의 상태 변형'); await vec('arrow', [[0, 0], [56, 0]], true, w); }
await item(badge(1), '번호 주석 · 근거는 MANUAL 요구사항 ID');
lg.appendChild(T('2026-10-02 · r6 · 화면 32 · 섹션 4 (동행자 · 탭 보조 · 길잡이 · 나)', 12, 'Regular', SUB, { lh: 1.4 }));
page.appendChild(lg); lg.x = 0; lg.y = 0;
page.setSharedPluginData('aftercrew', 'lofi', '');
let n = 0; for (const p of [page, ...Object.values(sec)]) n += p.children.filter(c => c.name.startsWith('ann · ')).length;
return { annotations: n, legend: [lg.id, Math.round(lg.width), Math.round(lg.height)], pluginData: page.getSharedPluginData('aftercrew', 'lofi').length };
