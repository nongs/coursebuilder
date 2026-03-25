import React from 'react';
import type { Editor } from '@tiptap/core';
import RichTextToolbarButton from './RichTextToolbarButton';

export interface RichTextToolbarProps {
  editor: Editor;
  onOpenLink: () => void;
  onOpenImage: () => void;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editor, onOpenLink, onOpenImage }) => {
  return (
    <div className="cb-rich__toolbar" role="toolbar" aria-label="서식">
      <RichTextToolbarButton
        title="굵게"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </RichTextToolbarButton>
      <RichTextToolbarButton
        title="기울임"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </RichTextToolbarButton>
      <RichTextToolbarButton
        title="취소선"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <s>S</s>
      </RichTextToolbarButton>
      <span className="cb-rich__sep" aria-hidden />
      <RichTextToolbarButton
        title="제목 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </RichTextToolbarButton>
      <RichTextToolbarButton
        title="제목 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </RichTextToolbarButton>
      <span className="cb-rich__sep" aria-hidden />
      <RichTextToolbarButton
        title="글머리 목록"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • 목록
      </RichTextToolbarButton>
      <RichTextToolbarButton
        title="번호 목록"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. 목록
      </RichTextToolbarButton>
      <RichTextToolbarButton
        title="인용"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        ”
      </RichTextToolbarButton>
      <span className="cb-rich__sep" aria-hidden />
      <RichTextToolbarButton title="링크 넣기·수정" onClick={onOpenLink}>
        링크
      </RichTextToolbarButton>
      <RichTextToolbarButton title="이미지 URL 삽입" onClick={onOpenImage}>
        이미지
      </RichTextToolbarButton>
      <span className="cb-rich__sep" aria-hidden />
      <RichTextToolbarButton
        title="실행 취소"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        ↶
      </RichTextToolbarButton>
      <RichTextToolbarButton
        title="다시 실행"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        ↷
      </RichTextToolbarButton>
    </div>
  );
};

export default RichTextToolbar;
