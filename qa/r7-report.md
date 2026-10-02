# impeccable r7 · 390×844
글꼴: 웹폰트(Google Fonts: Noto Sans KR · Archivo) · 44px 미만 = ::before 포함 터치 영역
page errors: 0
360 (doc/view/client): A-find 360/360/360 · B-session 360/360/360 · D-map 360/360/360 · H-chat 360/360/360 · I-chats 360/360/360 · K-search 360/360/360

| 화면 | 가로 스크롤 | 주 버튼 | accent 요소 수 | h1 | 44px 미만 |
|---|---|---|---|---|---|
| A-find | ○ | 0  | 0 | 마포구 모임 | ○ |
| A-find-run | ○ | 0  | 0 | 마포구 모임 | ○ |
| A-find-empty | ○ | 0  | 0 | 마포구 모임 | ○ |
| I-chats-empty | ○ | 0  | 0 | 채팅 | ○ |
| J-noti-empty | ○ | 0  | 0 | 알림 | ○ |
| B-session-bike | ○ | 1 신청하기 | 1 | 회차 | ○ |
| B-session-bike-scroll | ○ | 1 신청하기 | 1 | 회차 | ○ |
| B-session-walk | ○ | 1 신청하기 | 1 | 회차 | ○ |
| B1-apply-sheet | ○ | 1 신청하기 | 1 | 회차 | ○ |
| B-session-applied-today | ○ | 1 체크인하러 가기 | 1 | 회차 | ○ |
| H-chat | ○ | 0  | 0 | 망원 한강공원 한 바퀴 | ○ |
| H-chat-quick | ○ | 0  | 0 | 망원 한강공원 한 바퀴 | ○ |
| H-chat-sent | ○ | 0  | 0 | 망원 한강공원 한 바퀴 | ○ |
| H-msg-sheet | ○ | 0  | 0 | 망원 한강공원 한 바퀴 | ○ |
| F-report-msg | ○ | 0  | 0 | 망원 한강공원 한 바퀴 | ○ |
| A-find-pinned | ○ | 0  | 0 | 마포구 모임 | ○ |
| I-chats | ○ | 0  | 0 | 채팅 | ○ |
| J-notifications | ○ | 0  | 0 | 알림 | ○ |
| A1-gu-sheet | ○ | 0  | 0 | 마포구 모임 | ○ |
| K-search | ○ | 0  | 0 | 검색 | ○ |
| K-search-results | ○ | 0  | 0 | 검색 | ○ |
| K-search-none | ○ | 0  | 0 | 검색 | ○ |
| C-today-before | ○ | 1 체크인 | 1 | 9/29 (화) 회차 | ○ |
| C-today-going | ○ | 0  | 0 | 진행 중 | ○ |
| C-today-done | ○ | 1 내 동네 지도 보기 | 1 | 완주 | ○ |
| D-map | ○ | 0  | 0 | 내 동네 지도 | ○ |
| D-map-list | ○ | 0  | 0 | 내 동네 지도 | ○ |
| D1-course-sheet | ○ | 0  | 0 | 내 동네 지도 | ○ |
| D1-course-sheet-other | ○ | 0  | 0 | 내 동네 지도 | ○ |
| G-me | ○ | 0  | 0 | 나 | ○ |
| G1-edit | ○ | 1 저장 | 1 | 프로필 편집 | ○ |
| G1-edit-error | ○ | 1 닉네임을 확인해 주세요 | 1 | 프로필 편집 | ○ |
| G-me-saved | ○ | 0  | 0 | 나 | ○ |
| G2-settings | ○ | 0  | 0 | 설정 | ○ |
| E0-verify | ○ | 1 본인인증 하기 | 1 | 회차 열기 | ○ |
| E1-activity | ○ | 1 다음 | 1 | 회차 열기 · 활동 | ○ |
| E2-course | ○ | 1 다음 | 1 | 회차 열기 · 코스 | ○ |
| E3-when | ○ | 1 미리보기 | 1 | 회차 열기 · 날짜와 정원 | ○ |
| E4-preview | ○ | 1 회차 열기 | 1 | 회차 열기 · 미리보기 | ○ |
| E5-created | ○ | 0  | 0 | 마포구 모임 | ○ |
| A-find-host-pinned | ○ | 0  | 0 | 마포구 모임 | ○ |
| H-chat-host-empty | ○ | 0  | 0 | 망원 한강공원 한 바퀴 | ○ |
| Cp-host-checked | ○ | 1 출발하기 | 1 | 내가 여는 회차 | ○ |
| Cp-host-going | ○ | 1 해산하기 | 1 | 내가 여는 회차 | ○ |
| Cp-host-ended | ○ | 1 내 동네 지도 보기 | 1 | 내가 여는 회차 | ○ |
| Cp-close-chat-sheet | ○ | 1 내 동네 지도 보기 | 1 | 내가 여는 회차 | ○ |
| H-chat-closed | ○ | 0  | 0 | 회차 | ○ |
| X-notfound | ○ | 0  | 0 | 찾을 수 없어요 | ○ |

## r7 변경 (헤드 리뷰 r6 · 2026-10-02 "채팅 바 정렬 · 채팅 문구가 터치 따라 움직임")

| # | 무엇 | 코드 | DESIGN |
|---|---|---|---|
| 1 | 대화 입력 바 문구 칩: 한 줄 가로 스크롤(390에서 60px 넘침) → 줄바꿈 + 줄마다 채우기. 손가락 따라 밀리지 않고, 줄마다 입력 줄 좌우 끝(24 · 366)에 맞음. 한 줄에 다 들어가면 한 줄 | app.css `.composer .strip` · `.composer .strip .chip` | 3d v1.5 · 7칸 DON'T |
| 2 | 보내기 원 44 → 48: 입력창 48과 위아래 선 일치(r6: 위 720 / 722) | `.composer .send` | 6칸 크기 · 3d · 7칸 DON'T |
| 3 | 폰 폭(≤760)만 `html` · `body` · `#view` overscroll `none`, 시트 `contain`: 목록 끝을 밀어도 상태 바·상단 바·입력 바·탭바가 따라 출렁이지 않음. 데스크톱은 모두 기본값 | `@media (max-width:760px)` | 7칸 DON'T |
| 4 | 칩 터치 영역 42 → 44: `::before`는 경계 안쪽(패딩 상자) 기준이라 경계 1px만큼 더(`calc(-1 * var(--s1) - 1px) -1px`, sm은 s2) | `.chip::before` · `.chip.sm::before` | 7칸 DO 보정 |
| 5 | 가로 줄 세로 스크롤 없앰(`.strip{overflow-y:hidden}`): 칩 확장 영역이 넘쳐 줄이 세로로 3px 밀리고 세로 스와이프를 먹던 것 | `.strip` | |
| 6 | 찾기·지도 필터 칩 줄 터치 36 → 44: 줄 위아래 4 여유 + 바깥 여백을 그만큼 줄여 화면 모양 그대로(요소 위치 비교: 줄 상자 하나 말고 0) | `.strip.chips` · `.strip.chips.mt12` · `.mt16` · app.js 지도 필터 `padding-inline:0` | |
| 7 | r7 표기 | `app/index.html` | |
| 8 | 흐름 검사 5개 추가: `quickNoScroll` · `quickRowsFill`(줄마다 좌우 끝) · `sendMatchesInput` · `overscroll`(390: none/none/contain) · `overscrollDesk`(1440: auto/auto/auto) | `qa/flow-check.js` 9절 | |
| 9 | 렌더 측정: 터치 영역을 `::before` 확장 포함으로 재고 안쪽 줄이 잘라 낸 만큼 뺌(전에는 칩을 무조건 44로 침) · `WEBFONT=1`이면 실제 글꼴로 렌더, 보고서 머리에 글꼴 표기 | `qa/render.js` | |

헤드 결정(2026-10-02): 칩 B안(줄바꿈 + 채우기, A 2열 격자 · C 왼쪽 정렬과 비교 이미지로 고름) · 보내기 48 · 출렁임 같이 막기 · 필터 칩 터치 44 같이 고치기 · 찾기 필터 칩 390 넘침(웹폰트 3px)은 텍스트 수정 뒤 r8에서 다시 재기 · 문구 칩을 누르면 지금처럼 키보드까지 열기. 텍스트·워딩은 헤드가 Figma에서 고친다(이 라운드 범위 밖).

## 검수

- 칩 터치 스와이프(CDP 터치 제스처 -160px): r6 60 · 73 · 90 · 103px 밀림(390 동행자 · 390 길잡이 문구 · 360 동행자 · 360 길잡이) → r7 모두 0
- 입력 바 실측 r7: 390 칩 2줄 · 줄 끝 366/366 = 보내기 오른쪽 · 입력창·보내기 720~768 같음 · 입력 바 113 → 157(+44) / 360 줄 끝 336/336 · 칩 글자 안 잘림
- render r7(웹폰트): 390 48장 + 360 6장 · 가로 스크롤 0 · 주 버튼 ≤1 · 44px 미만 0(`::before` 포함 측정) · page errors 0 · 주 버튼 · accent · h1 열 r6과 같음
- 새 터치 측정을 r6 사본에 돌리면: 대화 칩 36 · 검색 칩 42 · 찾기 · 지도 필터 칩 36 → r7 모두 44
- flow-check: PASS 50항목(r6 45 + 5), errors []. 같은 검사를 r6 사본에 돌리면 `FAIL quickNoScroll, quickRowsFill, sendMatchesInput, overscroll`
- 요소 위치 비교(22개 화면 · 시트 × 390×844 · 360×740 · 390×664, 필터 칩 보정 전후): 다른 요소는 필터 칩 줄 상자 하나(36 → 44, 위로 4)뿐
- 데스크톱: 1366×768에서 폰 위 휠로 페이지 scrollY 140, 시트 위 118(r6과 같음) · 1440 루트 auto
- em dash 0 · 금지어 0 · `type=time` 0 · 새 accent 0 · MANUAL sha 일치(6bb3a2b6)
- 독립 검증(서브에이전트, 1회): BLOCKER 0 · MAJOR 2 · MINOR 4 → **통과**, MAJOR 2 · MINOR 3 수정·재확인, MINOR 1건 일부는 헤드 결정으로 r8
  - MAJOR 1(r7 회귀): `#view` · `.sheet` contain이 데스크톱에도 걸려 창이 폰보다 낮으면 폰 위 휠로 페이지가 안 내려감 → 전부 폰 폭으로
  - MAJOR 2(기존): 칩 터치 42(경계 계산), 가로 줄 안 필터 칩 36, render.js가 칩을 무조건 44로 침 → 4 · 6 · 9
  - MINOR 1(기존): 필터 칩 줄 세로 3px 스크롤 → 5 / 웹폰트 390에서 찾기 필터 칩 3px 넘침 → r8(텍스트 수정 뒤)
  - MINOR 2: DESIGN 수치 충돌(3d "좌우 24" ↔ 8칸 360 16) · DON'T 범위 → 고침 / MINOR 3: 새 검사 빈틈(둘째 줄 들여쓰기 · 데스크톱 · 시트) → 고침 / MINOR 4: 샷 글꼴이 r6과 다름 → 웹폰트로 다시 렌더 + 보고서에 글꼴
- 실행 환경: 프로젝트에 Node playwright 없음 → 설치하지 않고 python playwright 1.60의 드라이버(playwright-core 1.60)를 `NODE_PATH`로 연결
- 못 한 검증: 실제 iPhone Safari(출렁임 · 칩을 누를 때 키보드). 이 맥에 Xcode · 시뮬레이터 없음. 헤드 폰에서 확인. 검증 에이전트 추론(미검증): `overscroll-behavior`는 iOS 16 이상, 키보드가 열리면 입력 바(157)와 키보드 사이 대화가 좁아질 수 있음

## Figma 반영: 보류

헤드가 Figma에서 텍스트를 고치는 중이라 프레임을 다시 만들지 않았다(같은 이름 프레임을 교체하므로 헤드 수정이 지워짐). 다시 만들기 전에 `qa/figma-export.js`가 줄바꿈 + 채우기 칩(flex-wrap + flex-grow)을 줄마다 채움으로 내보내게 고쳐야 한다. 지금은 wrap 안 자식을 hug로 내보내 Figma에선 왼쪽 정렬(C안)처럼 보인다.
