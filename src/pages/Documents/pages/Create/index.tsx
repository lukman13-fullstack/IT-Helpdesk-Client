import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { cleanTemplateData } from "@/utils/stripHtml";
import { useNavigate } from "react-router-dom";
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
import { useState, useEffect, useRef } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { asyncCreateDocumentActionCreator } from "@/store/documents/action";
import { asyncGetAllReferencesActionCreator } from "@/store/references/action";
import type {
  DocumentCategory,
  DocumentFormat,
} from "@/services/api/types/documents.types";
import { notify } from "@/lib/toast";
import WorkInstructionBuilder, { TemplateData } from "../../components/WorkInstructionBuilder";
import { DEFAULT_STYLE } from "../../components/TemplateStylingSheet";
import { useLanguage } from "@/context/LanguageContext";
import { draftService, Draft } from "@/services/api/drafts";

const categoryOptions: { value: DocumentCategory; labelKey: string }[] = [
  { value: "form", labelKey: "createDocument.categories.form" },
  { value: "standard", labelKey: "createDocument.categories.standard" },
  { value: "instruksi_kerja", labelKey: "createDocument.categories.workInstruction" },
  { value: "prosedur", labelKey: "createDocument.categories.procedure" },
  { value: "manual_perusahaan", labelKey: "createDocument.categories.manualCompany" },
  { value: "manual_halal", labelKey: "createDocument.categories.manualHalal" },
];

export default function CreateDocument() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { user: authUser } = useAppSelector((state) => state.authUser);
  const isQaUser = authUser?.departments?.includes("QA") || authUser?.departments?.includes("Quality Assurance");

  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocumentCategory | undefined>(undefined);
  const [proposalObjective, setProposalObjective] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isInternal, setIsInternal] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterFile, setMasterFile] = useState<File | null>(null);

  // New fields for Form and External documents
  const [documentFormat, setDocumentFormat] = useState<
    DocumentFormat | undefined
  >(undefined);
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [hardDocumentRetentionPeriod, setHardDocumentRetentionPeriod] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [hardDocumentStorageLocation, setHardDocumentStorageLocation] = useState("");
  const [publishingInstitution, setPublishingInstitution] = useState("");
  const [dateOfIssue, setDateOfIssue] = useState("");
  const [expiredDate, setExpiredDate] = useState("");
  const [destinationDocument, setDestinationDocument] = useState<string | undefined>(undefined);
  const [remark, setRemark] = useState("");
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<number[]>([]);

  // Instruction Kerja Template State
  const [templateData, setTemplateData] = useState<TemplateData>({
    sections: [],
    attachments: [],
    style: DEFAULT_STYLE,
  });

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const activeDraftIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeDraftIdRef.current = activeDraftId;
  }, [activeDraftId]);

  // Load drafts on mount
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const fetchedDrafts = await draftService.getDrafts();
        setDrafts(fetchedDrafts);
      } catch (e) {
        console.error("Failed to fetch drafts", e);
        setDrafts([]);
      }
    };
    fetchDrafts();
  }, []);

  const loadDraft = (draft: Draft) => {
    if (!draft || !draft.data) return;
    setActiveDraftId(draft.id);
    setName(draft.data.name || "");
    setProposalObjective(draft.data.proposalObjective || "");
    setIsInternal(draft.data.isInternal || "true");
    setCategory(draft.data.category || "instruksi_kerja");
    setTemplateData(draft.data.templateData || { sections: [], attachments: [], style: DEFAULT_STYLE });
    if (draft.data.destinationDocument) setDestinationDocument(draft.data.destinationDocument);
  };

  const handleCreateNewDraft = () => {
    setActiveDraftId(null);
    setName("");
    setProposalObjective("");
    setTemplateData({ sections: [], attachments: [], style: DEFAULT_STYLE });
    notify.success("Mulai lembar kerja Instruksi Kerja baru");
  };

  const handleDeleteDraft = async (idToRemove: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus draft ini?")) {
      try {
        await draftService.deleteDraft(idToRemove);
        const newDrafts = drafts.filter(d => d.id !== idToRemove);
        setDrafts(newDrafts);
        
        if (activeDraftId === idToRemove) {
          handleCreateNewDraft();
        }
        notify.success("Draft berhasil dihapus");
      } catch (error) {
        notify.error("Gagal menghapus draft");
      }
    }
  };

  // Save draft whenever relevant state changes
  useEffect(() => {
    if (category === "instruksi_kerja") {
      // Don't save if it's completely empty
      if (!name && !proposalObjective && templateData.sections.length === 0 && templateData.attachments.length === 0 && (!templateData.pages || templateData.pages.length === 0)) {
         return; 
      }

      const timeoutId = setTimeout(async () => {
        const currentData = {
          name,
          proposalObjective,
          isInternal,
          category,
          destinationDocument,
          templateData,
        };

        try {
          let updatedId = activeDraftIdRef.current;
          let savedDraft: Draft;
          const title = name || "Draft Tanpa Nama";
          
          if (!updatedId) {
             savedDraft = await draftService.createDraft(title, currentData);
             setActiveDraftId(savedDraft.id);
          } else {
             savedDraft = await draftService.updateDraft(updatedId, title, currentData);
          }
          
          setDrafts(prevDrafts => {
             const idx = prevDrafts.findIndex(d => d.id === savedDraft.id);
             let newDrafts = [...prevDrafts];
             if (idx >= 0) {
               newDrafts[idx] = savedDraft;
             } else {
               newDrafts.push(savedDraft);
             }
             newDrafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
             return newDrafts;
          });
        } catch (error) {
          console.error("Auto-save failed", error);
        }
      }, 2000); 
      return () => clearTimeout(timeoutId);
    }
  }, [name, proposalObjective, isInternal, category, destinationDocument, templateData]);

  // Get references from store
  const { allReferences, loading: referencesLoading } = useAppSelector(
    (state) => state.references
  );

  // Fetch references on mount
  useEffect(() => {
    dispatch(asyncGetAllReferencesActionCreator());
  }, [dispatch]);

  const handleReferenceToggle = (referenceId: number) => {
    setSelectedReferenceIds((prev) =>
      prev.includes(referenceId)
        ? prev.filter((id) => id !== referenceId)
        : [...prev, referenceId]
    );
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Handle document type change
  const handleDocumentTypeChange = (value: string) => {
    setIsInternal(value);
    if (!category) {
      // Set default category
      setCategory("form");
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

  const handleMasterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      setMasterFile(selectedFile);
    }
  };

  const handleSave = async () => {
    const isInternalBool = isInternal === "true";

    if (!name.trim()) {
      notify.error("Please enter document name");
      return;
    }

    // PDF is mandatory for Internal, optional for External, UNLESS it's an instruksi_kerja
    const isTemplateBased = category === "instruksi_kerja";

    // For WI: require at least one section
    if (isTemplateBased && templateData.sections.length === 0) {
      notify.error("Please add at least one section to the Work Instruction");
      return;
    }

    if (isInternalBool && !file && !isTemplateBased) {
      notify.error("Please select a file");
      return;
    }

    if (file && file.type !== "application/pdf") {
      notify.error("Please select a PDF file");
      return;
    }

    if (!isInternal) {
      notify.error("Please select document type");
      return;
    }

    // Category is required for internal documents
    if (isInternal === "true" && !category) {
      notify.error("Please select a category");
      return;
    }

    // Proposal Objective is required for all documents
    if (!proposalObjective.trim()) {
      notify.error("Please enter proposal objective");
      return;
    }

    if ((isQaUser || (authUser?.departments?.length || 0) > 1) && !destinationDocument) {
      notify.error("Please select destination document");
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

    // Master file is mandatory for Internal, optional for External, UNLESS it's an instruksi_kerja
    if (isInternalBool && !masterFile && !isTemplateBased) {
      notify.error("Please select a master file");
      return;
    }

    // Conditional validation for Internal Form documents only
    if (isInternal === "true" && category === "form") {
      if (!documentFormat) {
        notify.error("Please select document format for Form documents");
        return;
      }
      if (!retentionPeriod.trim()) {
        notify.error("Please enter retention period for Form documents");
        return;
      }
      // Validate hardDocumentRetentionPeriod for digital_and_hard_document
      if (documentFormat === "digital_and_hard_document") {
        if (!hardDocumentRetentionPeriod.trim()) {
          notify.error("Please enter hard document retention period for Digital & Hard format");
          return;
        }
        if (!hardDocumentStorageLocation.trim()) {
          notify.error("Please enter hard document storage location for Digital & Hard format");
          return;
        }
      }
      if (!storageLocation.trim()) {
        notify.error("Please enter storage location for Form documents");
        return;
      }
    }

    // Conditional validation for External documents
    if (isInternal === "false") {
      if (!documentFormat) {
        notify.error("Please select document format for External documents");
        return;
      }
      if (!publishingInstitution.trim()) {
        notify.error(
          "Please enter publishing institution for External documents"
        );
        return;
      }
      if (!dateOfIssue) {
        notify.error("Please select date of issue for External documents");
        return;
      }
      if (!storageLocation.trim()) {
        notify.error("Please enter storage location for External documents");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Serialize templateData if category is instruksi_kerja
      const templateDataString = isTemplateBased
        ? JSON.stringify(cleanTemplateData(templateData))
        : undefined;

      await dispatch(
        asyncCreateDocumentActionCreator({
          name: name.trim(),
          category: isInternal === "true" ? category : "external", 
          proposalObjective: proposalObjective.trim(),
          isInternal: isInternal === "true",
          file: file || undefined,
          masterDocumentFile: masterFile || undefined,
          documentFormat,
          retentionPeriod: retentionPeriod || undefined,
          hardDocumentRetentionPeriod: hardDocumentRetentionPeriod || undefined,
          storageLocation: storageLocation.trim() || undefined,
          hardDocumentStorageLocation: hardDocumentStorageLocation.trim() || undefined,
          publishingInstitution: publishingInstitution.trim() || undefined,
          dateOfIssue: dateOfIssue || undefined,
          expiredDate: expiredDate || undefined,
          documentStoragePeriod: undefined, // Removed for external as per request
          remark: remark.trim() || undefined,
          referenceIds: selectedReferenceIds.length > 0 ? selectedReferenceIds : undefined,
          destination: destinationDocument,
          templateData: templateDataString,
        })
      );

      // Clear draft on successful upload
      if (isTemplateBased && activeDraftIdRef.current) {
        try {
          await draftService.deleteDraft(activeDraftIdRef.current);
          setDrafts(prev => prev.filter(d => d.id !== activeDraftIdRef.current));
        } catch (e) {
          console.error("Failed to delete draft after upload", e);
        }
      }

      navigate("/documents");
    } catch (error) {
      console.error("Failed to create document:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout
      title={t("createDocument.title")}
      items={[
        {
          label: t("common.documents"),
          href: "/documents",
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
          <CardTitle>{t("createDocument.registerNew")}</CardTitle>
          <CardDescription>
            {t("createDocument.uploadDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
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

                <div className="flex flex-col gap-2">
                <Label htmlFor="isInternal">
                  {t("createDocument.documentType")} <span className="text-red-500">*</span>
                </Label>
                <Select value={isInternal} onValueChange={handleDocumentTypeChange}>
                  <SelectTrigger id="isInternal">
                    <SelectValue placeholder={t("createDocument.documentTypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{t("createDocument.internalDocument")}</SelectItem>
                    <SelectItem value="false">{t("createDocument.externalDocument")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category field - shown for Internal documents only */}
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
                <Label htmlFor="proposalObjective">{t("createDocument.proposalObjective")}  <span className="text-red-500">*</span></Label>
                <Textarea
                  id="proposalObjective"
                  placeholder={t("createDocument.proposalPlaceholder")}
                  value={proposalObjective}
                  onChange={(e) => setProposalObjective(e.target.value)}
                  rows={4}
                />
              </div>

              {(isQaUser || (authUser?.departments?.length || 0) > 1) && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="destinationDocument">
                    {t("createDocument.destinationDocument")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={destinationDocument}
                    onValueChange={(value) =>
                      setDestinationDocument(value)
                    }
                  >
                    <SelectTrigger id="destinationDocument">
                      <SelectValue placeholder={t("createDocument.destinationPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {isQaUser ? (
                        <>
                          <SelectItem value="QA">QA</SelectItem>
                          <SelectItem value="MR">MR</SelectItem>
                        </>
                      ) : (
                        authUser?.departments?.map((dept: string) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

            

              {/* Conditional fields for Form documents only */}
              {isInternal === "true" && category === "form" && (
                <>
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
                </>
              )}

              {/* Conditional fields for External documents */}
              {isInternal === "false" && (
                <>
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
                      {t("createDocument.publishingInstitution")}{" "}
                      <span className="text-red-500">*</span>
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
                </>
              )}

              {/* Document References Section - Only for Level I & II Internal documents */}
              {/* Level I: manual_perusahaan, manual_halal */}
              {/* Level II: prosedur */}
              {/* Level III (excluded): form, standard, instruksi_kerja */}
              {isInternal === "true" && (category === "prosedur" || category === "manual_perusahaan" || category === "manual_halal") && (
                <div className="flex flex-col gap-2">
                  <Label>
                    {t("createDocument.documentReferences")}{" "}
                    {(category === "manual_perusahaan" || category === "manual_halal") && (
                      <span className="text-red-500">*</span>
                    )}
                    {category === "manual_perusahaan" && (
                      <span className="text-xs text-muted-foreground ml-1">{t("createDocument.minTwoRefs")}</span>
                    )}
                    {category === "manual_halal" && (
                      <span className="text-xs text-muted-foreground ml-1">{t("createDocument.minOneRef")}</span>
                    )}
                    {category === "prosedur" && (
                      <span className="text-xs text-muted-foreground ml-1">{t("createDocument.optional")}</span>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t("createDocument.referencesDesc")}
                  </p>
                  
                  {referencesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("createDocument.loadingReferences")}
                    </div>
                  ) : allReferences.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      {t("createDocument.noReferences")}
                    </p>
                  ) : (
                    <>
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
                                  {t("createDocument.checker")} {ref.checker.fullName}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Selected References Chips */}
                      {selectedReferenceIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedReferenceIds.map((refId) => {
                            const ref = allReferences.find((r) => r.id === refId);
                            if (!ref) return null;
                            return (
                              <div
                                key={refId}
                                className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                              >
                                <span>{ref.code}</span>
                                <button
                                  type="button"
                                  onClick={() => handleReferenceToggle(refId)}
                                  className="hover:bg-primary/20 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Template Builder for Instruksi Kerja */}
              {category === "instruksi_kerja" && isInternal === "true" && (
                <div className="flex flex-col gap-2 col-span-1 border-t pt-4">
                  <Label className="text-xl font-modern">
                    {t("createDocument.ikTemplate")} <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-slate-500">{t("createDocument.ikTemplateDesc")}</p>
                  <WorkInstructionBuilder data={templateData} onChange={setTemplateData} documentName={name} onDocumentNameChange={setName} />
                </div>
              )}

              {/* Uploads (Hidden if Instruksi Kerja) */}
              {category !== "instruksi_kerja" && (
                <>
                  <div className="flex flex-col gap-2 border-t pt-4">
                    <Label htmlFor="file">
                      {t("createDocument.documentFile")} {isInternal === "true" && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf"
                      required={isInternal === "true"}
                    />
                    {file && (
                      <p className="text-sm text-muted-foreground">
                        {t("createDocument.selectedFile")} {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="masterFile">
                      {t("createDocument.masterFile")} {isInternal === "true" && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="masterFile"
                      type="file"
                      onChange={handleMasterFileChange}
                      required={isInternal === "true"}
                    />
                    {masterFile && (
                      <p className="text-sm text-muted-foreground">
                        {t("createDocument.selectedFile")} {masterFile.name} (
                        {(masterFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 items-center border-t pt-4">
            <div className="w-full sm:w-auto">
              {category === "instruksi_kerja" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                      Draft Tersimpan:
                    </span>
                    <Select 
                      value={activeDraftId || undefined} 
                      onValueChange={(val) => {
                        const selected = drafts.find(d => d.id === val);
                        if (selected) loadDraft(selected);
                      }}
                    >
                      <SelectTrigger className="w-[180px] md:w-[220px] h-9 text-xs bg-white">
                        <SelectValue placeholder={activeDraftId ? "Pilih Draft..." : "Belum Tersimpan"} />
                      </SelectTrigger>
                      <SelectContent>
                        {drafts.length === 0 && (
                          <SelectItem value="empty" disabled>Belum ada draft</SelectItem>
                        )}
                        {drafts.map(d => (
                          <SelectItem key={d.id} value={d.id}>
                            <div className="flex flex-col text-left max-w-[150px] md:max-w-[190px]">
                              <span className="font-semibold truncate">{d.title || "Draft Tanpa Nama"}</span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {new Date(d.updatedAt).toLocaleString('id-ID')}
                                {d.createdBy ? ` • ${d.createdBy.fullName}` : ""}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs px-3 bg-white hover:bg-slate-100"
                      onClick={handleCreateNewDraft}
                    >
                      Buat Baru
                    </Button>
                    
                    {activeDraftId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3"
                        onClick={() => handleDeleteDraft(activeDraftId)}
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? t("createDocument.uploading") : t("createDocument.uploadBtn")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </Layout>
  );
}
