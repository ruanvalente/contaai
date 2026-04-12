"use client";

import { useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { ReadingControls } from "@/features/reading/ui/reading-controls.ui";
import { FloatingButton } from "@/features/reading/ui/floating-button.ui";
import { PanelOverlay } from "@/features/reading/ui/panel-overlay.ui";
import { PanelContainer } from "@/features/reading/ui/panel-container.ui";
import { PanelHeader, PanelFooterMobile } from "@/features/reading/ui/panel-layout.ui";
import { usePanelToggle } from "@/features/reading/hooks/use-panel-toggle";
import { useClickOutside } from "@/features/reading/hooks/use-click-outside";
import { useEscapeKey } from "@/features/reading/hooks/use-escape-key";
import { ReadingMode } from "@/features/profile/reading/hooks/use-reading-preferences";

type ReadingControlsPanelProps = {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  readingMode: ReadingMode;
  onReadingModeChange: (mode: ReadingMode) => void;
  autoScroll: boolean;
  onAutoScrollToggle: () => void;
  isSaving?: boolean;
  className?: string;
};

export function ReadingControlsPanel({
  fontSize,
  onFontSizeChange,
  readingMode,
  onReadingModeChange,
  autoScroll,
  onAutoScrollToggle,
  isSaving,
  className,
}: ReadingControlsPanelProps) {
  const { isOpen, togglePanel, closePanel } = usePanelToggle();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useClickOutside({
    enabled: isOpen,
    ignoreRefs: [panelRef, buttonRef],
    onClickOutside: closePanel,
  });

  useEscapeKey({
    enabled: isOpen,
    onEscape: closePanel,
  });

  return (
    <>
      <FloatingButton
        ref={buttonRef}
        isOpen={isOpen}
        onClick={togglePanel}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            <PanelOverlay visible={isOpen} onClick={closePanel} />
            <PanelContainer ref={panelRef} visible={isOpen} className={className}>
              <PanelHeader title="Configurações de Leitura" onClose={closePanel} />
              <div className="p-5">
                <ReadingControls
                  fontSize={fontSize}
                  onFontSizeChange={onFontSizeChange}
                  readingMode={readingMode}
                  onReadingModeChange={onReadingModeChange}
                  autoScroll={autoScroll}
                  onAutoScrollToggle={onAutoScrollToggle}
                  isSaving={isSaving}
                />
              </div>
              <PanelFooterMobile onClose={closePanel} />
            </PanelContainer>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
