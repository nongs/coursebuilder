import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Modal from '@components/common/Modal';
import { coercePlainTextToRichHtml, sanitizeRichHtml } from '@domain/sanitizeHtml';
import '@styles/components/_rich-text-editor.scss';

export interface RichTextEditorProps {
  /** 저장 형식: 정제된 HTML 조각 */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** 에디터 영역 최소 높이(px) */
  minHeight?: number;
  className?: string;
}

function escapeHtmlText(text: string): string {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    className={`cb-rich__toolbtn ${active ? 'is-active' : ''}`}
    onClick={onClick}
    disabled={disabled}
    title={title}
  >
    {children}
  </button>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '내용을 입력하세요',
  minHeight = 160,
  className = ''
}) => {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkLabel, setLinkLabel] = useState('');

  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('https://');
  const [imageAlt, setImageAlt] = useState('');

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
          bulletList: { keepMarks: true },
          orderedList: { keepMarks: true }
        }),
        Placeholder.configure({ placeholder }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank'
          }
        }),
        Image.configure({
          inline: false,
          allowBase64: false,
          HTMLAttributes: {
            class: 'cb-rich__img'
          }
        })
      ],
      content: coercePlainTextToRichHtml(value),
      editorProps: {
        attributes: {
          class: 'cb-rich__prose',
          style: `min-height: ${minHeight}px`,
          spellcheck: 'true'
        }
      },
      onUpdate: ({ editor: ed }) => {
        onChange(sanitizeRichHtml(ed.getHTML()));
      }
    },
    []
  );

  useEffect(() => {
    if (!editor) return;
    const next = coercePlainTextToRichHtml(value);
    const cur = editor.getHTML();
    if (editor.isFocused) return;
    if (sanitizeRichHtml(cur) !== sanitizeRichHtml(next)) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  const openLinkModal = () => {
    if (!editor) return;
    const href = (editor.getAttributes('link').href as string | undefined) ?? '';
    const { from, to } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to, '');
    setLinkUrl(href.trim() || 'https://');
    setLinkLabel(selected);
    setLinkOpen(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkOpen(false);
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      window.alert('주소는 http:// 또는 https:// 로 시작해야 합니다.');
      return;
    }
    const { from, to } = editor.state.selection;
    const empty = from === to;
    if (empty) {
      const label = (linkLabel.trim() || url).slice(0, 2000);
      const safe = escapeHtmlText(label);
      editor.chain().focus().insertContent(`<a href="${escapeAttr(url)}">${safe}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setLinkOpen(false);
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkOpen(false);
  };

  const openImageModal = () => {
    setImageUrl('https://');
    setImageAlt('');
    setImageOpen(true);
  };

  const applyImage = () => {
    if (!editor) return;
    const url = imageUrl.trim();
    if (!url) {
      window.alert('이미지 주소를 입력해 주세요.');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      window.alert('이미지 주소는 http:// 또는 https:// 로 시작해야 합니다.');
      return;
    }
    editor
      .chain()
      .focus()
      .setImage({
        src: url,
        alt: imageAlt.trim() || undefined
      })
      .run();
    setImageOpen(false);
  };

  if (!editor) {
    return <div className={`cb-rich cb-rich--loading ${className}`} aria-busy="true" />;
  }

  return (
    <div className={`cb-rich ${className}`}>
      <Modal
        isOpen={linkOpen}
        title="링크"
        onClose={() => setLinkOpen(false)}
        footer={
          <>
            <button type="button" className="cb-btn cb-btn--primary" onClick={applyLink}>
              적용
            </button>
            <button type="button" className="cb-btn" onClick={removeLink}>
              링크 제거
            </button>
            <button type="button" className="cb-btn" onClick={() => setLinkOpen(false)}>
              닫기
            </button>
          </>
        }
      >
        <div className="cb-richmodal">
          <label className="cb-richmodal__label">URL</label>
          <input
            className="cb-input cb-richmodal__input"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <p className="cb-richmodal__hint">선택 영역이 없으면 아래 텍스트가 삽입되며 링크가 걸립니다.</p>
          <label className="cb-richmodal__label">표시 텍스트 (선택 없을 때)</label>
          <input
            className="cb-input cb-richmodal__input"
            type="text"
            placeholder="비우면 URL과 동일하게 표시"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={imageOpen}
        title="이미지"
        onClose={() => setImageOpen(false)}
        footer={
          <>
            <button type="button" className="cb-btn cb-btn--primary" onClick={applyImage}>
              삽입
            </button>
            <button type="button" className="cb-btn" onClick={() => setImageOpen(false)}>
              닫기
            </button>
          </>
        }
      >
        <div className="cb-richmodal">
          <label className="cb-richmodal__label">이미지 주소</label>
          <input
            className="cb-input cb-richmodal__input"
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://… (웹에 공개된 이미지 URL)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <label className="cb-richmodal__label">대체 텍스트 (선택)</label>
          <input
            className="cb-input cb-richmodal__input"
            type="text"
            placeholder="스크린 리더용 설명"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
          />
          <p className="cb-richmodal__hint">
            이미지는 http(s) URL만 저장됩니다. Imgur·GitHub raw·CDN 등 공개 URL을 사용해 주세요.
          </p>
        </div>
      </Modal>

      <div className="cb-rich__toolbar" role="toolbar" aria-label="서식">
        <ToolbarButton
          title="굵게"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          title="기울임"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          title="취소선"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </ToolbarButton>
        <span className="cb-rich__sep" aria-hidden />
        <ToolbarButton
          title="제목 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="제목 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <span className="cb-rich__sep" aria-hidden />
        <ToolbarButton
          title="글머리 목록"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • 목록
        </ToolbarButton>
        <ToolbarButton
          title="번호 목록"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. 목록
        </ToolbarButton>
        <ToolbarButton
          title="인용"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ”
        </ToolbarButton>
        <span className="cb-rich__sep" aria-hidden />
        <ToolbarButton title="링크 넣기·수정" onClick={openLinkModal}>
          링크
        </ToolbarButton>
        <ToolbarButton title="이미지 URL 삽입" onClick={openImageModal}>
          이미지
        </ToolbarButton>
        <span className="cb-rich__sep" aria-hidden />
        <ToolbarButton
          title="실행 취소"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          title="다시 실행"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          ↷
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="cb-rich__editor" />
    </div>
  );
};

export default RichTextEditor;
