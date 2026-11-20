# ✳ GAME LAND — 우리 반 게임랜드

기존 게임을 변경하지 않고 한곳에 모아 주는 학급 게임 런처입니다.

## 실행
- 사이트: https://reiner5427-eng.github.io/stacking-blocks-3d/game-land/
- GitHub Pages는 이 저장소의 main 브랜치 루트에서 게시하도록 설정되어 있어야 합니다.
- 위 URL은 GitHub Pages 설정이 활성화되어 있을 때 접속할 수 있습니다.

## 구성
- index.html — 화면 구조, 모달
- style.css — 다크 아케이드 디자인, 모바일/태블릿 반응형
- app.js — 게임 6개 목록, 필터, 검색, 정렬, 즐겨찾기, 상세 소개

## 새 게임 추가
app.js의 GAMES 배열에 아래 형태로 항목을 추가하면 됩니다.

\`\`\`js
{
  id: "new-unique-id",
  title: "새 게임 이름",
  short: "타일에 보이는 한 줄 소개",
  subject: "수학", // 국어/수학/사회/도구
  genre: "학습 퀴즈",
  emoji: "🎮",
  word: "NEW GAME",
  colors: ["#376288","#97b5e9"],
  url: "https://실제-게임-실행-주소", // 미확인 상태라면 null
  source: "https://github.com/소스-저장소", // 없으면 null
  description: "게임 상세 설명",
  features: ["주요 특징 1", "주요 특징 2"]
}
\`\`\`

실행 링크가 없는 게임도 타일에 표시되지만 상세창에는 '실행 링크 준비 중'이라고 나옵니다. GitHub 소스 주소가 있으면 프로젝트 보기 버튼이 노출됩니다.

**주의:** 기존 프로젝트의 기능·URL·명예의 전당 기록은 이 런처가 수정하지 않습니다. 즐겨찾기는 현재 기기의 브라우저에만 저장됩니다.

## 링크 확인 상태 (2026-11-17)
등록된 6개 모두는 기존 대화, QR코드 또는 GitHub README로 확인된 실행 URL을 등록했습니다. 외부 게임 사이트의 접속 상태는 모든 주소에 대해 확정 검증하지 않았습니다. 

## GitHub Pages가 안 열릴 때
GitHub 저장소 Settings → Pages → Build and deployment → Deploy from a branch → main → /(root)에서 배포가 설정되어 있는지 확인하세요. Pages 최초 게시 또는 변경 반영에는 GitHub의 배포 절차가 필요합니다. 기존 게임의 배포 설정을 임의 변경하지 않도록 이 작업은 수행하지 않았습니다.

## LAST BELL · 마지막 종

비례식·비례배분 좀비 생존 게임을 추가했습니다. 소스는 `/last-bell/`, 실행·공유 순위는 Sites에서 운영합니다.
