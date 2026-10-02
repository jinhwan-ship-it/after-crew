# AGENTS.md · After Crew 앱 프로토타입 (Codex 등 다른 에이전트용)

이 저장소의 규칙 원본은 `MANUAL.md`(헌법, 잠김) · `DESIGN.md`(디자인 시스템) · `CLAUDE.md`(작업 절차)다. 이 파일은 그 요약이고, 서로 다르면 원본이 이긴다.

## 1. 시작 전에

```
shasum -a 256 MANUAL.md     # STATUS.md의 manual_sha와 같아야 한다
```
- 다르면 작업하지 말고 "[매뉴얼 변조 감지]"라고 알린다. `MANUAL.md`는 고치지 않는다.
- 무엇을 만드는지: 퇴근 후 동네 운동 모임 앱 "애프터 크루"의 모바일 프로토타입(390×844). 화면 목록과 이동은 `flows/ia.md`.
- 원칙 3 (MANUAL §6): 경쟁보다 완주 · 수치보다 지도 · 강요보다 계기.

## 2. 실행

```
npm install
npx playwright install chromium
npm run serve                 # http://localhost:5173 (app/)
node qa/flow-check.js         # 마지막 줄 PASS, 하나라도 틀리면 FAIL과 종료 코드 1
node qa/render.js r9          # shots/r9-*.png + qa/r9-report.md
```
빌드 단계는 없다. `app/`의 HTML · CSS · JS가 그대로 배포된다(GitHub Pages, 저장소 루트 `index.html`이 `app/`으로 보낸다).

## 3. 파일

- `app/index.html` · `app/app.css` · `app/app.js` · `app/data/` : 프로토타입 본체. 디자인 토큰은 `app.css`의 `:root` 한 곳에만 있다
- `flows/` : IA와 동행자 · 길잡이 흐름
- `qa/` : 렌더 · 흐름 검사 스크립트와 라운드별 보고서
- `figma/` : 코드에서 Figma 사본을 만드는 스크립트(hi-fi `builder.js`, lo-fi `lofi-*.js`)
- `screens/app.html` : r3 보관본, 고치지 않는다

## 4. 지켜야 하는 것 (셀 수 있는 것만)

- 주 버튼(`.btn.primary`, accent 채움)은 화면당 하나. 시트 안 확인은 보조 버튼
- accent `#FFB547`은 주 버튼 · 선택 상태에만. 지도 코스 · 글자 · 아이콘 · 새 소식 표시에 쓰지 않는다
- 날짜 · 시각은 항상 "9/30 (수) 19:00 → 19:30". "오늘", "내일", "평일", "N분 전" 같은 상대 표현 금지. 시각 입력에 `type=time` 금지
- 금지어 0: 외로움 · 만남 · 인연 · 설렘 · 말없이. em dash(—) 0
- 사람(아이콘 · 닉네임)은 회차 대화방과 나 화면에만. 카드 · 목록의 인원은 "3/6명 신청 중" 숫자만, 채팅 목록의 보낸 사람은 역할만. 1:1 DM과 상시 채팅방은 없다
- 완주 코스는 활동색 4, 미완주는 점선. 활동은 색만으로 구분하지 않는다(이름 병기)
- 지도가 보이는 곳엔 "© OpenStreetMap contributors"
- 터치 영역 44px 이상, 360px에서도 가로 스크롤 0
- 가짜 수치 · 후기 · 실존 인물 이름을 만들지 않는다
- DESIGN.md 밖 값(hex · px)이 필요하면 DESIGN.md를 먼저 고친다(값은 헤드 확인)

## 5. 하지 않는 것 (MANUAL §2)

실제 연동(본인인증 · 위치 기록 · 따릉이 결제 · 채팅 서버) · 레벨 · 배지 · 랭킹 · 스트릭 · 상시 채팅방 · 1:1 DM · 어떤 과금도 · 풀 디자인 시스템 · 승인 없는 배포 · 설치.

## Review guidelines

PR을 리뷰할 때 아래는 P1(머지 전 반드시 고침)로 표시한다.

- `MANUAL.md`가 바뀌었는데 §12에 같은 날짜의 해제 · 재잠금 행이 없거나, 해시가 STATUS.md의 `manual_sha`와 다르다(헤드 승인 개정은 §12 행 + 해시 일치로 확인)
- `app/` 안에 em dash(—) 또는 금지어(외로움 · 만남 · 인연 · 설렘 · 말없이)가 있다
- 상대 시간 표현이나 `type=time` 입력이 생겼다
- accent(`#FFB547`, `var(--accent)`)가 주 버튼 · 선택 상태 밖에 쓰였거나, 한 화면에 주 버튼이 2개 이상이다
- 카드 · 목록 · 채팅 목록 · 회차 상세에 닉네임이나 프로필 아이콘이 보인다(F-12), 1:1 DM이나 상시 채팅방이 생겼다(NG-02)
- `:root` 토큰 밖 hex · px가 추가됐다(`--desk-*` 2개 제외)
- 터치 영역 44px 미만, 360px 가로 스크롤, 지도 출처 표기 누락
- 근거 없는 수치 · 후기 · 실명

P2(가능하면 고침): `aria-label` 누락, 시트를 닫은 뒤 포커스 복귀 누락, 색만으로 상태 구분, 새 동작에 대한 `qa/flow-check.js` 검사 누락, 화면 문구 말투가 기존 화면(짧은 해요체)과 다름.
