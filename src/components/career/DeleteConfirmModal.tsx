import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-outline-variant rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-up">
        <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center mb-3.5">
          <span className="material-symbols-outlined text-xl">delete_forever</span>
        </div>

        <h3 className="font-headline-sm text-base font-bold text-on-surface mb-1">{title}</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">{description}</p>

        {itemName && (
          <div className="mb-4 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/50 text-xs font-semibold text-on-surface truncate">
            {itemName}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-2 rounded-lg bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-error text-white text-xs font-semibold hover:bg-error/90 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isDeleting && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
