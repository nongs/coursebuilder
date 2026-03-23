import DOMPurify from 'dompurify';
import type { CourseTreeState } from './types';

/**
 * 리치 텍스트(TipTap HTML)에 허용할 태그·속성.
 * 스크립트·이벤트 핸들러·위험 프로토콜(javascript:, data: 등)은 DOMPurify가 제거.
 */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'b',
  'i',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'blockquote',
  'code',
  'pre',
  'a',
  'img',
  'hr',
  'span',
  'div'
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'title', 'class'];

let hooksInstalled = false;

function installDomPurifyHooks(): void {
  if (typeof window === 'undefined' || hooksInstalled) return;
  hooksInstalled = true;

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.nodeType !== 1) return;
    const el = node as Element;
    const tag = el.tagName;

    if (tag === 'A') {
      const href = el.getAttribute('href');
      if (href) {
        const lower = href.trim().toLowerCase();
        if (
          lower.startsWith('javascript:') ||
          lower.startsWith('data:') ||
          lower.startsWith('vbscript:')
        ) {
          el.removeAttribute('href');
          return;
        }
        if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('mailto:')) {
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }

    /** 이미지: 원격 URL만 (http/https). Data URL·기타 스킴 제거 → 저장 후 재로드 시에도 동일하게 표시 */
    if (tag === 'IMG') {
      const src = el.getAttribute('src')?.trim();
      if (!src) {
        el.remove();
        return;
      }
      if (/^https?:\/\//i.test(src)) return;
      el.remove();
    }
  });
}

/**
 * 저장·표시 직전에 호출: XSS·악성 링크·허용되지 않은 이미지 URL 차단.
 */
export function sanitizeRichHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    return dirty;
  }
  installDomPurifyHooks();
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style']
  });
}

/**
 * 기존 순수 텍스트(마크업 없음) 데이터를 에디터용 HTML로 보정.
 */
export function coercePlainTextToRichHtml(raw: string | undefined): string {
  if (!raw?.trim()) return '';
  const t = raw.trim();
  if (t.startsWith('<')) {
    return sanitizeRichHtml(t);
  }
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  const lines = raw.split('\n');
  if (lines.length === 1) {
    return `<p>${escapeHtml(lines[0])}</p>`;
  }
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
}

/**
 * 로컬스토리지/가져오기로 들어온 트리에서 학습요소 HTML 필드를 일괄 정제.
 */
export function sanitizeLearningItemsInTree(state: CourseTreeState): CourseTreeState {
  if (typeof window === 'undefined') return state;

  const learningItemsById = { ...state.learningItemsById };
  for (const id of Object.keys(learningItemsById)) {
    const li = learningItemsById[id];
    if (!li) continue;
    const content = li.content ? sanitizeRichHtml(li.content) : li.content;
    let quiz = li.quiz;
    if (quiz?.kind === 'essay' && quiz.rubric) {
      quiz = { ...quiz, rubric: sanitizeRichHtml(quiz.rubric) };
    }
    learningItemsById[id] = { ...li, content, quiz };
  }
  return { ...state, learningItemsById };
}
