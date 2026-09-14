import { getCategoryLabel } from "@/utils/categoryLabels";
import Layout from "@/components/layout/layout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { asyncGetApprovalRequestsActionCreator } from "@/store/approvals/action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, GitBranch, Eye, Loader2, Maximize2, History } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import ApproveDialog from "../components/approve-dialog";
import RejectDialog from "../components/reject-dialog";
import { getDocumentPreview, getDocumentHistory, getDocumentHistoryPreview } from "@/services/api/documents";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function RevisionApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { approvalRequests, loading } = useAppSelector((state) => state.approvals);

  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);

  // Preview states
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // History Preview states
  const [historyPreviewLoading, setHistoryPreviewLoading] = useState(false);
  const [historyPreviewError, setHistoryPreviewError] = useState(false);
  const [historyPdfBlob, setHistoryPdfBlob] = useState<Blob | null>(null);
  const [historyNumPages, setHistoryNumPages] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("after");

  useEffect(() => {
    dispatch(asyncGetApprovalRequestsActionCreator());
  }, [dispatch]);

  const approval = approvalRequests.find((req: any) => req.id === Number(id));

  // Load preview when approval is available
  useEffect(() => {
    if (approval?.document?.id && approval.documentRevision !== undefined) {
      loadData(approval.document.id, approval.documentRevision);
    }
  }, [approval?.document?.id, approval?.documentRevision]);

  const loadData = async (documentId: number, currentRevision: number) => {
    setPreviewLoading(true);
    setPreviewError(false);
    try {
      const blob = await getDocumentPreview(documentId);
      setPdfBlob(blob);
    } catch (error) {
      console.error("Failed to load preview:", error);
      setPreviewError(true);
    } finally {
      setPreviewLoading(false);
    }

    if (currentRevision > 0) {
      setHistoryPreviewLoading(true);
      setHistoryPreviewError(false);
      try {
        const histories = await getDocumentHistory(documentId);
        const targetHistory = histories.find((h: any) => h.revision === currentRevision - 1);
        
        let historyIdToLoad = targetHistory?.id;
        if (!historyIdToLoad && histories.length > 0) {
           historyIdToLoad = histories[0].id;
        }

        if (historyIdToLoad) {
          const historyBlob = await getDocumentHistoryPreview(historyIdToLoad);
          setHistoryPdfBlob(historyBlob);
        } else {
          setHistoryPreviewError(true);
        }
      } catch (error) {
         console.error("Failed to load history preview:", error);
         setHistoryPreviewError(true);
      } finally {
         setHistoryPreviewLoading(false);
      }
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onHistoryLoadSuccess = ({ numPages }: { numPages: number }) => {
    setHistoryNumPages(numPages);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (loading) {
    return (
      <Layout title="Loading..." items={[]}>
        <div className="text-center py-12">Loading approval details...</div>
      </Layout>
    );
  }

  if (!approval) {
    return (
      <Layout title="Approval Not Found" items={[]}>
        <div className="text-center py-12 text-red-500 font-medium">
          Approval request not found. It may have been processed or deleted.
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: "Pending", class: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approved", class: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", class: "bg-red-100 text-red-800" },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return <Badge className={badge.class}>{badge.label}</Badge>;
  };

  const handleSuccess = () => {
    navigate("/approvals");
  };

  // Format revision number to 2 digits
  const formatRevision = (revision: number | undefined) => {
    return String(revision ?? 0).padStart(2, "0");
  };

  return (
    <Layout
      title="Revision Approval Detail"
      items={[
        { label: "Home", href: "/" },
        { label: "Approvals", href: "/approvals" },
        { label: "Detail", href: `#` },
      ]}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <Button variant="outline" onClick={() => navigate("/approvals")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Approvals
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-cyan-600" />
                Document Revision Approval (Rev.
                {formatRevision(approval.documentRevision)})
              </CardTitle>
              {getStatusBadge(approval.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Information */}
            <div>
              <h3 className="font-semibold mb-3">Document Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Document Code</p>
                  <p className="font-mono">
                    {approval.document?.documentCode || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Document Name</p>
                  <p className="font-medium">
                    {approval.document?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p>
                    {getCategoryLabel(approval.document?.category || "") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p>{approval.document?.department?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-semibold">
                    {approval.document?.version || 1}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revision</p>
                  <p className="font-semibold">
                    {formatRevision(approval.document?.revision)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Revision Request Information */}
            <div>
              <h3 className="font-semibold mb-3">Revision Request Details</h3>
              <div className="space-y-4">
                {approval.reason && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Revision Purpose (Why revise this document?)
                    </p>
                    <div className="bg-cyan-50 border border-cyan-200 rounded-md p-3">
                      <p className="text-sm text-cyan-800">{approval.reason}</p>
                    </div>
                  </div>
                )}

                {approval.document?.proposalObjective && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Proposal Objective
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-800">
                        {approval.document.proposalObjective}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Approval Information */}
            <div>
              <h3 className="font-semibold mb-3">Approval Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Requested By</p>
                  <p className="font-medium">
                    {approval.creator?.fullName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested</p>
                  <p>
                    {formatDistanceToNow(new Date(approval.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Approval Level
                  </p>
                  <p>Level {approval.level || 1}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approver</p>
                  <p className="font-medium">
                    {approval.approver?.fullName || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Approval/Rejection Comments */}
            {(approval.status === "approved" ||
              approval.status === "rejected") &&
              approval.comments && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">
                      {approval.status === "approved" ? "Approval" : "Rejection"}{" "}
                      Comments
                    </h3>
                    <div
                      className={`p-3 rounded-md ${
                        approval.status === "approved"
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          approval.status === "approved"
                            ? "text-green-800"
                            : "text-red-800"
                        }`}
                      >
                        {approval.comments}
                      </p>
                    </div>
                  </div>
                </>
              )}

            {approval.status === "pending" && (
              <>
                <Separator />
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setOpenApproveDialog(true)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Revision
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setOpenRejectDialog(true)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Revision
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Document Preview Section */}
        {approval.document?.id && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Document Preview
                </CardTitle>
                <Button variant="outline" size="sm" onClick={toggleFullScreen}>
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Full Screen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-6">
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="before" disabled={!historyPdfBlob && !historyPreviewLoading && (approval.documentRevision ?? 0) > 0}>
                      <History className="h-4 w-4 mr-2" />
                      Before (Rev. {formatRevision((approval.documentRevision ?? 0) - 1)})
                    </TabsTrigger>
                    <TabsTrigger value="after">
                      <Eye className="h-4 w-4 mr-2" />
                      After (Rev. {formatRevision(approval.documentRevision)})
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="before" className="mt-0">
                  <div className="w-full">
                    {historyPreviewLoading ? (
                      <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-muted/10">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Loading previous revision...
                        </p>
                      </div>
                    ) : historyPreviewError ? (
                      <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-muted/10">
                        <p className="text-muted-foreground">
                          Failed to load previous revision.
                        </p>
                      </div>
                    ) : historyPdfBlob ? (
                      <div
                        className="max-h-[600px] overflow-auto border rounded-lg bg-gray-50 p-4"
                        onContextMenu={(e) => e.preventDefault()}
                        style={{ userSelect: "none", WebkitUserSelect: "none" }}
                      >
                        <Document
                          file={historyPdfBlob}
                          onLoadSuccess={onHistoryLoadSuccess}
                          loading={
                            <div className="flex justify-center p-4">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          }
                          error={
                            <div className="text-red-500 text-center p-4">
                              Failed to load PDF.
                            </div>
                          }
                        >
                          {Array.from(new Array(historyNumPages || 0), (_, index) => (
                            <div
                              key={`history_page_${index + 1}`}
                              className="mb-4 flex justify-center"
                            >
                              <Page
                                pageNumber={index + 1}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                width={700}
                                className="shadow-md"
                              />
                            </div>
                          ))}
                        </Document>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-muted/10">
                        <p className="text-muted-foreground">No previous revision available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="after" className="mt-0">
                  <div className="w-full">
                    {previewLoading ? (
                      <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-muted/10">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Loading preview...
                        </p>
                      </div>
                    ) : previewError ? (
                      <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-muted/10">
                        <p className="text-muted-foreground">
                          Failed to load preview. Please try again later.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => approval.document?.id && loadData(approval.document.id, approval.documentRevision ?? 0)}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : pdfBlob ? (
                      <div
                        className="max-h-[600px] overflow-auto border rounded-lg bg-gray-50 p-4"
                        onContextMenu={(e) => e.preventDefault()}
                        style={{ userSelect: "none", WebkitUserSelect: "none" }}
                      >
                        <Document
                          file={pdfBlob}
                          onLoadSuccess={onDocumentLoadSuccess}
                          loading={
                            <div className="flex justify-center p-4">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          }
                          error={
                            <div className="text-red-500 text-center p-4">
                              Failed to load PDF.
                            </div>
                          }
                        >
                          {Array.from(new Array(numPages || 0), (_, index) => (
                            <div
                              key={`page_${index + 1}`}
                              className="mb-4 flex justify-center"
                            >
                              <Page
                                pageNumber={index + 1}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                width={700}
                                className="shadow-md"
                              />
                            </div>
                          ))}
                        </Document>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-muted/10">
                        <p className="text-muted-foreground">No preview available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
                Document Preview - {approval.document?.name || "Document"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullScreen}
                className="text-white hover:bg-white/20"
              >
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {previewLoading || (activeTab === 'before' && historyPreviewLoading) ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-12 w-12 animate-spin text-white" />
                  <p className="mt-4 text-white">Loading preview...</p>
                </div>
              ) : previewError || (activeTab === 'before' && historyPreviewError) ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-white text-lg">
                    Failed to load preview. Please try again.
                  </p>
                </div>
              ) : (activeTab === 'after' ? pdfBlob : historyPdfBlob) ? (
                <div
                  className="flex flex-col items-center"
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ userSelect: "none", WebkitUserSelect: "none" }}
                >
                  <Document
                    file={activeTab === 'after' ? pdfBlob : historyPdfBlob}
                    onLoadSuccess={activeTab === 'after' ? onDocumentLoadSuccess : onHistoryLoadSuccess}
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
                    {Array.from(new Array((activeTab === 'after' ? numPages : historyNumPages) || 0), (_, index) => (
                      <div
                        key={`page_fullscreen_${index + 1}`}
                        className="mb-6 flex justify-center"
                      >
                        <Page
                          pageNumber={index + 1}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          width={900}
                          className="shadow-xl"
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
      </motion.div>

      <ApproveDialog
        open={openApproveDialog}
        onOpenChange={setOpenApproveDialog}
        approvalId={approval.id}
        isPrintRequest={false}
        onSuccess={handleSuccess}
      />
      <RejectDialog
        open={openRejectDialog}
        onOpenChange={setOpenRejectDialog}
        approvalId={approval.id}
        isPrintRequest={false}
        onSuccess={handleSuccess}
      />
    </Layout>
  );
}
