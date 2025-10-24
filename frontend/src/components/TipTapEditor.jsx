import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Palette
} from 'lucide-react';
import { Button } from './ui/button';

const TipTapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-orange-500 hover:text-orange-400 underline',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt('Enter YouTube URL');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  const setColor = () => {
    const color = window.prompt('Enter color (hex, rgb, or name)', '#ff6600');
    if (color) {
      editor.chain().focus().setColor(color).run();
    }
  };

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-slate-700 bg-slate-900">
        {/* Text Formatting */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('underline') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="h-8 w-8 p-0"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('strike') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className="h-8 w-8 p-0"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('code') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className="h-8 w-8 p-0"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-slate-700 mx-1" />

        {/* Headings */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="h-8 px-2"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="h-8 px-2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="h-8 px-2"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-slate-700 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('blockquote') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-slate-700 mx-1" />

        {/* Media & Links */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('link') ? 'default' : 'outline'}
          onClick={addLink}
          className="h-8 w-8 p-0"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addImage}
          className="h-8 w-8 p-0"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addYoutube}
          className="h-8 w-8 p-0"
        >
          <YoutubeIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={setColor}
          className="h-8 w-8 p-0"
        >
          <Palette className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-slate-700 mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-slate-800 text-slate-200" />
    </div>
  );
};

export default TipTapEditor;
