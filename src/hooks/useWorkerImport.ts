import { useState, useRef, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Department } from "@/types/department";
import {
  parseExcelFile,
  cleanCnic,
  parseExcelDate,
  normalizeGender,
  normalizePoliceVerification,
  normalizeWorkerStatus,
  RawRowData,
} from "@/lib/excel-worker-parser";
import {
  createWorkersBatch
} from "@/handlers/worker.handler";
import { CandidateRow, WizardStep, WorkerBatchResponse } from "@/types/worker";

export function useWorkerImport(
  departments: Department[],
  onClose: () => void,
  onSuccess?: () => void
) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawRowData[]>([]);

  // Step 2: Mapping
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [defaultDateOfJoining, setDefaultDateOfJoining] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Step 3: Department Reconciliation
  const [departmentMapping, setDepartmentMapping] = useState<Record<string, string>>({});
  const [useSingleDepartment, setUseSingleDepartment] = useState(false);
  const [singleDepartmentId, setSingleDepartmentId] = useState<string>(
    departments[0]?._id || ""
  );

  // Step 4: Staged validation
  const [candidateRows, setCandidateRows] = useState<CandidateRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "valid" | "invalid">("all");
  const [excludeInvalidRows, setExcludeInvalidRows] = useState(true);
  const [batchResult, setBatchResult] = useState<WorkerBatchResponse | null>(null);

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setHeaders([]);
    setRawRows([]);
    setColumnMapping({});
    setDepartmentMapping({});
    setUseSingleDepartment(false);
    setSingleDepartmentId(departments[0]?._id || "");
    setCandidateRows([]);
    setIsSubmitting(false);
    setFilterMode("all");
    setExcludeInvalidRows(true);
    setBatchResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const autoDetectMapping = (detectedHeaders: string[]) => {
    const mapping: Record<string, string> = {};

    const findMatch = (patterns: RegExp[]): string => {
      for (const pattern of patterns) {
        const found = detectedHeaders.find((h) => pattern.test(h.trim().toLowerCase()));
        if (found) return found;
      }
      return "";
    };

    mapping.name = findMatch([/^(worker|employee)?\s*name$/i, /^full\s*name$/i, /\bname\b/i]);
    mapping.cnic = findMatch([/\b(cnic|nic|id_card|identity)\b/i, /\bcnic\b/i]);
    mapping.dateOfJoining = findMatch([/\b(doj|date_of_joining|joining_date|joining|date of joining)\b/i, /\bjoin\b/i]);
    mapping.department = findMatch([/\b(dept|department|section|unit)\b/i]);
    mapping.dateOfBirth = findMatch([/\b(dob|date_of_birth|birth_date|birth)\b/i]);
    mapping.fatherHusbandName = findMatch([/\b(father|husband|guardian|so|w\/o|s\/o|father_name)\b/i]);
    mapping.skill = findMatch([/\b(skill|designation|trade|role|category)\b/i]);
    mapping.contactNumber = findMatch([/\b(phone|contact|mobile|cell|telephone|cell_no|phone_no)\b/i]);
    mapping.gender = findMatch([/\b(gender|sex)\b/i]);
    mapping.address = findMatch([/\b(address|residence|location)\b/i]);
    mapping.policeVerification = findMatch([/\b(police|verification|police_ver|p_ver)\b/i]);
    mapping.status = findMatch([/\b(status|active|worker_status)\b/i]);

    setColumnMapping(mapping);
  };

  const processFile = (file: File) => {
    const validExtensions = [".xlsx", ".xls"];
    const isValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValidExt) {
      toast.error("Please upload a valid Excel file (.xlsx or .xls).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds the 10MB limit.");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const { headers: parsedHeaders, rows: parsedRows } = parseExcelFile(buffer);

        if (parsedHeaders.length === 0 || parsedRows.length === 0) {
          toast.error("The selected sheet is empty or contains no data rows.");
          return;
        }

        setHeaders(parsedHeaders);
        setRawRows(parsedRows);
        autoDetectMapping(parsedHeaders);
        toast.success(`Loaded ${parsedRows.length} rows with ${parsedHeaders.length} columns.`);
      } catch {
        toast.error("Failed to parse Excel file. Please ensure it is not corrupt.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      "Full Name,CNIC,Date of Joining,Department,Date of Birth,Father / Husband Name,Skill,Contact Number,Gender,Address,Police Verification,Status\n" +
      "Muhammad Tariq,3520112345671,2023-01-15,Cutting,1992-05-10,Abdul Rehman,Master Tailor,03001234567,Male,123 Textile Road Lahore,Yes,Active\n" +
      "Zahid Mahmood,3520198765432,2023-03-01,Stitching,1995-11-20,Muhammad Siddique,Helper,03129876543,Male,House 45 Street 2 Faisalabad,No,Active\n" +
      "Amina Bibi,3520287654321,2023-04-10,Finishing,1998-08-14,Riaz Ahmad,Quality Checker,03215678901,Female,Flat 10 Canal View Lahore,Yes,Active\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "askari_worker_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const rawDepartmentValues = useMemo(() => {
    const deptCol = columnMapping.department;
    if (!deptCol) return [];
    const values = new Set<string>();
    rawRows.forEach((row) => {
      const val = row[deptCol];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        values.add(String(val).trim());
      }
    });
    return Array.from(values);
  }, [rawRows, columnMapping.department]);

  useEffect(() => {
    if (rawDepartmentValues.length === 0 || departments.length === 0) return;

    const initialMap: Record<string, string> = {};
    rawDepartmentValues.forEach((rawVal) => {
      const normalizedRaw = rawVal.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matched = departments.find((d) => {
        const dNorm = d.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          dNorm === normalizedRaw ||
          normalizedRaw.includes(dNorm) ||
          dNorm.includes(normalizedRaw)
        );
      });
      initialMap[rawVal] = matched ? matched._id : "";
    });

    setDepartmentMapping((prev) => ({ ...initialMap, ...prev }));
  }, [rawDepartmentValues, departments]);

  const isStep2Valid = useMemo(() => {
    if (!columnMapping.name || !columnMapping.cnic || !columnMapping.department) {
      return false;
    }
    if (!columnMapping.dateOfJoining && !defaultDateOfJoining) {
      return false;
    }
    return true;
  }, [columnMapping, defaultDateOfJoining]);

  const isStep3Valid = useMemo(() => {
    if (useSingleDepartment) return Boolean(singleDepartmentId);
    if (rawDepartmentValues.length === 0) return false;
    return rawDepartmentValues.every((val) => Boolean(departmentMapping[val]));
  }, [useSingleDepartment, singleDepartmentId, rawDepartmentValues, departmentMapping]);

  const buildCandidateRows = () => {
    const seenCnics = new Set<string>();
    const candidates: CandidateRow[] = [];

    rawRows.forEach((row, idx) => {
      const errors: string[] = [];

      const rawName = columnMapping.name ? row[columnMapping.name] : "";
      const name = String(rawName ?? "").trim();
      if (!name || name.length < 2) {
        errors.push("Name must be at least 2 characters.");
      } else if (name.length > 150) {
        errors.push("Name cannot exceed 150 characters.");
      }

      const rawCnic = columnMapping.cnic ? row[columnMapping.cnic] : "";
      const cnic = cleanCnic(rawCnic);
      let isDuplicate = false;

      if (!cnic || cnic.length !== 13) {
        errors.push(`CNIC must be exactly 13 digits (found: "${cnic || rawCnic || "empty"}").`);
      } else {
        if (seenCnics.has(cnic)) {
          isDuplicate = true;
          errors.push(`Duplicate CNIC "${cnic}" in spreadsheet.`);
        } else {
          seenCnics.add(cnic);
        }
      }

      const rawDoj = columnMapping.dateOfJoining ? row[columnMapping.dateOfJoining] : null;
      const parsedDoj = parseExcelDate(rawDoj);
      const dateOfJoining = parsedDoj || defaultDateOfJoining || "";
      if (!dateOfJoining) {
        errors.push("Date of joining is required.");
      }

      let departmentId = "";
      if (useSingleDepartment) {
        departmentId = singleDepartmentId;
      } else {
        const rawDept = columnMapping.department ? String(row[columnMapping.department] ?? "").trim() : "";
        departmentId = departmentMapping[rawDept] || "";
      }
      if (!departmentId) {
        errors.push("Department is unmapped or missing.");
      }

      const rawDob = columnMapping.dateOfBirth ? row[columnMapping.dateOfBirth] : null;
      const dateOfBirth = parseExcelDate(rawDob);

      const rawFather = columnMapping.fatherHusbandName ? row[columnMapping.fatherHusbandName] : null;
      const fatherHusbandName = rawFather ? String(rawFather).trim() : null;

      const rawSkill = columnMapping.skill ? row[columnMapping.skill] : null;
      const skill = rawSkill ? String(rawSkill).trim() : null;

      const rawContact = columnMapping.contactNumber ? row[columnMapping.contactNumber] : null;
      const contactNumber = rawContact ? String(rawContact).replace(/[^\d+]/g, "") : null;

      const rawGender = columnMapping.gender ? row[columnMapping.gender] : null;
      const gender = normalizeGender(rawGender);

      const rawAddress = columnMapping.address ? row[columnMapping.address] : null;
      const address = rawAddress ? String(rawAddress).trim() : null;

      const rawPolice = columnMapping.policeVerification ? row[columnMapping.policeVerification] : null;
      const policeVerification = normalizePoliceVerification(rawPolice);

      const rawStatus = columnMapping.status ? row[columnMapping.status] : null;
      const status = normalizeWorkerStatus(rawStatus);

      const isValid = errors.length === 0;

      candidates.push({
        index: idx + 1,
        raw: row,
        data: {
          name,
          cnic,
          dateOfJoining,
          departmentId,
          dateOfBirth: dateOfBirth || null,
          fatherHusbandName: fatherHusbandName || null,
          skill: skill || null,
          contactNumber: contactNumber || null,
          gender: gender || null,
          address: address || null,
          policeVerification,
          status,
        },
        errors,
        isValid,
        included: isValid,
        isDuplicateInSheet: isDuplicate,
      });
    });

    setCandidateRows(candidates);
  };

  const goToStep = (step: WizardStep) => {
    if (step === 4) {
      buildCandidateRows();
    }
    setCurrentStep(step);
  };

  const toggleRowInclusion = (index: number) => {
    setCandidateRows((prev) =>
      prev.map((r) => (r.index === index ? { ...r, included: !r.included } : r))
    );
  };

  const handleToggleExcludeInvalid = (exclude: boolean) => {
    setExcludeInvalidRows(exclude);
    setCandidateRows((prev) =>
      prev.map((r) => (!r.isValid ? { ...r, included: !exclude } : r))
    );
  };

  const handleSelectAllValid = (selected: boolean) => {
    setCandidateRows((prev) =>
      prev.map((r) => (r.isValid ? { ...r, included: selected } : r))
    );
  };

  const summaryStats = useMemo(() => {
    const total = candidateRows.length;
    const valid = candidateRows.filter((r) => r.isValid).length;
    const invalid = total - valid;
    const included = candidateRows.filter((r) => r.included).length;
    const readyToSubmit = candidateRows.filter((r) => r.included && r.isValid).length;
    return { total, valid, invalid, included, readyToSubmit };
  }, [candidateRows]);

  const displayedRows = useMemo(() => {
    if (filterMode === "valid") return candidateRows.filter((r) => r.isValid);
    if (filterMode === "invalid") return candidateRows.filter((r) => !r.isValid);
    return candidateRows;
  }, [candidateRows, filterMode]);

  const handleSubmitBatch = async () => {
    const payload = candidateRows
      .filter((r) => r.included && r.isValid)
      .map((r) => r.data);

    if (payload.length === 0) {
      toast.error("No valid rows selected for import.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createWorkersBatch(payload);
      setBatchResult(res);

      if (res.totalCreated > 0) {
        toast.success(
          `Batch import successful! ${res.totalCreated} created, ${res.totalSkipped} skipped.`
        );
      } else {
        toast.warning(
          `No new records were created. All ${res.totalSkipped} submitted rows were skipped.`
        );
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Batch import failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}