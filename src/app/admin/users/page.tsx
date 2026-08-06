"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { User } from "@/types/user";
import UserModal from "@/components/auth/UserModal";
import { UserCog, Plus, ShieldCheck, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";

export default function UsersPage() {
  const { users, currentUser, toggleUserStatus, deleteUser } = useAuthStore();
  const isAdmin = currentUser.role === "Admin";

  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete user account for "${name}"?`)) {
      deleteUser(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            User Accounts & Access Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage system users, assign operational roles (Admin vs. User Data Clerk), and toggle access permissions.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setUserToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create User Account</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">User Name</th>
              <th className="px-4 py-3">Email Address</th>
              <th className="px-4 py-3">Assigned Role</th>
              <th className="px-4 py-3">Account Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-blue-600" />
                  <span>{u.name}</span>
                  {u.id === currentUser.id && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-extrabold">
                      (You)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 font-mono">
                  {u.email}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      u.role === "Admin"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => isAdmin && toggleUserStatus(u.id)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors ${
                      u.active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {u.active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Disabled
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  {isAdmin && u.id !== currentUser.id && (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setUserToEdit(u);
                          setIsModalOpen(true);
                        }}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                        title="Edit User"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                        title="Delete User"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
      />
    </div>
  );
}
