import Layout from "@/components/layout/layout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { asyncGetApprovalRequestsActionCreator } from "@/store/approvals/action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, BookMarked, Eye, Loader2, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import ApproveDialog from "../components/approve-dialog";
import RejectDialog from "../components/reject-dialog";
import { getDocumentPreview } from "@/services/api/documents";
import { getApprovalDetail } from "@/services/api/approvals"; // Import detail fetcher
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ReferenceApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { approvalRequests } = useAppSelector((state) => state.approvals);

  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);

  // Preview states
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Fetching single detail state
  const [fetchedApproval, setFetchedApproval] = useState<any>(null);
  const [loadingFetched, setLoadingFetched] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  useEffect(() => {
    dispatch(asyncGetApprovalRequestsActionCreator());
  }, [dispatch]);

  // Find approval by matching ID (handle potentially string IDs for reference checks)
  const storedApproval = approvalRequests.find((req: any) => String(req.id) === String(id));
  
  const approval = storedApproval || fetchedApproval;

  // New useEffect to fetch detail if not found in store
  useEffect(() => {
    if (!id || isNaN(Number(id))) return;
    if (storedApproval || fetchedApproval) return;
    if (loadingFetched || fetchAttempted) return;

    const fetchDetail = async () => {
      setLoadingFetched(true);
      try {
        console.log("Fetching reference approval detail for ID:", id);
        // We know we are in ReferenceApprovalDetail, so type is 'reference'
        const res = await getApprovalDetail(Number(id), 'reference');
        if (res.success && res.data) {
             // Adapt data if needed to match what component expects
             // The backend returns mappedData which should be compatible
            setFetchedApproval(res.data);
        } else {
            console.error("Fetch returned success=false", res);
        }
      } catch (error) {
        console.error("Failed to fetch approval detail:", error);
      } finally {
        setLoadingFetched(false);
        setFetchAttempted(true);
      }
    };
    fetchDetail();
  }, [id, storedApproval, fetchedApproval, loadingFetched, fetchAttempted]);

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

  // Safe checks for approval data loading
  if (loadingFetched || (!approval && !fetchAttempted)) {
    return (
      <Layout title="Loading..." items={[]}>
        <div className="text-center py-12">Loading approval details...</div>
      </Layout>
    );
  }

  // Handle case where approval is not found even after fetch attempt
  if (!approval) {
     return (
      <Layout title="Not Found" items={[]}>
        <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-4">Approval Not Found</h2>
            <p className="text-muted-foreground mb-6">The requested approval details could not be found.</p>
            <Button onClick={() => navigate("/approvals")}>Back to Approvals</Button>
        </div>
      </Layout>
    ); 
  }

  const handleSuccess = () => {
    navigate("/approvals");
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: "Pending", class: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approved", class: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", class: "bg-red-100 text-red-800" },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return <Badge className={badge.class}>{badge.label}</Badge>;
  };

  const getReferenceTypeBadge = (type: string) => {
    const badges = {
      ISO: { label: "ISO", class: "bg-blue-100 text-blue-800" },
      SJPH: { label: "SJPH", class: "bg-purple-100 text-purple-800" },
      Halal: { label: "Halal", class: "bg-green-100 text-green-800" },
    };
    const badge = badges[type as keyof typeof badges] || {
      label: type,
      class: "bg-gray-100 text-gray-800",
    };
    return <Badge className={badge.class}>{badge.label}</Badge>;
  };

  return (
    <Layout
      title="Reference Approval Detail"
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
                <BookMarked className="h-5 w-5" />
                Reference Check Request
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
                  <p>{approval.document?.category || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p>{approval.document?.department?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-semibold">{approval.document?.version || 1}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revision</p>
                  <p className="font-semibold">
                    {String(approval.documentRevision ?? approval.document?.revision ?? 0).padStart(2, "0")}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Request Purpose - Styled like the screenshot */}
            {approval.reason && (
              <>
                <div>
                  <h3 className="font-semibold mb-3">Request Purpose</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">{approval.reason}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Reference Check Information as "Approval Information" style */}
            <div>
              <h3 className="font-semibold mb-3">Reference Check Information</h3>
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
                    {approval.createdAt ? formatDistanceToNow(new Date(approval.createdAt), {
                      addSuffix: true,
                    }) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reference Type</p>
                   <div className="pt-1">
                    {getReferenceTypeBadge(approval.reference?.name || approval.referenceType || "Unknown")}
                   </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Checker</p>
                  <p className="font-medium">
                    {approval.approver?.fullName || approval.checker?.fullName || "-"}
                  </p>
                </div>
              </div>
            </div>

             {/* Approval/Rejection Reason (Comments) */}
            {(approval.status === "approved" || approval.status === "rejected") && 
             (approval.comments) && (
              <>
                <Separator />
                <div>
                   <h3 className="font-semibold mb-3">
                      {approval.status === "approved" ? "Approval" : "Rejection"} Reason
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

            {approval.status === "pending" && (approval.canAct !== false) && (
              <>
                <Separator />
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setOpenApproveDialog(true)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Reference
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => setOpenRejectDialog(true)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Reference
                  </Button>
                </div>
              </>
            )}

            {approval.status === "pending" && approval.canAct === false && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> You cannot approve this reference check
                  until the document's hierarchy approval is completed.
                </p>
              </div>
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

      <ApproveDialog
        open={openApproveDialog}
        onOpenChange={setOpenApproveDialog}
        approvalId={approval.id}
        isReferenceCheck={true}
        originalId={approval.id} // use referenceLinkId as ID for dialog action
        onSuccess={handleSuccess}
      />

      <RejectDialog
        open={openRejectDialog}
        onOpenChange={setOpenRejectDialog}
        approvalId={approval.id} // use referenceLinkId as ID for dialog action
        isReferenceCheck={true}
        originalId={approval.id}
        onSuccess={handleSuccess}
      />
    </Layout>
  );
}
