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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentFormat } from "@/services/api/types/documents.types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  asyncGetDocumentByIdActionCreator,
  asyncReviseDocumentActionCreator,
} from "@/store/documents/action";
import { asyncGetAllReferencesActionCreator } from "@/store/references/action";
import { notify } from "@/lib/toast";
import WorkInstructionBuilder, { TemplateData } from "../../components/WorkInstructionBuilder";
import { DEFAULT_STYLE } from "../../components/TemplateStylingSheet";
import { getWiTemplate } from "@/services/api/documents";

export default function ReviseDocument() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { documentDetail, loading } = useAppSelector(
    (state) => state.documents
  );
  const { user: authUser } = useAppSelector((state) => state.authUser);

  const [changeDescription, setChangeDescription] = useState("");
  const [name, setName] = useState("");
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<number[]>([]);
  
  // Draft States
  const DRAFT_KEY = `DMS_QA_IK_REVISE_DRAFT_${authUser?.id || "guest"}_${id}`;
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const [revisionPurpose, setRevisionPurpose] = useState(""); // New: purpose for approval list
  const [documentFormat, setDocumentFormat] = useState<DocumentFormat | "">("");
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [remark, setRemark] = useState("");
  const [publishingInstitution, setPublishingInstitution] = useState("");
  const [dateOfIssue, setDateOfIssue] = useState("");
  const [expiredDate, setExpiredDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [masterDocumentFile, setMasterDocumentFile] = useState<File | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Work Instruction template state
  const [templateData, setTemplateData] = useState<TemplateData>({
    sections: [],
    attachments: [],
    style: DEFAULT_STYLE,
  });
  const [templateLoaded, setTemplateLoaded] = useState(false);

  const isWorkInstruction = documentDetail?.category === "instruksi_kerja";
  const category = documentDetail?.category;
  const isInternal = documentDetail?.isInternal;

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
      if (documentDetail.name) setName(documentDetail.name);
      if (documentDetail.documentFormat) setDocumentFormat(documentDetail.documentFormat);
      if (documentDetail.retentionPeriod) setRetentionPeriod(documentDetail.retentionPeriod.toString());
      if (documentDetail.storageLocation) setStorageLocation(documentDetail.storageLocation);
      if (documentDetail.remark) setRemark(documentDetail.remark);
      if (documentDetail.publishingInstitution) setPublishingInstitution(documentDetail.publishingInstitution);
      if (documentDetail.dateOfIssue) setDateOfIssue(documentDetail.dateOfIssue.split('T')[0]); // format for input type="date"
      if (documentDetail.expiredDate) setExpiredDate(documentDetail.expiredDate.split('T')[0]); // format for input type="date"
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
          console.error("Failed to parse revise draft", e);
        }
      }
    }
  }, [DRAFT_KEY, isWorkInstruction]);

  // Save draft whenever relevant state changes
  useEffect(() => {
    if (isWorkInstruction && templateLoaded) {
      // Don't save if it's completely empty
      if (!changeDescription && !revisionPurpose && templateData.sections.length === 0 && templateData.attachments.length === 0) {
        return;
      }

      const timeoutId = setTimeout(() => {
        const currentData = {
          name,
          changeDescription,
          revisionPurpose,
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
    changeDescription, revisionPurpose, documentFormat, retentionPeriod, storageLocation, 
    remark, publishingInstitution, dateOfIssue, expiredDate, templateData, 
    isWorkInstruction, templateLoaded, DRAFT_KEY
  ]);

  const handleLoadDraft = () => {
    if (!draftData) return;
    if (draftData.name !== undefined) setName(draftData.name);
    if (draftData.changeDescription !== undefined) setChangeDescription(draftData.changeDescription);
    if (draftData.revisionPurpose !== undefined) setRevisionPurpose(draftData.revisionPurpose);
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
      setMasterDocumentFile(selectedFile);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    if (!changeDescription.trim()) {
      notify.error("Please enter change description");
      return;
    }

    // For non-WI Internal: require file upload
    const isInternalDoc = documentDetail?.isInternal;
    if (isInternalDoc && !isWorkInstruction && !file) {
      notify.error("Please upload a document file");
      return;
    }

    // For External: file is optional, but validating new external fields
    if (isInternalDoc === false) {
      if (!documentFormat) {
        notify.error("Please select document format for External document");
        return;
      }
      if (!publishingInstitution.trim()) {
        notify.error("Please enter publishing institution for External document");
        return;
      }
      if (!dateOfIssue) {
        notify.error("Please select date of issue for External document");
        return;
      }
      if (!storageLocation.trim()) {
        notify.error("Please enter storage location for External document");
        return;
      }
    }

    // For WI: require at least one section
    if (isWorkInstruction && templateData.sections.length === 0) {
      notify.error("Please add at least one section to the Work Instruction");
      return;
    }

    // Validate mandatory references for manual categories
    if (isInternal && category === "manual_perusahaan" && selectedReferenceIds.length < 2) {
      notify.error("Manual Perusahaan documents require at least 2 document references");
      return;
    }
    if (isInternal && category === "manual_halal" && selectedReferenceIds.length < 1) {
      notify.error("Manual Halal documents require at least 1 document reference");
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(
        asyncReviseDocumentActionCreator(id, {
          name: name.trim() || undefined,
          changeDescription: changeDescription.trim(),
          revisionPurpose: revisionPurpose.trim() || changeDescription.trim(), // Use purpose or fallback to description
          file: file || undefined,
          masterDocumentFile: masterDocumentFile || undefined,
          documentFormat: (documentFormat as DocumentFormat) || undefined,
          retentionPeriod: retentionPeriod || undefined,
          storageLocation: storageLocation || undefined,
          remark: remark || undefined,
          templateData: isWorkInstruction ? JSON.stringify(cleanTemplateData(templateData)) : undefined,
          publishingInstitution: publishingInstitution.trim() || undefined,
          dateOfIssue: dateOfIssue || undefined,
          expiredDate: expiredDate || undefined,
          referenceIds: selectedReferenceIds.length > 0 ? selectedReferenceIds : undefined,
        })
      );

      if (isWorkInstruction) {
        localStorage.removeItem(DRAFT_KEY);
      }

      navigate("/documents");
    } catch (error) {
      console.error("Failed to revise document:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !documentDetail) {
    return (
      <Layout title="Revise Document">
        <div className="flex items-center justify-center h-full py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Revise Document"
      items={[
        {
          label: "Documents",
          href: "/documents",
        },
        {
          label: "Revise",
          href: `/documents/revise/${id}`,
        },
      ]}
    >
      <Button variant="ghost" onClick={handleCancel}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Documents
      </Button>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Revise Document</CardTitle>
          <CardDescription>
            <span>Create a new revision for document: {documentDetail?.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            
            {hasDraft && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-blue-800">Draft Ditemukan</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    <span>Anda memiliki draft revisi yang belum selesai disimpan pada {draftSavedAt ? new Date(draftSavedAt).toLocaleString('id-ID') : 'waktu sebelumnya'}.</span>
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
                <Label htmlFor="documentName">
                  Document Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="documentName"
                  placeholder="Enter document name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="revisionPurpose">
                  Revision Purpose <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="revisionPurpose"
                  placeholder="What is the purpose of this revision? (shown in approval list)"
                  value={revisionPurpose}
                  onChange={(e) => setRevisionPurpose(e.target.value)}
                  rows={2}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="changeDescription">
                  Change Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="changeDescription"
                  placeholder="Describe the technical changes made in this revision"
                  value={changeDescription}
                  onChange={(e) => setChangeDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              {/* Document References Section */}
              {isInternal && (category === "prosedur" || category === "manual_perusahaan" || category === "manual_halal") && (
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
                                  Checker: {ref.checker.fullName}
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
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Work Instruction Template Builder */}
              {isWorkInstruction && (
                <div className="flex flex-col gap-2 border-t pt-4">
                  <Label className="text-xl font-modern">
                    Instruksi Kerja Template <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-slate-500">
                    Edit the Work Instruction template below. PDF and Excel master documents will be regenerated automatically.
                  </p>
                  {templateLoaded ? (
                    <WorkInstructionBuilder data={templateData} onChange={setTemplateData} documentName={name} />
                  ) : (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">Loading template...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Conditional fields for Form Documents only */}
              {documentDetail?.isInternal && documentDetail?.category === "form" && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="documentFormat">Document Format <span className="text-red-500">*</span></Label>
                    <Select
                      value={documentFormat}
                      onValueChange={(value) =>
                        setDocumentFormat(value as DocumentFormat)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital_document">
                          Digital Document
                        </SelectItem>
                        <SelectItem value="hard_document">Hard Document</SelectItem>
                        <SelectItem value="digital_and_hard_document">
                          Digital & Hard Document
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="retentionPeriod">Retention Period <span className="text-red-500">*</span></Label>
                    <Input
                      id="retentionPeriod"
                      placeholder="Example: 5 Months / 5 Years / Unlimited"
                      value={retentionPeriod}
                      onChange={(e) => setRetentionPeriod(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="storageLocation">Storage Location <span className="text-red-500">*</span></Label>
                    <Input
                      id="storageLocation"
                      placeholder="Enter storage location"
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="remark">Remark (Optional)</Label>
                    <Textarea
                      id="remark"
                      placeholder="Enter any additional remarks"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      rows={2}
                    />
                  </div>
                </>
              )}

              {/* Conditional fields for External Documents */}
              {documentDetail?.isInternal === false && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="documentFormatExt">Document Format <span className="text-red-500">*</span></Label>
                    <Select
                      value={documentFormat}
                      onValueChange={(value) =>
                        setDocumentFormat(value as DocumentFormat)
                      }
                    >
                      <SelectTrigger id="documentFormatExt">
                        <SelectValue placeholder="Select document format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital_document">
                          Digital Document
                        </SelectItem>
                        <SelectItem value="hard_document">Hard Document</SelectItem>
                        <SelectItem value="digital_and_hard_document">
                          Digital & Hard Document
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="publishingInstitution">
                      Publishing Institution <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="publishingInstitution"
                      placeholder="Enter publishing institution"
                      value={publishingInstitution}
                      onChange={(e) => setPublishingInstitution(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="dateOfIssue">
                      Date of Issue <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dateOfIssue"
                      type="date"
                      value={dateOfIssue}
                      onChange={(e) => setDateOfIssue(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="expiredDate">Expired Date (If any)</Label>
                    <Input
                      id="expiredDate"
                      type="date"
                      value={expiredDate}
                      onChange={(e) => setExpiredDate(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="storageLocationExt">
                      Document Storage <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="storageLocationExt"
                      placeholder="Enter document storage location (e.g. Rack A, Shelf 1)"
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="remarkExt">Remark (Optional)</Label>
                    <Textarea
                      id="remarkExt"
                      placeholder="Enter any additional remarks"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      rows={2}
                    />
                  </div>
                </>
              )}

              {/* File uploads — at the bottom, hidden for Work Instruction documents */}
              {!isWorkInstruction && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="file">
                      Document File (Upload soft file in pdf format){" "}
                      {documentDetail?.isInternal && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf"
                      required={documentDetail?.isInternal}
                    />
                    {file && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="masterFile">
                      Master Document File (Upload soft file in excel or word format){" "}
                      {documentDetail?.isInternal && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="masterFile"
                      type="file"
                      onChange={handleMasterFileChange}
                    />
                    {masterDocumentFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {masterDocumentFile.name} (
                        {(masterDocumentFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Revision"}
            </Button>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </Layout>
  );
}
