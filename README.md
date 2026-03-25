# Coursebuilder

강의 구조(주차 → 챕터 → 페이지 → 학습요소)를 브라우저에서 설계하는 **웹 기반 강의 저작 도구**입니다. 별도 서버 DB 없이 **`localStorage`**에 저장하며, JSON으로 백업·복원할 수 있습니다.

**구현 페이지:** [http://limgeonhong.com/coursebuilder/](http://limgeonhong.com/coursebuilder/)

---

## 주요 기능

- **계층형 코스 설계**: 강의 / 주차 / 챕터 / 페이지 / 학습요소
- **편집·저장 분리**: 편집은 메모리(Zustand), **저장** 버튼으로 브라우저에 반영
- **저장 상태 표시**: 마지막 저장 대비 변경 여부(`저장됨` / `저장필요`)
- **데이터 관리**: JSON 내보내기·가져오기, 스키마 검증 및 덮어쓰기 확인

---

## 기술 스택

| 구분 | 사용 |
|------|------|
| UI | React 18, TypeScript |
| 빌드 | Vite 6, `@vitejs/plugin-react-swc` |
| 상태 | Zustand |
| 스타일 | Sass(SCSS) |
| 리치 텍스트 | TipTap 3 (`@tiptap/react` 등) |
| HTML 정제 | `dompurify` |

---

## 시작하기

### 요구 사항

- **Node.js** 18+ 권장
- 패키지 매니저: **npm** (또는 `pnpm` / `yarn` — 아래 명령만 대응하면 됨)

### 설치

```bash
npm install
```

### 개발 서버

```bash
npm run dev
```

기본 주소: `http://localhost:5173` ([vite.config.ts](vite.config.ts)에서 포트 변경 가능)

### 프로덕션 빌드

```bash
npm run build
npm run preview   # 빌드 결과 미리보기 — 하위 경로 배포 시 아래 URL로 접속
```

### 배포 경로 (환경 변수)

정적 파일을 **`https://도메인/coursebuilder/`** 처럼 하위 경로에 올릴 때, Vite의 `base`와 맞춰야 JS/CSS 경로가 올바릅니다.

| 파일 | 용도 |
|------|------|
| [`.env.development`](.env.development) | `npm run dev` — 기본 `/` (루트) |
| [`.env.production`](.env.production) | `npm run build` — 예: `/coursebuilder/` |
| [`.env.example`](.env.example) | 변수 설명용 템플릿 (복사해 사용 가능) |

- 변수명: **`VITE_PUBLIC_BASE_PATH`** (앞에 `/` 를 붙이고, 끝에 `/` 가 없으면 빌드 시 자동 보정)
- 값은 공개 설정(경로)이므로 저장소에 포함해도 됩니다. 서버마다 다르면 **`.env.production.local`** (git 무시)로 덮어쓰면 됩니다.
- `npm run preview` 로 확인할 때는 브라우저에서 **`http://localhost:4173/coursebuilder/`** 처럼 **base 경로를 포함한 URL**로 열어야 합니다.

서버(Nginx 등)에서는 `location /coursebuilder/` 에 `dist` 내용을 두고, `index.html` 이 해당 경로에서 서빙되도록 설정하세요.

### 린트

```bash
npm run lint
```

### 품질 검증 (린트 + 타입 + 빌드)

단위 테스트 프레임워크는 없습니다. 아래로 ESLint, `tsc --noEmit`, 프로덕션 빌드를 한 번에 실행할 수 있습니다.

```bash
npm run check
```

---

## 데이터 저장

- **키**: `coursebuilder:courseTree` (`src/api/courseApi.ts` 내부 상수)
- 브라우저별·도메인별로 분리됩니다. 다른 PC로 옮길 때는 **데이터 관리 → JSON 내보내기/가져오기**를 사용하세요.

---

## 프로젝트 구조 (요약)

```
src/
  api/           # fetch/save (localStorage 래퍼)
  components/    # layout, common, course UI
  domain/        # 타입, 정규화, 가져오기 검증, 선택 유틸
  store/         # courseStore, apiUi, persistMeta
  styles/        # 전역·컴포넌트·레이아웃 SCSS
  App.tsx
  main.tsx
docs/            # 명세·요구사항 문서
```

경로 별칭: `@root`, `@components`, `@domain`, `@store`, `@api`, `@styles`, `@utils` (`tsconfig.json` / `vite.config.ts` 참고)

---

## 문서

| 문서 | 내용 |
|------|------|
| [docs/screen-spec.md](docs/screen-spec.md) | **화면 명세** — 레이아웃, 영역별 UI, 모달 |
| [docs/feature-spec.md](docs/feature-spec.md) | **기능 명세** — 도메인, 저장·가져오기, 기능 목록 |
| [docs/file-spec.md](docs/file-spec.md) | **파일 명세** — 디렉터리 구조, 파일 책임, 기능↔파일 대응 |
| [docs/coursebuilder-spec.md](docs/coursebuilder-spec.md) | 초기 요구사항·기술 방향 정리 |

---

## 라이선스

`private` 패키지입니다. 저장소 정책에 따릅니다.
