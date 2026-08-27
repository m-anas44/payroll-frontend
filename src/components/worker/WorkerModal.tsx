"use client";

import React, { useEffect, useState } from "react";

import {
  Worker,
  PoliceVerificationStatus,
  WorkerGender,
  WorkerStatus,
} from "@/types/worker";

import {
  addWorker,
  updateWorker,
} from "@/handlers/worker.handler";

import {
  POLICE_VERIFICATION_STATUSES,
  WORKER_STATUS_OPTIONS,
} from "@/lib/constants";

import { formatCNICInput } from "@/lib/validators";

import {
  X,
  UserCheck,
  AlertCircle,
} from "lucide-react";

import { Department } from "@/types/department";
import CustomSelect, {
  SelectOption,
} from "@/components/common/CustomSelect";

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
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    cnic: string;
    fatherHusbandName: string;
    departmentId: string;
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
    doj: new Date().toISOString().split("T")[0],
    dob: "1995-01-01",
    gender: "Male",
    contact: "",
    address: "",
    policeVerification:
      "Pending" as PoliceVerificationStatus,
    status: "active",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (workerToEdit) {
      setFormData({
        name: workerToEdit.name || "",
        cnic: workerToEdit.cnic || "",
        fatherHusbandName:
          workerToEdit.fatherHusbandName || "",
        departmentId:
          workerToEdit.departmentId || "",
        doj:
          workerToEdit.doj ||
          new Date().toISOString().split("T")[0],
        dob: workerToEdit.dob || "1995-01-01",
        gender: workerToEdit.gender || "Male",
        contact: workerToEdit.contact || "",
        address: workerToEdit.address || "",
        policeVerification:
          workerToEdit.policeVerification ||
          ("Pending" as PoliceVerificationStatus),
        status:
          workerToEdit.status ||
          ("active" as WorkerStatus),
      });
    } else {
      setFormData({
        name: "",
        cnic: "",
        fatherHusbandName: "",
        departmentId:
          departments[0]?._id || "",
        doj: new Date()
          .toISOString()
          .split("T")[0],
        dob: "1995-01-01",
        gender: "Male",
        contact: "",
        address: "",
        policeVerification:
          "Pending" as PoliceVerificationStatus,
        status: "active",
      });
    }

    setErrorMessage("");
  }, [
    departments,
    isOpen,
    workerToEdit,
  ]);

  if (!isOpen) {
    return null;
  }

  const departmentOptions: SelectOption[] =
    departments.map((department) => ({
      label: department.name,
      value: department._id,
      sublabel: department.code,
    }));

  const genderOptions: SelectOption[] = [
    {
      label: "Male",
      value: "Male",
    },
    {
      label: "Female",
      value: "Female",
    },
    {
      label: "Other",
      value: "Other",
    },
  ];

  const statusOptions: SelectOption[] =
    WORKER_STATUS_OPTIONS.map((option: any) => ({
      label: option.label,
      value: option.value,
    }));

  const policeVerificationOptions: SelectOption[] =
    POLICE_VERIFICATION_STATUSES.map(
      (status) => ({
        label: status,
        value: status,
      })
    );

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setErrorMessage("");

    if (!formData.departmentId) {
      setErrorMessage(
        "Please select a department."
      );
      return;
    }

    const selectedDept = departments.find(
      (department) =>
        String(department._id) ===
        String(formData.departmentId)
    );

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        departmentName:
          selectedDept?.name || "",
      };

      if (workerToEdit) {
        await updateWorker(
          workerToEdit._id,
          payload
        );
      } else {
        await addWorker(payload);
      }

      await onSuccess?.();

      onClose();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to save worker."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <UserCheck className="h-5 w-5 text-blue-600" />

            {workerToEdit
              ? "Edit Worker Profile"
              : "Register New Worker"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
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

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4"
        >
          {/* Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Full Name *
              </label>

              <input
                type="text"
                required
                disabled={isSubmitting}
                value={formData.name}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    name: event.target.value,
                  })
                }
                placeholder="e.g. Muhammad Usman"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Father / Husband Name
              </label>

              <input
                type="text"
                disabled={isSubmitting}
                value={
                  formData.fatherHusbandName
                }
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    fatherHusbandName:
                      event.target.value,
                  })
                }
                placeholder="e.g. Abdul Rehman"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* CNIC and Gender */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                CNIC (Unique) *
              </label>

              <input
                type="text"
                required
                disabled={isSubmitting}
                value={formData.cnic}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    cnic: formatCNICInput(
                      event.target.value
                    ),
                  })
                }
                placeholder="35202-1234567-1"
                maxLength={15}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Contact Number
              </label>

              <input
                type="text"
                disabled={isSubmitting}
                value={formData.contact}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    contact: event.target.value,
                  })
                }
                placeholder="0300-1234567"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Department */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CustomSelect
              label="Department"
              required
              options={departmentOptions}
              value={formData.departmentId}
              disabled={
                isSubmitting ||
                departments.length === 0
              }
              placeholder={
                departments.length === 0
                  ? "No departments loaded"
                  : "Select department"
              }
              searchPlaceholder="Search department..."
              error={
                !formData.departmentId &&
                errorMessage
                  ? "Department is required"
                  : undefined
              }
              onChange={(value) =>
                setFormData({
                  ...formData,
                  departmentId: String(value),
                })
              }
            />
            <CustomSelect
              label="Gender"
              options={genderOptions}
              value={formData.gender}
              disabled={isSubmitting}
              placeholder="Select gender"
              searchPlaceholder="Search gender..."
              onChange={(value) =>
                setFormData({
                  ...formData,
                  gender: value as WorkerGender,
                })
              }
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Date of Joining (DOJ)
              </label>

              <input
                type="date"
                disabled={isSubmitting}
                value={formData.doj}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    doj: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Date of Birth (DOB)
              </label>

              <input
                type="date"
                disabled={isSubmitting}
                value={formData.dob}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    dob: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Police Verification */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CustomSelect
            label="Police Verification Status"
            options={
              policeVerificationOptions
            }
            value={
              formData.policeVerification
            }
            disabled={isSubmitting}
            placeholder="Select verification status"
            searchPlaceholder="Search status..."
            onChange={(value) =>
              setFormData({
                ...formData,
                policeVerification:
                  value as PoliceVerificationStatus,
              })
            }
          />
          <CustomSelect
              label="Status"
              options={statusOptions}
              value={formData.status}
              disabled={isSubmitting}
              placeholder="Select status"
              searchPlaceholder="Search status..."
              onChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as WorkerStatus,
                })
              }
            />
          </div>

          {/* Address */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Residential Address
            </label>

            <textarea
              rows={3}
              disabled={isSubmitting}
              value={formData.address}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  address: event.target.value,
                })
              }
              placeholder="Full home address..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : workerToEdit
                  ? "Save Profile Changes"
                  : "Add Worker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}