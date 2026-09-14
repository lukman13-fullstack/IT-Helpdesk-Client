import { getCategoryLabel } from "@/utils/categoryLabels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Clock,
  FileText,
  User,
  Info,
  HardDrive,
  Download,
  BookMarked,
  Maximize2,
  X,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { format } from "date-fns";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useState, useEffect } from "react";
import { notify } from "@/lib/toast";
import { useLanguage } from "@/context/LanguageContext";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DetailTabProps {
  id: string | undefined;
  isDraft: boolean;
  previewUrl: string | null;
  previewLoading: boolean;
  previewError: boolean;
  handleOpenPreview: () => void;
  approvals: any[];
  getApprovalStatusBadge: (status: string) => React.ReactElement;
  documentDetail: any;
  getStatusBadge: (status: string) => React.ReactElement;
  handleDownloadMaster: () => void;
  downloadingMaster: boolean;
  handleDownloadOriginalMaster: () => void;
  downloadingOriginalMaster: boolean;
  pdfBlob: Blob | null;
  isUser?: boolean;
  canDownloadDocument?: boolean;
}

export default function DetailTab({
  id,
  isDraft,
  previewUrl,
  previewLoading,
  previewError,
  handleOpenPreview,
  approvals,
  getApprovalStatusBadge,
  documentDetail,
  getStatusBadge,
  handleDownloadMaster,
  downloadingMaster,
  handleDownloadOriginalMaster,
  downloadingOriginalMaster,
  pdfBlob,
  isUser,
  canDownloadDocument,
}: DetailTabProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const { t } = useLanguage();

  const handleRotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const isApproved = documentDetail.status === "approved";

  // Protected View: All approved documents use react-pdf (no print)
  // Only use iframe in Print Preview tab
  const showProtectedView = isApproved;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm");
    } catch {
      return dateString;
    }
  };

  /**
   * REFACTORED: Compute workflow steps to match PDF traces and modular system logic.
   * Logic: QA Level 1 -> References -> Department Hierarchies (Lvl 1, 2...)
   */
  const getWorkflowSteps = () => {
    const steps: any[] = [];
    const currentRevision = documentDetail.revision || 0;

    // 1. FILTER: Active approvals for current revision (excluding cancelled ones)
    const activeApprovals = (approvals || []).filter(
      (a) => a.status !== "cancelled"
    );

    // 2. STEP: QA Level 1 ("Checked by QA Leader")
    const lvl1Approvals = activeApprovals.filter((a) => a.level === 1);
    // If multiple QA assigned but already approved, only show approved trace to keep it clean
    const approvedLvl1 = lvl1Approvals.filter((a) => a.status === "approved");
    const displayLvl1 = approvedLvl1.length > 0 ? approvedLvl1 : lvl1Approvals;

    displayLvl1.forEach((a) => {
      steps.push({
        id: `qa-${a.id}`,
        level: "QA",
        title: "Checked by QA Leader",
        approverName: a.approver.fullName,
        approverEmail: a.approver.email,
        status: a.status,
        comments: a.comments,
        reason: a.reason,
        createdAt: a.createdAt,
        approvedAt: a.approvedAt,
      });
    });

    // 3. STEP: References ("Reference Approve")
    // EXEMPTION: Skip for 'form' category
    const isForm = documentDetail.category === "form";
    const documentRefs = isForm ? [] : (documentDetail.references || []).filter(
      (r: any) =>
        r.documentRevision === currentRevision ||
        r.documentRevision === undefined
    );

    documentRefs.forEach((ref: any) => {
      steps.push({
        id: `ref-${ref.id}`,
        level: "REF",
        title: "Reference Approve",
        approverName: ref.checker?.fullName || ref.reference?.checker?.fullName || "Reference Checker",
        approverEmail: ref.checker?.email || ref.reference?.checker?.email || "-",
        status: ref.status,
        comments: ref.comments,
        createdAt: ref.createdAt,
        approvedAt: ref.checkedAt,
      });
    });

    // 4. STEP: Department Hierarchies (Levels 2, 3...)
    // Shifted by -1 to display as Lvl 1, Lvl 2 for the department users
    const higherLevels = activeApprovals.filter((a) => a.level > 1);
    higherLevels.sort((a, b) => a.level - b.level);
    higherLevels.forEach((a) => {
      steps.push({
        id: `lvl-${a.id}`,
        level: `${a.level - 1}`,
        title: `Approver (Lvl ${a.level - 1})`,
        approverName: a.approver.fullName,
        approverEmail: a.approver.email,
        status: a.status,
        comments: a.comments,
        reason: a.reason,
        createdAt: a.createdAt,
        approvedAt: a.approvedAt,
      });
    });

    // 5. STEP: Append 'waiting' future steps from approvalProgress
    if (documentDetail.approvalProgress?.steps) {
      const waitingSteps = documentDetail.approvalProgress.steps.filter((s: any) => s.status === 'waiting');
      waitingSteps.forEach((ws: any) => {
        const match = ws.id.match(/^lvl-(\d+)$/);
        let levelDisplay = "Lvl";
        let titleDisplay = ws.title;
        if (match) {
          levelDisplay = match[1];
          titleDisplay = `Approver (Lvl ${levelDisplay})`;
        }
        steps.push({
          id: `waiting-${ws.id}`,
          level: levelDisplay,
          title: titleDisplay,
          approverName: ws.approverName,
          approverEmail: "-",
          status: "waiting",
          comments: null,
          reason: null,
          createdAt: null,
          approvedAt: null,
        });
      });
    }

    return steps;
  };

  const workflowSteps = getWorkflowSteps();

  // Prevent printing for approved documents (Master watermark preview only)
  useEffect(() => {
    if (!showProtectedView) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+P or Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        e.stopPropagation();
        notify.error(
          "Printing is disabled for Master preview. Please use Print Preview tab if you have print approval."
        );
        return false;
      }
    };

    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
      notify.error(
        "Printing is disabled for Master preview. Please use Print Preview tab if you have print approval."
      );
      return false;
    };

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("beforeprint", handleBeforePrint, true);

    // Override window.print
    const originalPrint = window.print;
    window.print = () => {
      notify.error(
        "Printing is disabled for Master preview. Please use Print Preview tab if you have print approval."
      );
    };

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("beforeprint", handleBeforePrint, true);
      window.print = originalPrint;
    };
  }, [showProtectedView]);

  return (
    <div className="space-y-6">
      {/* ═══ Single Document Info Card with internal sections ═══ */}
      <Card>
        <CardContent className="pt-6 space-y-6">

          {/* Document name + status badges */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{documentDetail.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {documentDetail.documentCode && (
                <Badge variant="outline">{documentDetail.documentCode}</Badge>
              )}
              {getStatusBadge(documentDetail.status)}
              {documentDetail.isInternal && (
                <Badge variant="secondary">Internal</Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Section: Detail Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {t("documentDetail.detailInformation")}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: t("documentDetail.documentNumber"), value: documentDetail.documentNumber },
                { label: t("documentDetail.category"), value: getCategoryLabel(documentDetail.category) },
                { label: t("documentDetail.department"), value: `${documentDetail.department.name} (${documentDetail.department.departmentCode})` },
                { label: t("documentDetail.uploadedBy"), value: documentDetail.uploader.fullName },
                { label: t("documentDetail.createdAt"), value: formatDate(documentDetail.createdAt) },
                { label: t("documentDetail.updatedAt"), value: formatDate(documentDetail.updatedAt) },
                ...(documentDetail.proposalObjective
                  ? [{ label: t("documentDetail.proposalObjective"), value: documentDetail.proposalObjective }]
                  : []),
              ].map((item, index) => (
                <div key={index} className="bg-muted/40 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="font-medium text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Additional Information */}
          {Boolean(
            documentDetail.documentFormat || documentDetail.retentionPeriod ||
            documentDetail.hardDocumentRetentionPeriod || documentDetail.storageLocation ||
            documentDetail.hardDocumentStorageLocation || documentDetail.remark ||
            documentDetail.publishingInstitution || documentDetail.dateOfIssue || documentDetail.expiredDate
          ) && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    {t("documentDetail.additionalInfo")}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    documentDetail.documentFormat && { label: t("documentDetail.documentFormat"), value: documentDetail.documentFormat.replace(/_/g, " "), capitalize: true },
                    documentDetail.retentionPeriod && { label: t("documentDetail.retentionPeriod"), value: documentDetail.retentionPeriod },
                    documentDetail.hardDocumentRetentionPeriod && { label: t("documentDetail.hardCopyRetention"), value: documentDetail.hardDocumentRetentionPeriod },
                    documentDetail.storageLocation && { label: t("documentDetail.storageLocation"), value: documentDetail.storageLocation },
                    documentDetail.hardDocumentStorageLocation && { label: t("documentDetail.hardCopyStorage"), value: documentDetail.hardDocumentStorageLocation },
                    documentDetail.remark && { label: t("documentDetail.remark"), value: documentDetail.remark },
                    documentDetail.publishingInstitution && { label: t("documentDetail.publishingInstitution"), value: documentDetail.publishingInstitution },
                    documentDetail.dateOfIssue && { label: t("documentDetail.dateOfIssue"), value: formatDate(documentDetail.dateOfIssue) },
                    documentDetail.expiredDate && { label: t("documentDetail.expiredDate"), value: formatDate(documentDetail.expiredDate) },
                  ].filter(Boolean).map((item: any, index) => (
                    <div key={index} className="bg-muted/40 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      <p className={`font-medium text-sm${item.capitalize ? " capitalize" : ""}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Section: Document References */}
          {documentDetail.references && documentDetail.references.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookMarked className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    {t("documentDetail.documentReferences")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {documentDetail.references
                    .filter((refLink: any, index: number, self: any[]) =>
                      index === self.findIndex((r) => r.referenceId === refLink.referenceId)
                    )
                    .map((refLink: any) => (
                      <div key={refLink.id} className="flex items-center gap-2 bg-primary/10 text-primary rounded-lg px-3 py-2 text-sm">
                        <span className="font-mono font-semibold">[{refLink.reference.code}]</span>
                        <span>{refLink.reference.name}</span>
                        {refLink.reference.checker && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            <User className="h-3 w-3 mr-1" />
                            {refLink.reference.checker.fullName}
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Section: File Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {t("documentDetail.fileInformation")}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: t("documentDetail.fileSize"), value: `${(documentDetail.fileSize / 1024).toFixed(2)} KB` },
                { label: t("documentDetail.type"), value: documentDetail.mimeType },
                { label: t("documentDetail.revision"), value: `REV-${String(documentDetail.revision).padStart(2, "0")}` },
              ].map((item, index) => (
                <div key={index} className="bg-muted/40 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="font-medium text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Master File Properties */}
          {documentDetail.masterDocumentGoogleDriveId && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                      {t("documentDetail.rawDocumentInfo")}
                    </span>
                  </div>
                  {(!isUser || canDownloadDocument) && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleDownloadMaster} disabled={downloadingMaster || downloadingOriginalMaster}>
                        {downloadingMaster ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {downloadingMaster ? t("documentDetail.downloading") : t("documentDetail.downloadRaw")}
                      </Button>
                      {documentDetail.category === "instruksi_kerja" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleDownloadOriginalMaster} 
                          disabled={downloadingMaster || downloadingOriginalMaster}
                          className="border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                        >
                          {downloadingOriginalMaster ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                          Download Master Original (Drive)
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      label: t("documentDetail.fileSize"),
                      value: documentDetail.masterDocumentFileSize
                        ? `${(documentDetail.masterDocumentFileSize / 1024).toFixed(2)} KB`
                        : "-",
                    },
                    { label: t("documentDetail.type"), value: documentDetail.masterDocumentMimeType || "-" },
                  ].map((item, index) => (
                    <div key={index} className="bg-muted/40 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </CardContent>
      </Card>



      {/* PDF Preview */}
      {id && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t("documentDetail.documentPreview")}
              </CardTitle>
              <div className="flex items-center gap-2">
                {showProtectedView && (
                  <>
                    <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleRotateLeft} title="Rotate Left">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleRotateRight} title="Rotate Right">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={toggleFullScreen}>
                  <Maximize2 className="mr-2 h-4 w-4" />
                  {t("documentDetail.fullScreen")}
                </Button>
                {!isDraft && !showProtectedView && (
                  <Button variant="outline" size="sm" onClick={handleOpenPreview}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t("documentDetail.openInNewTab")}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              {showProtectedView && (
                <style>
                  {`
                    @media print {
                      .pdf-viewer-container {
                        display: none !important;
                      }
                      .pdf-viewer-container::before {
                        content: "Printing is disabled for Master preview. Please use Print Preview tab." !important;
                        display: block !important;
                        text-align: center !important;
                        padding: 20px !important;
                        font-size: 18px !important;
                      }
                    }
                  `}
                </style>
              )}
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-muted/10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("documentDetail.loadingPreview")}
                  </p>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-muted/10">
                  <p className="text-muted-foreground">
                    {t("documentDetail.failedToLoad")}
                  </p>
                </div>
              ) : showProtectedView ? (
                <div
                  className="pdf-viewer-container max-h-[800px] overflow-auto border rounded-lg bg-gray-50 p-4"
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ userSelect: "none", WebkitUserSelect: "none" }}
                >
                  {pdfBlob && (
                    <Document
                      key={id}
                      file={pdfBlob}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div className="flex justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      }
                      error={
                        <div className="text-red-500 text-center p-4">
                          {t("documentDetail.failedPdf")}
                        </div>
                      }
                    >
                      {Array.from(new Array(numPages), (_, index) => (
                        <div
                          key={`page_${index + 1}`}
                          className="mb-4 flex justify-center"
                        >
                          <Page
                            pageNumber={index + 1}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            width={800}
                            scale={scale}
                            rotate={rotation}
                            className="shadow-md"
                          />
                        </div>
                      ))}
                    </Document>
                  )}
                </div>
              ) : (
                <iframe
                  src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-[600px] border rounded-lg"
                  title="PDF Preview"
                >
                  <p className="text-muted-foreground text-center py-8">
                    Your browser does not support PDF preview. Please use the
                    "Open in New Tab" button above or download the document.
                  </p>
                </iframe>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Workflow */}
      {workflowSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {t("documentDetail.approvalWorkflow")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs text-center">
                    {step.level}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                          {step.title}
                        </p>
                        <p className="font-medium text-sm">
                          {step.approverName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step.approverEmail}
                        </p>
                      </div>
                      {getApprovalStatusBadge(step.status)}
                    </div>

                    {/* Display Revision Purpose if available */}
                    {step.reason && (
                      <div className="mt-2 p-3 rounded bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 w-full overflow-hidden">
                        <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                          {t("documentDetail.revisionPurpose")}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 break-words whitespace-pre-wrap break-all">
                          {step.reason}
                        </p>
                      </div>
                    )}

                    {step.comments && (
                      <div className="mt-2 p-3 rounded bg-muted/50 w-full overflow-hidden">
                        <p className="text-xs text-muted-foreground">
                          {t("documentDetail.comments")}
                        </p>
                        <p className="text-xs break-words whitespace-pre-wrap break-all">{step.comments}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t("documentDetail.created")} {formatDate(step.createdAt)}
                      </span>
                      {step.approvedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("documentDetail.processed")} {formatDate(step.approvedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Screen Preview Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/50 text-white">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t("documentDetail.documentPreview")} - {documentDetail?.documentCode || "Document"}
            </h2>
            <div className="flex items-center gap-2">
              {showProtectedView && (
                <>
                  <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out" className="text-white hover:bg-white/20">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In" className="text-white hover:bg-white/20">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleRotateLeft} title="Rotate Left" className="text-white hover:bg-white/20">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleRotateRight} title="Rotate Right" className="text-white hover:bg-white/20">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullScreen}
                className="text-white hover:bg-white/20 ml-2"
              >
                <X className="mr-2 h-4 w-4" />
                {t("documentDetail.close")}
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {previewLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
                <p className="mt-4 text-white">{t("documentDetail.loadingPreview")}</p>
              </div>
            ) : previewError ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-white text-lg">
                  {t("documentDetail.failedToLoad")}
                </p>
              </div>
            ) : showProtectedView && pdfBlob ? (
              <div 
                className="flex flex-col items-center"
                onContextMenu={(e) => e.preventDefault()}
                style={{ userSelect: "none", WebkitUserSelect: "none" }}
              >
                <Document
                  file={pdfBlob}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  }
                  error={
                    <div className="text-red-500 text-center p-4">
                      Failed to load PDF.
                    </div>
                  }
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <div key={`fullscreen_page_${index + 1}`} className="mb-6 flex justify-center">
                      <Page
                        pageNumber={index + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={Math.min(window.innerWidth - 100, 1200)}
                        scale={scale}
                        rotate={rotation}
                        className="shadow-2xl"
                      />
                    </div>
                  ))}
                </Document>
              </div>
            ) : previewUrl ? (
              <iframe
                src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-0 rounded-lg bg-white"
                title="PDF Preview Full Screen"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-white text-lg">{t("documentDetail.noPreview")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
