# 코스빌더 기능 명세서

> 문서 버전: 1.0  
> 구현 기준: `src/` 기준 동작.

---

## 1. 목적 및 범위

| 항목 | 내용 |
|------|------|
| **목적** | 강의 단위로 주차·챕터·페이지·학습요소를 설계하고, 편집 내용을 브라우저에 저장·백업할 수 있게 함 |
| **비범위** | 실제 백엔드 DB, 사용자 로그인, 멀티 탭 동기화, 실시간 협업 |

---

## 2. 도메인 모델

### 2.1 계층 구조

```
강의(Course) > 주차(Week) > 챕터(Chapter) > 페이지(Page) > 학습요소(LearningItem)
```

- 엔티티는 고유 `id`(문자열)를 가짐.
- 상위는 하위의 **id 배열**만 저장하고, 상세는 `*ById` 맵(`Record<id, Entity>`)으로 관리.

### 2.2 런타임 상태 (`CourseTreeState`)

트리 데이터(`CourseTreeData`)에 더해:

- `selectedWeekId`, `selectedPageId`: UI 선택(저장 스냅샷에는 **포함하지 않음**).

### 2.3 영속화 스냅샷 (`CourseTreePersisted`)

- `CourseTreeData` + `schemaVersion`(정수).
- 현재 앱 버전 상수: `COURSE_TREE_SCHEMA_VERSION = 1` (`src/domain/types.ts`).
- **용도**: 내보내기 JSON·`localStorage` 저장에 동일 형식. 향후 포맷 변경 시 마이그레이션 분기 기준.

---

## 3. 데이터 저장·로드

### 3.1 API (`src/api/courseApi.ts`)

| 함수 | 동작 |
|------|------|
| `fetchCourseTree()` | `localStorage`에서 JSON 읽기 → `normalizeCourseTreeState`로 메모리 상태로 복원. 선택 ID는 비움 |
| `saveCourseTree(state)` | `CourseTreePersisted`를 JSON으로 `localStorage`에 저장 |
| 비동기 지연 | 데모용으로 약간의 지연(로딩 UX) |

### 3.2 정규화 (`src/domain/courseTreeNormalize.ts`)

- 루트가 객체가 아니면 빈 트리.
- 필수 맵 필드가 없으면 빈 객체로 보정.
- `schemaVersion`은 런타임 트리 상태에는 **반영하지 않음**(저장 시에만 추가).

### 3.3 저장 플로우 (사용자 관점)

1. 편집은 메모리(Zustand)에만 반영.
2. **저장** 버튼 또는 **가져오기 완료 후 자동 저장** 시 `localStorage` 반영.
3. **저장 상태 표시**: 마지막 저장 기준과 현재 스냅샷 비교로 `저장됨` / `저장필요` (`persistMetaStore` + `getPersistedSnapshotString`).

### 3.4 가져오기/내보내기 (`DataManagementModal` + `courseTreeImport`)

| 단계 | 동작 |
|------|------|
| 내보내기 | `getCourseTreeSnapshot()` JSON → 파일 다운로드 (`schemaVersion` 포함) |
| 가져오기 | JSON 파싱 → `validateCourseTreeImport` (필수 필드·타입·지원 `schemaVersion` 범위) |
| 확인 | 검증 통과 후 **덮어쓰기 확인 모달** → `hydrate` + `saveCourseTree` + baseline 동기화 |

---

## 4. 강의(Course)

| 기능 | 설명 |
|------|------|
| 활성 강의 | `courseIds[0]`을 활성으로 사용 (`getActiveCourseId`) |
| 강의명 수정 | 헤더에서 모달로 제목 변경 (빈 문자열은 무시) |
| 새 강의 생성 | 강의명 + 주차 수(1~99). 기본 챕터·페이지가 주차별로 생성됨 |
| 기존 데이터 존재 시 | 새 강의 전 확인 모달(덮어쓰기 경고) |
| 강의 없음(최초) | 강의 생성 모달이 닫기 불가로 표시될 수 있음 |

---

## 5. 주차(Week)

| 기능 | 설명 |
|------|------|
| 선택 | 탭 클릭 → `selectWeek` (해당 주 첫 페이지로 선택 연동) |
| 추가 | 코스에 주차 추가, 기본 챕터·페이지 포함 |
| 삭제 | 주차 1개일 때는 삭제 불가. 삭제 시 하위 챕터·페이지·학습요소 정리 |
| 순서 변경 | `순서 편집` 모드에서만 탭 드래그, `reorderWeeks` |
| 복제 | 선택 주차 복제(새 id, 하위 구조 복사) |
| 중복 주차명 | `order`로 정렬해 탭 표시 |

---

## 6. 챕터(Chapter)

| 기능 | 설명 |
|------|------|
| 순서 | 챕터 카드 드래그로 `reorderChapters` |
| 제목 | 인라인 편집(빈 문자열은 저장 시 trim 처리 등 스토어 규칙 따름) |
| 추가/삭제 | 주차에 챕터 추가, 삭제 시 하위 페이지·학습요소 제거 |
| 페이지 | 챕터별 페이지 목록, 드래그로 순서 변경 및 챕터 간 **이동** (`movePage`) |

---

## 7. 페이지(Page)

| 기능 | 설명 |
|------|------|
| 선택 | 트리에서 페이지 클릭 → `selectPage` |
| 제목·설명 | `PageEditor`에서 편집 |
| 삭제 | 챕터에서 페이지 제거, 학습요소 삭제 |
| 추가 | 챕터별 `addPage` |

---

## 8. 학습요소(LearningItem)

| 타입 | 필드·동작 요약 |
|------|-------------------|
| `unknown` | 타입 미선택 안내 |
| `text` | 제목, 본문(content) |
| `video` | `videoUrl`, YouTube URL 패턴이면 미리보기 |
| `image` | 이미지 관련 필드(콘텐츠/URL 등 스토어 필드 따름) |
| `embed` | 임베드용 |
| `quiz` | 단답형/서술형/객관식. 객관식은 보기 추가·삭제(최소 1개), 정답 라디오 선택 |

공통: 추가/삭제, 목록 순서는 드래그로 재정렬(동일 페이지 내).

---

## 9. UI·전역 상태

| 스토어 | 역할 |
|--------|------|
| `courseStore` | 트리 CRUD, 선택, `hydrate`, `getCourseTreeSnapshot` |
| `persistMetaStore` | 마지막 저장 직렬화 baseline → 더티 여부 |
| `apiUiStore` | 초기 fetch 완료 여부, 전역 로딩 카운트 등 |

`GlobalLoader`: API 요청 중 오버레이.

---

## 10. 스키마 버전 정책

| 항목 | 내용 |
|------|------|
| 저장 시 | 항상 현재 `COURSE_TREE_SCHEMA_VERSION` 기록 |
| 가져오기 | `schemaVersion` 없으면 레거시로 허용. 있으면 `1 ≤ v ≤ 현재 앱 최대` 범위만 허용 |
| 미래 | v2 도입 시 `validate` 후 `normalize` 또는 `migrate` 함수로 이전 포맷 변환 가능 |

---

## 11. 제약·알려진 한계

- **단일 브라우저·단일 탭** 기준: 다른 탭과 동시 편집 시 `localStorage` 충돌 가능.
- **실서비스 DB** 없음: 백업은 JSON 내보내기에 의존.
- **라우팅 없음**: URL로 특정 페이지/강의 공유 불가.

---

## 12. 관련 문서

- 요구사항 초안: `coursebuilder-spec.md`
- 화면 구성: `screen-spec.md`
