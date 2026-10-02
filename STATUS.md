manual_version: v1.6
manual_sha: 6bb3a2b6fc5ff6868564d41043d64aff41e8c8f4daf7247515903f9a2ef398ef
원본 위치: 맥북 Desktop/after-crew (Claude Code, git) — 프로젝트 문서 after-crew/는 게이트마다 덮어쓰는 사본 (R-10)
단계: 5/5 r6 통과 · Figma hi-fi App r4(32화면) + lo-fi "Lo-fi r6" 149:571(32화면 · 캡션 · 화살표 · 주석 8 · 범례) — 헤드 리뷰 대기
갱신: 2026-10-02 · Cowork 클라우드 세션 (lo-fi 제작 · GitHub 준비)
완료: MANUAL v1.6 LOCKED · DESIGN v1.4 · flows ia v1.3 · app/ r6 · qa/r6-report.md · lo-fi 파이프라인(figma/lofi-*.js) · AGENTS.md · README.md · .github/workflows/qa.yml · 루트 index.html(Pages) · scripts/publish.sh · flow-check 판정(PASS/FAIL·종료 코드)
진행 중: GitHub 첫 push — 헤드가 맥에서 실행 (아래 git 줄)
다음: 헤드 리뷰 r6 + lo-fi → 수정 있으면 r7 · push 뒤 Pages 켜기(Settings → Pages → main / root)
남은 BLOCKER: 0 / MAJOR: 0 (r6 독립 검증 MAJOR 2 · MINOR 8 → 전부 수정·재확인)
마지막 라운드: impeccable r6 · shots/r6-390 48장 + r6-360 6장 · flow-check PASS 45항목 · em dash 0 · 금지어 0
헤드 결정 필요: brand-board/(38MB, 다른 작업)를 공개 저장소에 올릴지 — 지금은 .gitignore로 제외. 남은 MINOR 3(선택창 기본 화살표 크기 · 360 좌우 여백 24 vs DESIGN 8칸 16 · 범례 점 모양)은 다음 라운드 후보
잠금 후 결정: 2026-09-29 활동색 A안·지도색 확정 · 2026-09-30 r5 4건(24시간 선택 · 시각 필 한 줄/배지 문구 유지 · 글자 역할 등록 · 썸네일 점선) · 2026-10-02 r6 3건(상단 검색·알림·회차 열기 / 하단 탭 찾기·지도·채팅·나 / 탭 첫 화면 4개 모두) · 2026-10-02 lo-fi(32화면 · 회색 블록 · 화살표+번호 주석, Figma만) · GitHub 공개+Pages, push 승인(실행은 헤드)
열린 질문: 없음
git: 맥 저장소 master 1커밋(r4) · .git/index.lock 남음 · 원격 없음 · Actions 파일은 원격 쓰기 보호로 scripts/qa-workflow.yml에 둠 → 헤드: github.com에서 빈 공개 저장소 생성 → rm .git/index.lock → mv scripts/qa-workflow.yml .github/workflows/qa.yml → bash scripts/publish.sh <주소>
재실행: shasum -a 256 MANUAL.md → node qa/render.js r7 → node qa/flow-check.js · Figma hi-fi: node qa/figma-export.js → node figma/make-call.js --builder → bash figma/make-all.sh · lo-fi: node figma/lofi-convert.js → node figma/make-lofi.js → lofi-annotate.js (CLAUDE.md 5·6절)

<!-- 20줄 이내. 보고마다 갱신. 새 세션은 이 파일만 읽고 이어 간다. -->
