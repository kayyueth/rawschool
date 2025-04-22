"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Add custom CSS to override Tiptap's default styles
const customEditorStyles = `
  /* Remove borders around selected text */
  .ProseMirror-selectednode {
    outline: none !important;
    border: none !important;
  }
  
  /* Remove blue background on selection */
  .ProseMirror p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
  
  /* Customize text selection color to be more subtle */
  .ProseMirror ::selection {
    background: rgba(0, 0, 0, 0.1);
  }
  
  /* Remove default focus outline */
  .ProseMirror:focus {
    outline: none !important;
  }
  
  /* Remove any unwanted borders on focused editor */
  .ProseMirror {
    min-height: 150px;
  }
  
  /* Style for links inside editor */
  .ProseMirror a {
    color: #2563eb;
    text-decoration: underline;
    cursor: pointer;
  }
`;

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  className = "",
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkText, setLinkText] = React.useState("");

  // Add the custom styles to the document head
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = customEditorStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: parseMarkdownToHTML(content),
    onUpdate: ({ editor }) => {
      // Convert HTML to Markdown when content changes
      onChange(parseHTMLToMarkdown(editor.getHTML()));
    },
  });

  useEffect(() => {
    // Update the editor content when the content prop changes
    // (e.g., when initial content is loaded)
    if (editor && content !== parseHTMLToMarkdown(editor.getHTML())) {
      editor.commands.setContent(parseMarkdownToHTML(content));
    }
  }, [content, editor]);

  const handleInsertLink = () => {
    if (!editor) return;

    if (linkUrl) {
      // If there's already text selected, use that as the link text
      if (editor.state.selection.empty && linkText) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${linkUrl}">${linkText}</a>`)
          .run();
      } else {
        // Otherwise update the selected text to be a link
        editor.chain().focus().setLink({ href: linkUrl }).run();
      }
    }

    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <div className="flex items-center mb-2 space-x-2 pb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={`h-8 w-8 ${
                  editor.isActive("bold")
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold (Ctrl+B)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={`h-8 w-8 ${
                  editor.isActive("italic")
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic (Ctrl+I)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={`h-8 w-8 ${
                  editor.isActive("link")
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
                onClick={() => {
                  // Check if a link is selected
                  if (editor.isActive("link")) {
                    // Remove link
                    editor.chain().focus().unsetLink().run();
                  } else {
                    // If text is selected, open dialog to add link
                    const selection = editor.state.selection;
                    if (!selection.empty) {
                      setLinkText(
                        editor.state.doc.textBetween(
                          selection.from,
                          selection.to,
                          " "
                        )
                      );
                      setShowLinkDialog(true);
                    } else {
                      setShowLinkDialog(true);
                    }
                  }
                }}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {editor.isActive("link") ? "Remove Link" : "Insert Link"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <EditorContent
        editor={editor}
        className="min-h-[160px] rounded-md border border-input bg-transparent px-3 py-2 focus-visible:outline-none editor-container"
      />

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="linkText" className="text-right">
                Text
              </Label>
              <Input
                id="linkText"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="linkUrl" className="text-right">
                URL
              </Label>
              <Input
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLinkDialog(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleInsertLink}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions to convert between Markdown and HTML

function parseMarkdownToHTML(markdown: string): string {
  if (!markdown) return "";

  // Convert Markdown to HTML
  let html = markdown;

  // Bold: **text** or __text__
  html = html.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");

  // Italic: *text* or _text_
  html = html.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return html;
}

function parseHTMLToMarkdown(html: string): string {
  if (!html) return "";

  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Process the HTML nodes recursively
  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      let result = "";

      // Process children first
      for (let i = 0; i < node.childNodes.length; i++) {
        result += processNode(node.childNodes[i]);
      }

      // Apply formatting
      if (element.tagName === "STRONG" || element.tagName === "B") {
        return `**${result}**`;
      } else if (element.tagName === "EM" || element.tagName === "I") {
        return `*${result}*`;
      } else if (element.tagName === "A") {
        const href = element.getAttribute("href");
        return `[${result}](${href})`;
      } else if (element.tagName === "P") {
        return `${result}\n\n`;
      } else if (element.tagName === "BR") {
        return "\n";
      } else if (element.tagName === "DIV") {
        return `${result}\n`;
      }

      return result;
    }

    return "";
  }

  let markdown = processNode(doc.body);

  // Clean up extra newlines
  markdown = markdown.replace(/\n{3,}/g, "\n\n");
  markdown = markdown.trim();

  return markdown;
}
