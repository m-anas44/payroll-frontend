"use client";

import React, { useState } from "react";
import { useMasterDataStore } from "@/store/masterData.store";
import { useAuthStore } from "@/store/auth.store";
import { OperationHandler } from "@/handlers/operation.handler";
import OperationModal from "@/components/master/OperationModal";
import { Operation } from "@/types/operation";
import { Layers, Plus, Edit2, Trash2, Search, Building2, Package } from "lucide-react";

export default function OperationsPage() {
  const { operations } = useMasterDataStore();
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser.role === "Admin";

  const [search, setSearch] = useState("");
  const [opToEdit, setOpToEdit] = useState<Operation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredOperations = operations.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.operationCode.toLowerCase().includes(search.toLowerCase()) ||
      (o.articleName && o.articleName.toLowerCase().includes(search.toLowerCase())) ||
      (o.departmentName && o.departmentName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete operation "${name}"?`)) {
      OperationHandler.deleteOperation(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Operation Process Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Map specific manufacturing processes to articles and departments (e.g., Upper Cutting, Sole Stitching, Finishing).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setOpToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Operation</span>
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search operations by code, process name, article, or department..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Operation Code</th>
              <th className="px-4 py-3">Operation Name</th>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredOperations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                  No operations found.
                </td>
              </tr>
            ) : (
              filteredOperations.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                    {o.operationCode}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-slate-400" />
                    <span>{o.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-blue-500" />
                      <span>{o.articleName || "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-purple-500" />
                      <span>{o.departmentName || "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setOpToEdit(o);
                            setIsModalOpen(true);
                          }}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                          title="Edit Operation"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(o.id, o.name)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                          title="Delete Operation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OperationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        operationToEdit={opToEdit}
      />
    </div>
  );
}
