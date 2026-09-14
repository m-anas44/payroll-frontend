"use client";

import React, { useEffect, useState } from "react";
import Heading from "@/components/common/Heading";
import { useAuthStore } from "@/store/auth.store";
import {
  changePassword,
  getSystemSettings,
  updateSystemSettings,
} from "@/handlers/settings.handler";
import {
  Settings,
  User as UserIcon,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  Coins,
  CheckCircle2,
  AlertCircle,
  Save,
  Shield,
} from "lucide-react";

interface SettingsViewProps {
  portal: "admin" | "operator";
}

export default function SettingsView({ portal }: SettingsViewProps) {
  const { currentUser } = useAuthStore();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Organization & Currency state (Admin only)
  const [companyName, setCompanyName] = useState("Askari Footwear Manufacturing");
  const [currencySymbol, setCurrencySymbol] = useState("Rs.");
  const [currencyCode, setCurrencyCode] = useState("PKR");
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  // Load organization settings if admin
  useEffect(() => {
    if (portal === "admin") {
      let isMounted = true;
      setSettingsLoading(true);
      getSystemSettings()
        .then((data) => {
          if (isMounted && data) {
            setCompanyName(data.companyName || "Askari Footwear Manufacturing");
            setCurrencySymbol(data.currencySymbol || "Rs.");
            setCurrencyCode(data.currencyCode || "PKR");
          }
        })
        .catch(() => {
          // Defaults are preserved
        })
        .finally(() => {
          if (isMounted) setSettingsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [portal]);

  // Handle password submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from your current password.");
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle organization settings submission (Admin only)
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess(false);
    setSettingsError("");

    if (!companyName.trim()) {
      setSettingsError("Company legal name is required.");
      return;
    }
    if (!currencySymbol.trim()) {
      setSettingsError("Currency symbol is required.");
      return;
    }

    try {
      setSettingsSaving(true);
      await updateSystemSettings({
        companyName: companyName.trim(),
        currencySymbol: currencySymbol.trim(),
        currencyCode: currencyCode.trim() || "PKR",
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      setSettingsError(err.message || "Failed to update configuration.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const isAdmin = portal === "admin";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <Heading
        title={isAdmin ? "System & Account Settings" : "Account Settings"}
        subtitle={
          isAdmin
            ? "Manage organization details, currency preferences, and personal security credentials."
            : "Review your account profile and update security credentials."
        }
      />

      {/* 1. User Profile & Disabled Email Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">User Profile</h2>
              <p className="text-xs text-slate-500">
                Your account information as registered in the Askari Payroll system.
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isAdmin
                ? "bg-blue-100 text-blue-800 border border-blue-200"
                : "bg-purple-100 text-purple-800 border border-purple-200"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            {currentUser?.role || portal}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={currentUser?.name || ""}
              disabled
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-100/75 px-3.5 py-2.5 text-xs font-medium text-slate-700 cursor-not-allowed select-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Email Address
              </label>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Lock className="h-3 w-3" />
                Disabled / Immutable
              </span>
            </div>
            <div className="relative">
              <input
                type="email"
                value={currentUser?.email || ""}
                disabled
                readOnly
                aria-disabled="true"
                className="w-full rounded-xl border border-slate-200 bg-slate-100/75 px-3.5 py-2.5 text-xs font-semibold text-slate-600 cursor-not-allowed select-none focus:outline-none"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Your registered email cannot be edited from this settings panel.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Change Password Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Change Password</h2>
            <p className="text-xs text-slate-500">
              Ensure your account is using a strong password to maintain workspace security.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-semibold text-rose-800 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              <KeyRound className="h-4 w-4" />
              <span>{passwordLoading ? "Updating Password..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Organizational & Currency Setup (Admin only) */}
      {isAdmin && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Organization & Currency Setup
                </h2>
                <p className="text-xs text-slate-500">
                  Configure corporate legal entity parameters and currency formatting.
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-lg">
              <Coins className="h-3.5 w-3.5" />
              Admin Configuration
            </span>
          </div>

          {settingsSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Organization & currency settings saved successfully!</span>
            </div>
          )}

          {settingsError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-semibold text-rose-800 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{settingsError}</span>
            </div>
          )}

          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Company / Factory Legal Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="e.g. Askari Footwear Manufacturing"
                  disabled={settingsLoading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Currency Symbol & Code
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    required
                    placeholder="Rs."
                    disabled={settingsLoading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-center"
                    title="Currency Symbol (e.g. Rs.)"
                  />
                  <input
                    type="text"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    required
                    placeholder="PKR"
                    disabled={settingsLoading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-center"
                    title="Currency Code (e.g. PKR)"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={settingsSaving || settingsLoading}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{settingsSaving ? "Saving Configuration..." : "Save Configuration"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
