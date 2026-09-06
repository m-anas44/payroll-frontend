"use client";

import React, { useState, useEffect } from "react";
import { Operator } from "@/types/operator";
import { Department } from "@/types/department";
import { createOperator, updateOperator } from "@/handlers/operator.handler";
import { X, UserCog, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departments: Department[];
  userToEdit?: Operator | null;
}

export default function UserModal({
  isOpen,
  onClose,
  onSuccess,
  departments,
  userToEdit,
}: UserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || "");
      setEmail(userToEdit.email || "");
      setPassword("");
      setSelectedDeptIds(userToEdit.departmentIds || []);
      setStatus(userToEdit.status === "inactive" ? "inactive" : "active");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setSelectedDeptIds([]);
      setStatus("active");
    }
    setErrorMsg("");
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleDepartment = (deptId: string) => {
    setSelectedDeptIds((prev) =>
      prev.includes(deptId)
        ? prev.filter((id) => id !== deptId)
        : [...prev, deptId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }
    if (!userToEdit && !password.trim()) {
      setErrorMsg("Password is required for creating a new operator.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (userToEdit) {
        await updateOperator(userToEdit.id || userToEdit._id, {
          name: name.trim(),
          email: email.trim(),
          password: password.trim() || undefined,
          departmentIds: selectedDeptIds,
          status,
        });
        toast.success(`Operator ${name} updated successfully.`);
      } else {
        await createOperator({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          departmentIds: selectedDeptIds,
          status,
        });
        toast.success(`Operator ${name} created successfully.`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save operator account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-blue-600" />
            {userToEdit ? "Edit Operator Account" : "Create Operator Account"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@piecerate.com"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Password {userToEdit ? "(Leave blank to keep unchanged)" : "*"}
            </label>
            <input
              type="password"
              required={!userToEdit}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={userToEdit ? "••••••••" : "Minimum 6 characters"}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Assigned Department Privileges
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Select departments this operator is allowed to log daily production for.
            </p>

            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-3 bg-slate-50">
              {departments.length === 0 ? (
                <p className="text-slate-400 text-center py-2">No departments found.</p>
              ) : (
                departments.map((dept) => {
                  const deptId = dept._id || (dept as any).id;
                  const isChecked = selectedDeptIds.includes(deptId);
                  return (
                    <label
                      key={deptId}
                      className="flex items-center gap-2 text-slate-800 cursor-pointer hover:text-blue-600 select-none font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDepartment(deptId)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{dept.name} ({dept.code})</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {userToEdit && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="status_toggle"
                checked={status === "active"}
                onChange={(e) => setStatus(e.target.checked ? "active" : "inactive")}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="status_toggle" className="font-bold text-slate-700 cursor-pointer">
                Account Active Status
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Operator Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
