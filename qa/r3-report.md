# impeccable r3 · 390×844 · 2026-09-29
page errors: 0
360 A: doc 360 view 360/360 · 360 B: doc 360 view 360/360

| 화면 | 가로 스크롤 | 주 버튼 | h1 | 44px 미만 |
|---|---|---|---|---|
| A-find | ○ | 0  | ○ 마포구 모임 | ○ |
| A-find-bike | ○ | 0  | ○ 마포구 모임 | ○ |
| A-find-empty | ○ | 0  | ○ 마포구 모임 | ○ |
| B-session-walk | ○ | 1 신청하기 | ○ 회차 | ○ |
| B-session-walk-bottom | ○ | 1 신청하기 | ○ 회차 | ○ |
| B-session-bike | ○ | 1 신청하기 | ○ 회차 | ○ |
| B-session-bike-fee | ○ | 1 신청하기 | ○ 회차 | ○ |
| B1-apply-sheet | ○ | 1 신청하기 | ○ 회차 | ○ |
| B-session-applied | ○ | 0  | ○ 회차 | ○ |
| F-report-sheet | ○ | 0  | ○ 회차 | ○ |
| B-cancel-sheet | ○ | 0  | ○ 회차 | ○ |
| A-find-mine | ○ | 0  | ○ 마포구 모임 | ○ |
| C-today-before | ○ | 1 체크인 | ○ 9/29 (화) 회차 | ○ |
| C-today-going | ○ | 0  | ○ 진행 중 | ○ |
| C-today-done | ○ | 1 내 동네 지도 보기 | ○ 완주 | ○ |
| D-map | ○ | 0  | ○ 내 동네 지도 | ○ |
| D-map-list | ○ | 0  | ○ 내 동네 지도 | ○ |
| D1-course-sheet-open | ○ | 0  | ○ 내 동네 지도 | ○ |
| D1-course-sheet-done | ○ | 0  | ○ 내 동네 지도 | ○ |
| G-me | ○ | 0  | ○ 나 | ○ |
| E0-verify-gate | ○ | 1 본인인증 하기 | ○ 회차 열기 | ○ |
| E1-activity | ○ | 1 활동을 골라 주세요 | ○ 회차 열기 · 활동 | ○ |
| E1-activity-picked | ○ | 1 다음 | ○ 회차 열기 · 활동 | ○ |
| E2-course | ○ | 1 코스를 골라 주세요 | ○ 회차 열기 · 코스 | ○ |
| E2-course-new | ○ | 1 코스를 골라 주세요 | ○ 회차 열기 · 코스 | ○ |
| E3-when | ○ | 1 날짜를 골라 주세요 | ○ 회차 열기 · 날짜와 정원 | ○ |
| E3-when-filled | ○ | 1 미리보기 | ○ 회차 열기 · 날짜와 정원 | ○ |
| E4-preview | ○ | 1 회차 열기 | ○ 회차 열기 · 미리보기 | ○ |
| E5-created-sheet | ○ | 0  | ○ 마포구 모임 | ○ |
| A-find-host-mine | ○ | 0  | ○ 마포구 모임 | ○ |
| Cp-host-before | ○ | 1 체크인한 동행자가 없어요 | ○ 내가 여는 회차 | ○ |
| Cp-host-checked | ○ | 1 출발하기 | ○ 내가 여는 회차 | ○ |
| Cp-host-cancel-sheet | ○ | 1 출발하기 | ○ 내가 여는 회차 | ○ |
| Cp-host-going | ○ | 1 해산하기 | ○ 내가 여는 회차 | ○ |
| Cp-host-ended | ○ | 1 내 동네 지도 보기 | ○ 내가 여는 회차 | ○ |
| D-map-host-just | ○ | 0  | ○ 내 동네 지도 | ○ |
| X-notfound | ○ | 0  | ○ 없는 회차 | ○ |

## 라운드 이력 (r1 → r3)
- r1 자체 점검: em dash 4(제목·주석) → 0 · 신청 확인 시트 주 버튼 2개 → 시트 확인은 보조 · 요금 안내 링크 60×16 → 44 행 · 칩/토글 터치 44 확장 · 미지정 라우트 → 없는 회차 화면 · 길잡이 데모(신청 0명이면 시뮬 불가) 수정
- r1 시각 점검: 다크 화면 상태바 흰 배경 → `text` · 완주·진행 중 화면 accent 3곳 → 주 버튼 1곳, 야간 지도 추가 · 단일 코스 지도 확대(zoom) · 짧은 화면 sticky CTA 하단 고정 · 활동 칩 줄바꿈 · 시트 포커스는 dialog 컨테이너 + Tab 가둠 · 코스 작성자 가명 표시 제거
- r2 독립 검증(서브에이전트, BLOCKER 2·MAJOR 5·MINOR 5) → r3 전부 수정:
  - BLOCKER `icsFor(id)` TypeError → id/객체 모두 받음 · 새로 그린 코스 미영속(새로고침 시 앱 죽음) → `S.courses` 저장 + 코스 없는 회차 필터
  - MAJOR 지도 accent 3곳 → 1곳 · 오늘 점·고정 카드 배지 accent → text/accent-soft · 미래 회차 길잡이 "당일 현황" 진입 → 당일 안내 게이트 + 회차 취소 · ics "길잡이 undefined" 제거 · 고정 카드 완주 상태·취소 후 잔존 상태 정리
  - MINOR 해산 시각 NaN 방어 + 비활성 사유 3종 · 개설 완료 시트 타이머 경쟁 → render 훅 + 닫기 · 카피("만나는"·"오는 7일") · 점선 스펙 · `.opt` 테두리 제거 · draw 모션 600ms · 시드 인원 mutate 제거(`appliedCount`) · 따릉이 버튼 1b 보조 · 토큰 밖 hex/px 정리(SVG는 var(--token))
- 실행 검증 qa/flow-check.js: 새 코스 개설 → 새로고침 생존 ○ · .ics TZID 포맷 ○ · undefined 0 · 신청→체크인→취소→재신청 배지 "신청됨" ○ · 미래 회차 게이트 ○ · 미지정 host 라우트 ○ · 페이지 에러 0
- 남은 알림: 지도 D '방금 완주' 선(accent 4px on `bg`)은 DESIGN 허용 1곳. 범례 스와치는 같은 의미의 설명으로 방금 완주가 있을 때만 표시. 미검증 임시값(H-13 요금 표시 강도 · H-15 인증 안내 강도 · 근처 추천 3개)은 그대로.
