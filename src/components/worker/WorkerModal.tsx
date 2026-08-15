"use client";

import React, { useEffect, useState } from "react";
import { Worker, PoliceVerificationStatus, WorkerGender, WorkerStatus } from "@/types/worker";
import { addWorker, updateWorker } from "@/handlers/worker.handler";
import { SKILLS_LIST, POLICE_VERIFICATION_STATUSES, WORKER_STATUS_OPTIONS } from "@/lib/constants";
import { formatCNICInput } from "@/lib/validators";
import { X, UserCheck, AlertCircle } from "lucide-react";
import { Department } from "@/types/department";

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  workerToEdit?: Worker | null;
  onSuccess?: () => void;
}

export default function WorkerModal({
  isOpen,
  onClose,
  departments,
  workerToEdit,
  onSuccess,
}: WorkerModalProps) {
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<{
    name: string;
    cnic: string;
    fatherHusbandName: string;
    departmentId: string;
    skill: string;
    doj: string;
    dob: string;
    gender: WorkerGender;
    contact: string;
    address: string;
    policeVerification: PoliceVerificationStatus;
    status: WorkerStatus;
  }>({
    name: "",
    cnic: "",
    fatherHusbandName: "",
    departmentId: "",
    skill: SKILLS_LIST[0],
    doj: new Date().toISOString().split("T")[0],
    dob: "1995-01-01",
    gender: "Male",
    contact: "",
    address: "",
    policeVerification: "Pending" as PoliceVerificationStatus,
    status: "active",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (workerToEdit) {
      setFormData({
        name: workerToEdit.name,
        cnic: workerToEdit.cnic,
        fatherHusbandName: workerToEdit.fatherHusbandName || "",
        departmentId: workerToEdit.departmentId,
        skill: workerToEdit.skill || SKILLS_LIST[0],
        doj: workerToEdit.doj,
        dob: workerToEdit.dob,
        gender: workerToEdit.gender || "Male",
        contact: workerToEdit.contact,
        address: workerToEdit.address,
        policeVerification: workerToEdit.policeVerification,
        status: workerToEdit.status,
      });
    } else {
      setFormData({
        name: "",
        cnic: "",
        fatherHusbandName: "",
        departmentId: departments[0]?.id || "",
        skill: SKILLS_LIST[0],
        doj: new Date().toISOString().split("T")[0],
        dob: "1995-01-01",
        gender: "Male",
        contact: "",
        address: "",
        policeVerification: "Pending" as PoliceVerificationStatus,
        status: "active",
      });
    }
    setErrorMessage("");
  }, [departments, isOpen, workerToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const selectedDept = departments.find((d) => d.id === formData.departmentId);

    try {
      if (workerToEdit) {
        await updateWorker(workerToEdit.id, {
          ...formData,
          departmentName: selectedDept?.name || "",
        });
      } else {
        await addWorker({
          ...formData,
          departmentName: selectedDept?.name || "",
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || "Unable to save worker.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <UserCheck className="h-5 w-5 text-blue-600" />
            {workerToEdit ? "Edit Worker Profile" : "Register New Worker"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Muhammad Usman"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Father / Husband Name</label>
              <input
                type="text"
                value={formData.fatherHusbandName}
                onChange={(e) => setFormData({ ...formData, fatherHusbandName: e.target.value })}
                placeholder="e.g. Abdul Rehman"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">CNIC (Unique) *</label>
              <input
                type="text"
                required
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: formatCNICInput(e.target.value) })}
                placeholder="35202-1234567-1"
                maxLength={15}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as WorkerGender })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Department *</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              >
                {departments.length === 0 ? (
                  <option value="">No departments loaded</option>
                ) : (
                  departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Primary Skill</label>
              <select
                value={formData.skill}
                onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              >
                {SKILLS_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Date of Joining (DOJ)</label>
              <input
                type="date"
                value={formData.doj}
                onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Date of Birth (DOB)</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Contact Number</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="0300-1234567"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as WorkerStatus })
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              >
                {WORKER_STATUS_OPTIONS.map((opt: any) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Police Verification Status</label>
              <select
                value={formData.policeVerification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policeVerification: e.target.value as PoliceVerificationStatus,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
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
            <label className="mb-1 block text-xs font-bold text-slate-700">Residential Address</label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full home address..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
            >
              {workerToEdit ? "Save Profile Changes" : "Add Worker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}