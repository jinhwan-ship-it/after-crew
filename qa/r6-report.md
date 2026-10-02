# impeccable r6 · 390×844
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

## r6 변경 (헤드 결정 2026-10-02 · 당근 상단·하단 아이콘 박스 참고)

| # | 무엇 | 코드 | DESIGN · flows |
|---|---|---|---|
| 1 | 하단 탭 3 → 4: 찾기(나침반) · 지도 · **채팅** · 나. 채팅 탭에 안 읽은 메시지 수 배지(text 채움, 99+) | app.js `renderTabs` · `totalUnread` · app.css `.tabbar .count` | 4b · 4d · ia v1.3 |
| 2 | 탭 첫 화면 상단 바: 찾기 = 동네 선택(📍마포구 ⌄) + 검색·알림·회차 열기(+) / 지도 = 공개 범위 + 알림 / 채팅·나 = 제목 + 알림 | `findBar` · `bellBtn` · `.locbtn` · `.dot-new` | 4a′ |
| 3 | I 채팅: 내 회차 대화방 목록(해산 24시간 뒤 사라짐). 보낸 사람은 역할(길잡이·동행자·나)로만, 닉네임·아이콘 없음(F-12) | `viewChats` · `myRooms` · `lastLine` | 2f · ia I |
| 4 | J 알림: 앱 안 목록만(회차 출발 알림 · 회차 취소). 열면 읽음, 점 사라짐. 상단 바 오른쪽 설정 아이콘 | `notis` · `viewNotis` | 2g · ia J |
| 5 | K 검색: 코스 이름·출발/해산 지점·활동·동네. 입력 중 결과 영역만 다시 그림, 결과 수 한 줄만 `aria-live` | `viewSearch` · `renderSearch` · `.searchbox` · `.topbar.search` | 3f · ia K |
| 6 | A-1 동네 선택 시트: 찾기 기준 동네 = 프로필 '내 동네'. 바꾼 뒤 포커스는 동네 버튼으로 | `guSheet` · `setGu` | ia A-1 |

MANUAL 대조: 채팅 탭은 회차마다 생기고 사라지는 대화방 목록이라 NG-02(상시 채팅방·1:1 DM) 아님 · 알림은 앱 안 목록만, 푸시·메일 본문은 §4 Out 그대로 · 목록에 사람 없음(F-12).

## 검수

- render r6: 390 48장 + 360 6장(I-chats · K-search 추가) · 가로 스크롤 0 · 주 버튼 ≤1 · 44px 미만 0 · page errors 0
- flow-check: 모든 항목 통과(endOk는 설계상 false), errors [] · r6 항목 `tabs4` · `chatBadge` 4 → 읽은 뒤 1 · `chatNoNick` · `bellDot` → 읽은 뒤 사라짐 · `notiNoRelative`(받은 시각 9/29 (화) 18:55) · `tabCurrentOnlyRoot` · `guFocusBack` · `searchFocus` · `searchKeepsInput` · `searchCountLive`("열린 회차 2개, 코스 2개", 결과 영역 live 없음) · `searchNone`
- em dash 0 · 금지어 0 · MANUAL sha 일치(6bb3a2b6)
- 독립 검증(서브에이전트): BLOCKER 0 · MAJOR 2 · MINOR 8 → **통과**, 전부 수정·재확인
  - MAJOR 1: 360에서 검색 상자가 19px 넘침 → `.searchbox{min-width:0}` + 오른쪽 간격을 상단 바 패딩으로
  - MAJOR 2: 알림 제목 "1시간 뒤 출발해요"(상대 표현, 18:55 기준 틀림) + 받은 시각이 신청보다 앞섬 → 제목 "회차 출발 알림", 받은 시각 = 출발 60분 전과 지금 중 늦은 쪽, 최신순
  - MINOR 수정: 동네 바꾼 뒤 포커스 복귀 · `aria-current`는 탭 첫 화면만 · 검색 결과 수만 live · 채팅 행 aria-label 제거(마지막 메시지가 읽히게) · 알림 최신순 · J 제목 가운데(설정 아이콘) · 알림 행 위 정렬 · 목록 시각 Archivo 12(`.stamp`) · index.html r6 표기
  - 규칙 부재 3건 → DESIGN 7칸 DON'T 추가(알림 상대 표현·받은 시각 / 가운데 제목 바의 글자 버튼 / 검색 live 범위·min-width)

## Figma 반영 (파일 9eNEAWAgW4rhZ4C1QPz0Hz · 페이지 App r4 50:571)

- 컴포넌트: App/Icon 52:644에 down · bell · compass 추가(22종) · App/TabBar 53:635 4탭으로(찾기 아이콘 나침반) + `Current=채팅` 변형 + 채팅 탭 수 배지 `count`(기본 숨김, 화면 빌더가 수를 켬). 기존 Button 5:39는 건드리지 않음
- 새 화면 5: I-chats · J-notifications · K-search · K-search-results · A1-gu-sheet (동행자 섹션 끝)
- 다시 만듦: G-me · B-session-applied-today(채팅 배지 3) · A-find-empty / 상단 바만 교체: A-find · A-find-host-pinned · E5-created · D-map · D1-course-sheet (`figma/make-topbar-patch.js`)
- 나머지 화면의 탭바는 컴포넌트 갱신으로 자동 4탭. 섹션 크기 조정, MapBase 위치를 탭바 아래로. 작업 뒤 builder 공유 데이터 비움
- 파이프라인 개선: 실제로 잘린 글자만 말줄임 고정폭(안 잘린 글자는 hug, "마…" 방지) · 빈 `.grow`는 남는 폭을 먹는 스페이서 · 탭바 내보내기에 안 읽은 수 · 숨은 인스턴스 자식 탐색
