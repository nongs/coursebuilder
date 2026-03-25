import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { coercePlainTextToRichHtml, sanitizeRichHtml } from '@domain/sanitizeHtml';
import '@styles/components/_rich-text-editor.scss';
import type { RichTextEditorProps } from './types';
import { createRichTextEditorExtensions } from './richTextEditorExtensions';
import { escapeAttr, escapeHtmlText } from './escapeHtml';
import RichTextToolbar from './RichTextToolbar';
import RichTextLinkModal from './RichTextLinkModal';
import RichTextImageModal from './RichTextImageModal';

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
      extensions: createRichTextEditorExtensions(placeholder),
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
      <RichTextLinkModal
        isOpen={linkOpen}
        linkUrl={linkUrl}
        linkLabel={linkLabel}
        onChangeUrl={setLinkUrl}
        onChangeLabel={setLinkLabel}
        onClose={() => setLinkOpen(false)}
        onApply={applyLink}
        onRemove={removeLink}
      />

      <RichTextImageModal
        isOpen={imageOpen}
        imageUrl={imageUrl}
        imageAlt={imageAlt}
        onChangeUrl={setImageUrl}
        onChangeAlt={setImageAlt}
        onClose={() => setImageOpen(false)}
        onApply={applyImage}
      />

      <RichTextToolbar editor={editor} onOpenLink={openLinkModal} onOpenImage={openImageModal} />
      <EditorContent editor={editor} className="cb-rich__editor" />
    </div>
  );
};

export default RichTextEditor;
