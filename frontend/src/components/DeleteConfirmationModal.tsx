import React, { useEffect, useRef } from 'react';
import { Trash2, Loader2, X } from 'lucide-react';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete conversation?',
  message = 'Are you sure you want to delete this conversation? This action cannot be undone.',
  isDeleting = false,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  // Focus cancel button when modal opens for accessibility
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow DOM element to mount
      const timer = setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="delete-confirmation-dialog-backdrop"
      className="fixed inset-0 z-[60] bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-150"
      onClick={!isDeleting ? onClose : undefined}
      aria-hidden="true"
    >
      <div
        id="delete-confirmation-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button in top-right */}
        <button
          id="btn-close-delete-dialog"
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          {/* Warning Trash Icon Badge */}
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
            <Trash2 className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <h3
              id="delete-dialog-title"
              className="text-base font-semibold text-neutral-900 tracking-tight"
            >
              {title}
            </h3>
            <p
              id="delete-dialog-description"
              className="text-xs text-neutral-500 mt-1.5 leading-relaxed"
            >
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            ref={cancelButtonRef}
            id="btn-cancel-delete"
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-delete"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
