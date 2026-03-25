export interface RichTextEditorProps {
  /** 저장 형식: 정제된 HTML 조각 */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** 에디터 영역 최소 높이(px) */
  minHeight?: number;
  className?: string;
}
