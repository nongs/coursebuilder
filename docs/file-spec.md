# 코스빌더 파일 명세서

> 문서 버전: 1.0  
> 기준: 저장소 `src/` 및 루트 설정 파일.  
> 동작·요구사항 상세는 `feature-spec.md`, 화면은 `screen-spec.md`를 우선 참고.

---

## 1. 문서 목적

| 항목 | 내용 |
|------|------|
| **목적** | 디렉터리 구조, 주요 파일의 책임, 기능과의 대략적 대응을 한곳에서 추적 |
| **범위** | 프런트엔드 소스(`src/`), 빌드·경로 설정(`vite.config.ts`, `tsconfig.json`), 진입 HTML |
| **비범위** | 패키지별 내부 구현, 노드 모듈 상세 |

---

## 2. 루트·설정 파일

| 경로 | 역할 |
|------|------|
| `package.json` | 스크립트(`dev`/`build`/`check`), 의존성(React, Zustand, TipTap, dnd-kit, DOMPurify 등) |
| `vite.config.ts` | Vite + React(SWC), `@root`·`@components`·`@styles`·`@domain`·`@store`·`@api`·`@utils` 별칭, `VITE_PUBLIC_BASE_PATH`로 `base` 설정 |
| `tsconfig.json` | `baseUrl: ./src`, 위 별칭과 동일한 `paths` |
| `index.html` | Vite 진입, `#root` 마운트 |

---

## 3. `src/` 디렉터리 트리 (요약)

```
src/
├── main.tsx                 # ReactDOM + ToastProvider + 전역 SCSS
├── App.tsx                  # 초기 courseTree fetch·hydrate, Header + Week + Course
├── api/
│   └── courseApi.ts         # localStorage 읽기/쓰기(지연 시뮬레이션)
├── domain/
│   ├── types.ts             # CourseTree 스키마, LearningItem 등 도메인 타입·버전 상수
│   ├── learningItemTypeOptions.ts  # 학습요소 타입 라벨·셀렉트 옵션 메타
│   ├── sanitizeHtml.ts      # 리치 HTML 정제·plain→rich 보조(coerce)
│   ├── courseTreeNormalize.ts    # 저장 JSON → 런타임 상태 보정
│   ├── courseTreeImport.ts       # 가져오기 JSON 검증
│   ├── courseTreeSelection.ts    # 주차/페이지 선택 헬퍼
│   └── …
├── store/
│   ├── courseStore.ts       # Zustand: 트리 CRUD, 선택, hydrate, 스냅샷
│   ├── persistMetaStore.ts  # 저장 baseline·더티 플래그
│   └── apiUiStore.ts        # 글로벌 로딩·초기 fetch 완료 플래그
├── utils/
│   └── toast.ts             # 명령형 Toast(`showToast`) — Provider와 연동
├── styles/
│   ├── index.scss           # 전역 partial import 허브
│   ├── base/                # reset, global
│   ├── layout/              # header
│   ├── components/          # modal, toast, radio, rich-text-editor, data-management, global-loader
│   ├── week/, course/, chapter/, page/, learningItem/  # 기능 영역 SCSS
│   └── …
└── components/
    ├── layout/Header.tsx
    ├── week/                # Week, WeekTabs, WeekTab, WeekActions
    ├── course/Course.tsx    # 좌 Chapter + 우 PageDetail
    ├── chapter/             # Chapter, ChapterCard, PageList, PageRow, chapterDnd.ts
    ├── page/PageDetail.tsx
    ├── learningItem/        # LearningItemList, LearningItem, learningItemType/*, index.ts
    ├── modal/               # Modal, CourseTitleModal, DataManagementModal, DeleteConfirmModal
    └── common/              # Radio, GlobalLoader, icons, toast/, textEditor/
```

---

## 4. 진입·앱 셸

| 파일 | 상세 |
|------|------|
| `main.tsx` | `ToastProvider`로 앱 감싸기, `index.scss` 로드, `App` 마운트 |
| `App.tsx` | 마운트 시 `fetchCourseTree` → `hydrate`, persist baseline 동기화; `Header`, `Week`, `Course`, `GlobalLoader` 배치 |

---

## 5. API·도메인·스토어

### 5.1 `src/api/courseApi.ts`

| 항목 | 내용 |
|------|------|
| **역할** | 브라우저 `localStorage`에 코스 트리 JSON 읽기/쓰기 |
| **비고** | 비동기 지연으로 로딩 UX; 실백엔드 API 아님 |

### 5.2 `src/domain/` (선택 파일)

| 파일 | 역할 |
|------|------|
| `types.ts` | `Course`, `Week`, `Chapter`, `Page`, `LearningItem`, `CourseTreeState`, `schemaVersion` 등 |
| `learningItemTypeOptions.ts` | 학습요소 타입 UI 라벨, 셀렉트 순서(`unknown` 플레이스홀더 + 선택 가능 타입 Record) |
| `sanitizeHtml.ts` | 편집기 출력 HTML 정제(DOMPurify), plain 텍스트를 안전한 HTML로 감싸기 등 |
| `courseTreeNormalize.ts` | 로드된 객체를 안전한 트리 상태 형태로 |
| `courseTreeImport.ts` | 내보낸 JSON 가져오기 검증 |
| `courseTreeSelection.ts` | 주차 선택 시 페이지 선택 연계 등 |

### 5.3 `src/store/`

| 파일 | 역할 |
|------|------|
| `courseStore.ts` | 강의/주차/챕터/페이지/학습요소 CRUD, DnD 순서·이동, `selectedWeekId`/`selectedPageId`, `hydrate`, 스냅샷 |
| `persistMetaStore.ts` | 마지막 저장 문자열과 현재 스토어 비교 → 저장 필요 여부 |
| `apiUiStore.ts` | API(현재는 주로 courseApi) 요청 중 카운트, 초기 fetch 완료 |

---

## 6. 유틸

| 파일 | 역할 |
|------|------|
| `utils/toast.ts` | `showToast(message, variant)` — 루트 `ToastProvider`가 구독 |

---

## 7. 스타일 `src/styles/`

| 구역 | 설명 |
|------|------|
| `index.scss` | `base`, `layout/header`, 공통 컴포넌트, `week-tabs`, `course`, `chapter`, `page-detail`, `learning-items` 등 `@use` 묶음 |
| `components/_rich-text-editor.scss` | TipTap 에디터 래퍼·툴바·모달 내 폼 클래스(`.cb-rich*`, `.cb-richmodal*`) |
| 영역별 `_*.scss` | 헤더, 주차 탭, 코스 그리드, 챕터 카드/페이지 행, 페이지 상세, 학습요소 카드 등 |

컴포넌트 TSX는 필요 시 `@styles/...` 또는 영역별 partial을 직접 import.

---

## 8. 컴포넌트 상세

### 8.1 레이아웃

| 파일 | 역할 |
|------|------|
| `layout/Header.tsx` | 로고, 저장 상태, 강의명·저장·데이터 관리, 강의 생성/제목 모달 분기 |

### 8.2 주차 `components/week/`

| 파일 | 역할 |
|------|------|
| `Week.tsx` | `WeekTabs` + `WeekActions` 래퍼 |
| `WeekTabs.tsx` | 주차 탭, 스크롤, +주차 추가, (순서 편집 모드 시) 탭 DnD |
| `WeekTab.tsx` | 단일 탭 |
| `WeekActions.tsx` | 복제, 순서 편집 토글, 삭제 확인 연동 |

### 8.3 코스·챕터·페이지

| 파일 | 역할 |
|------|------|
| `course/Course.tsx` | 좌 `Chapter`, 우 `PageDetail` 2단 그리드 |
| `chapter/Chapter.tsx` | 챕터 목록 DnD, 페이지 DnD 컨텍스트, `ChapterCard` 나열, 페이지 드래그 오버레이 |
| `chapter/chapterDnd.ts` | 드롭 ID 파싱, 충돌 검출 팩토리, 페이지 드롭 목적지 계산 등 **순수 로직** |
| `chapter/ChapterCard.tsx` | 챕터 제목 편집, `PageList` |
| `chapter/PageList.tsx` | 챕터 내 페이지 정렬 컨텍스트, 컨테이너 droppable id |
| `chapter/PageRow.tsx` | 페이지 행(Sortable), 선택·삭제 트리거 |
| `page/PageDetail.tsx` | 브레드크럼, 페이지 제목/설명, `LearningItemList` |

### 8.4 학습요소 `components/learningItem/`

| 파일 | 역할 |
|------|------|
| `index.ts` | `LearningItem`, `LearningItemList`, `LearningItemProps` re-export (리스트는 내부에서 `./LearningItem` 직접 import로 순환 방지) |
| `LearningItemList.tsx` | 학습요소 섹션 헤더/빈 상태/목록/`DeleteConfirmModal` |
| `LearningItem.tsx` | 카드 UI: 타입 셀렉트, 제목, **상세 내용**(`LazyRichTextEditor`), 비디오/퀴즈 분기 |
| `learningItemType/Quiz.tsx` | 퀴즈 전용 UI(단답/서술 textarea/객관식) |
| `learningItemType/Video.tsx` | YouTube URL, embed 미리보기, URL 검증 토스트 |
| `learningItemType/quizHelpers.ts` | 퀴즈 기본값 채우기 |
| `learningItemType/types.ts` | `updateLearningItem` 콜백 타입 alias |

### 8.5 모달 `components/modal/`

| 파일 | 역할 |
|------|------|
| `Modal.tsx` | 공통 모달 래퍼(닫기 동작 옵션 등) |
| `CourseTitleModal.tsx` | 강의명·생성 시 주차 수 |
| `DataManagementModal.tsx` | JSON 내보내기/가져오기, 검증·덮어쓰기 확인 |
| `DeleteConfirmModal.tsx` | 대상 타입별 삭제 확인 + 스토어 연동 |

### 8.6 공통 `components/common/`

| 파일 | 역할 |
|------|------|
| `Radio.tsx` | 라디오( pill / dot 변형 ) |
| `GlobalLoader.tsx` | API UI 스토어 기반 전체 로딩 오버레이 |
| `icons/*` | 빈 상태 일러스트 등 |
| `toast/Toast.tsx`, `ToastProvider.tsx`, `toast/index.ts` | 토스트 UI + 컨텍스트 |

#### 텍스트 에디터 `common/textEditor/`

| 파일 | 역할 |
|------|------|
| `index.ts` | **`LazyRichTextEditor` + `RichTextEditorProps` 타입만** export(동기 `RichTextEditor`는 번들 분리를 위해 미포함) |
| `LazyRichTextEditor.tsx` | `React.lazy(() => import('./RichTextEditor'))` |
| `RichTextEditor.tsx` | TipTap `useEditor`, 외부 `value` 동기화, 툴바·모달 조립 |
| `richTextEditorExtensions.ts` | StarterKit, Placeholder, Link, Image 설정 |
| `RichTextToolbar.tsx` / `RichTextToolbarButton.tsx` | 포맷 툴바 |
| `RichTextLinkModal.tsx` / `RichTextImageModal.tsx` | 링크·이미지 URL 모달 |
| `escapeHtml.ts` | 링크 삽입 시 이스케이프 |
| `types.ts` | `RichTextEditorProps` |

동기 로드가 필요하면 주석대로 `@components/common/textEditor/RichTextEditor`에서 default import.

---

## 9. 주요 기능 ↔ 파일 대응 (빠른 표)

| 기능 | 관련 파일(대표) |
|------|----------------|
| 초기 로드·localStorage | `App.tsx`, `courseApi.ts`, `courseStore.ts`, `courseTreeNormalize.ts` |
| 저장·더티 표시 | `Header.tsx`, `persistMetaStore.ts`, `courseStore.ts`(스냅샷 문자열) |
| 가져오기/내보내기 | `DataManagementModal.tsx`, `courseTreeImport.ts`, `courseApi.ts` |
| 주차 탭·순서·삭제 | `Week*.tsx`, `courseStore.ts` |
| 챕터/페이지 DnD | `Chapter.tsx`, `chapterDnd.ts`, `ChapterCard.tsx`, `PageList.tsx`, `PageRow.tsx` |
| 페이지 편집 | `PageDetail.tsx` |
| 학습요소 편집 | `LearningItem*.tsx`, `learningItemType/*`, `learningItemTypeOptions.ts` |
| 리치 텍스트(상세 내용) | `textEditor/*`, `sanitizeHtml.ts` |
| 토스트/로딩 | `toast/*`, `utils/toast.ts`, `GlobalLoader.tsx`, `apiUiStore.ts` |

---

## 10. 문서 간 참조

| 문서 | 용도 |
|------|------|
| `screen-spec.md` | 화면 영역·UI 요소 단위 설명 |
| `feature-spec.md` | 도메인, 저장, 검증, 제약 |
| `file-spec.md`(본 문서) | **파일·폴더 구조와 책임** |
