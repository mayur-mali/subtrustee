import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";

interface ToolbarPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  align?: "left" | "right";
  offsetTop?: number;
  className?: string;
  id?: string;
}

export const ToolbarPopover: React.FC<ToolbarPopoverProps> = ({
  isOpen,
  onClose,
  anchorRef,
  children,
  align = "right",
  offsetTop = 6,
  className = "",
  id,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const top = rect.bottom + offsetTop;

    if (align === "right") {
      const right = Math.max(8, window.innerWidth - rect.right);
      setCoords({ top, right });
    } else {
      const left = Math.max(8, rect.left);
      setCoords({ top, left });
    }
  }, [anchorRef, align, offsetTop]);

  useEffect(() => {
    if (!isOpen) {
      setCoords(null);
      return;
    }

    updatePosition();

    let rafId: number | null = null;
    const handleScrollOrResize = (e: Event) => {
      // Avoid recalculations if the scroll originates inside the popover itself (e.g. scrolling the item list)
      if (
        e.type === "scroll" &&
        popoverRef.current &&
        popoverRef.current.contains(e.target as Node)
      ) {
        return;
      }

      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        updatePosition();
        rafId = null;
      });
    };

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, updatePosition, onClose, anchorRef]);

  if (!isOpen || !coords) return null;

  return ReactDOM.createPortal(
    <div
      ref={popoverRef}
      id={id}
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        ...(coords.right !== undefined
          ? { right: `${coords.right}px` }
          : { left: `${coords.left}px` }),
        zIndex: 9999,
      }}
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
};

export default ToolbarPopover;
