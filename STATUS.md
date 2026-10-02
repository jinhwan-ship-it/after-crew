manual_version: v1.6
manual_sha: 6bb3a2b6fc5ff6868564d41043d64aff41e8c8f4daf7247515903f9a2ef398ef
원본 위치: 맥북 Desktop/after-crew (Claude Code, git) — 프로젝트 문서 after-crew/는 게이트마다 덮어쓰는 사본 (R-10)
단계: 5/5 r7 통과 (헤드 리뷰 r6 반영: 대화 입력 바 · 칩 터치 44) · 헤드가 Figma에서 텍스트·워딩 수정 중 · Figma 프레임은 r6 그대로
갱신: 2026-10-02 · Claude Code 맥 세션 (r7)
완료: MANUAL v1.6 LOCKED · DESIGN v1.5 · flows ia v1.3 · app/ r7 · qa/r7-report.md · flow-check 50항목 · render.js(::before 포함 터치 측정 · WEBFONT=1) · (r6까지) lo-fi 파이프라인 · AGENTS.md · README.md · qa.yml · Pages · publish.sh
진행 중: 헤드 텍스트·워딩 수정(Figma). 끝날 때까지 Figma 프레임 다시 만들기 금지(같은 이름 프레임 교체라 헤드 수정이 지워짐)
다음: 헤드 "텍스트 끝" → get_design_context로 읽어 코드 반영 → r8 검수(찾기 필터 칩 390 웹폰트 3px 넘침 다시 재기 포함) → figma-export에 줄바꿈 + 채우기 칩 지원 → 바뀐 화면만 Figma hi-fi · lo-fi 다시 만들기
남은 BLOCKER: 0 / MAJOR: 0 (r7 독립 검증 MAJOR 2 · MINOR 4 → MAJOR 2 · MINOR 3 수정·재확인, 나머지 1건은 헤드 결정으로 r8)
마지막 라운드: impeccable r7 · 웹폰트 shots/r7-390 48장 + r7-360 6장 · 44px 미만 0(::before 포함) · flow-check PASS 50 · 칩 스와이프 r6 60~103px → 0 · em dash 0 · 금지어 0
헤드 결정 필요: r7 PR 머지(qa 통과 확인 뒤 main에 합치면 Pages에 r7) · 실제 iPhone에서 출렁임·칩 확인(이 맥엔 시뮬레이터 없음) · brand-board/(38MB) 공개 여부(지금 .gitignore) · MINOR 3(선택창 화살표 크기 · 360 좌우 여백 24 vs 16 · 범례 점 모양)
잠금 후 결정: 2026-09-29 활동색 A안·지도색 · 2026-09-30 r5 4건 · 2026-10-02 r6 3건 · lo-fi(Figma만) · GitHub 공개+Pages(push 실행은 헤드) · 2026-10-02 r7 6건(문구 칩 B 줄바꿈 + 채우기 · 보내기 48 · 폰 폭 출렁임 막기 · 필터 칩 터치 44 · 필터 칩 넘침은 텍스트 뒤 · 칩 누르면 키보드 유지)
열린 질문: 없음
git: github.com/jinhwan-ship-it/after-crew (공개) · main e84c86c · r7은 브랜치 r7-chat-bar → PR(헤드 "Create PR", 2026-10-02) · 머지 전이라 Pages(main)엔 r6 · 앞으로도 브랜치 → PR → qa 통과 → main, push는 헤드 승인 뒤 · 맥에 gh 없음
재실행: shasum -a 256 MANUAL.md → WEBFONT=1 node qa/render.js r8 → node qa/flow-check.js (Node playwright 없으면 python 드라이버를 NODE_PATH로, CLAUDE.md 5절) · Figma hi-fi: figma-export → make-call --builder → make-all.sh · lo-fi: lofi-convert → make-lofi → lofi-annotate (CLAUDE.md 5·6절)

<!-- 20줄 이내. 보고마다 갱신. 새 세션은 이 파일만 읽고 이어 간다. -->
