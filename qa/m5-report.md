# M5 Figma 사본 검수 · App r4

- 날짜: 2026-09-30 · 원본: app/ r4 (코드가 원본, Figma는 사본)
- Figma 파일 `9eNEAWAgW4rhZ4C1QPz0Hz` · 페이지 **App r4** `50:571`
- 결과: **통과** (BLOCKER 0 · MAJOR 0 · MINOR 1). 코드 쪽 발견 5건은 r5 후보로 헤드에게

## 1. 만든 것

| 구분 | 내용 |
|---|---|
| 화면 26 | 섹션 3개. 동행자 `55:589` 14 · 길잡이 `55:590` 9 · 나 `55:591` 3. 전부 자동 레이아웃 레이어(이미지 0), 390×844 |
| 컴포넌트 | 섹션 `52:571`에 App 세트 8: Icon 19 · ProfileIcon 12 · Toggle 2 · Chip 4 · Badge 8 · StatusBar 2 · MapBase 2(Light/Dark, OSM 실지형) · TabBar 3. 버튼은 기존 Button `5:39` 재사용 |
| 변수 | color/* 15 (기존 7 + 신규 8: accent-soft · error · act-walk/jog/run/bike · map-water · map-park) |
| 텍스트 스타일 | 18 (App용 신규: KR/Card Title · KR/Label · KR/Small · EN/Time) |
| 인스턴스 | 369 |
| 칠 | 화면 레이어 단색 1211개 변수 연결 · 미연결 37개는 전부 반투명(스크림·다크 카드 8%)이라 의도적으로 풀어 둠(변수 연결 시 불투명도 1로 초기화되는 Figma 동작) |
| 글꼴 | Noto Sans KR · Archivo 두 가지뿐 |

## 2. 검수

1차 독립 검증(서브에이전트, 코드 렌더 ↔ Figma 26쌍 비교): BLOCKER 0 · **MAJOR 4** · MINOR 4 → 통과 기준(MAJOR ≤2) 미달.

| # | 발견 | 원인 | 처리 |
|---|---|---|---|
| M1 | 시트 손잡이가 왼쪽 (B1 · H-msg-sheet · F-report-msg · D1 · E5) | `margin:0 auto`를 옮기지 못함 | 손잡이를 가운데 정렬 감싸개(`grab-row`)로 |
| M2 | B1 시트 버튼이 16 아래로, 아래 여백 32→13 | 간격(gap 16) 있는 부모에 여백 스페이서를 넣어 간격이 한 번 더 들어감 | 스페이서 대신 앞쪽 패딩 감싸개(`pad 8`), 시트 높이 hug |
| M3 | 대화 시각이 버블 아래가 아니라 이름 줄 오른쪽 위 (H-chat · H-msg-sheet · F-report-msg) | `align-self:flex-end`를 옮기지 못함 | 시각을 아래 정렬 감싸개(`at-col`)로 |
| M4 | E5 "닫기" 글자 버튼이 왼쪽 | M1과 같은 원인 | 가운데 정렬 감싸개(`textbtn-row`) |
| m1 | 아웃라인 버튼 47px (코드 44) | 1.5px 선이 레이아웃에 포함됨 | 인스턴스에서 `strokesIncludedInLayout=false` (공용 Button 컴포넌트는 건드리지 않음) |
| m2 | 데모 안내 상자가 실선 | 점선 미이관 | dash 4/4 |
| m3 | 지도 범례의 미완주 점선이 얇고 위로 치우침 | 선 위치 y=0 | 3px · 3/5 · 가운데 |
| m4 | E3 시각 입력의 시계 아이콘 없음 | 브라우저 기본 컨트롤이라 디자인 요소가 아님 | 남김. 아래 코드 발견 C1과 함께 결정 |

재발 방지: 같은 규칙을 `qa/figma-export.js`(교차축 개별 정렬 → 감싸개, gap 부모의 여백 → 패딩 감싸개)와 `figma/builder.js`(아웃라인 선 제외)에 넣었다. 다시 내보낸 26화면 중 20화면은 JSON이 바이트 단위로 같고, 바뀐 6화면은 위 M1~M4 대상뿐. H-chat은 새 파이프라인으로 다시 만들어(`82:1676`) 수작업 수정본과 같은 결과인지 확인했다.

재확인(수정 뒤 스크린샷): B1 · H-chat · H-msg-sheet · E5 · D-map 범례. MAJOR 0.

## 3. 코드 쪽 발견 (r5 후보, 헤드 리뷰 뒤)

| # | 화면 | 발견 | 제안 |
|---|---|---|---|
| C1 | E3 개설 · 언제 | `type=time`이 기기 언어에 따라 "오후 07:30" / "07:30 PM"으로 보임 → 날짜·시각 표기 규칙("19:30") 위반. 독립 검증 MAJOR | 24시간 선택창(3b) 두 개(시 · 분 10분 단위)로 교체 |
| C2 | A 찾기 · 오늘 고정 카드(길잡이일 때) | "내가 여는 회차" 배지 옆 시각 필("9/30 (수) 19:30 → 20:15")이 두 줄로 접힘 | 시각 필 `nowrap` + 배지 문구 짧게("내 회차") · 문구 변경은 헤드 확인 |
| C3 | D 지도 목록 | "라이트 바이크 · 4.9km · 열린 회차 1"에서 "1"만 다음 줄 | 숫자+단위 묶음 `nowrap` (문구 변경 없음) |
| C4 | 여러 화면 | 2칸 역할 표 밖 글자: Archivo 16/700(큰 시각) · 12/500(요일·탭 라벨) · 16/700(회차 탭) · 14/700(글자 버튼) | 2칸에 역할로 등록하거나 가까운 역할로 정리 · 값 변경이라 헤드 확인 |
| C5 | D · 코스 썸네일(5d) | 안 가본 코스 썸네일이 `text-muted` 실선. 지도(5b)·범례는 점선 | 5d에도 점선 적용 여부 헤드 결정 |

입력창 힌트 색(3a `text-muted`)은 M5 중에 코드에 반영함(`input::placeholder`). flow-check errors [].

## 4. 다시 만들기

```
FONT_DIR=<@fontsource node_modules> node qa/figma-export.js        # figma/export/<id>.json + 코드 렌더 png
TERSER=<terser 경로> node figma/make-call.js --builder              # calls/_builder.js → use_figma로 1회 실행(페이지에 빌더 저장)
bash figma/make-all.sh                                              # calls/<id>.js 26개 → 각각 use_figma로 실행(같은 이름 프레임을 교체)
```
빌더는 작업 뒤 페이지 shared plugin data에서 지웠다(`aftercrew/builder` = 빈 값). 다시 만들 때는 `--builder`부터.
