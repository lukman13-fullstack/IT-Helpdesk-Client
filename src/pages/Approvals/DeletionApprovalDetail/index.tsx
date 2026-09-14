import { getCategoryLabel } from "@/utils/categoryLabels";
import Layout from "@/components/layout/layout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { asyncGetApprovalRequestsActionCreator } from "@/store/approvals/action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Trash2, Eye, Loader2, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import ApproveDialog from "../components/approve-dialog";
import RejectDialog from "../components/reject-dialog";
import { getDocumentPreview } from "@/services/api/documents";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { motion } from "framer-motion";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function DeletionApprovalDetail() {
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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: "Pending", class: "bg-yellow-500/15 text-yellow-700 border-yellow-200/50 hover:bg-yellow-500/25" },
      approved: { label: "Approved", class: "bg-green-500/15 text-green-700 border-green-200/50 hover:bg-green-500/25" },
      rejected: { label: "Rejected", class: "bg-red-500/15 text-red-700 border-red-200/50 hover:bg-red-500/25" },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <Badge variant="outline" className={`${badge.class} border shadow-sm px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors`}>
        {badge.label}
      </Badge>
    );
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
      title="Deletion Approval Detail"
      items={[
        { label: "Home", href: "/" },
        { label: "Approvals", href: "/approvals" },
        { label: "Detail", href: `#` },
      ]}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate("/approvals")}
          className="hover:bg-muted/50 rounded-xl group text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Approvals
        </Button>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-orange-600" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                  Document Deletion Request
                </span>
              </CardTitle>
              {getStatusBadge(approval.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {/* Document Information */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                Document Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-muted/20 p-6 rounded-xl border border-border/50">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Document Code</p>
                  <p className="font-mono font-medium text-sm bg-background/50 px-2 py-1 rounded border border-border/50 w-fit">
                    {approval.document?.documentCode || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Document Name</p>
                  <p className="font-medium text-sm">
                    {approval.document?.name || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category</p>
                  <Badge variant="secondary" className="font-medium text-[10px] uppercase tracking-wider">
                    {getCategoryLabel(approval.document?.category || "") || "-"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Department</p>
                  <p className="font-medium text-sm">{approval.document?.department?.name || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Version</p>
                  <p className="font-semibold text-sm">
                    {approval.document?.version || 1}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Revision</p>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold">
                      {formatRevision(approval.document?.revision)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <Separator className="bg-border/60" />

            {/* Deletion Request Information */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                Deletion Request Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Request Reason (Why delete this document?)
                  </p>
                  <div className="bg-orange-50/50 border border-orange-200/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-sm text-orange-900 font-medium">
                      {approval?.reason || "No reason provided"}
                    </p>
                  </div>
                </div>

                {approval.status !== "pending" && approval.comments && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      {approval.status === "approved"
                        ? "Approval"
                        : "Rejection"}{" "}
                      Comments
                    </p>
                    <div
                      className={`border rounded-xl p-4 shadow-sm transition-all duration-300 ${
                        approval.status === "approved"
                          ? "bg-green-50/50 border-green-200/60"
                          : "bg-red-50/50 border-red-200/60"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          approval.status === "approved"
                            ? "text-green-900"
                            : "text-red-900"
                        }`}
                      >
                        {approval.comments}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <Separator className="bg-border/60" />

            {/* Approval Information */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                Approval Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/10 p-6 rounded-xl border border-blue-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {approval.creator?.fullName?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Requested By</p>
                    <p className="font-medium text-sm">
                      {approval.creator?.fullName || "-"}
                    </p>
                  </div>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Requested</p>
                   <p className="text-sm font-medium">
                     {formatDistanceToNow(new Date(approval.createdAt), {
                       addSuffix: true,
                     })}
                   </p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Approval Level</p>
                   <Badge variant="outline" className="mt-1">Level {approval.level || 1}</Badge>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                     {approval.approver?.fullName?.[0] || "?"}
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Approver</p>
                     <p className="font-medium text-sm">
                       {approval.approver?.fullName || "-"}
                     </p>
                   </div>
                 </div>
              </div>
            </motion.div>

            {approval.status === "pending" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Separator className="my-6 bg-border/60" />
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 mb-6 shadow-sm flex gap-3 items-start">
                  <div className="mt-0.5 min-w-5">
                    <Trash2 className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-sm text-amber-900 font-medium leading-relaxed">
                    <strong className="uppercase text-amber-700 tracking-wide text-xs">Warning:</strong> Approving this request will mark
                    the document as OBSOLETE. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setOpenApproveDialog(true)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Deletion
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setOpenRejectDialog(true)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Request
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Document Preview Section */}
        {approval.document?.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
              <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Eye className="h-5 w-5 text-blue-600" />
                    </div>
                    Document Preview
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={toggleFullScreen} className="rounded-lg hover:bg-background/80">
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Full Screen
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="w-full">
                  {previewLoading ? (
                    <div className="flex flex-col items-center justify-center h-[500px] border rounded-2xl bg-muted/5 backdrop-blur-sm">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                        <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
                      </div>
                      <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
                        Generating preview...
                      </p>
                    </div>
                  ) : previewError ? (
                    <div className="flex flex-col items-center justify-center h-[500px] border rounded-2xl bg-destructive/5 border-destructive/10">
                      <p className="text-destructive font-medium mb-4">
                        Failed to load preview. Please try again later.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => approval.document?.id && loadPreview(approval.document.id)}
                        className="rounded-xl border-destructive/20 hover:bg-destructive/10 text-destructive"
                      >
                        Retry Loading
                      </Button>
                    </div>
                  ) : pdfBlob ? (
                    <div
                      className="max-h-[600px] overflow-auto border rounded-2xl bg-gray-50/50 p-6 shadow-inner custom-scrollbar"
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ userSelect: "none", WebkitUserSelect: "none" }}
                    >
                      <Document
                        file={pdfBlob}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                          <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                          </div>
                        }
                        error={
                          <div className="text-destructive text-center p-8 font-medium">
                            Failed to load PDF document.
                          </div>
                        }
                      >
                        {Array.from(new Array(numPages), (_, index) => (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            key={`page_${index + 1}`}
                            className="mb-6 flex justify-center"
                          >
                            <Page
                              pageNumber={index + 1}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              width={700}
                              className="shadow-xl rounded-lg overflow-hidden border border-gray-200"
                            />
                          </motion.div>
                        ))}
                      </Document>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[500px] border border-dashed rounded-2xl bg-muted/10">
                      <p className="text-muted-foreground font-medium">No preview available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Full Screen Preview Modal */}
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col backdrop-blur-sm"
          >
            <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10 text-white backdrop-blur-md">
              <h2 className="text-lg font-bold flex items-center gap-3 tracking-wide">
                <div className="p-1.5 bg-white/10 rounded-full">
                  <Eye className="h-5 w-5" />
                </div>
                Document Preview - <span className="text-white/70 font-normal">{approval.document?.name || "Document"}</span>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullScreen}
                className="text-white hover:bg-white/10 rounded-full h-10 w-10 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-black/40">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-12 w-12 animate-spin text-white/80" />
                  <p className="mt-4 text-white/60 font-medium tracking-wide">Loading high resolution preview...</p>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-white/80 text-lg font-medium bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/20">
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
                      <div className="text-red-400 text-center p-4">
                        Failed to load PDF.
                      </div>
                    }
                  >
                    {Array.from(new Array(numPages), (_, index) => (
                      <div
                        key={`page_fullscreen_${index + 1}`}
                        className="mb-8 flex justify-center"
                      >
                        <Page
                          pageNumber={index + 1}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          width={900}
                          className="shadow-2xl rounded-lg"
                        />
                      </div>
                    ))}
                  </Document>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-white text-lg opacity-60">No preview available</p>
                </div>
              )}
            </div>
          </motion.div>
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
