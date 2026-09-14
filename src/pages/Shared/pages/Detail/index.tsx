import { getCategoryLabel } from "@/utils/categoryLabels";
import Layout from "@/components/layout/layout";
import { asyncGetDocumentByIdActionCreator } from "@/store/documents/action";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Building2,
  Hash,
  CheckCircle2,
  Clock,
  Loader2,
  Eye,
  AlignLeft,
  Lightbulb,
  Info,
  HardDrive,
  FileType,
  GitBranch,
  Maximize2,
  X,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { format } from "date-fns";
import type { HistoryItem } from "@/services/api/types/documents.types";
import { getDocumentPreview } from "@/services/api/documents";
import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function DocumentSharedDetail() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { documentDetail, loading } = useAppSelector(
    (state) => state.documents
  );
  const { id } = useParams();
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleRotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pdfBlob]);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!id || !documentDetail) return;

      try {
        setPreviewLoading(true);
        const blob = await getDocumentPreview(id);
        setPdfBlob(blob);
        setPreviewError(false);
      } catch (err: any) {
        console.error("Failed to fetch preview:", err);
        setPreviewError(true);
      } finally {
        setPreviewLoading(false);
      }
    };

    if (documentDetail) {
      fetchPreview();
    }
  }, [id, documentDetail]);

  useEffect(() => {
    if (id) {
      dispatch(asyncGetDocumentByIdActionCreator(Number(id)));
    }
  }, [dispatch, id]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      draft: { label: "Draft", variant: "secondary" },
      pending_approval: { label: "Pending Approval", variant: "default" },
      approved: { label: "Approved", variant: "default" },
      rejected: { label: "Rejected", variant: "destructive" },
      revised: { label: "Revised", variant: "default" },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "secondary",
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getApprovalStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
      waiting: { label: "Waiting", className: "bg-slate-100 text-slate-500 border border-slate-200" },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm");
    } catch {
      return dateString;
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (documentDetail?.printRequestStatus !== "approved") {
      e.preventDefault();
    }
  };

  if (loading && !documentDetail) {
    return (
      <Layout title="Document Detail">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (!documentDetail) {
    return (
      <Layout title="Document Detail">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Document not found</p>
            <Button
              onClick={() => handleCancel()}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documents
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout
      title="Document Detail"
      items={[
        {
          label: "Documents",
          href: "/documents",
        },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">
                  {documentDetail.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{documentDetail.documentCode}</Badge>
                  {getStatusBadge(documentDetail.status)}
                  {documentDetail.isInternal && (
                    <Badge variant="secondary">Internal</Badge>
                  )}
                </div>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: <Hash className="h-4 w-4" />,
                  label: "Document Number",
                  value: documentDetail.documentNumber,
                },
                {
                  icon: <FileText className="h-4 w-4" />,
                  label: "Category",
                  value: (
                    <span>
                      {getCategoryLabel(documentDetail.category)}
                    </span>
                  ),
                },
                {
                  icon: <Building2 className="h-4 w-4" />,
                  label: "Department",
                  value: `${documentDetail.department.name} (${documentDetail.department.departmentCode})`,
                },
                {
                  icon: <User className="h-4 w-4" />,
                  label: "Uploaded By",
                  value: documentDetail.uploader.fullName,
                },
                {
                  icon: <Calendar className="h-4 w-4" />,
                  label: "Created At",
                  value: formatDate(documentDetail.createdAt),
                },
                {
                  icon: <Calendar className="h-4 w-4" />,
                  label: "Updated At",
                  value: formatDate(documentDetail.updatedAt),
                },
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-4">
              {documentDetail.description && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <AlignLeft className="h-4 w-4" /> Description
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {documentDetail.description}
                  </p>
                </div>
              )}
              {documentDetail.proposalObjective && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" /> Proposal Objective
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {documentDetail.proposalObjective}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4" /> File Information
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: <HardDrive className="h-4 w-4" />,
                    label: "File Size",
                    value: `${(documentDetail.fileSize / 1024).toFixed(2)} KB`,
                  },
                  {
                    icon: <FileType className="h-4 w-4" />,
                    label: "Type",
                    value: documentDetail.mimeType,
                  },
                  {
                    icon: <GitBranch className="h-4 w-4" />,
                    label: "Version",
                    value: documentDetail.version,
                  },
                ].map((item, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PDF Preview */}
        {id && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Document Preview{" "}
                  {documentDetail.printRequestStatus !== "approved" &&
                    "(Protected)"}
                </CardTitle>
                <div className="flex items-center gap-2">
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
                  {/* Fullscreen Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullScreen}
                  >
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Full Screen
                  </Button>
                  {/* Open in New Tab for Approved only */}
                  {documentDetail.printRequestStatus === "approved" &&
                    previewUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`, "_blank")}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Open in New Tab
                      </Button>
                    )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="w-full"
                onContextMenu={
                  documentDetail.printRequestStatus !== "approved"
                    ? handleContextMenu
                    : undefined
                }
                onCopy={
                  documentDetail.printRequestStatus !== "approved"
                    ? (e) => e.preventDefault()
                    : undefined
                }
                style={
                  documentDetail.printRequestStatus !== "approved"
                    ? { userSelect: "none" }
                    : undefined
                }
              >
                {/* Print Styles handled by iframe mainly, but keep cleaned up styles */}
                <style>
                  {`
                    @media print {
                      @page {
                        size: auto;
                        margin: 0;
                      }
                      body {
                         /* Let the browser handle standard print, or the iframe's print */
                      }
                      /* Hide layout only if we are printing NOT from the iframe (which shouldn't happen for iframe printing) */
                      /* Actually, for iframe printing, the parent window styles often don't matter as much, 
                         but removing UI clutter is still good. */
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}
                </style>

                {previewLoading ? (
                  <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-muted/10">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Loading preview...
                    </p>
                  </div>
                ) : previewError ? (
                  <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground text-center p-4">
                      {documentDetail.status === "approved" &&
                      documentDetail.printRequestStatus !== "approved"
                        ? "Protected Content. Please Request Print to view."
                        : "Failed to load preview. Please try downloading the document."}
                    </p>
                  </div>
                ) : documentDetail.printRequestStatus === "approved" &&
                  previewUrl ? (
                  /* Native Browser Viewer for Approved Requests associated with Print */
                  <iframe
                    src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-[800px] border rounded-lg"
                    title="PDF Preview"
                  >
                    <p className="text-muted-foreground text-center py-8">
                      Your browser does not support PDF preview.
                    </p>
                  </iframe>
                ) : (
                  /* Protected Viewer (react-pdf) for non-approved */
                  <div className="pdf-viewer-container max-h-[800px] overflow-auto border rounded-lg bg-gray-50 p-4">
                    <Document
                      file={pdfBlob}
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                      onLoadError={(error) => {
                        console.error("Error loading PDF:", error);
                        setPreviewError(true);
                      }}
                      loading={
                        <div className="flex items-center justify-center h-[600px]">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      }
                    >
                      {Array.from(new Array(numPages), (_, index) => (
                        <div key={`page_${index + 1}`} className="mb-4 flex justify-center">
                          <Page
                            pageNumber={index + 1}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            width={Math.min(window.innerWidth * 0.7, 800)}
                            scale={scale}
                            rotate={rotation}
                            className="shadow-md"
                          />
                        </div>
                      ))}
                    </Document>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        ⚠️ This preview is protected. Printing and copying are
                        disabled for security.
                      </div>
                      {numPages && (
                        <div className="text-sm text-muted-foreground">
                          Total Pages: {numPages}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approval Workflow */}
        {documentDetail.approvals && documentDetail.approvals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Approval Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documentDetail.approvals.map((approval) => (
                  <div
                    key={approval.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {approval.level}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {approval.approver.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {approval.approver.email}
                          </p>
                        </div>
                        {getApprovalStatusBadge(approval.status)}
                      </div>
                      {approval.comments && (
                        <div className="mt-2 p-3 rounded bg-muted/50 w-full overflow-hidden">
                          <p className="text-sm text-muted-foreground">
                            Comments:
                          </p>
                          <p className="text-sm break-words whitespace-pre-wrap break-all">{approval.comments}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created: {formatDate(approval.createdAt)}
                        </span>
                        {approval.approvedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Approved: {formatDate(approval.approvedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Append Waiting Steps */}
                {documentDetail.approvalProgress?.steps
                  ?.filter((s: any) => s.status === 'waiting')
                  .map((ws: any) => {
                    const match = ws.id.match(/^lvl-(\d+)$/);
                    let levelDisplay = "Lvl";
                    if (match) {
                      levelDisplay = match[1];
                    }
                    return (
                      <div
                        key={`waiting-${ws.id}`}
                        className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {levelDisplay}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {ws.approverName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                -
                              </p>
                            </div>
                            {getApprovalStatusBadge(ws.status)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document History */}
        {documentDetail.history && documentDetail.history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Document History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documentDetail.history.map(
                  (item: HistoryItem, index: number) => (
                    <div
                      key={index}
                      className="flex gap-4 p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Full Screen Preview Modal (Readonly Protected) */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/50 text-white">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Document Preview - {documentDetail?.documentCode || "Document"}
            </h2>
            <div className="flex items-center gap-2">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullScreen}
                className="text-white hover:bg-white/20 ml-2"
              >
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {previewLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
                <p className="mt-4 text-white">Loading preview...</p>
              </div>
            ) : previewError ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-white text-lg">
                  Failed to load preview. Please try downloading the document.
                </p>
              </div>
            ) : pdfBlob ? (
              <div
                className="flex flex-col items-center"
                onContextMenu={(e) => e.preventDefault()}
                style={{ userSelect: "none", WebkitUserSelect: "none" }}
              >
                <Document
                  file={pdfBlob}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
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
                    <div
                      key={`fullscreen_page_${index + 1}`}
                      className="mb-6 flex justify-center"
                    >
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
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-white text-lg">No preview available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
