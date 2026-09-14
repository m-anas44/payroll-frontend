"use client";

import { X, FileSpreadsheet, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { StepTracker } from "./StepTracker";
import { Step1Upload } from "./Step1Upload";
import { Step2Mapping } from "./Step2Mapping";
import { Step3Department } from "./Step3Department";
import { Step4Preview } from "./Step4Preview";
import { WizardStep, WorkerImportModalProps } from "@/types/worker";
import { useWorkerImport } from "@/hooks/useWorkerImport";

export default function WorkerImportModal({
  isOpen,
  onClose,
  onSuccess,
  departments,
}: WorkerImportModalProps) {
  const {
    currentStep,
    goToStep,
    handleClose,
    isSubmitting,
    fileInputRef,
    selectedFile,
    isDragging,
    setIsDragging,
    headers,
    rawRows,
    handleDrop,
    handleFileChange,
    downloadSampleTemplate,
    columnMapping,
    setColumnMapping,
    defaultDateOfJoining,
    setDefaultDateOfJoining,
    isStep2Valid,
    autoDetectMapping,
    departmentMapping,
    setDepartmentMapping,
    useSingleDepartment,
    setUseSingleDepartment,
    singleDepartmentId,
    setSingleDepartmentId,
    rawDepartmentValues,
    isStep3Valid,
    summaryStats,
    excludeInvalidRows,
    handleToggleExcludeInvalid,
    handleSelectAllValid,
    filterMode,
    setFilterMode,
    displayedRows,
    toggleRowInclusion,
    batchResult,
    handleSubmitBatch,
  } = useWorkerImport(departments, onClose, onSuccess);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
                Import Workers from Excel
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-step column mapping, validation, and department reconciliation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Tracker */}
        <StepTracker currentStep={currentStep} />

        {/* Scrollable Wizard Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {currentStep === 1 && (
            <Step1Upload
              selectedFile={selectedFile}
              headers={headers}
              rawRows={rawRows}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              fileInputRef={fileInputRef}
              handleDrop={handleDrop}
              handleFileChange={handleFileChange}
              downloadSampleTemplate={downloadSampleTemplate}
            />
          )}

          {currentStep === 2 && (
            <Step2Mapping
              headers={headers}
              columnMapping={columnMapping}
              setColumnMapping={setColumnMapping}
              defaultDateOfJoining={defaultDateOfJoining}
              setDefaultDateOfJoining={setDefaultDateOfJoining}
              autoDetectMapping={autoDetectMapping}
            />
          )}

          {currentStep === 3 && (
            <Step3Department
              departments={departments}
              rawDepartmentValues={rawDepartmentValues}
              departmentMapping={departmentMapping}
              setDepartmentMapping={setDepartmentMapping}
              useSingleDepartment={useSingleDepartment}
              setUseSingleDepartment={setUseSingleDepartment}
              singleDepartmentId={singleDepartmentId}
              setSingleDepartmentId={setSingleDepartmentId}
            />
          )}

          {currentStep === 4 && (
            <Step4Preview
              departments={departments}
              summaryStats={summaryStats}
              excludeInvalidRows={excludeInvalidRows}
              handleToggleExcludeInvalid={handleToggleExcludeInvalid}
              handleSelectAllValid={handleSelectAllValid}
              filterMode={filterMode}
              setFilterMode={setFilterMode}
              displayedRows={displayedRows}
              toggleRowInclusion={toggleRowInclusion}
              batchResult={batchResult}
            />
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50/75 flex items-center justify-between gap-3">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => goToStep((currentStep - 1) as WizardStep)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition"
            >
              Cancel
            </button>

            {currentStep === 1 && (
              <button
                type="button"
                onClick={() => goToStep(2)}
                disabled={rawRows.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Map Columns
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => goToStep(3)}
                disabled={!isStep2Valid}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Reconcile Departments
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                onClick={() => goToStep(4)}
                disabled={!isStep3Valid}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Preview & Validate
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                onClick={handleSubmitBatch}
                disabled={isSubmitting || summaryStats.readyToSubmit === 0}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting {summaryStats.readyToSubmit} Records...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Import {summaryStats.readyToSubmit} Workers
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}