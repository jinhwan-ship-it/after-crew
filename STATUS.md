manual_version: v1.7
manual_sha: 8dbec6d9ba5efdd9ba45c02d72b3edc0aa6b6db3affdd3ca125f653ae6055507
원본 위치: 맥북 Desktop/after-crew (Claude Code, git) — 프로젝트 문서 after-crew/는 게이트마다 덮어쓰는 사본 (R-10)
단계: 5/5 r8 (문구 리서치 승인분 적용 · MANUAL v1.7 · DESIGN v1.6) · 독립 검증 반영 끝 · 브랜치 r8-copy 커밋, push · PR은 헤드 승인 대기 · Figma 프레임은 r6 그대로
갱신: 2026-10-02 · Claude Code 맥 세션 (문구 리서치 → r8)
완료: app/ r8 · r8 독립 검증(BLOCKER 0 · MAJOR 1 · MINOR 7 → 전부 반영, qa/r8-report.md) · MANUAL v1.7 LOCKED(F-01 러닝 정의 · §11 결정 병합) · DESIGN v1.6(띄어쓰기 · DON'T 3) · flow-check 51항목(noToday) · render.js(글자 여백 침범 · 숫자 갈라짐 열, 360 회차 상세 3상태) · qa.yml "오늘" grep · flows 문구 맞춤 · research/copy-inventory.md · copy-bench/web.md · copy-benchmark.md(R1~R12 · 수정 전/후 45줄 · 7절 적용 결과) · copy-bench/README.md(캡처 체크리스트) · (r6까지) lo-fi 파이프라인 · Pages · publish.sh
진행 중: 없음
다음: r8-copy push · PR(헤드 승인) → qa 통과 → main 머지 뒤 Pages에서 헤드 리뷰 → 열린 질문 답 → (캡처 들어오면 3단계 copy-bench/<앱>/copy.md) → figma-export에 줄바꿈 + 채우기 칩 지원 → 바뀐 화면만 Figma hi-fi · lo-fi 다시 만들기(헤드 Figma 문구 수정 끝난 뒤)
남은 BLOCKER: 0 / MAJOR: 0 (r8 검증 MAJOR 1 = 두 버튼 캘린더 줄 → 블록) · 범위 밖 발견: C · C′ 대화방 행이 닉네임 표시(app.js 대화방 행, F-12) → r9 후보
마지막 라운드: impeccable r8 · 웹폰트 shots/r8-390 48장 + r8-360 9장 · 44px 미만 0 · 글자 여백 침범 0 · 숫자 갈라짐 0(360 "4.9k / m" 고침) · 버튼 글자 넘침 0 · flow-check PASS 51 · "오늘" 0 · em dash 0 · 금지어 0
헤드 결정 필요: r8 push/PR · 문구 Q1(말투 규칙 위치) · Q5(회차 탭 "대화" → "대화방") · Q6(보드 합니다체) · 보드 43~45 · v1.7 재잠금을 "R8에 적용한다" 포괄 지시로 받은 것 확인 · B 신청한 당일 · 바이크 하단 버튼 3줄 높이 · 날짜 줄 첫 칸 점(지금은 aria-current만) · C′ "전원 완주로 마쳤어요" ↔ "모두 완주했어요" · K 묶음 "2개" ↔ 행 "1" · 실제 iPhone 확인(Pages) · brand-board/(38MB) 공개 여부 · MINOR 3(선택창 화살표 · 360 좌우 여백 · 범례 점) · 찾기 필터 칩 390 웹폰트 3px 넘침 다시 재기
잠금 후 결정: 없음 (v1.7 해제 때 §11에 병합, 2026-10-02)
열린 질문: 위 "헤드 결정 필요"의 문구 Q1 · Q5 · Q6
git: github.com/jinhwan-ship-it/after-crew (공개) · main 0360641 = r7(PR #1) · r8은 브랜치 r8-copy에 커밋(로컬, push 전) · Pages(main)엔 r7 · 브랜치 → PR → qa 통과 → main, push는 헤드 승인 뒤 · 맥에 gh 없음(PR 만들기·머지는 브라우저 창에서, 헤드 로그인)
재실행: shasum -a 256 MANUAL.md → WEBFONT=1 node qa/render.js r9 → node qa/flow-check.js (Node playwright 없으면 python 드라이버를 NODE_PATH로, CLAUDE.md 5절) · Figma hi-fi: figma-export → make-call --builder → make-all.sh · lo-fi: lofi-convert → make-lofi → lofi-annotate (CLAUDE.md 5·6절)

<!-- 20줄 이내. 보고마다 갱신. 새 세션은 이 파일만 읽고 이어 간다. -->
