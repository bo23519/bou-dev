"use client";

import { useState, useRef, useEffect } from "react";
import { generateJSON } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { marked } from "marked";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Convert TipTap JSON to markdown (simplified)
function jsonToMarkdown(json: any): string {
  if (!json || !json.content) return "";
  
  let markdown = "";
  
  function processNode(node: any): string {
    if (!node) return "";
    
    if (node.type === "text") {
      let text = node.text || "";
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          if (mark.type === "bold") {
            text = `**${text}**`;
          } else if (mark.type === "italic") {
            text = `*${text}*`;
          } else if (mark.type === "code") {
            text = `\`${text}\``;
          }
        });
      }
      return text;
    }
    
    if (node.type === "codeBlock") {
      const content = node.content ? node.content.map(processNode).join("") : "";
      const language = node.attrs?.language || "";
      return "```" + language + "\n" + content + "\n```\n\n";
    }
    
    if (node.type === "paragraph") {
      const content = node.content ? node.content.map(processNode).join("") : "";
      return content + "\n\n";
    }
    
    if (node.type === "heading") {
      const level = node.attrs?.level || 1;
      const content = node.content ? node.content.map(processNode).join("") : "";
      return "#".repeat(level) + " " + content + "\n\n";
    }
    
    if (node.type === "bulletList" || node.type === "orderedList") {
      const items = node.content ? node.content.map(processNode).join("") : "";
      return items;
    }
    
    if (node.type === "listItem") {
      const content = node.content ? node.content.map(processNode).join("").trim() : "";
      return "- " + content + "\n";
    }
    
    if (node.type === "blockquote") {
      const content = node.content ? node.content.map(processNode).join("").trim() : "";
      return "> " + content.split("\n").join("\n> ") + "\n\n";
    }
    
    if (node.type === "horizontalRule") {
      return "---\n\n";
    }
    
    if (node.content) {
      return node.content.map(processNode).join("");
    }
    
    return "";
  }
  
  json.content.forEach((node: any) => {
    markdown += processNode(node);
  });
  
  return markdown.trim();
}

// Convert markdown to TipTap JSON
function markdownToJson(markdown: string): string {
  try {
    // Configure marked to use <strong> and <em> tags
    const html = marked.parse(markdown, {
      breaks: false,
      gfm: true,
    }) as string;
    const json = generateJSON(html, [StarterKit]);
    return JSON.stringify(json);
  } catch (error) {
    console.error("Error converting markdown to JSON:", error);
    return JSON.stringify({ type: "doc", content: [] });
  }
}

export const TipTapEditor = ({ content, onChange }: TipTapEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [markdown, setMarkdown] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize: convert TipTap JSON to markdown
  useEffect(() => {
    if (isInitialized) return;
    
    if (content && content.trim()) {
      try {
        const json = JSON.parse(content);
        const md = jsonToMarkdown(json);
        setMarkdown(md);
      } catch {
        // If it's not JSON, assume it's already markdown
        setMarkdown(content);
      }
    } else {
      setMarkdown("");
    }
    setIsInitialized(true);
  }, [content, isInitialized]);

  // Convert markdown to TipTap JSON on change
  useEffect(() => {
    if (!isInitialized) return;
    
    const json = markdownToJson(markdown);
    onChange(json);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown, isInitialized]);

  const insertAtCursor = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    
    setMarkdown(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const insertLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const lines = markdown.split("\n");
    let lineIndex = 0;
    let charCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        lineIndex = i;
        break;
      }
      charCount += lines[i].length + 1; // +1 for newline
    }
    
    lines[lineIndex] = prefix + lines[lineIndex];
    const newText = lines.join("\n");
    setMarkdown(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + prefix.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const insertCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const codeBlock = "\n```\n" + (selectedText || "your code here") + "\n```\n";
    const newText = markdown.substring(0, start) + codeBlock + markdown.substring(end);
    
    setMarkdown(newText);
    
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        const newPos = start + 5 + selectedText.length;
        textarea.setSelectionRange(newPos, newPos);
      } else {
        const newPos = start + 5;
        textarea.setSelectionRange(newPos, newPos + 15);
      }
    }, 0);
  };

  return (
    <div className="border border-zinc-700 rounded-lg bg-zinc-900 min-h-[400px]">
      <div className="border-b border-zinc-700 p-2 flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => insertAtCursor("**", "**")}
          className="px-3 py-1 rounded text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor("*", "*")}
          className="px-3 py-1 rounded text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => insertLine("# ")}
          className="px-3 py-1 rounded text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertLine("## ")}
          className="px-3 py-1 rounded text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertLine("- ")}
          className="px-3 py-1 rounded text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          Bullet List
        </button>
        <button
          type="button"
          onClick={() => insertLine("1. ")}
          className="px-3 py-1 rounded text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          Numbered List
        </button>
        <button
          type="button"
          onClick={() => insertLine("> ")}
          className="px-3 py-1 rounded text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor("`", "`")}
          className="px-3 py-1 rounded text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          Inline Code
        </button>
        <button
          type="button"
          onClick={insertCodeBlock}
          className="px-3 py-1 rounded text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          Code Block
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor("\n---\n")}
          className="px-3 py-1 rounded text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          HR
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        className="w-full h-[400px] p-4 bg-zinc-900 text-zinc-100 font-mono text-sm focus:outline-none resize-none"
        placeholder="Write your content in markdown..."
      />
    </div>
  );
};
