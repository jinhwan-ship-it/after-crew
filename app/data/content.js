/* After Crew · 프로토타입 콘텐츠 데이터 (r4)
 * 코스 선은 map.js의 routes(OSM 실지형에서 만든 좌표). 여기서는 이름·활동·출발/해산 장소·왕복 여부만 정한다.
 * 거리(km)와 예상 완주 시간은 app.js가 routes의 실측 길이와 활동별 페이스로 계산한다.
 * 닉네임·대화는 프로토타입 시연용 예시다. 실제 사람이 아니다.
 */
window.AC_DATA = {
  /* 프로토타입 기준 시각: 2026-09-29 (화) 18:55 */
  now: [2026, 8, 29, 18, 55],

  acts: {
    walk: { label: '산책', desc: '천천히 걸으며 동네 한 바퀴', pace: 15 },
    jog:  { label: '조깅', desc: '대화할 수 있는 속도로', pace: 8 },
    run:  { label: '러닝', desc: '조금 더 빠르게 달리는 코스', pace: 6 },
    bike: { label: '라이트 바이크', desc: '따릉이로도 충분한 평지 코스', pace: 6 }
  },
  levels: { easy: '쉬움', mid: '보통' },
  gus: ['마포구', '서대문구', '용산구', '영등포구'],

  /* trip: 'loop' 한 바퀴(출발=해산) · 'round' 왕복(선은 한 방향, 거리 ×2) · 'oneway' 편도 */
  courses: [
    { id: 'c1', name: '망원 한강공원 한 바퀴', gu: '마포구', act: 'walk', level: 'easy', trip: 'loop',   start: '망원나들목', end: '망원나들목' },
    { id: 'c2', name: '경의선숲길 왕복',       gu: '마포구', act: 'jog',  level: 'easy', trip: 'round',  start: '홍대입구역 3번 출구', end: '홍대입구역 3번 출구', turn: '가좌역 쪽 끝' },
    { id: 'c3', name: '한강 평지 라이드',      gu: '마포구', act: 'bike', level: 'easy', trip: 'oneway', start: '망원나들목 따릉이 대여소', end: '마포나들목' },
    { id: 'c4', name: '불광천 러닝 왕복',      gu: '마포구', act: 'run',  level: 'mid',  trip: 'round',  start: '증산역 앞 불광천', end: '증산역 앞 불광천', turn: '월드컵경기장역 쪽' },
    { id: 'c5', name: '홍제천 산책길',         gu: '서대문구', act: 'walk', level: 'easy', trip: 'round', start: '홍제천 인공폭포', end: '홍제천 인공폭포', turn: '홍제역 쪽' },
    { id: 'c6', name: '노을공원 둘레',         gu: '마포구', act: 'walk', level: 'mid',  trip: 'loop',   start: '노을계단 입구', end: '노을계단 입구' },
    { id: 'c7', name: '효창공원 두 바퀴',      gu: '용산구', act: 'jog',  level: 'easy', trip: 'loop2',  start: '효창공원앞역 쪽 입구', end: '효창공원앞역 쪽 입구' },
    { id: 'c8', name: '여의도 한강공원 러닝',  gu: '영등포구', act: 'run', level: 'easy', trip: 'round', start: '여의나루 한강공원 입구', end: '여의나루 한강공원 입구', turn: '국회의사당 뒤편' }
  ],

  /* 회차 (일회성). d = 날짜 오프셋(기준일 0), t 출발. 해산 시각은 예상 완주 시간으로 계산 */
  sessions: [
    { id: 's1', course: 'c1', d: 0, t: '19:30', cap: 8,  applied: 5, guide: { nick: '망원산책', icon: 3 } },
    { id: 's2', course: 'c2', d: 1, t: '19:00', cap: 6,  applied: 3, guide: { nick: '연남러너', icon: 5 } },
    { id: 's3', course: 'c3', d: 3, t: '19:30', cap: 8,  applied: 6, guide: { nick: '한강따릉', icon: 8 } },
    { id: 's4', course: 'c4', d: 4, t: '08:00', cap: 10, applied: 4, guide: { nick: '불광천아침', icon: 1 } },
    { id: 's5', course: 'c6', d: 5, t: '08:00', cap: 8,  applied: 2, guide: { nick: '노을산책', icon: 11 } },
    { id: 's6', course: 'c2', d: 6, t: '20:00', cap: 6,  applied: 1, guide: { nick: '연남러너', icon: 5 } },
    /* 근처 동네 (서대문구·용산구·영등포구). 내 동네 목록에는 안 뜨고, 빈 날 추천에만 */
    { id: 'n1', course: 'c5', d: 2, t: '19:30', cap: 8,  applied: 3, guide: { nick: '홍제천길', icon: 7 } },
    { id: 'n2', course: 'c7', d: 2, t: '20:00', cap: 6,  applied: 2, guide: { nick: '효창저녁', icon: 9 } },
    { id: 'n3', course: 'c8', d: 2, t: '19:00', cap: 10, applied: 5, guide: { nick: '여의도런', icon: 2 } }
  ],
  weatherRule: '출발 3시간 전 강수확률이 60% 이상이면 취소해요',

  /* 회차 대화방 예시 (프로토타입 시연용). who: guide · peer · sys */
  chatSeed: {
    s1: [
      { who: 'guide', t: '18:40', text: '19:25부터 망원나들목 계단 아래에 있을게요. 남색 모자 쓰고 있어요.' },
      { who: 'peer', nick: '퇴근후한바퀴', icon: 6, t: '18:48', text: '야근이 조금 길어져서 19:35쯤 도착해요. 먼저 출발하셔도 괜찮아요.' },
      { who: 'guide', t: '18:50', text: '네, 첫 코너에서 천천히 걸을게요. 편하게 오세요.' }
    ],
    s2: [ { who: 'guide', t: '12:10', text: '9/30 (수) 19:00, 홍대입구역 3번 출구 앞 벤치에서 모여요.' } ],
    s3: [ { who: 'guide', t: '09:20', text: '따릉이는 각자 대여소에서 빌려 주세요. 헬멧은 대여소에 있어요.' } ]
  },
  quick: {
    peer:  ['조금 늦어요', '못 가게 됐어요', '출발 장소 도착했어요'],
    guide: ['날씨 때문에 취소할게요', '출발 장소 도착했어요', '조금 늦어요']
  },

  /* 프로필 아이콘 12종 · 루트 라인 모티프(시작 점 → 선 → 종료 점), 40×40 */
  icons: [
    { d: 'M11 29 L29 11', s: [11, 29], e: [29, 11] },
    { d: 'M11 11 L11 29 L29 29', s: [11, 11], e: [29, 29] },
    { d: 'M10 20 C16 8 24 32 30 20', s: [10, 20], e: [30, 20] },
    { d: 'M12 29 L12 16 A8 8 0 0 1 28 16 L28 29', s: [12, 29], e: [28, 29] },
    { d: 'M10 27 L16 13 L23 27 L30 13', s: [10, 27], e: [30, 13] },
    { d: 'M10 13 L30 13 L10 27 L30 27', s: [10, 13], e: [30, 27] },
    { d: 'M20 11 A9 9 0 1 1 11.5 23', s: [20, 11], e: [11.5, 23] },
    { d: 'M10 25 Q20 5 30 25', s: [10, 25], e: [30, 25] },
    { d: 'M11 29 L11 11 L29 11 L29 29', s: [11, 29], e: [29, 29] },
    { d: 'M10 28 L20 12 L30 28 L15 28', s: [10, 28], e: [15, 28] },
    { d: 'M10 14 C10 32 30 32 30 14', s: [10, 14], e: [30, 14] },
    { d: 'M10 25 L17 25 L17 15 L24 15 L24 25 L30 25', s: [10, 25], e: [30, 25] }
  ]
};
