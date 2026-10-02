#!/usr/bin/env bash
# GitHub 첫 업로드 · 맥 터미널에서 이 폴더(after-crew) 안에서 실행
#   bash scripts/publish.sh https://github.com/<아이디>/after-crew.git
# 하는 일: MANUAL 잠금 확인 → 전체 커밋 → 브랜치 이름 main → origin 연결 → push
# 하지 않는 일: 파일 삭제. 멈춘 잠금 파일(.git/index.lock)이 있으면 지우는 명령을 알려 주고 멈춘다.
set -euo pipefail

URL="${1:-}"
if [ -z "$URL" ]; then
  echo "저장소 주소를 붙여 주세요. 예: bash scripts/publish.sh https://github.com/<아이디>/after-crew.git"
  exit 1
fi

cd "$(dirname "$0")/.."

if [ -f .git/index.lock ]; then
  echo "git 잠금 파일(.git/index.lock)이 남아 있어요. 다른 git 작업이 돌고 있지 않다면 아래를 실행한 뒤 다시 실행해 주세요."
  echo "  rm .git/index.lock"
  exit 1
fi

if [ ! -f .github/workflows/qa.yml ] && [ -f scripts/qa-workflow.yml ]; then
  echo "GitHub Actions 검사 파일을 제자리에 옮긴 뒤 다시 실행해 주세요 (원격 도구는 .github/workflows/에 쓸 수 없어서 scripts/에 두었어요)."
  echo "  mkdir -p .github/workflows && mv scripts/qa-workflow.yml .github/workflows/qa.yml"
  exit 1
fi

want=$(grep -m1 '^manual_sha:' STATUS.md | awk '{print $2}')
got=$(shasum -a 256 MANUAL.md | cut -d' ' -f1)
if [ "$want" != "$got" ]; then
  echo "[매뉴얼 변조 감지] MANUAL.md 해시가 STATUS.md와 달라요. 멈춥니다."
  exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "새로 커밋할 변경 없음"
else
  git commit -q -F - <<'MSG'
After Crew r6 · lo-fi 32화면 · GitHub Pages · Codex 안내

- app/ r6: 하단 탭 4(찾기 · 지도 · 채팅 · 나), 상단 검색 · 알림 · 회차 열기, 채팅 · 알림 · 검색 화면
- figma/: hi-fi 빌더, lo-fi 변환 · 빌더 · 주석 스크립트
- qa/flow-check.js: 판정 추가(실패 시 종료 코드 1), .github/workflows/qa.yml
- AGENTS.md(Codex 리뷰 기준), README.md, 루트 index.html → app/ (GitHub Pages)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01TVASptfZURsZaFz3WxmrZ9
MSG
  git log --oneline -1
fi

git branch -M main
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$URL"
else
  git remote add origin "$URL"
fi
git push -u origin main

echo ""
echo "올라갔어요. 마지막 한 번: GitHub 저장소 → Settings → Pages → Branch: main, 폴더 / (root) → Save"
echo "1~2분 뒤 주소: https://<아이디>.github.io/<저장소 이름>/"
