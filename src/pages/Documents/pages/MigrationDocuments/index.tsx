import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { asyncMigrateDocumentsActionCreator } from "@/store/documents/action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, FolderSync, FileSpreadsheet, Loader2, X } from "lucide-react";
import Layout from "@/components/layout/layout";
import { notify } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/hooks/useAppSelector";
import { asyncGetAllReferencesActionCreator } from "@/store/references/action";
import { asyncGetDepartmentsActionCreator } from "@/store/departments/action";

interface MigrationRow {
  id: string;
  name: string;
  revision: string;
  pdfFile: File | null;
  masterFile: File | null;
  isObsolete: boolean;
  remark: string;
  dateOfIssue: string; // ISO date string extracted from filename (DDMMYYYY)
  releaseDate: string; // ISO date string extracted from filename (DDMMYYYY)
  documentFormat?: "digital_document" | "hard_document" | "digital_and_hard_document";
  retentionPeriod?: string;
  hardDocumentRetentionPeriod?: string;
  storageLocation?: string;
  hardDocumentStorageLocation?: string;
  referenceIds?: number[];
}

const CATEGORIES = [
  { value: "form", label: "Form" },
  { value: "standard", label: "Standard" },
  { value: "instruksi_kerja", label: "Instruksi Kerja" },
  { value: "prosedur", label: "Prosedur" },
  { value: "manual_perusahaan", label: "Manual Perusahaan" },
  { value: "manual_halal", label: "Manual Halal" },
];

export default function MigrationDocuments() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isInternal, setIsInternal] = useState<string>("true");
  const [category, setCategory] = useState<string>("");
  const [proposalObjective, setProposalObjective] = useState<string>("Migrasi Data Lama");
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<number[]>([]);
  const [targetDepartmentId, setTargetDepartmentId] = useState<string>("");
  const [rows, setRows] = useState<MigrationRow[]>([]);
  const [unmatchedFiles, setUnmatchedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Get user from store to check if QA
  const { user: authUser } = useAppSelector((state) => state.authUser);
  const isQaUser = authUser?.departments?.includes("QA") || authUser?.departments?.includes("Quality Assurance");

  // Get references and departments from store
  const { allReferences, loading: referencesLoading } = useAppSelector(
    (state) => state.references
  );
  const { departments: allDepartments } = useAppSelector(
    (state) => state.departments
  );

  // Fetch references and departments on mount
  React.useEffect(() => {
    dispatch(asyncGetAllReferencesActionCreator());
    dispatch(asyncGetDepartmentsActionCreator(1, 100));
  }, [dispatch]);

  const handleReferenceToggle = (referenceId: number) => {
    setSelectedReferenceIds((prev) =>
      prev.includes(referenceId)
        ? prev.filter((id) => id !== referenceId)
        : [...prev, referenceId]
    );
  };

  const handleMultipleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    // Sort files alphabetically so "01_", "02_" prefixes determine the processing order explicitly
    const filesArray = Array.from(e.target.files).sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );
    
    const newRows: MigrationRow[] = filesArray.map((file) => {
      // Keep entire filename as document name, just strip .pdf
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      
      // Strip any numeric prefix used for sorting order, e.g. "01_", "2_", "100_"
      const cleanNameWithoutExt = nameWithoutExt.replace(/^\d+_+/, "");
      
      // Parse filename format: name_revision_DDMMYYYY_DDMMYYYY (e.g. tes_00_04032026_05072027)
      // or 3-segment format: name_revision_DDMMYYYY (e.g. tes_00_04032026)
      // or legacy format: name_revision (e.g. tes_00)
      let extractedName = cleanNameWithoutExt;
      let extractedRevision = "00";
      let extractedDateOfIssue = "";
      let extractedReleaseDate = "";

      // Try 4-segment format: name_revision_DDMMYYYY_DDMMYYYY
      const fourSegmentMatch = cleanNameWithoutExt.match(/^(.+?)[_-](\d{1,2})[_-](\d{8})[_-](\d{8})$/);
      if (fourSegmentMatch) {
        extractedName = fourSegmentMatch[1];
        extractedRevision = fourSegmentMatch[2].padStart(2, '0');
        // Parse issue date (DDMMYYYY -> YYYY-MM-DD)
        const dateStr1 = fourSegmentMatch[3];
        extractedDateOfIssue = `${dateStr1.substring(4, 8)}-${dateStr1.substring(2, 4)}-${dateStr1.substring(0, 2)}`;
        // Parse revision date (DDMMYYYY -> YYYY-MM-DD)
        const dateStr2 = fourSegmentMatch[4];
        extractedReleaseDate = `${dateStr2.substring(4, 8)}-${dateStr2.substring(2, 4)}-${dateStr2.substring(0, 2)}`;
      } else {
        // Try 3-segment format: name_revision_DDMMYYYY
        const threeSegmentMatch = cleanNameWithoutExt.match(/^(.+?)[_-](\d{1,2})[_-](\d{8})$/);
        if (threeSegmentMatch) {
          extractedName = threeSegmentMatch[1];
          extractedRevision = threeSegmentMatch[2].padStart(2, '0');
          // Parse DDMMYYYY to ISO date
          const dateStr = threeSegmentMatch[3];
          extractedDateOfIssue = `${dateStr.substring(4, 8)}-${dateStr.substring(2, 4)}-${dateStr.substring(0, 2)}`; // ISO format
        } else {
          // Try 2-segment format: name_revision (e.g. tes_00)
          const twoSegmentMatch = cleanNameWithoutExt.match(/[_-](\d{1,2})$/);
          if (twoSegmentMatch && twoSegmentMatch[1]) {
            extractedRevision = twoSegmentMatch[1].padStart(2, '0');
          }
        }
      }

      return {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        name: extractedName,
        revision: extractedRevision,
        pdfFile: file,
        masterFile: null,
        isObsolete: false,
        remark: "",
        dateOfIssue: extractedDateOfIssue,
        releaseDate: extractedReleaseDate,
        documentFormat: undefined,
        retentionPeriod: "",
        storageLocation: "",
        hardDocumentRetentionPeriod: "",
        hardDocumentStorageLocation: "",
        referenceIds: [],
      };
    });

    setRows((prev) => [...prev, ...newRows]);
    // Reset input so the same files can be selected again if needed
    e.target.value = '';
  };

  // Bulk master file upload — auto-match to existing PDF rows by filename
  const handleMultipleMasterFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const masterFiles = Array.from(e.target.files);
    let matchedCount = 0;
    const unmatchedNames: string[] = [];

    const updated = [...rows];
    
    for (const masterFile of masterFiles) {
      // Strip extension and any sorting prefix (e.g. "01_") from master file
      const rawMasterBaseName = masterFile.name.replace(/\.[^/.]+$/, ""); 
      const masterBaseName = rawMasterBaseName.replace(/^\d+_+/, "");
      
      // Find the row whose PDF filename (without ext and sorting prefix) matches this master filename
      const matchIdx = updated.findIndex((row) => {
        if (!row.pdfFile) return false;
        const rawPdfBaseName = row.pdfFile.name.replace(/\.[^/.]+$/, "");
        const pdfBaseName = rawPdfBaseName.replace(/^\d+_+/, "");
        return pdfBaseName === masterBaseName;
      });
      
      if (matchIdx !== -1) {
        updated[matchIdx] = { ...updated[matchIdx], masterFile };
        matchedCount++;
      } else {
        unmatchedNames.push(masterFile.name);
      }
    }

    setRows(updated);
    setUnmatchedFiles(unmatchedNames);

    if (unmatchedNames.length > 0) {
      notify.warning(`${matchedCount} master file(s) matched. ${unmatchedNames.length} file(s) could not be matched.`);
    } else if (matchedCount > 0) {
      notify.success(`${matchedCount} master file(s) matched successfully!`);
    }
    
    e.target.value = '';
  };

  const handleRemoveRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleRowChange = (id: string, field: keyof MigrationRow, value: any) => {
    setRows(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleFileChange = (id: string, field: 'pdfFile' | 'masterFile', file: File | null) => {
    setRows(rows.map(row => (row.id === id ? { ...row, [field]: file } : row)));
  };

  const handleRowReferenceToggle = (rowId: string, referenceId: number) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        const refs = row.referenceIds || [];
        const newRefs = refs.includes(referenceId)
          ? refs.filter((id) => id !== referenceId)
          : [...refs, referenceId];
        return { ...row, referenceIds: newRefs };
      }
      return row;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (unmatchedFiles.length > 0) {
      notify.error("Please resolve or dismiss unmatched master files before proceeding.");
      return;
    }

    if (isInternal === "true" && !category) {
      notify.error("Please select a category");
      return;
    }

    if (!proposalObjective) {
      notify.error("Please enter a proposal objective");
      return;
    }

    if (isQaUser && !targetDepartmentId) {
      notify.error("Please select a target department");
      return;
    }

    // Validation
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.name) {
        notify.error(`Please enter a name for document #${i + 1}`);
        return;
      }
      if (!row.pdfFile) {
        notify.error(`Please upload a PDF file for document #${i + 1}`);
        return;
      }

      if (isInternal === "true" && category === "form") {
        if (!row.documentFormat) {
          notify.error(`Please select document format for document #${i + 1}`);
          return;
        }
        if (!row.retentionPeriod?.trim()) {
          notify.error(`Please enter retention period for document #${i + 1}`);
          return;
        }
        if (row.documentFormat === "digital_and_hard_document") {
          if (!row.hardDocumentRetentionPeriod?.trim()) {
            notify.error(`Please enter hard copy retention period for document #${i + 1}`);
            return;
          }
          if (!row.hardDocumentStorageLocation?.trim()) {
            notify.error(`Please enter hard copy storage location for document #${i + 1}`);
            return;
          }
        }
        if (!row.storageLocation?.trim()) {
          notify.error(`Please enter storage location for document #${i + 1}`);
          return;
        }
      }
    }

    // Validate mandatory references for manual categories
    if (isInternal === "true" && category === "manual_perusahaan" && selectedReferenceIds.length < 2) {
      notify.error("Manual Perusahaan documents require at least 2 document references");
      return;
    }
    if (isInternal === "true" && category === "manual_halal" && selectedReferenceIds.length < 1) {
      notify.error("Manual Halal documents require at least 1 document reference");
      return;
    }

    const formData = new FormData();
    formData.append("isInternal", isInternal);
    formData.append("category", isInternal === "true" ? category : "external");
    formData.append("proposalObjective", proposalObjective);

    if (selectedReferenceIds.length > 0) {
      formData.append("referenceIds", JSON.stringify(selectedReferenceIds));
    }

    if (isQaUser && targetDepartmentId) {
      formData.append("departmentId", targetDepartmentId);
      // For compatibility with any legacy destination references if any, we can also pass destination
      const selectedDept = allDepartments.find((d: any) => d.id.toString() === targetDepartmentId);
      if (selectedDept) {
        formData.append("destination", selectedDept.departmentCode || selectedDept.name);
      }
    }

    const documentsData = rows.map((row) => ({
      name: row.name,
      revision: row.revision,
      isObsolete: row.isObsolete,
      remark: row.remark,
      dateOfIssue: row.dateOfIssue || "", // Per-document effective date from filename
      releaseDate: row.releaseDate || "", // Per-document revision date from filename
      documentFormat: row.documentFormat,
      retentionPeriod: row.retentionPeriod,
      hardDocumentRetentionPeriod: row.hardDocumentRetentionPeriod,
      storageLocation: row.storageLocation,
      hardDocumentStorageLocation: row.hardDocumentStorageLocation,
      referenceIds: row.referenceIds || [],
    }));

    formData.append("documentsData", JSON.stringify(documentsData));

    rows.forEach((row, index) => {
      if (row.pdfFile) {
        formData.append(`pdfFile_${index}`, row.pdfFile);
      }
      if (row.masterFile) {
        formData.append(`masterFile_${index}`, row.masterFile);
      }
    });

    try {
      setIsSubmitting(true);
      await dispatch(asyncMigrateDocumentsActionCreator(formData));
      navigate("/documents");
    } catch (error) {
      console.error("Migration failed:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl space-y-6"
      >
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm border border-blue-100">
              <FolderSync className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mass Document Migration</h1>
              <p className="text-slate-600 mt-1">
                Upload multiple legacy documents at once and configure initial sequence & obsolescence states.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-t-4 border-t-blue-500 shadow-md">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="flex items-center gap-2">
                Configurations
              </CardTitle>
              <CardDescription>Set the global metadata that applies to all documents inside this batch.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="isInternal" className="font-semibold">Document Type</Label>
                <Select value={isInternal} onValueChange={setIsInternal}>
                  <SelectTrigger id="isInternal" className="bg-slate-50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Internal Document</SelectItem>
                    <SelectItem value="false">External Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isInternal === "true" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                  <Label htmlFor="category" className="font-semibold">Category <span className="text-red-500">*</span></Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="bg-slate-50">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isQaUser && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                  <Label htmlFor="targetDepartmentId" className="font-semibold">
                    Destination Document (Target Dept) <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={targetDepartmentId}
                    onValueChange={(value) => setTargetDepartmentId(value)}
                  >
                    <SelectTrigger id="targetDepartmentId" className="bg-slate-50">
                      <SelectValue placeholder="Select target department" />
                    </SelectTrigger>
                    <SelectContent>
                      {allDepartments && allDepartments.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name} {dept.departmentCode ? `(${dept.departmentCode})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="proposalObjective" className="font-semibold">Proposal Objective <span className="text-red-500">*</span></Label>
                <Input
                  id="proposalObjective"
                  value={proposalObjective}
                  onChange={(e) => setProposalObjective(e.target.value)}
                  placeholder="e.g. Migrasi Data Lama 2023"
                  className="bg-slate-50"
                  required
                />
              </div>

              {/* Document References Section */}
              {isInternal === "true" && (category === "manual_perusahaan" || category === "manual_halal") && (
                <div className="space-y-2 md:col-span-2 animate-in fade-in zoom-in duration-300">
                  <Label className="font-semibold">
                    Document References{" "}
                    <span className="text-red-500">*</span>
                    {category === "manual_perusahaan" && (
                      <span className="text-xs text-slate-500 font-normal ml-1">(minimum 2 references required)</span>
                    )}
                    {category === "manual_halal" && (
                      <span className="text-xs text-slate-500 font-normal ml-1">(minimum 1 reference required)</span>
                    )}
                  </Label>
                  <p className="text-xs text-slate-500 mb-2">
                    Select applicable document references. Assigned checkers will be notified for review.
                  </p>
                  
                  {referencesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      Loading references...
                    </div>
                  ) : allReferences.length === 0 ? (
                    <p className="text-sm text-slate-500 py-2">
                      No references available. You can add references in Settings.
                    </p>
                  ) : (
                    <>
                      <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 max-h-48 overflow-y-auto shadow-inner">
                        {allReferences.map((ref) => (
                          <div
                            key={ref.id}
                            className="flex items-center space-x-3 rounded-lg border border-transparent p-2 hover:bg-slate-50 hover:border-slate-100 transition-all"
                          >
                            <Checkbox
                              id={`ref-${ref.id}`}
                              checked={selectedReferenceIds.includes(ref.id)}
                              onCheckedChange={() => handleReferenceToggle(ref.id)}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`ref-${ref.id}`}
                                className="text-sm font-medium cursor-pointer text-slate-700"
                              >
                                <span className="font-mono text-blue-600 mr-2">[{ref.code}]</span>
                                {ref.name}
                              </label>
                              {ref.checker && (
                                <p className="text-xs text-slate-400">
                                  Checker: {ref.checker.fullName}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Selected References Chips */}
                      {selectedReferenceIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedReferenceIds.map((refId) => {
                            const ref = allReferences.find((r) => r.id === refId);
                            if (!ref) return null;
                            return (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={refId}
                                className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm w-fit"
                              >
                                <span>{ref.code}</span>
                                <button
                                  type="button"
                                  onClick={() => handleReferenceToggle(refId)}
                                  className="hover:bg-blue-200 hover:text-blue-900 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Migration Queue ({rows.length})</h2>
                <p className="text-sm text-slate-500 mt-1">Select multiple PDF files at once. Each file will create a new document entry automatically.</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group overflow-hidden rounded-md">
                <input
                  type="file"
                  multiple
                  accept="application/pdf"
                  onChange={handleMultipleFilesSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Select PDF Files"
                />
                <Button type="button" variant="outline" className="gap-2 w-full bg-blue-50 text-blue-700 border-blue-200 pointer-events-none group-hover:bg-blue-100 group-hover:border-blue-300 transition-colors">
                  <Plus className="h-4 w-4" /> Select Multiple PDFs
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group overflow-hidden rounded-md">
                <input
                  type="file"
                  multiple
                  accept=".doc,.docx,.xls,.xlsx"
                  onChange={handleMultipleMasterFilesSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Select Master Files"
                />
                <Button type="button" variant="outline" className="gap-2 w-full bg-emerald-50 text-emerald-700 border-emerald-200 pointer-events-none group-hover:bg-emerald-100 group-hover:border-emerald-300 transition-colors">
                  <FileSpreadsheet className="h-4 w-4" /> Select Multiple Masters
                </Button>
              </motion.div>
            </div>

            {unmatchedFiles.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-orange-50/80 border border-orange-200 rounded-xl p-5 mb-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600 mt-0.5 border border-orange-200/50">
                    <X className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-orange-900 text-base">Unmatched Master Files</h3>
                        <p className="text-sm text-orange-700 mt-0.5">The following files could not be matched to any PDF row. Please ensure the filenames match.</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setUnmatchedFiles([])} 
                        className="text-orange-600 hover:text-orange-800 hover:bg-orange-100/50 -mt-1 -mr-1"
                      >
                        Dismiss
                      </Button>
                    </div>
                    <ul className="mt-3 list-disc pl-5 text-sm font-medium text-orange-800 space-y-1 max-h-32 overflow-y-auto w-fit pr-4">
                      {unmatchedFiles.map((name, i) => <li key={i}>{name}</li>)}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {rows.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-12 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl"
                >
                  <FolderSync className="h-12 w-12 text-slate-300 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-lg font-medium text-slate-900">No documents queued</h3>
                  <p className="text-sm text-slate-500 mt-1">Click the button above to select PDF files for mass migration.</p>
                </motion.div>
              )}

              {rows.map((row, index) => (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="relative overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200 group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 group-hover:bg-blue-600 transition-colors" />
                    <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-slate-800 truncate max-w-[250px] md:max-w-[400px]">
                        {row.pdfFile ? row.pdfFile.name : `Document #${index + 1}`}
                      </h3>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveRow(row.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-semibold">Document Name <span className="text-red-500">*</span></Label>
                      <Input
                        value={row.name}
                        onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
                        placeholder="e.g. it_00"
                        required
                        className="bg-slate-50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="font-semibold">Revision <span className="text-red-500">*</span></Label>
                      <Input
                        type="text"
                        value={row.revision}
                        onChange={(e) => {
                          handleRowChange(row.id, 'revision', e.target.value);
                        }}
                        onBlur={(e) => {
                           const val = e.target.value;
                           if (!isNaN(parseInt(val))) {
                             handleRowChange(row.id, 'revision', val.padStart(2, '0'));
                           }
                        }}
                        required
                        className="bg-slate-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Master File (Excel/Word)</Label>
                      {row.masterFile && (
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          ✅ {row.masterFile.name}
                        </p>
                      )}
                      <Input
                        type="file"
                        accept=".doc,.docx,.xls,.xlsx"
                        onChange={(e) => handleFileChange(row.id, 'masterFile', e.target.files?.[0] || null)}
                        className="cursor-pointer bg-slate-50 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 file:text-sm file:font-semibold hover:file:bg-slate-200"
                      />
                    </div>

                    {/* Conditional fields for Form category in Migration */}
                    {isInternal === "true" && category === "form" && (
                      <>
                        {/* Visual separator for Form-specific fields */}
                        <div className="md:col-span-2 border-t border-dashed border-slate-300 pt-4 mt-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Form Document Details</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-semibold">
                            Document Format <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={row.documentFormat}
                            onValueChange={(value: "digital_document" | "hard_document" | "digital_and_hard_document") => 
                              handleRowChange(row.id, 'documentFormat', value)
                            }
                          >
                            <SelectTrigger className="bg-slate-50">
                              <SelectValue placeholder="Select document format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="digital_document">Digital Document</SelectItem>
                              <SelectItem value="hard_document">Hard Document</SelectItem>
                              <SelectItem value="digital_and_hard_document">Digital & Hard Document</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-semibold">
                            {row.documentFormat === "digital_and_hard_document" 
                              ? "Digital Retention Period"
                              : "Retention Period"}{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            placeholder="Example: 5 Months / 5 Years / Unlimited"
                            value={row.retentionPeriod || ""}
                            onChange={(e) => handleRowChange(row.id, 'retentionPeriod', e.target.value)}
                            required
                            className="bg-slate-50"
                          />
                        </div>

                        {row.documentFormat === "digital_and_hard_document" && (
                          <>
                            <div className="space-y-2">
                              <Label className="font-semibold">
                                Hard Copy Retention Period <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                placeholder="e.g. 1 Year, 6 Months..."
                                value={row.hardDocumentRetentionPeriod || ""}
                                onChange={(e) => handleRowChange(row.id, 'hardDocumentRetentionPeriod', e.target.value)}
                                required
                                className="bg-slate-50"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="font-semibold">
                                Hard Copy Storage Location <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                placeholder="Enter hard copy storage location"
                                value={row.hardDocumentStorageLocation || ""}
                                onChange={(e) => handleRowChange(row.id, 'hardDocumentStorageLocation', e.target.value)}
                                required
                                className="bg-slate-50"
                              />
                            </div>
                          </>
                        )}

                        <div className="space-y-2">
                          <Label className="font-semibold">
                            {row.documentFormat === "digital_and_hard_document" 
                              ? "Digital Storage Location"
                              : "Storage Location"}{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            placeholder="Enter storage location"
                            value={row.storageLocation || ""}
                            onChange={(e) => handleRowChange(row.id, 'storageLocation', e.target.value)}
                            required
                            className="bg-slate-50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-semibold">Remark (Optional)</Label>
                          <Input
                            value={row.remark}
                            onChange={(e) => handleRowChange(row.id, 'remark', e.target.value)}
                            placeholder="Optional references or notes"
                            className="bg-slate-50"
                          />
                        </div>
                      </>
                    )}

                    {isInternal === "true" && category === "prosedur" && (
                      <div className="md:col-span-2 space-y-2 border-t border-dashed border-slate-300 pt-4 mt-2">
                        <Label className="font-semibold">
                          Document References <span className="text-xs text-slate-500 font-normal ml-1">(optional)</span>
                        </Label>
                        <p className="text-xs text-slate-500 mb-2">
                          Select applicable document references. Assigned checkers will be notified for review.
                        </p>
                        
                        {referencesLoading ? (
                          <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            Loading references...
                          </div>
                        ) : allReferences.length === 0 ? (
                          <p className="text-sm text-slate-500 py-2">
                            No references available. You can add references in Settings.
                          </p>
                        ) : (
                          <>
                            <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 max-h-48 overflow-y-auto shadow-inner">
                              {allReferences.map((ref) => (
                                <div
                                  key={ref.id}
                                  className="flex items-center space-x-3 rounded-lg border border-transparent p-2 hover:bg-slate-50 hover:border-slate-100 transition-all"
                                >
                                  <Checkbox
                                    id={`ref-${row.id}-${ref.id}`}
                                    checked={(row.referenceIds || []).includes(ref.id)}
                                    onCheckedChange={() => handleRowReferenceToggle(row.id, ref.id)}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                  />
                                  <div className="flex-1">
                                    <label
                                      htmlFor={`ref-${row.id}-${ref.id}`}
                                      className="text-sm font-medium cursor-pointer text-slate-700"
                                    >
                                      <span className="font-mono text-blue-600 mr-2">[{ref.code}]</span>
                                      {ref.name}
                                    </label>
                                    {ref.checker && (
                                      <p className="text-xs text-slate-400">
                                        Checker: {ref.checker.fullName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Selected References Chips */}
                            {(row.referenceIds || []).length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {(row.referenceIds || []).map((refId) => {
                                  const ref = allReferences.find((r) => r.id === refId);
                                  if (!ref) return null;
                                  return (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      key={refId}
                                      className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm w-fit"
                                    >
                                      <span>{ref.code}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRowReferenceToggle(row.id, refId)}
                                        className="hover:bg-blue-200 hover:text-blue-900 rounded-full p-0.5 transition-colors"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    <div className="md:col-span-2 flex items-center gap-3 p-4 bg-orange-50/50 rounded-lg border border-orange-100">
                      <Switch 
                        checked={row.isObsolete} 
                        onCheckedChange={(checked) => handleRowChange(row.id, 'isObsolete', checked)} 
                      />
                      <div>
                        <Label className="font-bold text-orange-900 cursor-pointer text-base">Mark as Obsolete</Label>
                        <p className="text-sm text-orange-700/80">If activated, this document will be archived immediately taking up its auto-increment sequence without appearing in active documents.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex gap-4 pt-4 pb-12 sticky bottom-0 bg-white/80 backdrop-blur-md p-4 mt-8 rounded-xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10 border border-slate-200"
        >
          <Button
            type="button"
            variant="outline"
            className="flex-1 max-w-[200px]"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={unmatchedFiles.length > 0 || isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Processing Migration...
              </span>
            ) : unmatchedFiles.length > 0 ? (
              "Resolve Unmatched Files First"
            ) : (
              "Start Mass Migration"
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  </Layout>
  );
}
