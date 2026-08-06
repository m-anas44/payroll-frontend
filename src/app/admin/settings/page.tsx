"use client";

import React, { useState } from "react";
import { Save, ShieldAlert, CheckCircle2, Factory } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "Royal Leather & Footwear Manufacturing Co.",
    currencySymbol: "Rs.",
    cnicFormat: "35202-XXXXXXX-X",
    policeVerificationMandatory: true,
    rateLockStrict: true,
    allowNegativeAdjustments: true,
    workingDaysPerMonth: 26,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          System Configuration & Business Rules
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure application parameters, CNIC validation rules, piece-rate preservation, and factory defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Factory className="h-4 w-4 text-blue-600" />
            Organization & Currency Setup
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company / Factory Legal Name
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payroll Currency Symbol
              </label>
              <input
                type="text"
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none font-mono font-bold"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="h-4 w-4 text-purple-600" />
            Compliance & Piece Rate Safeguards
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.rateLockStrict}
                onChange={(e) => setSettings({ ...settings, rateLockStrict: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Strict Historical Piece Rate Locking
                </span>
                <span className="text-[11px] text-slate-500">
                  Prevents retroactive rate modifications from corrupting past production logs and disbursed payroll records.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.policeVerificationMandatory}
                onChange={(e) => setSettings({ ...settings, policeVerificationMandatory: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Flag Unverified Worker Police Records
                </span>
                <span className="text-[11px] text-slate-500">
                  Displays compliance warning indicators on worker profiles pending police verification.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>System settings saved successfully!</span>
            </div>
          )}
          <button
            type="submit"
            className="ml-auto flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
