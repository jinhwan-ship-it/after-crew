# impeccable r5 · 390×844
page errors: 0
360 (doc/view/client): A-find 360/360/360 · B-session 360/360/360 · D-map 360/360/360 · H-chat 360/360/360

| 화면 | 가로 스크롤 | 주 버튼 | accent 요소 수 | h1 | 44px 미만 |
|---|---|---|---|---|---|
| A-find | ○ | 0  | 0 | 마포구 모임 | ○ |
| A-find-run | ○ | 0  | 0 | 마포구 모임 | ○ |
| A-find-empty | ○ | 0  | 0 | 마포구 모임 | ○ |
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

## r5 변경 (헤드 결정 2026-09-30)

| # | 무엇 | 코드 | DESIGN |
|---|---|---|---|
| 1 | E3 시각 입력: `type=time` → 24시간 선택창 2개(시 00~23 · 분 10분 단위). 해산 제안은 10분 단위 올림, 자정을 넘기면 23:50 + 안내 문구 변경. 선택창마다 focus 표시 | app.js `timeSel`·`suggestEnd`·`pruneMin` · app.css `.tsel` | 3e 신규 · DON'T(기본 시각 입력) |
| 2 | A 오늘 고정 카드: 시각 필 한 줄 고정, 배지("내가 여는 회차" 문구 유지)는 넘치면 아래 줄 | `.status-pill` nowrap · `.row.wrap` | DON'T(좁은 줄 숫자·필) |
| 3 | D 목록 메타: 조각(활동·거리·구·열린 회차 N) 안에서는 줄바꿈 없음, 넘치면 조각 단위로 | app.js `segs` · app.css `.meta .seg` | 같은 DON'T |
| 4 | 안 가본 코스 썸네일 점선(`0.1 6`, 끝 점 없음) · 찾기 카드·지도 목록·다음 코스·E2 | app.js `thumbSVG` | 5d 개정 |
| 5 | 글자 보조 역할 4 등록(화면 값 그대로) | 없음 | 2칸 v1.3 |

## 검수

- render r5: 390 40장 + 360 4장 · 가로 스크롤 0 · 주 버튼 ≤1 · 44px 미만 0 · page errors 0 · 새 샷 `A-find-host-pinned`
- flow-check: 모든 항목 통과, errors [] · 새 항목 `time24`·`startMovesEnd`(21:30)·`midnight`(23:50)·`courseSheetListsOpen` · `courseSheetOpenCTA`는 열린 회차가 없는 코스로 검사를 고쳐 true
- em dash 0 · 금지어 0 · 새 상대 표현 0 · MANUAL sha 일치
- 독립 검증(서브에이전트, en-US·ko-KR 두 언어): BLOCKER 0 · MAJOR 1 · MINOR 5 → **통과**
  - MAJOR: 시각 선택창 두 개 중 어디에 포커스가 있는지 안 보임 → 선택창마다 focus 테두리 추가(수정·재확인)
  - MINOR 수정: 자정 넘김 제안(23:50으로 묶음) · 10분 단위 밖 저장값이 목록에 남음(다른 값 고르면 뺌) · 오류 문구 `role="alert"` · flow-check 검사 설정
  - MINOR 남김(r5 범위 밖, 기존부터): 선택창 기본 화살표 크기(3b chevron 20과 다름, G-1도 같음) · 360에서 좌우 여백 24(DESIGN 8칸은 16) · 범례 점 모양(사각)과 썸네일 점(원) 차이

## Figma 반영

바뀐 11화면을 파이프라인으로 다시 만듦(E3-when · E4-preview · Cp-host-checked · Cp-host-ended · E2-course · A-find · A-find-empty · D-map · D1-course-sheet · E5-created · G1-edit) + 새 화면 `A-find-host-pinned`(길잡이 섹션 끝). 총 27화면.
파이프라인 개선: 선택창 chevron(fwd -90°) · 교차축 여백 → 패딩 감싸개 · 범례 점선은 자동 레이아웃 밖에서 그림. 단색 칠 1350개 변수 연결, 미연결 27개는 전부 반투명 · 이미지 0 · 인스턴스 415.
