"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";

type BlockState = {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isCode: boolean;
  blockType: string;
}

export function useEditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const [blockState, setBlockState] = useState<BlockState>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isCode: false,
    blockType: "paragraph",
  });

  useEffect(() => {
    let mounted = true;

    const listener = editor.registerUpdateListener(({ editorState }) => {
      if (!mounted) return;
      editorState.read(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const parent = selection.anchorNode?.parentElement;
          setBlockState((prev) => ({
            ...prev,
            isBold: parent?.closest("b, strong") !== null,
            isItalic: parent?.closest("i, em") !== null,
            isUnderline: parent?.closest("u") !== null,
            isStrikethrough: parent?.closest("s, strike, del") !== null,
            isCode:
              parent?.closest("code") !== null ||
              selection.anchorNode?.parentElement?.closest("code") !== null,
          }));
        }

        const root = $getRoot();
        const firstChild = root.getFirstChild();
        if (firstChild) {
          const type = firstChild.getType();
          let blockType = "paragraph";
          if (type === "heading") {
            const headingNode = firstChild as unknown as {
              __type: "heading";
              getTag: () => string;
            };
            blockType = "h" + headingNode.getTag();
          } else if (type === "list") {
            blockType = "list";
          } else if (type === "quote") {
            blockType = "quote";
          }
          setBlockState((prev) => ({ ...prev, blockType }));
        }
      });
    });

    return () => {
      mounted = false;
      listener();
    };
  }, [editor]);

  const formatBold = useCallback(
    () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
    [editor]
  );
  const formatItalic = useCallback(
    () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
    [editor]
  );
  const formatUnderline = useCallback(
    () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline"),
    [editor]
  );
  const formatStrikethrough = useCallback(
    () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough"),
    [editor]
  );
  const formatCode = useCallback(
    () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code"),
    [editor]
  );

  const formatHeading = useCallback(
    (tag: HeadingTagType) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(tag));
        }
      });
    },
    [editor]
  );

  const formatParagraph = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  }, [editor]);

  const formatQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  }, [editor]);

  const insertUnorderedList = useCallback(
    () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    [editor]
  );
  const insertOrderedList = useCallback(
    () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    [editor]
  );

  const insertHorizontalRule = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText("— ");
      }
    });
  }, [editor]);

  const formatAlignLeft = useCallback(
    () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left"),
    [editor]
  );
  const formatAlignCenter = useCallback(
    () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center"),
    [editor]
  );
  const formatAlignRight = useCallback(
    () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right"),
    [editor]
  );
  const formatAlignJustify = useCallback(
    () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify"),
    [editor]
  );

  const toolbarActions = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return {
    blockState,
    ...toolbarActions,
  };
}
