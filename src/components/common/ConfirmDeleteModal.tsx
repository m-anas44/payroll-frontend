"use client";

import React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode;
  itemName?: string;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  description,
  itemName,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md transform overflow-hidden rounded-xl border border-slate-100 bg-white p-6 text-left shadow-xl transition-all">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          {description ? (
            description
          ) : (
            <p>
              Are you sure you want to delete{" "}
              {itemName ? (
                <span className="font-semibold text-slate-900">"{itemName}"</span>
              ) : (
                "this item"
              )}
              ?
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}