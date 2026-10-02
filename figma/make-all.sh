#!/bin/bash
# M5 · 모든 화면 호출 코드 다시 만들기 (섹션: 동행자 55:589 · 길잡이 55:590 · 나 55:591)
cd "$(dirname "$0")/.."
P=(A-find A-find-empty B-session-walk B-session-bike B1-apply-sheet B-session-applied-today H-chat H-msg-sheet F-report-msg C-today-before C-today-going C-today-done D-map D1-course-sheet I-chats J-notifications K-search K-search-results A1-gu-sheet)
H=(E0-verify E1-activity E2-course E3-when E4-preview E5-created Cp-host-checked Cp-host-ended H-chat-closed A-find-host-pinned)
G=(G-me G1-edit G2-settings)
i=0; for s in "${P[@]}"; do node figma/make-call.js $s $((40+i*470)) 120 55:589 >/dev/null; i=$((i+1)); done
i=0; for s in "${H[@]}"; do node figma/make-call.js $s $((40+i*470)) 120 55:590 >/dev/null; i=$((i+1)); done
i=0; for s in "${G[@]}"; do node figma/make-call.js $s $((40+i*470)) 120 55:591 >/dev/null; i=$((i+1)); done
wc -c figma/calls/*.js | tail -1
