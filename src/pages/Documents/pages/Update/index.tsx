import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cleanTemplateData } from "@/utils/stripHtml";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  asyncGetDocumentByIdActionCreator,
  asyncUpdateDocumentActionCreator,
} from "@/store/documents/action";
import { asyncGetAllReferencesActionCreator } from "@/store/references/action";
import type { DocumentCategory, DocumentFormat } from "@/services/api/types/documents.types";
import { notify } from "@/lib/toast";
import WorkInstructionBuilder, { TemplateData } from "../../components/WorkInstructionBuilder";
import { DEFAULT_STYLE } from "../../components/TemplateStylingSheet";
import { getWiTemplate } from "@/services/api/documents";
import { useLanguage } from "@/context/LanguageContext";

const categoryOptions: { value: DocumentCategory; labelKey: string }[] = [
  { value: "form", labelKey: "createDocument.categories.form" },
  { value: "standard", labelKey: "createDocument.categories.standard" },
  { value: "instruksi_kerja", labelKey: "createDocument.categories.workInstruction" },
  { value: "prosedur", labelKey: "createDocument.categories.procedure" },
  { value: "manual_perusahaan", labelKey: "createDocument.categories.manualCompany" },
  { value: "manual_halal", labelKey: "createDocument.categories.manualHalal" },
];

export default function UpdateDocument() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { id } = useParams();
  const { documentDetail, loading } = useAppSelector(
    (state) => state.documents
  );
  const { user: authUser } = useAppSelector((state) => state.authUser);

  // Draft States
  const DRAFT_KEY = `DMS_QA_IK_UPDATE_DRAFT_${authUser?.id || "guest"}_${id}`;
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("form");
  const [isInternal, setIsInternal] = useState<string>("false");
  const [proposalObjective, setProposalObjective] = useState("");
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<number[]>([]);
  const [masterDocumentFile, setMasterDocumentFile] = useState<File | null>(
    null
  );
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Additional fields
  const [documentFormat, setDocumentFormat] = useState<DocumentFormat | undefined>(undefined);
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [hardDocumentRetentionPeriod, setHardDocumentRetentionPeriod] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [hardDocumentStorageLocation, setHardDocumentStorageLocation] = useState("");
  const [publishingInstitution, setPublishingInstitution] = useState("");
  const [dateOfIssue, setDateOfIssue] = useState("");
  const [expiredDate, setExpiredDate] = useState("");
  const [remark, setRemark] = useState("");
  
  // Work Instruction template state
  const [templateData, setTemplateData] = useState<TemplateData>({
    sections: [],
    attachments: [],
    style: DEFAULT_STYLE,
  });
  const [templateLoaded, setTemplateLoaded] = useState(false);
  
  const isWorkInstruction = category === "instruksi_kerja";

  const { allReferences, loading: referencesLoading } = useAppSelector(
    (state) => state.references
  );

  useEffect(() => {
    dispatch(asyncGetAllReferencesActionCreator());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(asyncGetDocumentByIdActionCreator(Number(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (documentDetail) {
      setName(documentDetail.name);
      setCategory(documentDetail.category);
      setIsInternal(documentDetail.isInternal ? "true" : "false");
      setProposalObjective(documentDetail.proposalObjective || "");
      setDocumentFormat(documentDetail.documentFormat);
      setRetentionPeriod(documentDetail.retentionPeriod || "");
      setHardDocumentRetentionPeriod(documentDetail.hardDocumentRetentionPeriod || "");
      setStorageLocation(documentDetail.storageLocation || "");
      setHardDocumentStorageLocation(documentDetail.hardDocumentStorageLocation || "");
      setPublishingInstitution(documentDetail.publishingInstitution || "");
      setDateOfIssue(documentDetail.dateOfIssue ? documentDetail.dateOfIssue.split("T")[0] : "");
      setExpiredDate(documentDetail.expiredDate ? documentDetail.expiredDate.split("T")[0] : "");
      setRemark(documentDetail.remark || "");
      if (documentDetail.references && documentDetail.references.length > 0) {
        setSelectedReferenceIds(documentDetail.references.map((r) => r.reference.id));
      }
    }
  }, [documentDetail]);

  // Load existing WI template for instruksi_kerja documents
  useEffect(() => {
    if (id && isWorkInstruction && !templateLoaded) {
      getWiTemplate(id)
        .then((res) => {
          if (res.success && res.data) {
            setTemplateData({
              topSections: res.data.topSections || [],
              instructionText: res.data.instructionText || "",
              sections: res.data.sections || [],
              attachments: res.data.attachments || [],
              pages: res.data.pages || [],
              style: res.data.style || DEFAULT_STYLE,
            });
          }
          setTemplateLoaded(true);
        })
        .catch((err) => {
          console.error("Failed to load WI template:", err);
          setTemplateLoaded(true);
        });
    }
  }, [id, isWorkInstruction, templateLoaded]);

  // Load draft on mount
  useEffect(() => {
    if (isWorkInstruction) {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed && parsed.data) {
            setDraftData(parsed.data);
            setDraftSavedAt(parsed.savedAt);
            setHasDraft(true);
          }
        } catch (e) {
          console.error("Failed to parse update draft", e);
        }
      }
    }
  }, [DRAFT_KEY, isWorkInstruction]);

  // Save draft whenever relevant state changes
  useEffect(() => {
    if (isWorkInstruction && templateLoaded) {
      // Don't save if it's completely empty
      if (!proposalObjective && templateData.sections.length === 0 && templateData.attachments.length === 0) {
        return;
      }

      const timeoutId = setTimeout(() => {
        const currentData = {
          name,
          proposalObjective,
          documentFormat,
          retentionPeriod,
          storageLocation,
          remark,
          publishingInstitution,
          dateOfIssue,
          expiredDate,
          templateData,
        };

        const draftObj = {
          savedAt: new Date().toISOString(),
          data: currentData
        };

        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftObj));
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [
    name, proposalObjective, documentFormat, retentionPeriod, storageLocation, 
    remark, publishingInstitution, dateOfIssue, expiredDate, templateData, 
    isWorkInstruction, templateLoaded, DRAFT_KEY
  ]);

  const handleLoadDraft = () => {
    if (!draftData) return;
    if (draftData.name !== undefined) setName(draftData.name);
    if (draftData.proposalObjective !== undefined) setProposalObjective(draftData.proposalObjective);
    if (draftData.documentFormat !== undefined) setDocumentFormat(draftData.documentFormat);
    if (draftData.retentionPeriod !== undefined) setRetentionPeriod(draftData.retentionPeriod);
    if (draftData.storageLocation !== undefined) setStorageLocation(draftData.storageLocation);
    if (draftData.remark !== undefined) setRemark(draftData.remark);
    if (draftData.publishingInstitution !== undefined) setPublishingInstitution(draftData.publishingInstitution);
    if (draftData.dateOfIssue !== undefined) setDateOfIssue(draftData.dateOfIssue);
    if (draftData.expiredDate !== undefined) setExpiredDate(draftData.expiredDate);
    if (draftData.templateData !== undefined) setTemplateData(draftData.templateData);
    
    setHasDraft(false);
    notify.success("Draft berhasil dilanjutkan");
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setDraftData(null);
    notify.success("Draft dibuang. Menggunakan versi asli dari database.");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleReferenceToggle = (referenceId: number) => {
    setSelectedReferenceIds((prev) =>
      prev.includes(referenceId)
        ? prev.filter((id) => id !== referenceId)
        : [...prev, referenceId]
    );
  };

  const handleMasterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setMasterDocumentFile(selectedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        notify.error("Only PDF files are allowed");
        e.target.value = "";
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    if (!name.trim()) {
      notify.error("Please enter document name");
      return;
    }

    // Proposal Objective is required for all documents
    if (!proposalObjective.trim()) {
      notify.error("Please enter proposal objective");
      return;
    }

    // For WI: require at least one section
    if (isWorkInstruction && templateData.sections.length === 0) {
      notify.error("Please add at least one section to the Work Instruction");
      return;
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

    setIsSubmitting(true);

    try {
      await dispatch(
        asyncUpdateDocumentActionCreator(id, {
          name: name.trim(),
          category,
          isInternal: isInternal === "true",
          proposalObjective,
          file: file || undefined,
          masterDocumentFile: masterDocumentFile || undefined,
          documentFormat,
          retentionPeriod: retentionPeriod || undefined,
          hardDocumentRetentionPeriod: hardDocumentRetentionPeriod || undefined,
          storageLocation: storageLocation.trim() || undefined,
          hardDocumentStorageLocation: hardDocumentStorageLocation.trim() || undefined,
          publishingInstitution: publishingInstitution.trim() || undefined,
          dateOfIssue: dateOfIssue || undefined,
          expiredDate: expiredDate || undefined,
          remark: remark.trim() || undefined,
          templateData: isWorkInstruction ? JSON.stringify(cleanTemplateData(templateData)) : undefined,
          referenceIds: selectedReferenceIds.length > 0 ? selectedReferenceIds : undefined,
        })
      );

      if (isWorkInstruction) {
        localStorage.removeItem(DRAFT_KEY);
      }

      navigate("/documents");
    } catch (error) {
      console.error("Failed to update document:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !documentDetail) {
    return (
      <Layout title={t("updateDocument.title")}>
        <div className="flex items-center justify-center h-full py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={t("updateDocument.title")}
      items={[
        {
          label: t("common.documents"),
          href: "/documents",
        },
        {
          label: t("updateDocument.update"),
          href: `/documents/update/${id}`,
        },
      ]}
    >
      <Button variant="ghost" onClick={handleCancel}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("createDocument.backToDocuments")}
      </Button>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t("updateDocument.title")}</CardTitle>
          <CardDescription>{t("updateDocument.updateDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {hasDraft && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in zoom-in duration-300">
                <div>
                  <h4 className="text-sm font-semibold text-blue-800">Draft Ditemukan</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    <span>Anda memiliki draft update yang belum selesai disimpan pada {draftSavedAt ? new Date(draftSavedAt).toLocaleString('id-ID') : 'waktu sebelumnya'}.</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={handleDiscardDraft} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Abaikan Draft
                  </Button>
                  <Button size="sm" onClick={handleLoadDraft} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Lanjutkan Draft
                  </Button>
                </div>
              </div>
            )}
            
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">
                  {t("createDocument.documentName")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={t("createDocument.documentNamePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {isInternal === "true" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="category">
                    {t("createDocument.category")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(value) =>
                      setCategory(value as DocumentCategory)
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder={t("createDocument.categoryPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="proposalObjective">
                  {t("createDocument.proposalObjective")} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="proposalObjective"
                  placeholder={t("createDocument.proposalPlaceholder")}
                  value={proposalObjective}
                  onChange={(e) => setProposalObjective(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Document References Section */}
              {isInternal === "true" && (category === "prosedur" || category === "manual_perusahaan" || category === "manual_halal") && (
                <div className="flex flex-col gap-2">
                  <Label>
                    Document References{" "}
                    {(category === "manual_perusahaan" || category === "manual_halal") && (
                      <span className="text-red-500">*</span>
                    )}
                    {category === "manual_perusahaan" && (
                      <span className="text-xs text-muted-foreground ml-1">(Min. 2)</span>
                    )}
                    {category === "manual_halal" && (
                      <span className="text-xs text-muted-foreground ml-1">(Min. 1)</span>
                    )}
                    {category === "prosedur" && (
                      <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Select applicable document references. Assigned checkers will be notified for review.
                  </p>
                  
                  {referencesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading references...
                    </div>
                  ) : allReferences.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No references available
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="grid gap-2 rounded-lg border p-4 max-h-48 overflow-y-auto">
                        {allReferences.map((ref) => (
                          <div
                            key={ref.id}
                            className="flex items-center space-x-3 rounded-lg border p-2 hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={`ref-${ref.id}`}
                              checked={selectedReferenceIds.includes(ref.id)}
                              onCheckedChange={() => handleReferenceToggle(ref.id)}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`ref-${ref.id}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                <span className="font-mono text-primary mr-2">[{ref.code}]</span>
                                {ref.name}
                              </label>
                              {ref.checker && (
                                <p className="text-xs text-muted-foreground">
                                  Checker: {ref.checker.fullName}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Selected References Chips */}
                      {selectedReferenceIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedReferenceIds.map((refId) => {
                            const ref = allReferences.find((r) => r.id === refId);
                            if (!ref) return null;
                            return (
                              <div
                                key={refId}
                                className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                              >
                                {ref.code}
                                <button
                                  type="button"
                                  onClick={() => handleReferenceToggle(refId)}
                                  className="ml-1 hover:text-red-500 rounded-full p-0.5 hover:bg-red-100 transition-colors"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* Conditional fields for Internal Form documents only */}
              {isInternal === "true" && category === "form" && (
                <div className="contents">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="documentFormat">
                      {t("createDocument.documentFormat")} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={documentFormat}
                      onValueChange={(value) =>
                        setDocumentFormat(value as DocumentFormat)
                      }
                    >
                      <SelectTrigger id="documentFormat">
                        <SelectValue placeholder={t("createDocument.formatPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital_document">
                          {t("createDocument.formats.digital")}
                        </SelectItem>
                        <SelectItem value="hard_document">
                          {t("createDocument.formats.hard")}
                        </SelectItem>
                        <SelectItem value="digital_and_hard_document">
                          {t("createDocument.formats.both")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="retentionPeriod">
                      {documentFormat === "digital_and_hard_document" 
                        ? t("createDocument.digitalRetentionPeriod")
                        : t("createDocument.retentionPeriod")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="retentionPeriod"
                      placeholder={t("createDocument.retentionPlaceholder")}
                      value={retentionPeriod}
                      onChange={(e) => setRetentionPeriod(e.target.value)}
                      required
                    />
                  </div>

                  {/* Hard Document Retention Period - only for digital_and_hard_document */}
                  {documentFormat === "digital_and_hard_document" && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="hardDocumentRetentionPeriod">
                        {t("createDocument.hardRetentionPeriod")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="hardDocumentRetentionPeriod"
                        placeholder={t("createDocument.hardRetentionPlaceholder")}
                        value={hardDocumentRetentionPeriod}
                        onChange={(e) => setHardDocumentRetentionPeriod(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="storageLocation">
                      {documentFormat === "digital_and_hard_document" 
                        ? t("createDocument.digitalStorageLocation")
                        : t("createDocument.storageLocation")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="storageLocation"
                      placeholder={t("createDocument.storagePlaceholder")}
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      required
                    />
                  </div>

                  {/* Hard Document Storage Location - only for digital_and_hard_document */}
                  {documentFormat === "digital_and_hard_document" && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="hardDocumentStorageLocation">
                        {t("createDocument.hardStorageLocation")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="hardDocumentStorageLocation"
                        placeholder={t("createDocument.hardStoragePlaceholder")}
                        value={hardDocumentStorageLocation}
                        onChange={(e) => setHardDocumentStorageLocation(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="remark">{t("createDocument.remark")}</Label>
                    <Textarea
                      id="remark"
                      placeholder={t("createDocument.remarkPlaceholder")}
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* Conditional fields for External Documents */}
              {isInternal === "false" && (
                <div className="contents">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="documentFormatExt">
                      {t("createDocument.documentFormat")} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={documentFormat}
                      onValueChange={(value) =>
                        setDocumentFormat(value as DocumentFormat)
                      }
                    >
                      <SelectTrigger id="documentFormatExt">
                        <SelectValue placeholder={t("createDocument.formatPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital_document">
                          {t("createDocument.formats.digital")}
                        </SelectItem>
                        <SelectItem value="hard_document">
                          {t("createDocument.formats.hard")}
                        </SelectItem>
                        <SelectItem value="digital_and_hard_document">
                          {t("createDocument.formats.both")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="publishingInstitution">
                      {t("createDocument.publishingInstitution")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="publishingInstitution"
                      placeholder={t("createDocument.publishingPlaceholder")}
                      value={publishingInstitution}
                      onChange={(e) => setPublishingInstitution(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="dateOfIssue">
                      {t("createDocument.dateOfIssue")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dateOfIssue"
                      type="date"
                      value={dateOfIssue}
                      onChange={(e) => setDateOfIssue(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="expiredDate">{t("createDocument.expiredDate")}</Label>
                    <Input
                      id="expiredDate"
                      type="date"
                      value={expiredDate}
                      onChange={(e) => setExpiredDate(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="storageLocationExt">
                      {t("createDocument.documentStorage")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="storageLocationExt"
                      placeholder={t("createDocument.documentStoragePlaceholder")}
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Template Builder for Instruksi Kerja */}
              {isWorkInstruction && isInternal === "true" && (
                <div className="flex flex-col gap-2 border-t pt-4">
                  <Label className="text-xl font-modern">
                    {t("createDocument.ikTemplate")} <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-slate-500">
                    {t("updateDocument.editTemplateDesc")}
                  </p>
                  {templateLoaded ? (
                    <WorkInstructionBuilder data={templateData} onChange={setTemplateData} documentName={name} onDocumentNameChange={setName} />
                  ) : (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">{t("updateDocument.loadingTemplate")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Uploads (Hidden if Instruksi Kerja) */}
              {!isWorkInstruction && (
                <div className="contents">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="file">
                      {t("createDocument.documentFile")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf"
                    />
                    {file && (
                      <p className="text-sm text-muted-foreground">
                        {t("createDocument.selectedFile")} {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="masterFile">
                      {t("createDocument.masterFile")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="masterFile"
                      type="file"
                      onChange={handleMasterFileChange}
                    />
                    {masterDocumentFile && (
                      <p className="text-sm text-muted-foreground">
                        {t("createDocument.selectedFile")} {masterDocumentFile.name} (
                        {(masterDocumentFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? t("updateDocument.updating") : t("updateDocument.updateBtn")}
            </Button>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </Layout>
  );
}
