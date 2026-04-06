"use client";

import { memo } from "react";
import {
  Bold, Italic, Underline, Strikethrough, Code,
  List, ListOrdered, Quote, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, Type, Minus,
} from "lucide-react";
import { ToolbarButton, ToolbarDivider } from "./book-editor-toolbar";
import { useEditorToolbar } from "@/shared/hooks/use-editor-toolbar";

export const EditorToolbar = memo(() => {
  const {
    blockState,
    formatBold,
    formatItalic,
    formatUnderline,
    formatStrikethrough,
    formatCode,
    formatHeading,
    formatParagraph,
    formatQuote,
    insertUnorderedList,
    insertOrderedList,
    insertHorizontalRule,
    formatAlignLeft,
    formatAlignCenter,
    formatAlignRight,
    formatAlignJustify,
  } = useEditorToolbar();

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-primary-200 bg-primary-50">
      <ToolbarButton onClick={() => {}} icon={Undo} title="Desfazer (Ctrl+Z)" />
      <ToolbarButton onClick={() => {}} icon={Redo} title="Refazer (Ctrl+Y)" />
      <ToolbarDivider />

      <ToolbarButton onClick={formatBold} isActive={blockState.isBold} icon={Bold} title="Negrito (Ctrl+B)" />
      <ToolbarButton onClick={formatItalic} isActive={blockState.isItalic} icon={Italic} title="Itálico (Ctrl+I)" />
      <ToolbarButton onClick={formatUnderline} isActive={blockState.isUnderline} icon={Underline} title="Sublinhado (Ctrl+U)" />
      <ToolbarButton onClick={formatStrikethrough} isActive={blockState.isStrikethrough} icon={Strikethrough} title="Tachado" />
      <ToolbarButton onClick={formatCode} isActive={blockState.isCode} icon={Code} title="Código" />
      <ToolbarDivider />

      <ToolbarButton onClick={() => formatHeading("h1")} isActive={blockState.blockType === "h1"} icon={Heading1} title="Título 1" />
      <ToolbarButton onClick={() => formatHeading("h2")} isActive={blockState.blockType === "h2"} icon={Heading2} title="Título 2" />
      <ToolbarButton onClick={() => formatHeading("h3")} isActive={blockState.blockType === "h3"} icon={Heading3} title="Título 3" />
      <ToolbarButton onClick={formatParagraph} isActive={blockState.blockType === "paragraph"} icon={Type} title="Parágrafo" />
      <ToolbarDivider />

      <ToolbarButton onClick={insertUnorderedList} isActive={false} icon={List} title="Lista com marcadores" />
      <ToolbarButton onClick={insertOrderedList} isActive={false} icon={ListOrdered} title="Lista numerada" />
      <ToolbarButton onClick={formatQuote} isActive={blockState.blockType === "quote"} icon={Quote} title="Citação" />
      <ToolbarDivider />

      <ToolbarButton onClick={insertHorizontalRule} icon={Minus} title="Linha horizontal" />
      <ToolbarDivider />

      <ToolbarButton onClick={formatAlignLeft} icon={AlignLeft} title="Alinhar à esquerda" />
      <ToolbarButton onClick={formatAlignCenter} icon={AlignCenter} title="Centralizar" />
      <ToolbarButton onClick={formatAlignRight} icon={AlignRight} title="Alinhar à direita" />
      <ToolbarButton onClick={formatAlignJustify} icon={AlignJustify} title="Justificar" />
    </div>
  );
});

EditorToolbar.displayName = "EditorToolbar";
