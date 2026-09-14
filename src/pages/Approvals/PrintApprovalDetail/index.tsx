import Layout from "@/components/layout/layout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { asyncGetApprovalRequestsActionCreator } from "@/store/approvals/action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Printer, Eye, Loader2, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import ApproveDialog from "@/pages/Approvals/components/approve-dialog";
import RejectDialog from "@/pages/Approvals/components/reject-dialog";
import { getDocumentPreview } from "@/services/api/documents";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PrintApprovalDetail() {
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

  useEffect(() => {
    dispatch(asyncGetApprovalRequestsActionCreator());
  }, [dispatch]);

  const approval = approvalRequests.find((req: any) => req.id === Number(id));

  // Load preview when approval is available
  useEffect(() => {
    if (approval?.document?.id) {
      loadPreview(approval.document.id);
    }
  }, [approval?.document?.id]);

  const loadPreview = async (documentId: number) => {
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
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
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

  // Get print request from nested structure
  const printRequest = approval.printRequest;

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

  return (
    <Layout
      title="Print Approval Detail"
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
                <Printer className="h-5 w-5" />
                Print Request Approval
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
              </div>
            </div>

            <Separator />

            {/* Print Request Information */}
            <div>
              <h3 className="font-semibold mb-3">Print Request Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Distribution Type
                  </p>
                  <Badge
                    variant={
                      printRequest?.isInternal ? "default" : "destructive"
                    }
                  >
                    {printRequest?.isInternal ? "Controlled" : "Uncontrolled"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Number of Copies
                  </p>
                  <p className="font-medium">{printRequest?.copies || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{printRequest?.storageLocation || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p>{printRequest?.reason || "-"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Requester Information */}
            <div>
              <h3 className="font-semibold mb-3">Requester Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Requested By</p>
                  <p className="font-medium">
                    {printRequest?.requester?.fullName || "-"}
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
              </div>
            </div>

            {approval.status === "pending" && (
              <>
                <Separator />
                <div className="flex gap-3">
                  <Button
                    onClick={() => setOpenApproveDialog(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Print Request
                  </Button>
                  <Button
                    onClick={() => setOpenRejectDialog(true)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Print Request
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
                      onClick={() => approval.document?.id && loadPreview(approval.document.id)}
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
                      {Array.from(new Array(numPages), (_, index) => (
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
            </CardContent>
          </Card>
        )}

        {/* Full Screen Preview Modal */}
        {isFullScreen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
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
            <div className="flex-1 overflow-auto p-4">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-12 w-12 animate-spin text-white" />
                  <p className="mt-4 text-white">Loading preview...</p>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-white text-lg">
                    Failed to load preview. Please try again.
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

      {/* Approve Dialog */}
      <ApproveDialog
        open={openApproveDialog}
        onOpenChange={setOpenApproveDialog}
        approvalId={approval.id}
        onSuccess={handleSuccess}
      />

      {/* Reject Dialog */}
      <RejectDialog
        open={openRejectDialog}
        onOpenChange={setOpenRejectDialog}
        approvalId={approval.id}
        onSuccess={handleSuccess}
      />
    </Layout>
  );
}
