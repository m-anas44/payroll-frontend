"use client";

import React, { useState } from "react";
import { Worker, PoliceVerificationStatus } from "@/types/worker";
import { WorkerHandler } from "@/handlers/worker.handler";
import { useMasterDataStore } from "@/store/masterData.store";
import { SKILLS_LIST, POLICE_VERIFICATION_STATUSES } from "@/lib/constants";
import { formatCNICInput } from "@/lib/validators";
import { X, UserCheck, AlertCircle } from "lucide-react";

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerToEdit?: Worker | null;
  onSuccess?: () => void;
}

export default function WorkerModal({
  isOpen,
  onClose,
  workerToEdit,
  onSuccess,
}: WorkerModalProps) {
  const { departments } = useMasterDataStore();
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<{
    name: string;
    cnic: string;
    departmentId: string;
    skill: string;
    doj: string;
    dob: string;
    contact: string;
    address: string;
    policeVerification: PoliceVerificationStatus;
    status: "Active" | "Inactive";
  }>({
    name: "",
    cnic: "",
    departmentId: "",
    skill: SKILLS_LIST[0],
    doj: new Date().toISOString().split("T")[0],
    dob: "1995-01-01",
    contact: "",
    address: "",
    policeVerification: "Pending" as PoliceVerificationStatus,
    status: "Active",
  });

  const [prevWorkerToEditId, setPrevWorkerToEditId] = useState<string | null>(null);
  const currentWorkerId = workerToEdit ? workerToEdit.id : "new";

  if (currentWorkerId !== prevWorkerToEditId) {
    setPrevWorkerToEditId(currentWorkerId);
    if (workerToEdit) {
      setFormData({
        name: workerToEdit.name,
        cnic: workerToEdit.cnic,
        departmentId: workerToEdit.departmentId,
        skill: workerToEdit.skill,
        doj: workerToEdit.doj,
        dob: workerToEdit.dob,
        contact: workerToEdit.contact,
        address: workerToEdit.address,
        policeVerification: workerToEdit.policeVerification,
        status: workerToEdit.status,
      });
    } else {
      setFormData({
        name: "",
        cnic: "",
        departmentId: departments[0]?.id || "dept-1",
        skill: SKILLS_LIST[0],
        doj: new Date().toISOString().split("T")[0],
        dob: "1995-01-01",
        contact: "",
        address: "",
        policeVerification: "Pending",
        status: "Active",
      });
    }
    setErrorMessage("");
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const selectedDept = departments.find((d) => d.id === formData.departmentId);

    if (workerToEdit) {
      const res = WorkerHandler.updateWorker(workerToEdit.id, {
        ...formData,
        departmentName: selectedDept?.name || "",
      });
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }
    } else {
      const res = WorkerHandler.addWorker({
        ...formData,
        departmentName: selectedDept?.name || "",
      });
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }
    }

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 ">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 ">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            {workerToEdit ? "Edit Worker Profile" : "Register New Worker"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 ">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Muhammad Usman"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CNIC (Unique) *
              </label>
              <input
                type="text"
                required
                value={formData.cnic}
                onChange={(e) =>
                  setFormData({ ...formData, cnic: formatCNICInput(e.target.value) })
                }
                placeholder="35202-1234567-1"
                maxLength={15}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department *
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Skill
              </label>
              <select
                value={formData.skill}
                onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              >
                {SKILLS_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date of Joining (DOJ)
              </label>
              <input
                type="date"
                value={formData.doj}
                onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date of Birth (DOB)
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="0300-1234567"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Police Verification Status
              </label>
              <select
                value={formData.policeVerification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policeVerification: e.target.value as PoliceVerificationStatus,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              >
                {POLICE_VERIFICATION_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Residential Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full home address..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 ">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 "
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              {workerToEdit ? "Save Profile Changes" : "Register Worker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
