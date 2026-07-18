# 변경 이력

Baroba-YouTube-Ext 버전별 수정 내용을 정리합니다.

## 1.2.4

- 유튜브 **동영상 저장** 팝업 DOM 변경 대응
  - 신규 구조(`ytd-add-to-playlist-renderer`) selector 적용
  - 재생목록 항목, 제목, 검색창 삽입 위치 등 갱신
- A/B 테스트 대응: 이전 DOM(`yt-contextual-sheet-layout`)과 신규 DOM 모두에서 재생목록 검색·정렬 동작
- 검색 결과 없을 때 재생목록 영역이 줄어드는 현상 방지 CSS를 두 DOM 구조 모두에 적용

## 1.2.3

- 검색 결과가 없을 때 재생목록 박스가 사라지지 않도록 수정
- `ytContextualSheetLayoutContentContainer` 최소 높이 적용

## 1.2.1

- 팝업 레이어 구조 개선
- 썸네일 아이콘 추가 로직 최적화
- 팝업 열기/닫기 동작 개선
- CSS 스타일 수정
- 불필요한 파일 제거

## 1.1

- 재생목록 검색 기능 개선 및 스타일 수정
- 팝업 재생 버튼 디자인 수정

## 1.0.x (초기)

- `player-frame.html` / `player-frame.js` 기반 팝업 플레이어 통합
- 팝업뷰 DOM 변경 대응
- 재생목록 DOM 변경 대응 및 검색 기능 추가
- 미사용 권한·파일 정리
- Chrome / Edge 스토어 배포용 에셋 추가
