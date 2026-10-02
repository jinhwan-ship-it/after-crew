# 애프터 크루 (After Crew) · 앱 프로토타입

퇴근 후 동네에서 같이 걷고 달리는 회차형 운동 모임 앱의 모바일 프로토타입(390×844). 동행자는 회차를 찾아 신청하고, 회차 대화방에서 늦음 · 불참을 알리고, 당일 체크인해서 해산까지 가면 완주한 코스가 내 동네 지도에 채워진다. 길잡이는 본인인증 뒤 회차를 열고, 당일 출발 · 해산을 누르고, 해산 뒤 대화방을 닫는다.

- 원칙: 경쟁보다 완주 · 수치보다 지도 · 강요보다 계기
- 기술: 빌드 없는 HTML · CSS · JS (해시 라우터, 상태는 브라우저 localStorage)
- 데모 시각은 9/29 (화) 18:55로 고정돼 있다. 실제 서버 · 본인인증 · 위치 기록 · 결제 연동은 없다

## 보기

- 온라인: GitHub Pages 주소 `https://<아이디>.github.io/<저장소 이름>/` (루트 `index.html`이 `app/`으로 보낸다)
- 로컬: `npm run serve` 뒤 http://localhost:5173 , 또는 `app/index.html`을 브라우저로 바로 연다

## 문서

| 파일 | 내용 |
|---|---|
| `MANUAL.md` | 프로젝트 헌법 (목표 · 비목표 · 요구사항 F-01~F-13 · 원칙). 잠겨 있다 |
| `DESIGN.md` | 디자인 시스템 (색 · 글자 · 간격 · 컴포넌트 · DON'T) |
| `flows/` | IA와 동행자 · 길잡이 흐름 |
| `research/` | RFP · 페르소나 · 시나리오 · 인터뷰 질문 |
| `qa/` | 라운드별 검수 보고서와 검사 스크립트 |
| `figma/` | 코드에서 Figma 사본(hi-fi 32화면 · lo-fi 32화면)을 만드는 스크립트 |
| `CLAUDE.md` · `AGENTS.md` | 코딩 에이전트(Claude Code · Codex) 작업 규칙 |

## 검사

```
npm install
npx playwright install chromium
node qa/flow-check.js      # 상태 흐름 50항목, 마지막 줄 PASS
node qa/render.js r8       # 390 · 360 렌더와 실측 (shots/, qa/r8-report.md)
```

push와 PR마다 GitHub Actions(`.github/workflows/qa.yml`)가 같은 검사와 MANUAL 잠금 · em dash · 금지어 확인을 돌린다.

## GitHub Pages 켜기 (처음 한 번)

1. 저장소 → Settings → Pages
2. Build and deployment · Source: Deploy from a branch
3. Branch: `main`, 폴더 `/ (root)` → Save
4. 1~2분 뒤 위 주소로 열린다
