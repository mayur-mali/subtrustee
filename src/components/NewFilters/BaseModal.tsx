import React, { Suspense, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
export interface ModalProps {
  /**
   * Controlled open state of the modal
   */
  isOpen: boolean;
  isModal?: boolean;
  /**
   * Callback fired when closing the modal is requested
   */
  onClose: () => void;
  /**
   * Modal header title (string or custom elements)
   */
  title?: React.ReactNode;
  /**
   * Subtext or description underneath the title
   */
  description?: React.ReactNode;
  /**
   * Controls the maximum width of the modal container
   * @default 'md'
   */
  size?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "max";
  /**
   * Whether clicking the backdrop overlay should fire onClose
   * @default true
   */
  closeOnOverlayClick?: boolean;
  /**
   * Whether to show the top-right dismiss/close button
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Whether to render a bottom border under the header section
   * @default true
   */
  headerBorder?: boolean;
  /**
   * Custom footer elements. If supplied, renders inside a stylized footer bar.
   */
  footer?: React.ReactNode;
  /**
   * Unique ID for DOM accessibility and target elements
   */
  id?: string;
  /**
   * Additional className to apply directly to the modal content wrapper
   */
  className?: string;
  /**
   * Extra classes on the scrollable modal body
   */
  bodyClassName?: string;
  /**
   * Content inside the modal body
   */
  children?: React.ReactNode;
  data?: any; // Add this line to accept the data prop
  backdropClassName?: string;
  /** Tailwind z-* class. Receipt overlay is z-index 1000000; nested dialogs must sit above it. */
  zClassName?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-7xl",
  max: "max-w-[95vw]",
};
function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = true,
  headerBorder = true,
  footer,
  id = "reusable-modal-root",
  className = "",
  bodyClassName = "",
  children,
  backdropClassName = "",
  isModal = false,
  zClassName,
}: ModalProps) {
  const stackClass = zClassName || (isModal ? "z-50" : "z-[99999]");
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen &&
        (isModal ? (
          <div
            className={`fixed inset-0 ${stackClass} flex items-center justify-center p-4 overflow-y-auto font-sans`}
            id={`${id}-viewport`}
          >
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackdropClick}
              className="fixed inset-0 bg-white/30 backdrop-blur-sm"
              id={`${id}-backdrop`}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className={`relative bg-white w-full  ${sizeClasses[size]} rounded-2xl shadow-2xl border border-[#EAECF0] overflow-hidden flex flex-col z-10 ${className}`}
              style={{ maxHeight: "92vh" }}
              id={`${id}-container`}
            >
              {/* Header */}
              {(title || showCloseButton || description) && (
                <div
                  className={`flex items-start justify-between p-10 pb-2 ${headerBorder ? "border-b border-[#EAECF0]" : ""}`}
                  id={`${id}-header`}
                >
                  <div className="space-y-0.5 w-full">
                    {title && (
                      <h3 className="text-lg font-extrabold text-[#101828] tracking-tight leading-snug">
                        {title}
                      </h3>
                    )}
                    {description && (
                      <div className="text-xs text-[#667085] leading-relaxed">
                        {description}
                      </div>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-1.5 hover:bg-[#F2F4F7] rounded-lg text-[#98A2B3] hover:text-[#475467] transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#2E90FA]"
                      title="Close dialog"
                      id={`${id}-close-button`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Scrollable Body Content */}
              <div
                className={`p-6 overflow-y-auto custom-scrollbar ${bodyClassName}`}
                id={`${id}-body`}
              >
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div
                  className="px-6 py-4 border-t border-[#EAECF0] bg-[#F9FAFB] flex items-center justify-end gap-3"
                  id={`${id}-footer`}
                >
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <div
            className={`fixed inset-0 ${stackClass} flex items-end justify-center font-sans`}
            id={`${id}-viewport`}
          >
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackdropClick}
              className={`fixed inset-0 bg-white/30 backdrop-blur-sm`}
              id={`${id}-backdrop`}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className={`relative bg-[#F9FAFB] w-full ${sizeClasses[size]}  rounded-t-lg shadow-2xl border border-[#CBD5E1] h-[85vh] overflow-y-auto flex flex-col z-10 ${className}`}
              id={`${id}-container`}
            >
              {/* Header */}
              {(title || showCloseButton || description) && (
                <div
                  className={`flex items-start justify-between p-10 pb-2 ${headerBorder ? "border-b border-[#EAECF0]" : ""}`}
                  id={`${id}-header`}
                >
                  <div className="space-y-0.5 w-full">
                    {title && (
                      <h3 className="text-lg font-extrabold text-[#101828] tracking-tight leading-snug">
                        {title}
                      </h3>
                    )}
                    {description && (
                      <div className="text-xs text-[#667085] leading-relaxed">
                        {description}
                      </div>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-1.5 hover:bg-[#F2F4F7] rounded-lg text-[#98A2B3] hover:text-[#475467] transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#2E90FA]"
                      title="Close dialog"
                      id={`${id}-close-button`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Scrollable Body Content */}
              <div
                className={`p-6 overflow-y-auto custom-scrollbar ${bodyClassName}`}
                id={`${id}-body`}
              >
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div
                  className="px-6 py-4 border-t border-[#EAECF0] bg-[#F9FAFB] flex items-center justify-end gap-3"
                  id={`${id}-footer`}
                >
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        ))}
    </AnimatePresence>,
    document.getElementById("modal-root") || document.body,
  );
}

export default BaseModal;
