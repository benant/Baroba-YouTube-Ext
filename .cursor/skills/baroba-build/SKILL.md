---
name: baroba-build
description: >-
  Baroba-YouTube-Ext 확장 프로그램 빌드·배포 워크플로우. manifest 버전 올리기,
  src를 dist ZIP으로 패키징, CHANGELOG 갱신, git commit/pull/push까지 수행한다.
  사용자가 빌드, 배포, zip, 버전 올리기, 릴리스를 요청할 때 사용한다.
---

# Baroba Build

Baroba-YouTube-Ext의 표준 빌드·배포 절차다. 요청을 받으면 아래 단계를 **순서대로** 모두 수행한다.

## Prerequisites

- 작업 디렉터리: 저장소 루트 (`Baroba-YouTube-Ext/`)
- 패키징 대상: `src/` 안의 파일들 (폴더 자체는 ZIP에 넣지 않음)
- 출력: `dist/Baroba-YouTube-Ext-v{version}.zip`
- `dist/*.zip`은 `.gitignore`에 있으므로 **커밋하지 않는다**
- 참고용 `DOM/` 폴더는 별도 지시가 없으면 **커밋하지 않는다**

## Workflow Checklist

```
Build Progress:
- [ ] 1. 변경사항 확인
- [ ] 2. 버전 올리기
- [ ] 3. ZIP 패키징
- [ ] 4. CHANGELOG 갱신
- [ ] 5. git commit
- [ ] 6. git pull & push
```

### 1. 변경사항 확인

```bash
git status
git diff
git log --oneline -5
```

커밋할 내용이 무엇인지 파악한다. 사용자가 변경 요약을 주면 그걸 CHANGELOG·커밋 메시지에 반영한다.

### 2. 버전 올리기

`src/manifest.json`의 `version`을 올린다.

- 기본: **patch** (`1.2.4` → `1.2.5`)
- 사용자가 major/minor를 지정하면 그에 따름
- 이미 올린 상태면 다시 올리지 않음

### 3. ZIP 패키징

`src/manifest.json`에서 올린 버전을 `{version}`에 넣고, **src 디렉터리에서** 패키징한다.
ZIP 루트에 `manifest.json`이 바로 있어야 한다 (`src/` 폴더로 한 겹 감싸지 않음).

```bash
# Git Bash / 저장소 루트에서
powershell.exe -NoProfile -Command "Compress-Archive -Path 'src\\*' -DestinationPath 'dist\\Baroba-YouTube-Ext-v{version}.zip' -Force"
```

동일 로직의 헬퍼 스크립트도 있다 (실행 정책에 막히면 위 명령을 사용):

`.cursor/skills/baroba-build/scripts/build.ps1`

검증:

- ZIP이 `dist/`에 생성되었는지
- ZIP 루트에 `manifest.json`, `content.js`, `search_playlist.js` 등이 있는지

```bash
powershell.exe -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; \$z = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path 'dist\\Baroba-YouTube-Ext-v{version}.zip')); \$z.Entries | ForEach-Object FullName; \$z.Dispose()"
```

> Windows Git Bash에는 `zip`이 없을 수 있다. PowerShell `Compress-Archive`를 사용한다.

### 4. CHANGELOG 갱신

`CHANGELOG.md` 최상단(제목 바로 아래)에 새 버전 섹션을 추가한다.

```markdown
## {version}

- 변경 요약 1
- 변경 요약 2
```

- 사용자가 수정 내용을 주면 그걸 사용
- 없으면 `git diff` / 대화 맥락으로 간결히 요약
- 기존 버전 섹션은 유지

### 5. git commit

스테이징 대상 (기본):

- `src/` 변경 파일
- `CHANGELOG.md`
- 이번에 함께 수정한 기타 소스/문서 (사용자가 명시한 경우)

제외:

- `dist/*.zip`
- `DOM/` (명시 요청 없으면)

커밋 메시지 스타일 (기존 저장소 톤):

```
버전 {version}: {한 줄 요약}

{필요 시 1~2문장 보충}
```

예:

```
버전 1.2.4: 동영상 저장 팝업 DOM 변경 대응 및 A/B 테스트 호환

유튜브 저장 팝업의 신규·구형 DOM을 모두 지원하고 CHANGELOG를 추가했다.
```

HEREDOC으로 커밋:

```bash
git add src/ CHANGELOG.md
git commit -m "$(cat <<'EOF'
버전 {version}: 요약

EOF
)"
```

### 6. git pull & push

```bash
git pull
git push
```

- pull 충돌 시 해결 후 다시 push
- force push 금지
- 완료 후 `git status`로 확인

## Completion Report

끝나면 사용자에게 짧게 보고:

- 새 버전 번호
- ZIP 경로
- 커밋 해시 / 메시지
- push 결과 (`origin/main` 등)

## Notes

- 기능 수정만 하고 빌드를 요청하지 않은 경우 이 스킬을 실행하지 않는다
- 버전만 올리거나 ZIP만 만들라는 부분 요청이면 해당 단계만 수행
- 커밋/푸시를 제외하라고 하면 5·6단계는 건너뛴다
