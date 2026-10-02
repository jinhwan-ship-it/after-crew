/* After Crew · 앱 프로토타입 r6
 * 화면: A 찾기 · B 회차 상세(정보 · 대화=H) · C 당일(동행자) · C' 당일(길잡이) · D 내 동네 지도 · E 회차 열기 · G 나(G-1 프로필 편집 · G-2 설정)
 *       I 채팅(대화방 목록) · J 알림 · K 검색 · A-1 동네 선택 시트
 * 근거: MANUAL v1.6 · DESIGN.md v1.4 · flows/ia.md v1.3
 * 규칙: 색·간격은 app.css 토큰만. 날짜는 항상 "9/30 (수) 19:00 → 19:30"처럼 정확히. 사람은 대화방·나 화면에만(인원은 숫자).
 */
'use strict';

const D = window.AC_DATA;
const MAP = window.AC_MAP;
const NOW = new Date(...D.now);
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const STORE = 'aftercrew-proto-r4';

/* ================================================================
 * 상태
 * ================================================================ */
function defaultState() {
  return {
    applied: [], checkedIn: [], hosted: [], created: [], courses: [],
    done: ['c6', 'c2'],               // 완주 순서 (오래된 것 → 최근)
    verified: false, privacy: 'me',
    hostStage: {}, hostCounts: {}, cancelledSessions: [],
    chat: {}, chatSeen: {}, chatClosed: {}, notiSeen: [],
    profile: { nick: '저녁바람', icon: 2, gu: '마포구', acts: ['walk', 'bike'] },
    settings: { notiSession: true, notiChat: true }
  };
}
let S = load();
function load() {
  try {
    const j = localStorage.getItem(STORE);
    if (j) return Object.assign(defaultState(), JSON.parse(j));
  } catch (e) { /* 저장소 없음: 기본값 */ }
  return defaultState();
}
function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* 무시 */ } }
function resetAll() {
  S = defaultState(); save(); H = newDraft(); PD = null; drawnKey = '';
  nav('#/find'); render(); announce('처음 상태로 되돌렸어요');
}

/* ================================================================
 * 데이터 헬퍼
 * ================================================================ */
const myGu = () => S.profile.gu;
const allCourses = () => D.courses.concat(S.courses || []);
const course = id => allCourses().find(c => c.id === id);
const routeOf = c => c.route || MAP.routes[c.id];
const sessions = () => D.sessions.concat(S.created).filter(s => course(s.course));
const sessionById = id => sessions().find(s => s.id === id);
const isApplied = id => S.applied.includes(id);
const isMine = s => S.hosted.includes(s.id);
const isCancelled = id => S.cancelledSessions.includes(id);
const actLabel = a => D.acts[a].label;

function kmOf(c) {
  const mult = (c.trip === 'round' || c.trip === 'loop2') ? 2 : 1;
  return (Math.round(routeOf(c).m * mult / 100) / 10).toFixed(1);
}
function minOf(c) {
  const raw = Number(kmOf(c)) * D.acts[c.act].pace * (c.level === 'mid' ? 1.1 : 1);
  return Math.max(10, Math.ceil(raw / 5) * 5);
}
function addMin(t, m) {
  const [h, mm] = t.split(':').map(Number);
  const tot = h * 60 + mm + m;
  return `${String(Math.floor(tot / 60) % 24).padStart(2, '0')}:${String(tot % 60).padStart(2, '0')}`;
}
const endOf = s => s.e || addMin(s.t, minOf(course(s.course)));
function dateOf(d) { const x = new Date(NOW); x.setDate(x.getDate() + d); return x; }
function fmtDay(d) { const x = dateOf(d); return `${x.getMonth() + 1}/${x.getDate()} (${WD[x.getDay()]})`; }
const fmtWhen = s => `${fmtDay(s.d)} ${s.t} → ${endOf(s)}`;
const expireText = s => `${fmtDay(s.d + 1)} ${endOf(s)}`;   // 해산 24시간 뒤
function appliedCount(s) {
  const h = S.hostCounts[s.id];
  return (h ? h.applied : s.applied) + (isApplied(s.id) ? 1 : 0);
}
const seatsText = s => `${appliedCount(s)}/${s.cap}명 신청 중`;
const tripText = c => ({ loop: '한 바퀴', loop2: '두 바퀴', round: '왕복', oneway: '편도' })[c.trip] || '';
function myTodaySession() {
  return sessions().find(s => s.d === 0 && (isApplied(s.id) || isMine(s)) && !isCancelled(s.id));
}

/* ================================================================
 * 공통 조각
 * ================================================================ */
function esc(t) { return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function announce(t) { const l = document.getElementById('live'); l.textContent = ''; setTimeout(() => { l.textContent = t; }, 30); }

const ICONS = {
  back: '<path d="m15 18-6-6 6-6"/>', fwd: '<path d="m9 18 6-6-6-6"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  flag: '<path d="M4 22V4a1 1 0 0 1 1-1h11l-2 4 2 4H5"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  map: '<path d="M14.1 6 8 3 2 6v15l6-3 6.1 3 5.9-3V3z"/><path d="M8 3v15M14 6v15"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  bike: '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'
};
function icon(n, cls = '') { return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`; }

const actDot = a => `<span class="dot-act" style="--c:var(--act-${a})" aria-hidden="true"></span>`;
const actChip = a => `<span class="chip sm static">${actDot(a)}${actLabel(a)}</span>`;
const plainChip = t => `<span class="chip sm static">${esc(t)}</span>`;
// 메타 한 줄: 조각 안에서는 줄바꿈하지 않는다 (넘치면 조각 단위로, 구분점은 다음 조각 앞에)
const segs = a => `<span class="segs">${a.filter(Boolean).map((t, i) => `<span class="seg">${i ? '· ' : ''}${esc(t)}</span>`).join(' ')}</span>`;

/* 프로필 아이콘 (루트 라인 모티프 12종) */
function pi(idx, size = 40, label = '') {
  const g = D.icons[((idx % 12) + 12) % 12];
  const aria = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  return `<span class="pi s${size}" ${aria}><svg viewBox="0 0 40 40"><path d="${g.d}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${g.s[0]}" cy="${g.s[1]}" r="2.6" fill="currentColor"/><circle cx="${g.e[0]}" cy="${g.e[1]}" r="3.8" fill="currentColor"/></svg></span>`;
}

/* ================================================================
 * 지도 (OSM 실지형 · DESIGN 5b~5c)
 * ================================================================ */
const parsePts = p => p.split(' ').map(s => s.split(',').map(Number));
function polyLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }

function thumbSVG(c, done) {
  const pts = parsePts(routeOf(c).pts);
  const xs = pts.map(a => a[0]), ys = pts.map(a => a[1]);
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
  const w = Math.max(maxx - minx, 1), h = Math.max(maxy - miny, 1), sc = Math.min(56 / w, 40 / h);
  const P = pts.map(([x, y]) => [8 + (x - minx) * sc + (56 - w * sc) / 2, 8 + (y - miny) * sc + (40 - h * sc) / 2]);
  const line = P.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  if (!done) return `<svg viewBox="0 0 72 56" aria-hidden="true"><polyline points="${line}" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="0.1 6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const col = `var(--act-${c.act})`, f = P[0], l = P[P.length - 1];
  return `<svg viewBox="0 0 72 56" aria-hidden="true"><polyline points="${line}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${f[0].toFixed(1)}" cy="${f[1].toFixed(1)}" r="3" fill="${col}"/><circle cx="${l[0].toFixed(1)}" cy="${l[1].toFixed(1)}" r="4.5" fill="${col}"/></svg>`;
}

/**
 * opts: ids(그릴 코스) · done(완주 코스, 순서=오래된→최근) · fit(시야 기준 코스) · pxw/pxh(화면 크기)
 *       dark · interactive(코스 눌러 시트) · draw(그려지는 연출) · label · padBottom(아래 시트 여백 px)
 */
function mapView(o) {
  const ids = o.ids || [];
  const done = o.done || [];
  const pxw = o.pxw || 342, pxh = o.pxh || 214;
  const fitIds = (o.fit && o.fit.length ? o.fit : ids);
  // 1) 시야: 코스 범위 + 여백, 화면 비율에 맞춤, 캔버스 안으로
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  fitIds.forEach(id => { const c = course(id); if (!c) return; parsePts(routeOf(c).pts).forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }); });
  if (x0 > x1) { x0 = 0; y0 = 0; x1 = MAP.vw; y1 = MAP.vh; }
  const pad = Math.max(x1 - x0, y1 - y0) * 0.14 + 22;
  let w = x1 - x0 + pad * 2, h = y1 - y0 + pad * 2;
  const bottomFrac = (o.padBottom || 0) / pxh;         // 아래 시트가 덮는 비율만큼 아래로 늘림
  h = h / (1 - bottomFrac);
  const ar = pxw / pxh;
  if (w / h > ar) h = w / ar; else w = h * ar;
  let vx = (x0 + x1) / 2 - w / 2, vy = (y0 + y1) / 2 - (h * (1 - bottomFrac)) / 2;
  if (w > MAP.vw + 48) { w = MAP.vw + 48; h = w / ar; }
  vx = Math.min(Math.max(vx, -24), MAP.vw + 24 - w);
  vy = Math.min(Math.max(vy, -24), MAP.vh + 24 - h);
  const k = pxw / w;                                    // 1 캔버스 단위 = k px
  // 2) 바탕
  const base = `<rect class="m-land" x="-60" y="-60" width="1120" height="960"/><path class="m-park" d="${MAP.parks}"/><path class="m-water" fill-rule="evenodd" d="${MAP.water}"/><path class="m-stream" d="${MAP.streams}"/><path class="m-minor" d="${MAP.minor}"/><path class="m-major" d="${MAP.major}"/>`;
  // 3) 코스: 미완주 → 완주(오래된 것부터, 최근 것이 위)
  const todo = ids.filter(id => !done.includes(id));
  const doneOrdered = done.filter(id => ids.includes(id));
  let routes = '';
  const sw = u => (u / k).toFixed(2);
  todo.forEach(id => {
    const c = course(id); const pts = routeOf(c).pts;
    routes += `<polyline class="rt todo" points="${pts}" style="stroke-width:${sw(3)};stroke-dasharray:${sw(0.1)} ${sw(9)}"/>`;
  });
  const n = doneOrdered.length;
  doneOrdered.forEach((id, i) => {
    const c = course(id); const pts = parsePts(routeOf(c).pts); const f = pts[0], l = pts[pts.length - 1];
    const col = o.dark ? 'var(--surface)' : `var(--act-${c.act})`;
    const L = polyLen(pts).toFixed(1);
    const drawStyle = o.draw ? `;stroke-dasharray:${L};--len:${L};animation-delay:${(n - 1 - i) * 120}ms` : '';
    routes += `<polyline class="rt${o.draw ? ' draw' : ''}" points="${routeOf(c).pts}" style="stroke:${col};stroke-width:${sw(5)}${drawStyle}"/>`;
    routes += `<circle class="rt-dot" cx="${f[0]}" cy="${f[1]}" r="${sw(4)}" style="fill:${col}"/><circle class="rt-dot" cx="${l[0]}" cy="${l[1]}" r="${sw(6)}" style="fill:${col}"/>`;
  });
  // 4) 누를 수 있는 코스 (D)
  let hits = '';
  if (o.interactive) {
    ids.forEach(id => {
      const c = course(id);
      hits += `<polyline class="rt-hit" points="${routeOf(c).pts}" style="stroke-width:${sw(22)}" tabindex="0" role="button" aria-label="${esc(c.name)} 코스 보기" onclick="courseSheet('${id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();courseSheet('${id}')}"/>`;
    });
  }
  const role = o.interactive ? `role="group" aria-label="${esc(o.label || '동네 지도')}"` : `role="img" aria-label="${esc(o.label || '코스 지도')}"`;
  return `<svg viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}" preserveAspectRatio="xMidYMid slice" ${role}>${base}${routes}${hits}</svg><span class="osm">© OpenStreetMap contributors</span>`;
}
function courseMap(c, { dark = false } = {}) {
  return `<div class="map">${mapView({ ids: [c.id], done: [c.id], dark, label: `${c.name} 코스 지도. 출발 ${c.start}, 해산 ${c.end}` })}</div>`;
}

/* 따릉이 예상 요금 (예시값: 1시간권 1,000원, 초과 30분당 1,000원 · 출처는 링크로 안내, R-07) */
function bikeFee(c) { const m = minOf(c); return { pass: 0, hourly: m <= 60 ? 1000 : 1000 + Math.ceil((m - 60) / 30) * 1000 }; }
const won = n => (n === 0 ? '0원' : n.toLocaleString('ko-KR') + '원');

/* 기기 캘린더 (.ics, F-10) */
function icsFor(sid) {
  const s = typeof sid === 'string' ? sessionById(sid) : sid; if (!s) return;
  const c = course(s.course); const d = dateOf(s.d); const p = n => String(n).padStart(2, '0');
  const ymd = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//After Crew//prototype r6//KO', 'BEGIN:VEVENT',
    `UID:${s.id}@aftercrew.proto`, `DTSTART;TZID=Asia/Seoul:${ymd}T${s.t.replace(':', '')}00`, `DTEND;TZID=Asia/Seoul:${ymd}T${endOf(s).replace(':', '')}00`,
    `SUMMARY:애프터 크루 · ${c.name}`, `LOCATION:${c.start}`,
    `DESCRIPTION:${actLabel(c.act)} ${kmOf(c)}km · 예상 완주 시간 ${minOf(c)}분 · 출발 ${c.start} · 해산 ${c.end}`,
    'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', `DESCRIPTION:${s.t} 출발 · ${c.start}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
  const a = document.createElement('a'); a.href = url; a.download = `after-crew-${s.id}.ics`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  announce('캘린더 파일을 내려받았어요. 기기 캘린더에서 열면 일정이 추가돼요');
}

/* ================================================================
 * 라우터 · 탭 · 시트
 * ================================================================ */
let afterRender = null;
window.addEventListener('hashchange', render);
window.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
function nav(h) { location.hash = h; }
function replaceNav(h) { location.replace(h); }
function back() { if (history.length > 1) history.back(); else nav('#/find'); }
function setTopbarDark(dark) { document.getElementById('statusbar').classList.toggle('dark', !!dark); }

let lastHash = '', lastTab = 'find';   // 탭 밖 화면(상세·알림 등)은 들어온 탭을 그대로 표시
function focusKeyOf(el) { if (!el || !el.closest || !el.closest('#view')) return null; return el.id ? '#' + el.id : el.dataset && el.dataset.fk ? `[data-fk="${el.dataset.fk}"]` : null; }
function render() {
  const h = location.hash || '#/find';
  const p = h.slice(2).split('/');
  const v = document.getElementById('view');
  const same = h === lastHash; lastHash = h;
  const keepScroll = same ? v.scrollTop : null;
  const fk = same ? focusKeyOf(document.activeElement) : null;
  closeSheet(true); setTopbarDark(false);
  let html = '', tab = lastTab, scrollBottom = false;
  if (p[0] === 'find') { html = viewFind(p[1]); tab = 'find'; }
  else if (p[0] === 'chats') { html = viewChats(); tab = 'chat'; }
  else if (p[0] === 'notifications') html = viewNotis();
  else if (p[0] === 'search') { html = viewSearch(); tab = 'find'; }
  else if (p[0] === 'session') { if (p[2] === 'chat') { html = viewChat(p[1]); scrollBottom = true; } else html = viewSession(p[1]); }
  else if (p[0] === 'today') html = viewToday(p[1]);
  else if (p[0] === 'map') { html = viewMap(); tab = 'map'; }
  else if (p[0] === 'me') { tab = 'me'; html = p[1] === 'edit' ? viewMeEdit() : p[1] === 'settings' ? viewSettings() : viewMe(); }
  else if (p[0] === 'host' && p[1] === 'new') html = viewHostNew(p[2] || '0');
  else if (p[0] === 'host' && p[1] === 'today') html = viewHostToday(p[2]);
  else html = notFound();
  v.innerHTML = html;
  v.scrollTop = scrollBottom ? v.scrollHeight : keepScroll !== null ? keepScroll : 0;
  if (fk) { const el = v.querySelector(fk); if (el) el.focus({ preventScroll: true }); }
  const root = (p[0] === 'find' && !p[1]) || p[0] === 'map' || p[0] === 'chats' || (p[0] === 'me' && !p[1]);
  lastTab = tab; renderTabs(tab, root);
  if (p[0] === 'search' && !same) { const si = document.getElementById('search-in'); if (si) si.focus({ preventScroll: true }); }
  const sc = v.querySelector('.screen'); setTopbarDark(sc && sc.classList.contains('dark'));
  if (afterRender) { const f = afterRender; afterRender = null; f(); }
}
/* 하단 탭 4 (v1.4): 찾기 · 지도 · 채팅 · 나. 찾기 아이콘은 상단 검색(돋보기)과 겹치지 않게 나침반 */
const countText = n => (n > 99 ? '99+' : String(n));
function renderTabs(cur, root = true) {
  const t = [['find', '찾기', 'compass', '#/find'], ['map', '지도', 'map', '#/map'], ['chat', '채팅', 'chat', '#/chats'], ['me', '나', 'user', '#/me']];
  const u = totalUnread();
  document.getElementById('tabbar').innerHTML = t.map(([k, l, i, href]) => {
    const badge = k === 'chat' && u ? `<span class="count" aria-hidden="true">${countText(u)}</span>` : '';
    const on = cur === k ? (root ? ' class="on" aria-current="page"' : ' class="on"') : '';
    return `<button type="button"${on} onclick="nav('${href}')"><span class="ico">${icon(i)}${badge}</span><span>${l}</span>${badge ? `<span class="sr">, 새 메시지 ${u}개</span>` : ''}</button>`;
  }).join('');
}
const topbar = (title, { backTo = null, right = '' } = {}) => `<header class="topbar">${backTo ? `<button type="button" class="iconbtn" aria-label="뒤로" onclick="${backTo}">${icon('back')}</button>` : ''}<h1 class="title${backTo ? '' : ' left'}">${title}</h1>${right || (backTo ? '<span class="iconbtn" aria-hidden="true"></span>' : '')}</header>`;
const reportBtn = sid => `<button type="button" class="iconbtn" aria-label="신고" onclick="reportSheet('${sid}')">${icon('flag')}</button>`;
/* 탭 첫 화면 상단 바 (v1.4): 오른쪽 아이콘 버튼 44. 알림은 새 알림이 있으면 점 */
function bellBtn() {
  const n = unseenNotis().length;
  return `<button type="button" class="iconbtn badged" aria-label="알림${n ? `, 새 알림 ${n}개` : ''}" onclick="nav('#/notifications')">${icon('bell')}${n ? '<span class="dot-new" aria-hidden="true"></span>' : ''}</button>`;
}
const findBar = gu => `<header class="topbar root"><h1 class="sr">${esc(gu)} 모임</h1>
  <button type="button" class="locbtn" aria-label="내 동네 ${esc(gu)}, 동네 바꾸기" onclick="guSheet()">${icon('pin')}<span>${esc(gu)}</span>${icon('down')}</button>
  <span class="grow"></span>
  <button type="button" class="iconbtn" aria-label="검색" onclick="nav('#/search')">${icon('search')}</button>${bellBtn()}
  <button type="button" class="iconbtn" aria-label="회차 열기" onclick="nav('#/host/new')">${icon('plus')}</button></header>`;

let lastFocus = null;
function openSheet(html, { label = '시트' } = {}) {
  lastFocus = document.activeElement;
  const r = document.getElementById('sheet-root');
  r.innerHTML = `<div class="sheet-bg" onclick="if(event.target===this)closeSheet()"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1"><div class="grab" aria-hidden="true"></div>${html}</div></div>`;
  const d = r.querySelector('.sheet');
  d.focus({ preventScroll: true });
  d.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const f = [...d.querySelectorAll('button,input,select,a,[tabindex="0"]')].filter(x => !x.disabled);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === d)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}
function closeSheet(silent) {
  const r = document.getElementById('sheet-root');
  if (r.innerHTML) { r.innerHTML = ''; if (!silent && lastFocus && lastFocus.focus) lastFocus.focus(); }
}

/* ================================================================
 * A · 모임 찾기
 * ================================================================ */
let findAct = 'all';
function viewFind(dayParam) {
  const gu = myGu();
  const day = dayParam === undefined || dayParam === '' ? null : Number(dayParam);
  const inRange = s => (day === null ? s.d >= 0 && s.d <= 6 : s.d === day);
  const list = sessions()
    .filter(s => course(s.course).gu === gu && !isCancelled(s.id) && inRange(s) && (findAct === 'all' || course(s.course).act === findAct))
    .sort((a, b) => a.d - b.d || a.t.localeCompare(b.t));
  const strip = `<div class="strip" role="group" aria-label="날짜 선택">${Array.from({ length: 7 }, (_, i) => {
    const x = dateOf(i);
    return `<button type="button" class="day ${i === 0 ? 'today' : ''}" data-fk="fday-${i}" aria-pressed="${day === i}"${i === 0 ? ' aria-current="date"' : ''} aria-label="${fmtDay(i)}" onclick="nav('#/find/${day === i ? '' : i}')"><span class="w">${WD[x.getDay()]}</span><span class="d">${x.getDate()}</span></button>`;
  }).join('')}</div>`;
  const chips = `<div class="strip chips mt12" role="group" aria-label="활동">${[['all', '전체'], ...Object.keys(D.acts).map(k => [k, actLabel(k)])]
    .map(([k, l]) => `<button type="button" class="chip" data-fk="fchip-${k}" aria-pressed="${findAct === k}" onclick="findAct='${k}';render()">${l}</button>`).join('')}</div>`;

  let body = '';
  const mine = myTodaySession();
  if (mine) body += pinnedCard(mine);
  if (list.length === 0) {
    const near = sessions().filter(s => course(s.course).gu !== gu && !isCancelled(s.id) && inRange(s)).slice(0, 3);
    body += `<div class="pad mt24"><div class="empty"><div class="h3">${day === null ? `${fmtDay(0)} ~ ${fmtDay(6)}에 열린 모임이 없어요` : `${fmtDay(day)}에 열린 모임이 없어요`}</div>
      <p class="body muted">${gu} 기준이에요. 근처 동네 모임도 볼 수 있어요.</p>
      <button type="button" class="btn outline" onclick="render();announce('새로고침했어요')">${icon('refresh')} 새로고침</button></div></div>`;
    if (near.length) body += `<div class="datehead">근처 동네 모임</div><div class="pad stack g12">${near.map(sessionCard).join('')}</div>`;
    body += `<div class="pad mt24"><button type="button" class="btn secondary block" onclick="nav('#/host/new')">${icon('plus')} 직접 회차 열기</button></div>`;
  } else {
    const byDay = {};
    list.forEach(s => { (byDay[s.d] = byDay[s.d] || []).push(s); });
    Object.keys(byDay).map(Number).sort((a, b) => a - b).forEach(d => {
      body += `<div class="datehead">${fmtDay(d)}</div><div class="pad stack g12">${byDay[d].map(sessionCard).join('')}</div>`;
    });
  }
  return `<div class="screen">${findBar(gu)}
    <div class="mt8">${strip}</div>${chips}${body}<div class="footer-space"></div></div>`;
}
function pinnedCard(s) {
  const c = course(s.course); const stg = S.hostStage[s.id];
  const st = stg === 'ended' ? '완주' : (stg === 'going' || S.checkedIn.includes(s.id)) ? '진행 중' : (isMine(s) ? '내가 여는 회차' : '신청됨');
  const go = isMine(s) ? `#/host/today/${s.id}` : `#/today/${s.id}`;
  const unread = unreadCount(s.id);
  return `<div class="pad mt16"><div class="card on-text" style="gap:var(--s3)">
    <button type="button" class="stack g8" style="text-align:left" onclick="nav('${go}')" aria-label="내 회차 ${esc(c.name)}, ${fmtWhen(s)}, ${st}">
      <span class="row between wrap"><span class="status-pill">${icon('clock', 's')} ${fmtWhen(s)}</span><span class="badge">${st}</span></span>
      <span class="h3">${esc(c.name)}</span>
      <span class="row between"><span class="cap muted">${actLabel(c.act)} · ${kmOf(c)}km · ${esc(c.start)}</span>${icon('fwd')}</span>
    </button>
    ${chatClosedFor(s) ? '' : `<div class="divider" style="background:rgba(255,255,255,.16)"></div>
    <button type="button" class="row between" style="min-height:44px" onclick="nav('#/session/${s.id}/chat')"><span class="row g8">${icon('chat', 's')}<span class="cap">회차 대화방</span></span><span class="row g8">${unread ? `<span class="count" style="background:var(--surface);color:var(--text)">${unread}</span><span class="sr">새 메시지</span>` : ''}${icon('fwd', 's')}</span></button>`}
  </div></div>`;
}
function sessionCard(s) {
  const c = course(s.course); const full = appliedCount(s) >= s.cap;
  const status = isApplied(s.id) ? '<span class="badge">신청됨</span>' : isMine(s) ? '<span class="badge dark">내가 여는 회차</span>' : full ? '<span class="badge line">마감</span>' : '';
  const done = S.done.includes(c.id);
  return `<button type="button" class="card tap" onclick="nav('#/session/${s.id}')" aria-label="${esc(c.name)}, ${fmtWhen(s)}, ${seatsText(s)}">
    <span class="row between"><span class="row g8">${actChip(c.act)}${plainChip(D.levels[c.level])}${c.gu !== myGu() ? plainChip(c.gu) : ''}</span>${status}</span>
    <span class="row top g12"><span class="stack g4 grow"><span class="time">${fmtWhen(s)}</span><span class="h3">${esc(c.name)}</span>
      <span class="cap muted">${kmOf(c)}km · 예상 완주 시간 ${minOf(c)}분</span><span class="cap">${seatsText(s)}</span></span>
      <span class="thumb">${thumbSVG(c, done)}</span></span>
  </button>`;
}

/* ================================================================
 * B · 회차 상세 (정보 탭) + 탭 머리
 * ================================================================ */
function canChat(s) { return (isApplied(s.id) || isMine(s)); }
function sessionTabs(s, cur) {
  if (!canChat(s)) return '';
  const u = unreadCount(s.id);
  return `<div class="tabs" role="tablist" aria-label="회차">
    <button type="button" role="tab" aria-selected="${cur === 'info'}" onclick="replaceNav('#/session/${s.id}')">정보</button>
    <button type="button" role="tab" aria-selected="${cur === 'chat'}" onclick="replaceNav('#/session/${s.id}/chat')">대화${u && cur !== 'chat' ? ` <span class="count">${u}</span><span class="sr">새 메시지</span>` : ''}</button>
  </div>`;
}
function viewSession(id) {
  const s = sessionById(id); if (!s) return notFound();
  const c = course(s.course); const applied = isApplied(id), cancelled = isCancelled(id), mine = isMine(s);
  const full = appliedCount(s) >= s.cap && !applied;
  const fee = c.act === 'bike' ? bikeFee(c) : null;
  let cta;
  if (cancelled) cta = `<button type="button" class="btn secondary block" onclick="nav('#/find')">다른 모임 찾기</button>`;
  else if (mine && s.d === 0) cta = `<button type="button" class="btn primary block" onclick="nav('#/host/today/${id}')">당일 현황 보기</button>`;
  else if (mine) cta = `<div class="stack g12"><p class="cap muted center">${fmtDay(s.d)} ${s.t}에 출발해요. 당일 화면은 그날 열려요.</p>
      <button type="button" class="btn secondary block" onclick="icsFor('${id}')">${icon('cal')} 내 캘린더에 추가</button><button type="button" class="btn outline block" onclick="hostCancelSheet('${id}')">회차 취소</button></div>`;
  else if (applied && s.d === 0) cta = `<div class="stack g12"><button type="button" class="btn primary block" onclick="nav('#/today/${id}')">체크인하러 가기</button>
      <button type="button" class="btn secondary block" onclick="icsFor('${id}')">${icon('cal')} 내 캘린더에 추가</button><button type="button" class="btn outline block" onclick="cancelSheet('${id}')">신청 취소</button></div>`;
  else if (applied && c.act === 'bike') cta = `<div class="stack g12"><button type="button" class="btn secondary block" onclick="announce('따릉이 앱으로 이동해요 (프로토타입)')">${icon('ext')} 따릉이로 이동</button>
      <button type="button" class="btn secondary block" onclick="icsFor('${id}')">${icon('cal')} 내 캘린더에 추가</button><button type="button" class="btn outline block" onclick="cancelSheet('${id}')">신청 취소</button></div>`;
  else if (applied) cta = `<div class="stack g12"><button type="button" class="btn secondary block" onclick="icsFor('${id}')">${icon('cal')} 내 캘린더에 추가</button>
      <button type="button" class="btn outline block" onclick="cancelSheet('${id}')">신청 취소</button></div>`;
  else if (full) cta = `<button type="button" class="btn primary block" disabled>정원이 찼어요</button>`;
  else cta = `<button type="button" class="btn primary block" onclick="applySheet('${id}')">신청하기</button>`;

  const badge = cancelled ? '<span class="badge err">취소됨</span>' : applied ? '<span class="badge">신청됨</span>' : mine ? '<span class="badge dark">내가 여는 회차</span>' : '';
  return `<div class="screen">${topbar('회차', { backTo: 'back()', right: reportBtn(id) })}${sessionTabs(s, 'info')}
  <div class="pad stack g16 mt16">
    <div class="row g8" style="flex-wrap:wrap">${actChip(c.act)}${plainChip(D.levels[c.level])}${plainChip(c.gu)}${badge}</div>
    <div><div class="time l">${fmtWhen(s)}</div><h2 class="h1 mt8">${esc(c.name)}</h2>
      <p class="cap muted mt8 row g8">${icon('shield', 's')}<span>인증한 길잡이 · ${seatsText(s)}</span></p></div>
    <div class="card" style="gap:var(--s4)">
      <div class="row between" style="align-items:baseline"><span class="num-l">${kmOf(c)}km</span><span class="cap muted">${tripText(c)} · 예상 완주 시간 ${minOf(c)}분</span></div>
      <div class="route-track" aria-hidden="true"><span class="dot"></span><span class="line"></span><span class="dot end"></span></div>
      <div class="row between top g16"><div class="grow"><div class="time">${s.t}</div><div class="cap muted">출발 · ${esc(c.start)}</div></div>
        <div class="grow" style="text-align:right"><div class="time">${endOf(s)}</div><div class="cap muted">해산 · ${esc(c.end)}</div></div></div>
      ${courseMap(c)}
      ${c.turn ? `<p class="cap muted">${esc(c.turn)}에서 돌아와요.</p>` : ''}
    </div>
    ${fee ? `<div class="card"><div class="h3">따릉이 예상 요금</div>
      <div class="fee"><span class="cap">이용권 없음 · 1시간권</span><span class="num" style="font-weight:700;font-size:18px">${won(fee.hourly)}</span></div>
      <div class="fee"><span class="cap">정기권·이용권 있음</span><span class="num" style="font-weight:700;font-size:18px">${won(fee.pass)}</span></div>
      <p class="cap muted">예상 금액이에요. 대여·결제는 따릉이 앱에서 해요.</p>
      <a href="#" class="linkrow" onclick="event.preventDefault();announce('따릉이 요금 안내 페이지로 이동해요 (프로토타입)')">따릉이 요금 안내 ${icon('ext', 's')}</a></div>` : ''}
    <div class="card"><div class="h3">이 회차의 약속</div>
      <ul class="stack g8 body">
        <li>가입·참가비가 없어요</li>
        <li>가장 느린 사람에 맞춰 가요</li>
        <li>${endOf(s)}에 해산해요</li>
        <li>이동 기록은 체크인부터 해산까지만, 기본은 나만 보기예요</li>
        <li>날씨로 취소할 때: ${esc(D.weatherRule)}</li>
        <li>못 가게 되면 출발 전까지 언제든 취소할 수 있어요</li>
      </ul></div>
    <div class="footer-space"></div>
  </div>
  <div class="sticky-cta">${cta}</div></div>`;
}
function applySheet(id) {
  const s = sessionById(id); const c = course(s.course);
  openSheet(`<div class="h2">이 회차에 신청할까요?</div>
    <div class="stack g12 body">
      <div class="row g12">${icon('clock')}<div><div class="time">${fmtWhen(s)}</div><div class="cap muted">${esc(c.name)}</div></div></div>
      <div class="row g12">${icon('pin')}<div><div>출발 ${esc(c.start)}</div><div class="cap muted">해산 ${esc(c.end)}</div></div></div>
      <div class="row g12 top">${icon('shield')}<div>이동 기록은 체크인부터 해산까지만 남고, 기본 공개 범위는 나만 보기예요.</div></div>
      <div class="row g12 top">${icon('chat')}<div>신청하면 회차 대화방에 들어가요. 해산 24시간 뒤 사라져요.</div></div>
    </div>
    <div class="stack g12 mt8"><button type="button" class="btn secondary block" onclick="doApply('${id}')">신청하기</button><button type="button" class="btn outline block" onclick="closeSheet()">닫기</button></div>`, { label: '신청 확인' });
}
function doApply(id) {
  if (!isApplied(id)) { S.applied.push(id); save(); }
  closeSheet(true); render(); announce('신청됐어요. 회차 대화방에 들어갔어요');
}
function cancelSheet(id) {
  const s = sessionById(id); const c = course(s.course);
  openSheet(`<div class="h2">신청을 취소할까요?</div>
    <p class="body">"${esc(c.name)}" ${fmtWhen(s)}. 자리는 바로 다른 사람에게 열리고 대화방에서도 나가요. 캘린더에 넣었다면 직접 지워 주세요.</p>
    <div class="stack g12"><button type="button" class="btn secondary block" onclick="doCancel('${id}')">신청 취소</button><button type="button" class="btn outline block" onclick="closeSheet()">닫기</button></div>`, { label: '신청 취소 확인' });
}
function doCancel(id) {
  S.applied = S.applied.filter(x => x !== id); S.checkedIn = S.checkedIn.filter(x => x !== id);
  delete S.hostStage[id]; delete S.chat[id]; delete S.chatSeen[id];
  save(); closeSheet(true); nav('#/find'); announce('신청을 취소했어요. 대화방에서도 나왔어요');
}
const REPORT_REASONS = ['개인 연락을 강요해요', '약속한 코스·시간과 달라요', '위험한 행동을 해요', '불쾌한 말이나 행동이 있어요', '기타'];
function reportSheet(id, msgIdx) {
  const target = msgIdx !== undefined ? `<div class="notice">${icon('chat', 's')}<span>신고할 메시지: "${esc(chatMsgs(sessionById(id))[msgIdx].text)}"</span></div>` : '';
  openSheet(`<div class="h2">신고</div>${target}<p class="cap muted">사유를 고르면 바로 접수돼요. 운영팀이 확인해서 조치해요.</p>
    <div class="stack g8">${REPORT_REASONS.map(r => `<button type="button" class="opt" onclick="doReport('${id}','${r}')"><span>${r}</span></button>`).join('')}</div>
    <button type="button" class="btn outline block" onclick="closeSheet()">닫기</button>`, { label: '신고' });
}
function doReport(id, r) {
  openSheet(`<div class="okicon">${icon('check')}</div><div class="h2">신고가 접수됐어요</div>
    <p class="body">"${esc(r)}" 사유로 접수했어요. 회차 진행 중이면 길잡이에게도 바로 알려요. 필요하면 지금 자리를 떠나도 돼요.</p>
    <button type="button" class="btn secondary block" onclick="closeSheet()">확인</button>`, { label: '신고 접수' });
  announce('신고가 접수됐어요');
}

/* ================================================================
 * H · 회차 대화방 (F-11)
 * ================================================================ */
function guideOf(s) { return isMine(s) ? { nick: S.profile.nick, icon: S.profile.icon, me: true } : (s.guide || { nick: '길잡이', icon: 0 }); }
function chatMsgs(s) {
  const g = guideOf(s);
  const seed = (D.chatSeed[s.id] || []).map(m => m.who === 'guide' ? { ...m, nick: g.nick, icon: g.icon, guide: true } : { ...m });
  const own = (S.chat[s.id] || []);
  const out = [{ who: 'sys', text: `회차 대화방이 열렸어요 · ${fmtWhen(s)}` }].concat(seed, own);
  if (S.hostStage[s.id] === 'ended') out.push({ who: 'sys', text: `해산했어요. 이 방은 ${expireText(s)}에 사라져요.` });
  if (isCancelled(s.id)) out.push({ who: 'sys', text: `회차가 취소됐어요. 이 방은 ${fmtDay(1)} 18:55에 사라져요.` });
  return out;
}
function unreadCount(sid) {
  const s = sessionById(sid); if (!s || !canChat(s) || chatClosedFor(s)) return 0;
  const others = chatMsgs(s).filter(m => m.who !== 'me' && m.who !== 'sys' && !(m.guide && isMine(s))).length;
  return Math.max(0, others - (S.chatSeen[sid] || 0));
}
const chatClosedFor = s => !!S.chatClosed[s.id];
const drafts = {};                 // 방마다 쓰다 만 글
const draftOf = id => drafts[id] || '';
function viewChat(id) {
  const s = sessionById(id); if (!s) return notFound();
  if (!canChat(s)) {
    return `<div class="screen">${topbar('회차', { backTo: `replaceNav('#/session/${id}')` })}<div class="pad mt24"><div class="empty"><div class="h3">대화방은 신청한 사람만 볼 수 있어요</div>
      <p class="body muted">신청을 취소했거나 아직 신청 전이에요.</p><button type="button" class="btn secondary" onclick="replaceNav('#/session/${id}')">회차 정보 보기</button></div></div></div>`;
  }
  const c = course(s.course); const mine = isMine(s); const ended = S.hostStage[id] === 'ended';
  // 읽음 처리
  const others = chatMsgs(s).filter(m => m.who !== 'me' && m.who !== 'sys' && !(m.guide && mine)).length;
  if ((S.chatSeen[id] || 0) !== others) { S.chatSeen[id] = others; save(); }

  if (chatClosedFor(s)) {
    return `<div class="screen">${topbar('회차', { backTo: 'back()', right: reportBtn(id) })}${sessionTabs(s, 'chat')}
      <div class="pad mt24"><div class="empty"><div class="h3">${mine ? '대화방을 닫았어요' : '길잡이가 대화방을 닫았어요'}</div>
      <p class="body muted">메시지는 모두에게서 사라졌어요. 신고된 메시지만 확인을 위해 남겨 둬요.</p>
      <button type="button" class="btn outline" onclick="replaceNav('#/session/${id}')">회차 정보 보기</button></div></div></div>`;
  }
  const msgs = chatMsgs(s);
  const log = msgs.map((m, i) => {
    if (m.who === 'sys') return `<div class="msg sys">${esc(m.text)}</div>`;
    const me = m.who === 'me' || (m.guide && mine);
    if (me) return `<div class="msg me"><span class="at">${m.t}</span><div class="col"><div class="bubble">${esc(m.text)}</div></div></div>`;
    return `<div class="msg">${pi(m.icon, 40)}<div class="col"><div class="who">${esc(m.nick)}${m.guide ? '<span class="badge xs">길잡이</span>' : ''}</div>
      <button type="button" class="bubble" onclick="msgSheet('${id}',${i})" aria-label="${esc(m.nick)}: ${esc(m.text)}. 메시지 메뉴 열기">${esc(m.text)}</button></div><span class="at">${m.t}</span></div>`;
  }).join('');
  const quick = D.quick[mine ? 'guide' : 'peer'];
  const closeRow = mine && ended ? `<div class="pad"><div class="card" style="gap:var(--s2)"><div class="h4">해산했어요</div><p class="cap muted">이 방은 ${expireText(s)}에 사라져요. 지금 닫아도 돼요.</p><button type="button" class="btn outline" onclick="closeChatSheet('${id}')">대화방 닫기</button></div></div>` : '';
  return `<div class="screen">${topbar(esc(c.name), { backTo: 'back()', right: reportBtn(id) })}${sessionTabs(s, 'chat')}
    <div class="pad mt16"><div class="notice">${icon('alert', 's')}<span>이 방은 해산 24시간 뒤 사라지고, 신고된 메시지만 확인을 위해 남겨 둬요. 연락처를 나눌지는 각자 정해요.</span></div></div>
    <div class="chat" role="log" aria-live="polite" aria-label="회차 대화">${log}</div>
    ${closeRow}
    <div class="composer">
      <div class="strip" role="group" aria-label="자주 쓰는 문구">${quick.map(q => `<button type="button" class="chip" onclick="useQuick('${id}','${q}')">${q}</button>`).join('')}</div>
      <form class="inrow" onsubmit="event.preventDefault();sendMsg('${id}')">
        <label class="in"><span class="sr">메시지</span><input id="msg-in" maxlength="500" autocomplete="off" placeholder="메시지 보내기" value="${esc(draftOf(id))}" oninput="drafts['${id}']=this.value;syncSend('${id}')"></label>
        <button type="submit" class="send" id="msg-send" aria-label="보내기" ${draftOf(id).trim() ? '' : 'disabled'}>${icon('send', 's')}</button>
      </form>
    </div></div>`;
}
function syncSend(id) { const b = document.getElementById('msg-send'); if (b) b.disabled = !draftOf(id).trim(); }
function useQuick(id, q) { drafts[id] = q; const i = document.getElementById('msg-in'); if (i) { i.value = q; i.focus(); } syncSend(id); }
function sendMsg(id) {
  const text = draftOf(id).trim(); if (!text) return;
  const own = S.chat[id] = S.chat[id] || [];
  own.push({ who: 'me', text: text.slice(0, 500), t: addMin('18:55', own.length) });
  drafts[id] = ''; save(); render(); announce('메시지를 보냈어요');
  setTimeout(() => { const i = document.getElementById('msg-in'); if (i) i.focus(); }, 0);
}
function msgSheet(id, i) {
  const m = chatMsgs(sessionById(id))[i];
  openSheet(`<div class="row g12">${pi(m.icon, 40)}<div><div class="h4">${esc(m.nick)}</div><div class="cap muted">${m.t}</div></div></div>
    <p class="body">${esc(m.text)}</p>
    <div class="stack g12"><button type="button" class="btn secondary block" onclick="reportSheet('${id}',${i})">이 메시지 신고</button><button type="button" class="btn outline block" onclick="closeSheet()">닫기</button></div>`, { label: '메시지' });
}
function closeChatSheet(id) {
  openSheet(`<div class="h2">대화방을 닫을까요?</div><p class="body">닫으면 동행자 모두에게서 메시지가 사라져요. 다시 열 수 없어요.</p>
    <div class="stack g12"><button type="button" class="btn secondary block" onclick="doCloseChat('${id}')">대화방 닫기</button><button type="button" class="btn outline block" onclick="closeSheet()">닫기</button></div>`, { label: '대화방 닫기 확인' });
}
function doCloseChat(id) { S.chatClosed[id] = true; save(); closeSheet(true); render(); announce('대화방을 닫았어요'); }

/* ================================================================
 * C · 당일 (동행자)
 * ================================================================ */
function chatRow(s) {
  if (chatClosedFor(s)) return '';
  const msgs = chatMsgs(s).filter(m => m.who !== 'sys'); const last = msgs[msgs.length - 1]; const u = unreadCount(s.id);
  return `<button type="button" class="card tap" style="gap:var(--s2)" onclick="nav('#/session/${s.id}/chat')">
    <span class="row between"><span class="row g8">${icon('chat', 's')}<span class="h4">회차 대화방</span>${u ? `<span class="count">${u}</span><span class="sr">새 메시지</span>` : ''}</span>${icon('fwd', 's')}</span>
    ${last ? `<span class="cap muted" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(last.who === 'me' ? '나' : last.nick)}: ${esc(last.text)}</span>` : '<span class="cap muted">늦거나 못 가게 되면 여기에 알려 주세요</span>'}
  </button>`;
}
function viewToday(id) {
  const s = sessionById(id); if (!s) return notFound();
  const c = course(s.course); const stage = S.hostStage[id] || 'before'; const checked = S.checkedIn.includes(id);
  if (stage === 'ended' && checked) {
    return `<div class="screen dark on-dark">${topbar('완주', { backTo: "nav('#/find')", right: reportBtn(id) })}
      <div class="pad stack g24" style="flex:1;justify-content:center">
        <div class="okicon">${icon('check')}</div>
        <div><div class="hero-num">${kmOf(c)}km</div><h2 class="h2 mt8">끝까지 같이 왔어요</h2><p class="body muted mt8">${esc(c.name)} · ${fmtWhen(s)}</p></div>
        ${courseMap(c, { dark: true })}
        <p class="body muted">이 코스가 내 동네 지도에 ${actLabel(c.act)} 색으로 채워졌어요. 기록은 나만 봐요.</p>
        <p class="cap muted">회차 대화방은 ${expireText(s)}에 사라져요.</p>
      </div>
      <div class="sticky-cta"><button type="button" class="btn primary block" onclick="nav('#/map')">내 동네 지도 보기</button></div></div>`;
  }
  if (checked) {
    return `<div class="screen dark on-dark">${topbar('진행 중', { backTo: "nav('#/find')", right: reportBtn(id) })}
      <div class="pad stack g24" style="flex:1">
        <div><span class="status-pill">${icon('clock', 's')} ${endOf(s)}에 해산</span><h2 class="h1 mt16">${esc(c.name)}</h2><p class="body muted mt8">가장 느린 사람에 맞춰 같이 가요.</p></div>
        <div class="card" style="background:rgba(255,255,255,.08);color:var(--surface)"><div class="row between"><span class="cap muted">출발 ${s.t}</span><span class="cap muted">해산 ${endOf(s)}</span></div><div class="progress" aria-hidden="true"><i style="width:42%"></i></div><div class="cap muted">이동 기록 중 · 해산하면 자동으로 멈춰요</div></div>
        ${courseMap(c, { dark: true })}
        <div class="demo-strip" style="margin:0"><span>프로토타입 데모</span><button type="button" onclick="endSession('${id}')">길잡이가 해산했어요 → 완주 화면 보기</button></div>
      </div></div>`;
  }
  return `<div class="screen">${topbar(`${fmtDay(0)} 회차`, { backTo: "nav('#/find')", right: reportBtn(id) })}
    <div class="pad stack g16">
      <div><div class="time l">${fmtWhen(s)}</div><h2 class="h1 mt8">${esc(c.name)}</h2></div>
      <div class="card"><div class="row g12">${icon('pin')}<div><div class="body">출발 ${esc(c.start)}</div><div class="cap muted">체크인 마감 ${s.t} · 마감 뒤엔 온 사람끼리 출발해요</div></div></div>
        ${c.act === 'bike' ? `<div class="divider"></div><div class="row g12">${icon('bike')}<div><div class="body">따릉이는 출발 대여소에서</div><div class="cap muted">${esc(c.start)}</div></div></div>` : ''}</div>
      ${chatRow(s)}
      ${courseMap(c)}
      <p class="cap muted">체크인하면 이동 기록을 시작해요. 위치 권한이 없어도 체크인은 되고, 체크인한 뒤 길잡이가 해산을 누르면 완주로 남아요.</p>
    </div>
    <div class="sticky-cta"><div class="stack g12">${c.act === 'bike' ? `<button type="button" class="btn secondary block" onclick="announce('따릉이 앱으로 이동해요 (프로토타입)')">${icon('ext')} 따릉이로 이동</button>` : ''}<button type="button" class="btn primary block" onclick="checkIn('${id}')">체크인</button></div></div></div>`;
}
function checkIn(id) { if (!S.checkedIn.includes(id)) S.checkedIn.push(id); S.hostStage[id] = 'going'; save(); render(); announce('체크인됐어요. 이동 기록을 시작해요'); }
function markDone(courseId) { S.done = S.done.filter(x => x !== courseId).concat(courseId); }
function endSession(id) { const s = sessionById(id); S.hostStage[id] = 'ended'; markDone(s.course); save(); render(); announce('해산했어요. 완주했어요'); }

/* ================================================================
 * C' · 당일 (길잡이)
 * ================================================================ */
function viewHostToday(id) {
  const s = sessionById(id); if (!s) return notFound();
  const c = course(s.course); const stage = S.hostStage[id] || 'before'; const cnt = S.hostCounts[id] || { applied: s.applied, checked: 0 };
  const head = topbar('내가 여는 회차', { backTo: "nav('#/find')", right: reportBtn(id) });
  if (s.d !== 0 && stage === 'before') {
    return `<div class="screen">${head}<div class="pad stack g16 mt16"><div class="time l">${fmtWhen(s)}</div><h2 class="h1">${esc(c.name)}</h2>
      <p class="body muted">당일 화면은 ${fmtDay(s.d)}에 열려요. 그때 체크인 현황을 보고 출발해요.</p>${chatRow(s)}
      <div class="card" style="gap:var(--s2)"><div class="h4">지금 할 수 있는 것</div><p class="body">내 사정이나 날씨 때문에 출발 전까지 언제든 회차를 취소할 수 있어요. 동행자에게 바로 알림이 가요.</p></div></div>
      <div class="sticky-cta"><div class="stack g12"><button type="button" class="btn secondary block" onclick="nav('#/session/${id}')">회차 보기</button><button type="button" class="btn outline block" onclick="hostCancelSheet('${id}')">회차 취소</button></div></div></div>`;
  }
  if (stage === 'ended') {
    return `<div class="screen dark on-dark">${head}<div class="pad stack g24" style="flex:1;justify-content:center">
      <div class="okicon">${icon('check')}</div>
      <div><div class="hero-num">${cnt.checked}명</div><h2 class="h2 mt8">전원 완주로 마쳤어요</h2><p class="body muted mt8">${esc(c.name)} · ${fmtWhen(s)}</p></div>
      <p class="body muted">체크인한 ${cnt.checked}명 모두 완주로 남고, 이 코스는 각자 지도에 채워져요. 내 지도에도요.</p>
      ${chatClosedFor(s) ? '<p class="cap muted">대화방을 닫았어요.</p>' : `<div class="card" style="background:rgba(255,255,255,.08);color:var(--surface);gap:var(--s2)"><div class="h4">회차 대화방</div><p class="cap muted">${expireText(s)}에 사라져요. 지금 닫아도 돼요.</p><button type="button" class="btn outline" onclick="closeChatSheet('${id}')">대화방 닫기</button></div>`}
    </div><div class="sticky-cta"><button type="button" class="btn primary block" onclick="nav('#/map')">내 동네 지도 보기</button></div></div>`;
  }
  if (stage === 'going') {
    return `<div class="screen dark on-dark">${head}<div class="pad stack g24" style="flex:1">
      <div><span class="status-pill">${icon('clock', 's')} ${endOf(s)}에 해산</span><h2 class="h1 mt16">${esc(c.name)}</h2><p class="body muted mt8">동행자 ${cnt.checked}명과 진행 중. 가장 느린 사람에 맞춰요.</p></div>
      <div class="card" style="background:rgba(255,255,255,.08);color:var(--surface)"><div class="row between"><span class="cap muted">출발 ${s.t}</span><span class="cap muted">해산 ${endOf(s)}</span></div><div class="progress" aria-hidden="true"><i style="width:42%"></i></div></div>
      ${courseMap(c, { dark: true })}
    </div><div class="sticky-cta"><button type="button" class="btn primary block" onclick="hostEnd('${id}')">해산하기</button></div></div>`;
  }
  return `<div class="screen">${head}<div class="pad stack g16">
    <div><div class="time l">${fmtWhen(s)}</div><h2 class="h1 mt8">${esc(c.name)}</h2><p class="cap muted mt8">출발 ${esc(c.start)} · 체크인 마감 ${s.t}</p></div>
    <div class="count-grid"><div class="c"><b>${cnt.applied}</b><span class="cap muted">신청</span></div><div class="c"><b>${cnt.checked}</b><span class="cap muted">체크인</span></div><div class="c"><b>${Math.max(0, cnt.applied - cnt.checked)}</b><span class="cap muted">체크인 전</span></div></div>
    <div class="card"><div class="body">체크인은 동행자가 각자 하고, 마감 시각이 지나면 온 사람과 출발해요. 안 온 사람은 "불참"으로만 기록되고, 따로 드러나거나 불이익은 없어요.</div></div>
    ${chatRow(s)}
    ${courseMap(c)}
    <div class="demo-strip" style="margin:0"><span>프로토타입 데모</span><button type="button" onclick="hostSimCheck('${id}')">동행자 신청·체크인 +1</button></div>
    <button type="button" class="btn outline block" onclick="hostCancelSheet('${id}')">회차 취소</button></div>
    <div class="sticky-cta"><button type="button" class="btn primary block" ${cnt.checked === 0 ? 'disabled' : ''} onclick="hostStart('${id}')">${cnt.checked === 0 ? '체크인한 동행자가 없어요' : '출발하기'}</button></div></div>`;
}
function hostSimCheck(id) {
  const s = sessionById(id); const c = S.hostCounts[id] || { applied: s.applied, checked: 0 };
  if (c.checked >= c.applied) { if (c.applied >= s.cap) return; c.applied += 1; }
  c.checked += 1; S.hostCounts[id] = c; save(); render(); announce(`신청 ${c.applied}명, 체크인 ${c.checked}명`);
}
function hostStart(id) { S.hostStage[id] = 'going'; save(); render(); announce('출발했어요'); }
function hostEnd(id) { const s = sessionById(id); S.hostStage[id] = 'ended'; markDone(s.course); save(); render(); announce('해산했어요. 모두 완주했어요'); }
function hostCancelSheet(id) {
  const s = sessionById(id); const c = course(s.course); const cnt = (S.hostCounts[id] || { applied: s.applied }).applied;
  openSheet(`<div class="h2">회차를 취소할까요?</div><p class="body">"${esc(c.name)}" ${fmtWhen(s)}. 동행자 ${cnt}명에게 바로 알림이 가고, 대화방에 취소 안내가 올라가요.${s.d === 0 ? ' 출발 당일이에요.' : ''}</p>
    <div class="stack g12"><button type="button" class="btn secondary block" onclick="hostCancel('${id}')">회차 취소</button><button type="button" class="btn outline block" onclick="closeSheet()">닫기</button></div>`, { label: '회차 취소 확인' });
}
function hostCancel(id) { if (!isCancelled(id)) S.cancelledSessions.push(id); save(); closeSheet(true); nav('#/session/' + id); announce('회차를 취소했어요. 동행자에게 알림이 갔고, 대화방에 안내가 올라갔어요'); }

/* ================================================================
 * D · 내 동네 지도 (F-06 · F-13 · N-05)
 * ================================================================ */
let mapTab = 'all';
let drawnKey = '';          // 같은 완주 목록이면 다시 그리지 않음 (세션당 1회)
function openSessionsOf(cid) { return sessions().filter(s => s.course === cid && !isCancelled(s.id) && s.d >= 0).sort((a, b) => a.d - b.d || a.t.localeCompare(b.t)); }
function recommendations() {
  // 가까운 미완주 코스 중 열린 회차가 있는 것 최대 3개 (기준점: 최근 완주 코스의 끝, 없으면 지도 가운데)
  const lastDone = S.done.length ? course(S.done[S.done.length - 1]) : null;
  let ref = [500, 420];
  if (lastDone) { const p = parsePts(routeOf(lastDone).pts); ref = p[p.length - 1]; }
  return allCourses().filter(c => !S.done.includes(c.id) && openSessionsOf(c.id).length)
    .map(c => { const p = parsePts(routeOf(c).pts)[0]; return { c, dist: Math.hypot(p[0] - ref[0], p[1] - ref[1]) }; })
    .sort((a, b) => a.dist - b.dist).slice(0, 3).map(x => x.c);
}
function viewMap() {
  const done = S.done.filter(id => course(id));
  const mineIds = allCourses().filter(c => c.gu === myGu() || done.includes(c.id)).map(c => c.id);
  const ids = mineIds, fit = mineIds;
  const key = done.join(',');
  const draw = key !== drawnKey; drawnKey = key;
  const doneCourses = done.slice().reverse().map(course);
  const notYet = allCourses().filter(c => mineIds.includes(c.id) && !done.includes(c.id));
  const list = mapTab === 'done' ? doneCourses : mapTab === 'notyet' ? notYet : doneCourses.concat(notYet);
  const recs = recommendations();
  const recHtml = recs.length ? `<ul class="recs" aria-label="추천 코스">${recs.map(c => { const n = openSessionsOf(c.id)[0];
    return `<li><button type="button" class="rec" onclick="courseSheet('${c.id}')" aria-label="추천 코스 ${esc(c.name)}, ${actLabel(c.act)}, 다음 회차 ${fmtDay(n.d)} ${n.t}">
      <span class="thumb">${thumbSVG(c, false)}</span><span class="stack g4 grow"><span class="h4">${esc(c.name)}</span><span class="cap row g8">${actDot(c.act)}${actLabel(c.act)} · ${kmOf(c)}km</span><span class="time muted">${fmtDay(n.d)} ${n.t}</span></span></button></li>`; }).join('')}</ul>`
    : `<p class="pad cap muted">안 가본 코스에 지금 열린 회차가 없어요.</p>`;
  const acts = Object.keys(D.acts);
  return `<div class="screen">${topbar('내 동네 지도', { right: `<button type="button" class="textbtn" onclick="nav('#/me/settings')">${icon('shield', 's')} ${S.privacy === 'me' ? '나만 보기' : '공유 허용'}</button>${bellBtn()}` })}
    <div class="stack g8 mt8"><div class="pad row between"><span class="h4">다음 코스</span><span class="cap muted">지금 회차가 열린, 안 가본 코스</span></div>${recHtml}</div>
    <div class="map full mt16">${mapView({ ids, done, fit, pxw: 390, pxh: 360, interactive: true, draw, label: `내 동네 지도. 완주한 코스 ${done.length}개. 코스를 누르면 자세히 볼 수 있어요` })}</div>
    <div class="pad mt16"><div class="h2">완주한 코스 ${done.length}개</div><div class="cap muted">순위도 경쟁도 없어요</div>
      <div class="legend mt12">${acts.map(a => `<span><i style="--c:var(--act-${a})"></i>${actLabel(a)}</span>`).join('')}<span><i class="dash"></i>아직 안 가본 코스</span></div>
      <div class="strip chips mt16" style="padding-inline:0" role="group" aria-label="코스 필터">${[['all', '전체'], ['done', '완주'], ['notyet', '안 가본 코스']].map(([k, l]) => `<button type="button" class="chip" data-fk="mtab-${k}" aria-pressed="${mapTab === k}" onclick="mapTab='${k}';render()">${l}</button>`).join('')}</div>
      <ul class="mt8">${list.map(c => { const d = done.includes(c.id); const n = openSessionsOf(c.id).length;
        return `<li><button type="button" class="list-row" onclick="courseSheet('${c.id}')"><span class="thumb">${thumbSVG(c, d)}</span>
          <span class="stack g4 grow"><span class="h4">${esc(c.name)}</span><span class="cap muted meta">${actDot(c.act)}${segs([actLabel(c.act), `${kmOf(c)}km`, c.gu !== myGu() ? c.gu : '', d ? '완주' : n ? `열린 회차 ${n}` : ''])}</span></span>${icon('fwd', 'muted')}</button></li>`; }).join('')}</ul>
    </div><div class="footer-space"></div></div>`;
}
function courseSheet(id) {
  const c = course(id); const d = S.done.includes(id); const open = openSessionsOf(id);
  openSheet(`<div class="row between top"><div class="grow"><div class="h2">${esc(c.name)}</div>
      <div class="cap muted row g8 mt8">${actDot(c.act)}<span>${actLabel(c.act)} · ${kmOf(c)}km · 예상 완주 시간 ${minOf(c)}분</span></div></div>${d ? '<span class="badge">완주</span>' : ''}</div>
    <div class="map">${mapView({ ids: [id], done: [id], label: `${c.name} 코스 지도` })}</div>
    <p class="cap muted">출발 ${esc(c.start)} → 해산 ${esc(c.end)}${c.turn ? ` · ${esc(c.turn)}에서 돌아옴` : ''} · ${c.by === 'me' ? '내가 만든 코스' : '다른 길잡이가 만든 코스'}</p>
    ${open.length ? `<div class="h3">이 코스로 열린 회차</div><div class="stack g8">${open.map(s => `<button type="button" class="opt" onclick="closeSheet(true);nav('#/session/${s.id}')"><span class="stack g4 grow"><span class="time">${fmtWhen(s)}</span><span class="cap muted">${seatsText(s)}</span></span>${icon('fwd')}</button>`).join('')}</div>`
      : `<div class="stack g8"><p class="body">아직 열린 회차가 없어요</p><button type="button" class="btn secondary" onclick="closeSheet(true);startHostWith('${id}')">${icon('plus')} 이 코스로 회차 열기</button></div>`}
    <button type="button" class="btn outline block" onclick="closeSheet()">닫기</button>`, { label: c.name });
}
function startHostWith(cid) { const c = course(cid); H = newDraft(); H.act = c.act; H.courseMode = 'pick'; H.course = cid; nav(S.verified ? '#/host/new/3' : '#/host/new'); }

/* ================================================================
 * E · 회차 열기 (F-07)
 * ================================================================ */
function newDraft() { return { act: null, courseMode: null, course: null, start: '', end: '', km: '', d: null, t: '19:30', e: '', eEdited: false, cap: 8 }; }
const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const validKm = v => { const k = Number(v); return v !== '' && k > 0 && k <= 50; };
function step2Reason() {
  if (H.courseMode === 'pick') return H.course ? '' : '코스를 골라 주세요';
  if (H.courseMode === 'new') {
    if (!H.start.trim()) return '출발 지점을 넣어 주세요';
    if (!H.end.trim()) return '해산 지점을 넣어 주세요';
    if (!validKm(H.km)) return '거리를 숫자로 넣어 주세요';
    return '';
  }
  return '코스를 골라 주세요';
}
function step3Reason() {
  if (H.d === null) return '날짜를 골라 주세요';
  if (!/^\d{2}:\d{2}$/.test(H.t)) return '출발 시각을 골라 주세요';
  if (!/^\d{2}:\d{2}$/.test(H.e)) return '해산 시각을 골라 주세요';
  if (toMin(H.e) <= toMin(H.t)) return '해산은 출발보다 늦어야 해요';
  return '';
}
function hostStepGuard(step) { if (step >= 2 && !H.act) return 1; if (step >= 3 && step2Reason()) return 2; if (step >= 4 && step3Reason()) return 3; return step; }
function syncCta(id, reason, okLabel) { const b = document.getElementById(id); if (b) { b.disabled = !!reason; b.textContent = reason || okLabel; } }
function onStep2Input(k, v) { H[k] = v; syncCta('cta2', step2Reason(), '다음'); }
function kmBlur() {
  const bad = H.km !== '' && !validKm(H.km);
  document.getElementById('hkbox').classList.toggle('err', bad);
  document.getElementById('hk').setAttribute('aria-invalid', String(bad));
  const m = document.getElementById('hkmsg'); m.className = bad ? 'msg' : 'hint';
  m.innerHTML = bad ? `${icon('alert', 's')}거리는 50km까지, 0보다 큰 숫자로 넣어 주세요 (예: 3.2)` : '실제 앱에서는 지도에서 지점을 찍으면 거리가 계산돼요.';
}
function syncStep3() {
  const r = step3Reason(); syncCta('cta3', r, '미리보기');
  const bad = r === '해산은 출발보다 늦어야 해요';
  const box = document.getElementById('he2box'); if (!box) return;
  box.classList.toggle('err', bad); ['he2h', 'he2m'].forEach(i => document.getElementById(i).setAttribute('aria-invalid', String(bad)));
  document.getElementById('he2msg').hidden = !bad;
}
// 시각 입력: 24시간 · 분 10분 단위 (기기 언어와 관계없이 "19:30")
const up10 = t => addMin(t, (10 - Number(t.slice(3)) % 10) % 10);
// 해산 제안: 출발 + 예상 완주 시간을 10분 단위로 올림, 자정을 넘기지 않는다(23:50까지)
function suggestEnd(t, min) { const raw = toMin(t) + min; return raw > 23 * 60 + 50 ? '23:50' : up10(addMin(t, min)); }
const endHint = (t, min) => toMin(t) + min > 23 * 60 + 50 ? `예상 완주 시간 ${min}분이에요. 해산은 자정 전으로 제안했어요.` : `예상 완주 시간 ${min}분이라 해산 시각을 제안했어요. 바꿔도 돼요.`;
const expMin = () => { const c = draftCourse(); return c && routeOf(c).m ? minOf(c) : 40; };
// 10분 단위가 아닌 저장값은 보여 주되, 다른 값을 고르면 목록에서 뺀다
function pruneMin(id) { const m = document.getElementById(id + 'm'); if (!m) return; [...m.options].forEach(o => { if (Number(o.value) % 10 && !o.selected) o.remove(); }); }
function timeSel(id, v, name, extra = '') {
  const [h, m] = /^\d{2}:\d{2}$/.test(v) ? v.split(':') : ['', ''];
  const hs = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const ms = ['00', '10', '20', '30', '40', '50']; if (m && !ms.includes(m)) ms.push(m), ms.sort();
  const opts = (arr, cur) => arr.map(x => `<option value="${x}" ${x === cur ? 'selected' : ''}>${x}</option>`).join('');
  return `<select id="${id}h" aria-label="${name} 시" ${extra}>${opts(hs, h)}</select><span class="colon" aria-hidden="true">:</span><select id="${id}m" aria-label="${name} 분" ${extra}>${opts(ms, m)}</select>`;
}
const selTime = id => `${document.getElementById(id + 'h').value}:${document.getElementById(id + 'm').value}`;
function setSelTime(id, v) {
  const [h, m] = v.split(':'); const hs = document.getElementById(id + 'h'), msel = document.getElementById(id + 'm'); if (!hs || !msel) return;
  if (![...msel.options].some(o => o.value === m)) msel.add(new Option(m, m));
  hs.value = h; msel.value = m;
}
function onStartTime(v) {
  H.t = v;
  pruneMin('ht');
  if (!H.eEdited && /^\d{2}:\d{2}$/.test(v)) { H.e = suggestEnd(v, expMin()); setSelTime('he2', H.e); pruneMin('he2'); const hint = document.getElementById('he2hint'); if (hint) hint.textContent = endHint(v, expMin()); }
  syncStep3();
}
function onEndTime(v) { H.e = v; H.eEdited = true; pruneMin('he2'); syncStep3(); }
let H = newDraft();
function draftCourse() {
  if (H.courseMode === 'pick') return course(H.course);
  const km = Number(H.km) || 0;
  return { id: 'draft', name: `${H.start} → ${H.end}`, gu: myGu(), act: H.act, level: 'easy', trip: 'oneway', start: H.start, end: H.end, by: 'me',
    route: { m: km * 1000, pts: '560,470 590,440 625,452 652,432' } };
}
function viewHostNew(step) {
  step = Number(step) || 0;
  if (!S.verified && step === 0) {
    return `<div class="screen">${topbar('회차 열기', { backTo: "nav('#/find')" })}
      <div class="pad stack g24" style="flex:1;justify-content:center"><div class="okicon">${icon('shield')}</div>
        <div><h2 class="h1">회차를 열려면 본인인증이 필요해요</h2><p class="body muted mt12">처음 보는 사람들과 야외에서 같이 운동하는 모임이라, 모임을 여는 사람은 본인인증이 필요해요. 인증 정보는 동행자에게 보이지 않아요.</p></div>
        <div class="card"><div class="body">인증하면 이 회차의 길잡이가 돼요. 코스·시각·정원을 정하고, 당일에 출발과 해산을 눌러요.</div></div></div>
      <div class="sticky-cta"><div class="stack g12"><button type="button" class="btn primary block" onclick="S.verified=true;save();nav(H.course?'#/host/new/3':'#/host/new/1');announce('본인인증이 끝났어요 (프로토타입)')">본인인증하기</button><span class="cap muted center">프로토타입: 누르면 인증이 끝난 것으로 진행해요</span></div></div></div>`;
  }
  if (step === 0) step = 1;
  const fixed = hostStepGuard(step);
  if (fixed !== step) { setTimeout(() => replaceNav('#/host/new/' + fixed), 0); return '<div class="screen"></div>'; }
  const heads = ['', '활동', '코스', '날짜와 정원', '미리보기'];
  const bar = `<div class="pad mt8"><div class="steps" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="${step}" aria-label="회차 열기 ${step}/4단계">${[1, 2, 3, 4].map(i => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div></div>`;
  const head = topbar(`회차 열기 · ${heads[step]}`, { backTo: step === 1 ? "nav('#/find')" : `nav('#/host/new/${step - 1}')` }) + bar;

  if (step === 1) {
    return `<div class="screen">${head}<div class="pad stack g16 mt24"><h2 class="h2">어떤 활동인가요?</h2>
      <div class="stack g8">${Object.entries(D.acts).map(([k, a]) => `<button type="button" class="opt" data-fk="eact-${k}" aria-pressed="${H.act === k}" onclick="H.act='${k}';H.course=null;H.courseMode=null;H.e='';H.eEdited=false;render()">
        <span class="check ${H.act === k ? 'on' : ''}">${H.act === k ? icon('check', 's') : ''}</span>
        <span class="stack"><span class="body row g8" style="font-weight:700">${actDot(k)}${a.label}</span><span class="cap muted">${a.desc}</span></span></button>`).join('')}</div></div>
      <div class="sticky-cta"><button type="button" class="btn primary block" ${H.act ? '' : 'disabled'} onclick="nav('#/host/new/2')">${H.act ? '다음' : '활동을 골라 주세요'}</button></div></div>`;
  }
  if (step === 2) {
    const rec = allCourses().filter(c => c.act === H.act && c.gu === myGu());
    const r2 = step2Reason();
    return `<div class="screen">${head}<div class="pad stack g16 mt24"><h2 class="h2">어느 코스로 갈까요?</h2>
      ${rec.length ? `<p class="cap muted">${myGu()}에 다른 길잡이가 만든 ${actLabel(H.act)} 코스가 있어요. 그대로 써도 돼요.</p>
        <div class="stack g8">${rec.map(c => `<button type="button" class="opt" data-fk="ecourse-${c.id}" aria-pressed="${H.courseMode === 'pick' && H.course === c.id}" onclick="H.courseMode='pick';H.course='${c.id}';H.e='';H.eEdited=false;render()">
          <span class="thumb">${thumbSVG(c, S.done.includes(c.id))}</span><span class="stack g4 grow"><span class="h4">${esc(c.name)}</span><span class="cap muted">${kmOf(c)}km · 예상 완주 시간 ${minOf(c)}분</span><span class="cap muted">${esc(c.start)}</span></span></button>`).join('')}</div>`
      : `<p class="cap muted">${myGu()}에 아직 ${actLabel(H.act)} 코스가 없어요. 새로 만들어 주세요.</p>`}
      <button type="button" class="opt" data-fk="enew" aria-pressed="${H.courseMode === 'new'}" onclick="H.courseMode='new';H.course=null;H.e='';H.eEdited=false;render()"><span class="check ${H.courseMode === 'new' ? 'on' : ''}">${H.courseMode === 'new' ? icon('check', 's') : ''}</span><span class="h4">새로 만들기</span></button>
      ${H.courseMode === 'new' ? `<div class="stack g12">
        <div class="field"><label for="hs">출발 지점</label><div class="box"><input id="hs" value="${esc(H.start)}" placeholder="예: 망원나들목" autocomplete="off" oninput="onStep2Input('start',this.value)"></div></div>
        <div class="field"><label for="he">해산 지점</label><div class="box"><input id="he" value="${esc(H.end)}" placeholder="예: 양화대교 북단" autocomplete="off" oninput="onStep2Input('end',this.value)"></div></div>
        <div class="field"><label for="hk">거리 (km)</label><div class="box" id="hkbox"><input id="hk" inputmode="decimal" value="${esc(H.km)}" placeholder="예: 3.2" autocomplete="off" aria-describedby="hkmsg" oninput="onStep2Input('km',this.value.trim())" onblur="kmBlur()"></div><span class="hint" id="hkmsg">실제 앱에서는 지도에서 지점을 찍으면 거리가 계산돼요.</span></div>
      </div>` : ''}
      </div><div class="sticky-cta"><button type="button" id="cta2" class="btn primary block" ${r2 ? 'disabled' : ''} onclick="nav('#/host/new/3')">${r2 || '다음'}</button></div></div>`;
  }
  if (step === 3) {
    const c = draftCourse(); const min = c && routeOf(c).m ? minOf(c) : 40;
    if (!H.e && /^\d{2}:\d{2}$/.test(H.t)) H.e = suggestEnd(H.t, min);
    const reason = step3Reason(); const badEnd = reason === '해산은 출발보다 늦어야 해요';
    return `<div class="screen">${head}<div class="pad stack g16 mt24"><h2 class="h2">언제, 몇 명과 갈까요?</h2>
      <div class="field"><span class="label" id="dlab">날짜</span><div class="strip fit" style="padding:0" role="group" aria-labelledby="dlab">${Array.from({ length: 7 }, (_, i) => { const x = dateOf(i);
        return `<button type="button" class="day ${i === 0 ? 'today' : ''}" data-fk="eday-${i}" aria-pressed="${H.d === i}"${i === 0 ? ' aria-current="date"' : ''} aria-label="${fmtDay(i)}" onclick="H.d=${i};render()"><span class="w">${WD[x.getDay()]}</span><span class="d">${x.getDate()}</span></button>`; }).join('')}</div>${H.d !== null ? `<span class="cap">${fmtDay(H.d)}</span>` : ''}</div>
      <div class="row g12 top"><div class="field grow" role="group" aria-labelledby="htlab"><span class="label" id="htlab">출발</span><div class="box tsel">${timeSel('ht', H.t, '출발', `onchange="onStartTime(selTime('ht'))"`)}</div></div>
        <div class="field grow" role="group" aria-labelledby="he2lab"><span class="label" id="he2lab">해산</span><div class="box tsel ${badEnd ? 'err' : ''}" id="he2box">${timeSel('he2', H.e, '해산', `aria-invalid="${badEnd}" aria-describedby="he2msg" onchange="onEndTime(selTime('he2'))"`)}</div></div></div>
      <span class="errline" id="he2msg" role="alert" ${badEnd ? '' : 'hidden'}>${icon('alert', 's')}해산은 출발보다 늦어야 해요</span>
      <p class="cap muted" id="he2hint">${endHint(H.t, min)}</p>
      <div class="field"><label for="hc">정원</label><div class="box"><input id="hc" type="number" min="4" max="12" value="${H.cap}" onchange="H.cap=Math.min(12,Math.max(4,Number(this.value)||8));this.value=H.cap"><span class="cap muted">4~12명</span></div><span class="hint">길잡이 한 명이 가장 느린 사람까지 챙길 수 있는 인원이에요.</span></div></div>
      <div class="sticky-cta"><button type="button" id="cta3" class="btn primary block" ${reason ? 'disabled' : ''} onclick="nav('#/host/new/4')">${reason || '미리보기'}</button></div></div>`;
  }
  if (step === 4) {
    const c = draftCourse();
    const km = c.route ? Number(H.km).toFixed(1) : kmOf(c);
    return `<div class="screen">${head}<div class="pad stack g16 mt24"><h2 class="h2">동행자에게 이렇게 보여요</h2>
      <div class="card"><div class="row g8" style="flex-wrap:wrap">${actChip(H.act)}${plainChip(D.levels[c.level])}${plainChip(myGu())}</div>
        <div class="time">${fmtDay(H.d)} ${H.t} → ${H.e}</div><div class="h3">${esc(c.name)}</div>
        <div class="cap muted row g8">${icon('shield', 's')}<span>인증한 길잡이 · 0/${H.cap}명 신청 중</span></div>
        <div class="divider"></div><div class="num-l">${km}km</div>
        <div class="route-track" aria-hidden="true"><span class="dot"></span><span class="line"></span><span class="dot end"></span></div>
        <div class="row between top"><div><div class="time">${H.t}</div><div class="cap muted">출발 · ${esc(c.start)}</div></div><div style="text-align:right"><div class="time">${H.e}</div><div class="cap muted">해산 · ${esc(c.end)}</div></div></div></div>
      <div class="card"><div class="h3">열면 이렇게 돼요</div><ul class="stack g8 body">
        <li>${myGu()} 찾기 목록에 바로 올라가요</li><li>회차 대화방이 열리고, 신청한 동행자가 들어와요</li>
        <li>동행자 인원은 숫자로만 보여요</li><li>출발 전까지 언제든 취소할 수 있어요</li></ul></div></div>
      <div class="sticky-cta"><button type="button" class="btn primary block" onclick="createSession()">회차 열기</button></div></div>`;
  }
  return notFound();
}
function createSession() {
  let cid = H.course;
  if (H.courseMode === 'new') {
    const dc = draftCourse(); cid = 'u' + Date.now();
    S.courses.push(Object.assign({}, dc, { id: cid, name: `${H.start} → ${H.end}` }));
  }
  const s = { id: 'h' + Date.now(), course: cid, d: H.d, t: H.t, e: H.e, cap: H.cap, applied: 0 };
  S.created.push(s); S.hosted.push(s.id); S.hostCounts[s.id] = { applied: 0, checked: 0 }; save();
  const c = course(cid); H = newDraft();
  afterRender = () => openSheet(`<div class="okicon">${icon('check')}</div>
    <div><div class="h1">회차를 열었어요</div><p class="body muted mt8">이 회차의 길잡이가 됐어요. 회차 대화방도 열렸어요.</p></div>
    <div class="divider"></div>
    <div><div class="h3">${esc(c.name)}</div><div class="time mt8">${fmtWhen(s)}</div><div class="cap muted">${esc(c.start)}</div></div>
    <div class="map">${mapView({ ids: [cid], done: [cid], label: `${c.name} 코스 지도` })}</div>
    <div class="stack g12"><button type="button" class="btn secondary block" onclick="icsFor('${s.id}')">${icon('cal')} 내 캘린더에 추가</button>
      <button type="button" class="btn outline block" onclick="closeSheet(true);nav('#/session/${s.id}')">회차 보기</button>
      <button type="button" class="textbtn" style="align-self:center" onclick="closeSheet()">닫기</button></div>`, { label: '회차 열림' });
  if (location.hash === '#/find') render(); else nav('#/find');
  announce('회차를 열었어요');
}

/* ================================================================
 * G · 나 / G-1 프로필 편집 / G-2 설정 (F-12)
 * ================================================================ */
function viewMe() {
  const P = S.profile;
  const mine = sessions().filter(s => isApplied(s.id) || isMine(s)).sort((a, b) => a.d - b.d || a.t.localeCompare(b.t));
  return `<div class="screen">${topbar('나', { right: bellBtn() })}<div class="pad stack g16 mt8">
    <div class="card"><div class="row g16">${pi(P.icon, 64, '내 프로필 아이콘')}<div class="grow"><div class="h2">${esc(P.nick)}</div>
      <div class="cap muted">${esc(P.gu)} · 관심 활동 ${P.acts.length ? P.acts.map(a => `<span class="nowrap">${actLabel(a)}</span>`).join(', ') : '없음'}</div></div></div>
      <button type="button" class="btn outline" onclick="PD=null;nav('#/me/edit')">프로필 편집</button>
      <p class="small muted">아이콘과 닉네임은 회차 대화방에서만 보여요.</p></div>
    <div class="card" style="gap:var(--s2)"><div class="h3">내 회차</div>${mine.length ? `<ul>${mine.map(s => { const c = course(s.course);
      return `<li><button type="button" class="list-row" onclick="nav('#/session/${s.id}')"><span class="stack g4 grow"><span class="time">${fmtWhen(s)}</span><span class="body">${esc(c.name)}</span><span class="cap muted">${isCancelled(s.id) ? '취소됨' : isMine(s) ? '내가 여는 회차' : '신청됨'}</span></span>${icon('fwd', 'muted')}</button></li>`; }).join('')}</ul>`
      : `<p class="body muted">아직 없어요. 찾기에서 회차를 골라 보세요.</p>`}</div>
    <div class="card"><div class="row between"><div><div class="h3">완주한 코스 ${S.done.length}개</div><div class="cap muted">순위도 경쟁도 없어요</div></div><button type="button" class="btn outline" onclick="nav('#/map')">${icon('map')} 지도</button></div></div>
    <div class="card" style="padding-top:var(--s2);padding-bottom:var(--s2);gap:0">
      <button type="button" class="set-row" onclick="nav('#/me/settings')">${icon('gear')}<span class="grow body">설정</span><span class="cap muted">알림 · 기록 공개 · 인증</span>${icon('fwd', 'muted')}</button>
    </div>
    <div class="footer-space"></div></div></div>`;
}
let PD = null;           // 프로필 편집 초안
let nickTouched = false;
function nickError(n) {
  const v = (n || '').trim();
  if (v.length < 2) return '2자 이상 써 주세요';
  if (v.length > 10) return '10자까지 쓸 수 있어요';
  if (!/^[가-힣a-zA-Z0-9]+$/.test(v)) return '한글·영문·숫자만 쓸 수 있어요 (띄어쓰기 없이)';
  return '';
}
function viewMeEdit() {
  if (!PD) { PD = JSON.parse(JSON.stringify(S.profile)); nickTouched = false; }
  const err = nickError(PD.nick); const showErr = nickTouched && err;
  return `<div class="screen">${topbar('프로필 편집', { backTo: "PD=null;nav('#/me')" })}<div class="pad stack g24 mt16">
    <div class="row g16">${pi(PD.icon, 64, '선택한 프로필 아이콘')}<div><div class="h3" id="pvnick">${esc(PD.nick || '닉네임')}</div><div class="cap muted">대화방에서 이렇게 보여요</div></div></div>
    <div class="field"><span class="label" id="iclab">프로필 아이콘</span><div class="icon-grid" role="group" aria-labelledby="iclab">${D.icons.map((_, i) => `<button type="button" data-fk="icon-${i}" aria-pressed="${PD.icon === i}" aria-label="아이콘 ${i + 1}" onclick="PD.icon=${i};render()">${pi(i, 56)}</button>`).join('')}</div>
      <span class="hint">사진은 올리지 않아요. 걸은 길을 닮은 아이콘 중에서 골라요.</span></div>
    <div class="field"><label for="nick">닉네임</label><div class="box ${showErr ? 'err' : ''}" id="nickbox"><input id="nick" value="${esc(PD.nick)}" maxlength="12" autocomplete="off" aria-invalid="${!!showErr}" aria-describedby="nickmsg" oninput="PD.nick=this.value;syncNick(false)" onblur="syncNick(true)"></div>
      ${showErr ? `<span class="msg" id="nickmsg">${icon('alert', 's')}${err}</span>` : `<span class="hint" id="nickmsg">2~10자, 한글·영문·숫자</span>`}</div>
    <div class="field"><label for="gu">내 동네</label><div class="box"><select id="gu" onchange="PD.gu=this.value;PD.nick=document.getElementById('nick').value">${D.gus.map(g => `<option ${PD.gu === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div><span class="hint">찾기 목록의 기준 동네예요.</span></div>
    <div class="field"><span class="label" id="aclab">관심 활동</span><div class="row g8" style="flex-wrap:wrap" role="group" aria-labelledby="aclab">${Object.keys(D.acts).map(k => `<button type="button" class="chip" data-fk="pact-${k}" aria-pressed="${PD.acts.includes(k)}" onclick="PD.acts=PD.acts.includes('${k}')?PD.acts.filter(x=>x!=='${k}'):PD.acts.concat('${k}');render()">${actDot(k)}${actLabel(k)}</button>`).join('')}</div></div>
    <div class="footer-space"></div></div>
    <div class="sticky-cta"><button type="button" id="savebtn" class="btn primary block" ${err ? 'disabled' : ''} onclick="saveProfile()">${err ? '닉네임을 확인해 주세요' : '저장'}</button></div></div>`;
}
function syncNick(blur) {
  if (blur) nickTouched = true;
  const err = nickError(PD.nick); const show = nickTouched && err;
  const pv = document.getElementById('pvnick'); if (pv) pv.textContent = PD.nick || '닉네임';
  const box = document.getElementById('nickbox'); if (box) box.classList.toggle('err', !!show);
  const inp = document.getElementById('nick'); if (inp) inp.setAttribute('aria-invalid', String(!!show));
  const m = document.getElementById('nickmsg'); if (m) { m.className = show ? 'msg' : 'hint'; m.innerHTML = show ? `${icon('alert', 's')}${err}` : '2~10자, 한글·영문·숫자'; }
  syncCta('savebtn', err ? '닉네임을 확인해 주세요' : '', '저장');
}
function saveProfile() {
  if (nickError(PD.nick)) { nickTouched = true; render(); return; }
  PD.nick = PD.nick.trim(); S.profile = PD; PD = null; save(); nav('#/me'); announce('프로필을 저장했어요');
}
function toggleSetting(k) { S.settings[k] = !S.settings[k]; save(); render(); announce(S.settings[k] ? '알림을 켰어요' : '알림을 껐어요'); }
function viewSettings() {
  const T = (k, label, sub) => `<div class="set-row"><div class="grow"><div class="body">${label}</div><div class="cap muted">${sub}</div></div><button type="button" class="toggle" data-fk="set-${k}" role="switch" aria-checked="${!!S.settings[k]}" aria-label="${label}" onclick="toggleSetting('${k}')"></button></div>`;
  return `<div class="screen">${topbar('설정', { backTo: "nav('#/me')" })}<div class="pad stack g16 mt16">
    <div class="card" style="gap:0"><div class="h3" style="margin-bottom:var(--s2)">알림</div>
      ${T('notiSession', '회차 알림', '출발 1시간 전 · 회차 취소')}
      ${T('notiChat', '대화방 새 메시지', '신청한 회차의 대화방')}</div>
    <div class="card" style="gap:0"><div class="h3" style="margin-bottom:var(--s2)">이동 기록</div>
      <div class="set-row"><div class="grow"><div class="body">완주 코스 공유 허용</div><div class="cap muted">${S.privacy === 'me' ? '지금은 나만 보기예요' : '코스마다 공유할지 따로 골라요'}</div></div>
        <button type="button" class="toggle" data-fk="set-privacy" role="switch" aria-checked="${S.privacy !== 'me'}" aria-label="완주 코스 공유 허용" onclick="S.privacy=S.privacy==='me'?'share':'me';save();render();announce(S.privacy==='me'?'나만 보기로 바꿨어요':'공유를 허용했어요')"></button></div>
      <p class="cap muted mt8">기록은 체크인부터 해산까지만 남아요.</p></div>
    <div class="card" style="gap:0"><div class="h3" style="margin-bottom:var(--s2)">계정</div>
      <div class="set-row"><div class="grow"><div class="body">본인인증</div><div class="cap muted">${S.verified ? '인증됨 · 회차를 열 수 있어요' : '회차를 열 때 필요해요'}</div></div>${S.verified ? '<span class="badge">완료</span>' : `<button type="button" class="btn outline" onclick="nav('#/host/new')">인증</button>`}</div>
      <button type="button" class="set-row" onclick="announce('로그아웃은 프로토타입에서 동작하지 않아요')"><span class="grow body">로그아웃</span>${icon('fwd', 'muted')}</button></div>
    <div class="footer-space"></div></div></div>`;
}

/* ================================================================
 * A-1 · 동네 선택 시트 (상단 바 "📍마포구 ⌄")
 * ================================================================ */
function guSheet() {
  const cur = myGu();
  openSheet(`<div><div class="h2">내 동네</div><p class="cap muted mt8">찾기 목록의 기준 동네예요. 프로필 편집의 '내 동네'와 같이 바뀌어요.</p></div>
    <div class="stack g8" role="group" aria-label="동네 선택">${D.gus.map(g => `<button type="button" class="opt" aria-pressed="${cur === g}" onclick="setGu('${g}')"><span class="h4 grow">${g}</span>${cur === g ? icon('check') : ''}</button>`).join('')}</div>
    <button type="button" class="btn outline block" onclick="closeSheet()">닫기</button>`, { label: '내 동네 바꾸기' });
}
function setGu(g) {
  const changed = g !== myGu(); S.profile.gu = g; save(); closeSheet(true);
  afterRender = () => { const b = document.querySelector('.locbtn'); if (b) b.focus({ preventScroll: true }); };
  if (location.hash.startsWith('#/find')) render(); else nav('#/find');
  announce(changed ? `내 동네를 ${g}로 바꿨어요` : `내 동네는 ${g}예요`);
}

/* ================================================================
 * J · 알림 (앱 안 목록만 · 푸시 본문 설계는 범위 밖, MANUAL §4)
 * ================================================================ */
const hm = d => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
function notis() {
  if (!S.settings.notiSession) return [];
  const nowMin = toMin(hm(NOW)); const out = [];
  sessions().filter(s => isApplied(s.id) || isMine(s)).forEach(s => {
    const c = course(s.course); const mine = isMine(s);
    if (isCancelled(s.id)) {
      if (!mine) out.push({ id: 'x-' + s.id, kind: 'cancel', at: hm(NOW), title: '회차 취소 알림', parts: [c.name, fmtWhen(s)], note: '기기 캘린더에 넣었다면 지워 주세요.', href: `#/session/${s.id}` });
      return;
    }
    if (s.d === 0 && toMin(s.t) - 60 <= nowMin && S.hostStage[s.id] !== 'ended') {
      /* 받은 시각 = 출발 60분 전과 지금(신청·개설 시각) 중 늦은 쪽. 상대 표현("1시간 뒤") 금지 */
      const at = toMin(s.t) - 60 >= nowMin ? addMin(s.t, -60) : hm(NOW);
      out.push({ id: 'h-' + s.id, kind: 'soon', at, title: mine ? '내가 여는 회차 출발 알림' : '회차 출발 알림',
        parts: [c.name, fmtWhen(s), `출발 ${c.start}`], href: mine ? `#/host/today/${s.id}` : `#/today/${s.id}` });
    }
  });
  return out.sort((a, b) => b.at.localeCompare(a.at)).map(n => ({ ...n, at: `${fmtDay(0)} ${n.at}` }));
}
const unseenNotis = () => notis().filter(n => !S.notiSeen.includes(n.id));
function viewNotis() {
  const list = notis(); const fresh = new Set(unseenNotis().map(n => n.id));
  if (fresh.size) { S.notiSeen = S.notiSeen.concat([...fresh]); save(); }
  const head = topbar('알림', { backTo: 'back()', right: `<button type="button" class="iconbtn" aria-label="알림 설정" onclick="nav('#/me/settings')">${icon('gear')}</button>` });
  if (!list.length) {
    const off = !S.settings.notiSession;
    return `<div class="screen">${head}<div class="pad mt24"><div class="empty"><div class="h3">${off ? '회차 알림이 꺼져 있어요' : '새 알림이 없어요'}</div>
      <p class="body muted">${off ? '설정에서 켜면 출발 1시간 전 알림과 회차 취소 소식이 여기에 와요.' : '신청한 회차의 출발 1시간 전 알림과 회차 취소 소식이 여기에 와요.'}</p>
      ${off ? `<button type="button" class="btn outline" onclick="nav('#/me/settings')">알림 설정</button>` : ''}</div>
      <p class="cap muted mt16">대화방 새 메시지는 채팅 탭에서 볼 수 있어요.</p></div></div>`;
  }
  return `<div class="screen">${head}<div class="pad mt8"><div class="card" style="padding-top:var(--s2);padding-bottom:var(--s2);gap:0"><ul>${list.map(n => `<li><button type="button" class="list-row top" onclick="nav('${n.href}')">
      <span class="noti-ic">${icon(n.kind === 'cancel' ? 'alert' : 'clock')}</span>
      <span class="stack g4 grow"><span class="h4">${n.title}</span><span class="cap muted">${esc(n.parts[0])}</span><span class="time muted">${n.parts[1]}</span>${n.parts[2] ? `<span class="cap muted">${esc(n.parts[2])}</span>` : ''}${n.note ? `<span class="cap muted">${n.note}</span>` : ''}<span class="stamp">${n.at}</span></span>
      ${fresh.has(n.id) ? '<span class="dot-new static" aria-hidden="true"></span><span class="sr">새 알림</span>' : ''}</button></li>`).join('')}</ul></div>
    <p class="cap muted mt16">대화방 새 메시지는 채팅 탭에서 볼 수 있어요.</p></div><div class="footer-space"></div></div>`;
}

/* ================================================================
 * K · 검색 (코스 이름 · 출발/해산 지점 · 활동 · 동네)
 * 입력 중에는 결과 영역만 다시 그린다 (DESIGN 7 DON'T: 입력칸에서 화면 전체 다시 그리기 금지)
 * ================================================================ */
let searchQ = '';
function viewSearch() {
  return `<div class="screen"><header class="topbar search"><button type="button" class="iconbtn" aria-label="뒤로" onclick="back()">${icon('back')}</button><h1 class="sr">검색</h1>
    <label class="searchbox">${icon('search')}<span class="sr">코스, 출발 지점, 활동으로 검색</span><input id="search-in" type="search" enterkeyhint="search" autocomplete="off" maxlength="30" placeholder="코스, 출발 지점, 활동" value="${esc(searchQ)}" oninput="searchQ=this.value;renderSearch()"></label></header>
    <p id="search-count" class="sr" aria-live="polite"></p><div id="search-results">${searchResults()}</div><div class="footer-space"></div></div>`;
}
let searchCount = '';
function renderSearch() {
  const r = document.getElementById('search-results'); if (r) r.innerHTML = searchResults();
  const c = document.getElementById('search-count'); if (c) c.textContent = searchCount;
}
function setSearch(t) { searchQ = t; const i = document.getElementById('search-in'); if (i) { i.value = t; i.focus(); } renderSearch(); }
function searchResults() {
  const q = searchQ.trim().toLowerCase();
  searchCount = '';
  if (!q) {
    const quick = Object.keys(D.acts).map(actLabel).concat(D.gus);
    return `<div class="pad mt16"><p class="body muted">코스 이름, 출발 지점, 활동, 동네로 찾아요.</p>
      <div class="row g8 mt12" style="flex-wrap:wrap" role="group" aria-label="빠른 검색">${quick.map(t => `<button type="button" class="chip" onclick="setSearch('${t}')">${t}</button>`).join('')}</div></div>`;
  }
  const match = c => [c.name, c.start, c.end, actLabel(c.act), c.gu].some(t => String(t).toLowerCase().includes(q));
  const ss = sessions().filter(s => !isCancelled(s.id) && s.d >= 0 && s.d <= 6 && match(course(s.course))).sort((a, b) => a.d - b.d || a.t.localeCompare(b.t));
  const cs = allCourses().filter(match);
  searchCount = ss.length || cs.length ? `열린 회차 ${ss.length}개, 코스 ${cs.length}개` : '맞는 회차와 코스가 없어요';
  if (!ss.length && !cs.length) {
    return `<div class="pad mt24"><div class="empty"><div class="h3">‘${esc(searchQ.trim())}’에 맞는 회차와 코스가 없어요</div>
      <p class="body muted">코스 이름, 출발 지점(예: 망원나들목), 활동(산책·조깅·러닝·라이트 바이크)으로 찾아보세요.</p></div></div>`;
  }
  return `${ss.length ? `<div class="datehead">열린 회차 ${ss.length}개</div><div class="pad stack g12">${ss.map(sessionCard).join('')}</div>` : ''}
    ${cs.length ? `<div class="datehead">코스 ${cs.length}개</div><div class="pad"><ul>${cs.map(c => { const d = S.done.includes(c.id); const n = openSessionsOf(c.id).length;
      return `<li><button type="button" class="list-row" onclick="courseSheet('${c.id}')"><span class="thumb">${thumbSVG(c, d)}</span>
        <span class="stack g4 grow"><span class="h4">${esc(c.name)}</span><span class="cap muted meta">${actDot(c.act)}${segs([actLabel(c.act), `${kmOf(c)}km`, c.gu !== myGu() ? c.gu : '', d ? '완주' : n ? `열린 회차 ${n}` : ''])}</span></span>${icon('fwd', 'muted')}</button></li>`; }).join('')}</ul></div>` : ''}`;
}

/* ================================================================
 * I · 채팅 (내 회차 대화방 목록 · F-11)
 * 목록에는 사람 이름·아이콘을 쓰지 않는다(MANUAL F-12): 보낸 사람은 역할(길잡이·동행자·나)로만
 * ================================================================ */
const myRooms = () => sessions().filter(s => canChat(s) && !chatClosedFor(s)).sort((a, b) => a.d - b.d || a.t.localeCompare(b.t));
const totalUnread = () => myRooms().reduce((n, s) => n + unreadCount(s.id), 0);
function lastLine(s) {
  const all = chatMsgs(s); const m = all[all.length - 1];
  if (m.who === 'sys') return { who: '', text: m.text, t: '' };
  const role = m.who === 'me' || (m.guide && isMine(s)) ? '나' : m.guide ? '길잡이' : '동행자';
  return { who: role, text: m.text, t: m.t };
}
function viewChats() {
  const rooms = myRooms();
  const head = topbar('채팅', { right: bellBtn() });
  if (!rooms.length) {
    return `<div class="screen">${head}<div class="pad mt8"><div class="empty"><div class="h3">아직 들어간 대화방이 없어요</div>
      <p class="body muted">회차를 신청하거나 열면 그 회차의 대화방이 여기에 생겨요. 대화방은 해산 24시간 뒤 사라져요.</p>
      <button type="button" class="btn outline" onclick="nav('#/find')">모임 찾기</button></div></div></div>`;
  }
  return `<div class="screen">${head}<p class="pad cap muted mt8">회차마다 대화방이 하나씩 있어요. 해산 24시간 뒤 사라져요.</p>
    <div class="pad mt8"><ul>${rooms.map(s => { const c = course(s.course); const u = unreadCount(s.id); const L = lastLine(s);
      const state = isCancelled(s.id) ? '취소됨' : S.hostStage[s.id] === 'ended' ? '해산' : '';
      return `<li><button type="button" class="list-row room" onclick="nav('#/session/${s.id}/chat')">
        <span class="thumb">${thumbSVG(c, S.done.includes(c.id))}</span>
        <span class="stack g4 grow"><span class="row between g8"><span class="h4 ell">${esc(c.name)}</span>${L.t ? `<span class="stamp">${L.t}</span>` : ''}</span>
          <span class="time muted">${state ? `${state} · ` : ''}${fmtWhen(s)}</span>
          <span class="row between g8"><span class="cap muted ell">${L.who ? `${L.who} · ` : ''}${esc(L.text)}</span>${u ? `<span class="count" aria-hidden="true">${countText(u)}</span><span class="sr">, 새 메시지 ${u}개</span>` : ''}</span></span></button></li>`; }).join('')}</ul></div>
    <div class="footer-space"></div></div>`;
}

function notFound() {
  return `<div class="screen">${topbar('찾을 수 없어요', { backTo: "nav('#/find')" })}<div class="pad mt24"><div class="empty"><div class="h3">이 화면을 찾을 수 없어요</div>
    <p class="body muted">회차가 취소됐거나 주소가 잘못됐을 수 있어요.</p><button type="button" class="btn secondary" onclick="nav('#/find')">모임 찾기</button></div></div></div>`;
}

/* 데모 패널 */
document.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', () => {
  const k = b.dataset.demo;
  if (k === 'reset') resetAll();
  else if (k === 'find') nav('#/find');
  else if (k === 'chat') { if (!isApplied('s1')) { S.applied.push('s1'); save(); } nav('#/session/s1/chat'); }
  else if (k === 'host') nav('#/host/new');
  else if (k === 'me') nav('#/me');
}));

render();
