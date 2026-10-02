# CLAUDE.md — After Crew 앱 프로토타입 (Claude Code 인계)

이 폴더를 Claude Code로 열면 이 파일부터 읽는다. 이 프로젝트의 헌법은 `MANUAL.md`(잠김), 법률은 `DESIGN.md`, 일지는 `STATUS.md`다.

## 1. 세션 시작 절차 (매번, 작업보다 먼저)

```
shasum -a 256 MANUAL.md        # STATUS.md의 manual_sha와 같아야 한다
```
- 다르면 `[매뉴얼 변조 감지]`라고 말하고 멈춘다. MANUAL.md는 헤드가 "매뉴얼 해제"라고 말할 때만 고친다.
- 같으면 STATUS.md의 단계·다음 할 일을 3줄로 말하고 시작한다.
- 요청이 MANUAL과 부딪히면(§2 비목표, §4 Out, §6 원칙) 실행하지 말고 `[매뉴얼 충돌] 요청 "…" ↔ §… — (a) 요청 취소 (b) 매뉴얼 해제 후 개정`으로 묻는다.
- 헤드에게 묻는 방식: 한 번에 3~4문항, 문항마다 기본값.

## 2. 무엇을 만드는 중인가

퇴근 후 동네 운동 모임 앱 "애프터 크루"의 모바일 프로토타입(390×844). 동행자는 회차를 찾아 신청하고, 회차 대화방에서 늦음·불참을 알리고, 당일 체크인해서 해산까지 가면 완주한 코스가 내 동네 지도에 활동색으로 채워진다. 길잡이는 본인인증 뒤 회차를 열고, 당일 출발·해산을 누르고, 해산 뒤 대화방을 닫는다.

원칙 3 (MANUAL §6): **경쟁보다 완주 · 수치보다 지도 · 강요보다 계기**

## 3. 파일

```
app/index.html        화면 틀(폰 프레임·탭바·데모 패널) — 글꼴은 Google Fonts
app/app.css           DESIGN.md 토큰은 :root 한 곳에만. 토큰 밖 hex는 --desk-* 2개뿐
app/app.js            라우터·상태(localStorage 'aftercrew-proto-r4', 키는 r4 그대로)·화면 A~K·G · 시각 입력은 24시간 선택창(timeSel)
app/data/content.js   활동·코스·회차·대화 예시·프로필 아이콘 12종
app/data/map.js       OSM 실지형 지도(정적 SVG path) + 코스 좌표 — app/data/README.md
screens/app.html      r3 보관본 (읽기 전용, 고치지 않는다)
flows/                ia.md v1.3(하단 탭 4 · I 채팅 · J 알림 · K 검색 · A-1) · participant.md v1.2 · host.md v1.2
qa/render.js          390·360 렌더 + 실측 (가로 스크롤·주 버튼 수·accent 수·44px)
qa/flow-check.js      상태 흐름 검증 (신청→대화→취소, 길잡이 개설→해산→대화방 닫기, 새로고침 생존, .ics)
qa/figma-export.js    M5 · 화면 32개를 DOM에서 읽어 figma/export/<id>.json (자동 레이아웃·토큰·컴포넌트 매핑)
figma/builder.js      M5 · JSON → Figma 레이어 빌더 (use_figma 안에서 실행)
figma/make-call.js    M5 · use_figma 호출 코드 생성 (--builder / <화면id> <x> <y> <섹션>)
figma/make-all.sh     M5 · 32화면 호출 코드 한 번에 (figma/calls/)
figma/make-topbar-patch.js  r6 · 상단 바만 바뀐 화면은 상단 바 하위 트리만 교체하는 호출 코드
figma/lofi-convert.js   lo-fi · figma/export/<id>.json → figma/lofi/<id>.json (회색 6단 · 지도/썸네일 X 박스 · 아이콘 원 · Noto 1종)
figma/lofi-builder.js   lo-fi · JSON → Figma 레이어 (plugin data aftercrew/lofi, 페이지 149:571)
figma/make-lofi.js      lo-fi · 배치(섹션 · 열 · 줄)와 호출 코드 calls/lofi-_builder.js + lofi-1..15.js (23KB 이하로 묶음)
figma/lofi-annotate.js  lo-fi · 캡션 · 흐름 화살표 · 번호 주석 8 · 범례 (use_figma에 그대로 붙임, 다시 실행하면 'ann · ' 노드만 새로)
AGENTS.md · README.md   Codex 규칙과 Review guidelines · 저장소 소개와 GitHub Pages 켜기
.github/workflows/qa.yml  push · PR마다 MANUAL 해시 · em dash · 금지어 · flow-check · render(아티팩트)
index.html · .nojekyll  GitHub Pages 루트 → app/
scripts/publish.sh      첫 push (bash scripts/publish.sh <저장소 주소>) · 잠금 파일이 있으면 멈추고 안내
qa/m5-report.md       M5 검수 결과 · 다시 만들기 순서
qa/r5-report.md       r5 변경 · 검수 · Figma 반영
qa/r6-report.md       r6 변경(하단 탭 4 · 상단 바 · 채팅 · 알림 · 검색) · 검수 · Figma 반영
qa/r8-report.md       r8 변경(문구 리서치 승인분 · MANUAL v1.7 · "오늘" 제거) · 검수 · 독립 검증
qa/r7-report.md       r7 변경(대화 입력 바: 문구 칩 줄바꿈 + 채우기 · 보내기 48 · 폰 폭 출렁임 막기 · 칩 터치 44) · 검수 · 독립 검증
shots/                rN-390-<화면>.png
```

화면 ↔ 해시: A `#/find[/날짜]`(A-1 동네 선택은 시트) · B `#/session/:id` · H `#/session/:id/chat` · C `#/today/:id` · C' `#/host/today/:id` · D `#/map` · E `#/host/new/1~4` · G `#/me` · G-1 `#/me/edit` · G-2 `#/me/settings` · I `#/chats` · J `#/notifications` · K `#/search`

하단 탭 4: 찾기 · 지도 · 채팅 · 나. 탭 첫 화면(A·D·I·G) 상단 바는 DESIGN 4a′, `aria-current`는 탭 첫 화면에서만.

## 4. 지켜야 하는 것 (셀 수 있는 것만)

- 주 버튼(`.btn.primary`, accent 채움)은 화면당 하나. 시트 안 확인은 보조(text 채움)
- accent #FFB547은 주 버튼·선택 상태에만. 지도 코스·글자·아이콘에 쓰지 않는다
- 완주 코스 = 활동색 4 (`--act-walk/jog/run/bike`), 미완주 = text-muted 점선. 활동은 색만으로 구분하지 않는다(이름 병기)
- 날짜·시각은 항상 "9/30 (수) 19:00 → 19:30". 오늘·내일·평일·주말 같은 상대 표현 금지(MANUAL v1.7 §11). 시각 입력에 `type=time` 금지(기기 언어에 따라 오전/오후로 보임)
- 금지어: 외로움 · 만남 · 인연 · 설렘 · 말없이. em dash(—) 0
- 사람(아이콘·닉네임)은 회차 대화방과 나 화면에만. 카드·목록의 인원은 "3/6명 신청 중" 숫자만. 채팅 목록의 보낸 사람은 역할만. 1:1 DM 없음
- 새 소식 표시(수 배지·알림 점)는 `text` 색. accent 아님. 알림 제목에 상대 시간 금지
- 메타 문구는 짧게: "예상 완주 시간 45분", "5/8명 신청 중"(MANUAL v1.7 띄어쓰기)
- 말투: 화면 문장은 해요체, 같은 동작·공간은 한 이름(캘린더 = "내 캘린더에 추가", 찾기 = "모임 찾기"), 시트의 나가는 버튼은 "닫기". 초안 전체는 research/copy-benchmark.md R1~R12
- 지도가 보이는 곳엔 "© OpenStreetMap contributors"
- 터치 44px, 가로 스크롤 0 (360에서도), 입력 검증은 그 자리에서(전체 다시 그리기 금지)
- DESIGN.md 밖 값이 필요하면 먼저 DESIGN.md에 추가(값은 헤드 확인), 그다음 코드

## 5. 검수 (라운드마다)

```
npm i playwright   # 처음 한 번 (Chromium: npx playwright install chromium) · 설치 전이면 python playwright 드라이버를 연결: NODE_PATH=<폴더>/nm (nm/playwright → site-packages/playwright/driver/package)
WEBFONT=1 node qa/render.js r9   # shots/r9-*.png + qa/r9-report.md · WEBFONT=1이면 실제 글꼴(r7부터), 44px 판정은 ::before 포함 터치 영역
node qa/flow-check.js       # 마지막 줄 PASS (실패하면 FAIL <항목>과 종료 코드 1)
grep -c "—" app/*.js app/*.css app/*.html app/data/content.js   # 0
grep -c "오늘" app/*.js app/*.css app/*.html app/data/*.js       # 0 (MANUAL v1.7 §11, CI도 같은 검사)
```
Figma 사본을 코드와 맞출 때(바뀐 화면만 다시 만들어도 된다):
```
FONT_DIR=<@fontsource node_modules> node qa/figma-export.js [화면id ...]
TERSER=<terser 경로> node figma/make-call.js --builder   # calls/_builder.js를 use_figma로 1회 실행
bash figma/make-all.sh                                   # calls/<id>.js를 use_figma로 실행, 같은 이름 프레임을 교체
```
작업 뒤 페이지 50:571의 shared plugin data `aftercrew/builder`는 빈 값으로 지운다.
lo-fi(페이지 "Lo-fi r6" `149:571`)를 코드와 맞출 때:
```
node figma/lofi-convert.js                     # figma/export → figma/lofi
TERSER=<terser 경로> node figma/make-lofi.js   # calls/lofi-_builder.js 1회 → lofi-1..15.js (같은 이름 프레임 교체)
# 마지막에 figma/lofi-annotate.js 를 use_figma로 1회 (캡션 · 화살표 · 주석 · 범례, plugin data aftercrew/lofi 지움)
```
호출 코드는 `cat`으로 띄워 그대로 붙인다. 손으로 옮겨 적으면 글자 스타일 번호(f)가 틀어진다(r6 lo-fi에서 겪음).
`node qa/flow-check.js`는 마지막 줄 PASS/FAIL과 종료 코드(실패 1)로 판정한다. 기대값은 파일 끝 `EQ`.

BLOCKER 0 · MAJOR ≤2여야 라운드 통과. 라운드가 끝나면 서브에이전트로 독립 검증 1회. QA에서 규칙이 없어서 생긴 문제는 DESIGN.md 7칸 DON'T에 한 줄 추가.

## 6. 다음 할 일 (STATUS.md가 최신)

1. 문구 리서치 r8 적용 끝(research/copy-benchmark.md 7절). 열린 질문 Q1 · Q5 · Q6 · 보드 43~45는 헤드 답 대기. 헤드가 Figma에서 텍스트를 더 고치면 `get_design_context`로 읽어 코드에 반영 → r9 검수. **그 전에는 Figma 프레임을 다시 만들지 않는다**(같은 이름 프레임 교체라 헤드 수정이 지워진다). 남은 MINOR 후보: 찾기 필터 칩 줄 390 웹폰트 3px 넘침(텍스트 수정 뒤 다시 재기, 헤드 결정) · 선택창 기본 화살표 크기(3b chevron 20) · 360 좌우 여백(DESIGN 8칸 16) · 범례 점 모양
2. 코드가 바뀌면 바뀐 화면만 Figma에 다시 만들기(5절). r7 대화 입력 바(H 화면들)를 다시 만들기 전에 `qa/figma-export.js`가 줄바꿈 + 채우기 칩(`.composer .strip`, flex-wrap + flex-grow)을 줄마다 채움으로 내보내게 고친다(지금은 hug로 나가 왼쪽 정렬처럼 보임). 내보낸 JSON을 이전 것과 비교해 바뀐 화면만, 상단 바만 바뀌면 `node figma/make-topbar-patch.js <화면id> <섹션id>`. Figma: 파일 `9eNEAWAgW4rhZ4C1QPz0Hz` · 페이지 "App r4" `50:571` · 섹션 동행자 `55:589`(끝에 I-chats · J-notifications · K-search · K-search-results · A1-gu-sheet) · 길잡이 `55:590`(끝에 A-find-host-pinned) · 나 `55:591` · App 컴포넌트 `52:571`(Icon 52:644 22종 · ProfileIcon 52:718 · Toggle 52:724 · Chip 52:738 · Badge 52:756 · StatusBar 52:778 · MapBase 53:586 · TabBar 53:635 4탭 + 채팅 수 배지) · Button `5:39`(기존, 수정하지 않는다) · 변수 color/* 15 · lo-fi 페이지 "Lo-fi r6" `149:571`(섹션 1 동행자 `149:572` 13화면 · 2 탭 보조 `149:573` 6 · 3 길잡이 `149:574` 10 · 4 나 `149:575` 3 + 범례). 원본은 코드. Figma에서 고친 것은 `get_design_context`로 읽어 코드에 반영
3. 게이트마다 MANUAL·DESIGN·STATUS·flows를 claude.ai 프로젝트 문서 `after-crew/`에 동기화 (Cowork 세션에서)
4. GitHub: 공개 저장소 + Pages. 첫 push는 헤드가 맥에서 `bash scripts/publish.sh <저장소 주소>` (README 마지막 절). 그 뒤로는 브랜치 → PR → Actions qa 통과 → main. push는 헤드 승인 뒤에만

## 7. 하지 않는 것 (MANUAL §2)

실제 연동(본인인증·위치 기록·따릉이 결제·채팅 서버) · 레벨·배지·랭킹·스트릭 · 상시 채팅방·1:1 DM · 어떤 과금도 · 풀 디자인 시스템 · 랜딩 v1 재작업 · 피치덱 · 승인 없는 배포·push·설치
