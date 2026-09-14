import Layout from "@/components/layout/layout";
import { asyncGetDocumentByIdActionCreator } from "@/store/documents/action";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import {
  downloadMasterDocument,
  getDocumentPreview,
  markAsPrinted,
  downloadPrintFile,
} from "@/services/api/documents";
import { useState, useEffect, useMemo } from "react";
import { notify } from "@/lib/toast";
import DetailTab from "./DetailTab";
import HistoryTab from "./HistoryTab";
import PrintHistoryTab from "./PrintHistoryTab";
import { Printer, AlertCircle, PackageCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { RequestPrintDialog } from "./RequestPrintDialog";
import {
  asyncRequestPrintActionCreator,
  asyncGetPrintHistoryActionCreator,
} from "@/store/printRequests/action";
import { motion } from "framer-motion";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function DocumentDetail() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { documentDetail, loading } = useAppSelector(
    (state) => state.documents
  );
  const { user: authUser } = useAppSelector((state) => state.authUser);
  const isSuperAdmin = authUser?.role?.name === "Super Admin" || authUser?.role?.name === "SUPER_ADMIN";
  const isUser = authUser?.role?.name === "USER";
  
  const canDownloadDocument = useMemo(() => {
    if (!authUser?.role?.permissions) return false;
    return authUser.role.permissions.some(
      (p: any) => p.permission?.name === "DOWNLOAD_DOCUMENT"
    );
  }, [authUser]);

  const { globalLoading } = useAppSelector((state) => state.ui);
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "detail";
  const [downloading, setDownloading] = useState(false);
  const [downloadingMaster, setDownloadingMaster] = useState(false);
  const [downloadingOriginalMaster, setDownloadingOriginalMaster] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  useEffect(() => {
    // ... existing preview logic ...
    const fetchPreview = async () => {
      if (!id) return;
      try {
        setPreviewLoading(true);
        const blob = await getDocumentPreview(id);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPdfBlob(blob);
        setPreviewError(false);
      } catch (err) {
        console.error("Failed to fetch preview:", err);
        setPreviewError(true);
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [id]);

  useEffect(() => {
    if (id) {
      dispatch(asyncGetDocumentByIdActionCreator(Number(id)));
    }
  }, [dispatch, id]);

  // ... existing badge helper functions ...
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

  const handlePrintRequest = async (
    printRequestId: number,
    isInternal: boolean
  ) => {
    if (!id) return;

    try {
      setDownloading(true);

      // Download using the existing service
      const { blob, filename } = await downloadPrintFile(
        id,
        documentDetail?.name || "",
        isInternal ? "controlled" : "uncontrolled",
        printRequestId
      );

      // Mark as printed after successful download
      await markAsPrinted(id, printRequestId);

      // Create object URL for the blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Refresh document to update printedAt status
      dispatch(asyncGetDocumentByIdActionCreator(Number(id)));

      notify.success(
        `${isInternal ? "Controlled" : "Uncontrolled"} document downloaded`
      );
    } catch (error) {
      console.error("Print failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to print document";
      notify.error(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadMaster = async () => {
    if (!id) return;

    try {
      setDownloadingMaster(true);
      const { blob, filename } = await downloadMasterDocument(
        id,
        documentDetail?.name || ""
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Master download failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to download master document";
      notify.error(errorMessage);
    } finally {
      setDownloadingMaster(false);
    }
  };

  const handleDownloadOriginalMaster = async () => {
    if (!id) return;

    try {
      setDownloadingOriginalMaster(true);
      const { blob, filename } = await downloadMasterDocument(
        id,
        documentDetail?.name || "",
        true
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Original Master download failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to download original master document";
      notify.error(errorMessage);
    } finally {
      setDownloadingOriginalMaster(false);
    }
  };

  const handleOpenPrintDialog = () => {
    setIsPrintDialogOpen(true);
  };

  const handleSubmitPrintRequest = async (data: {
    reason: string;
    copies: number;
    storageLocation: string;
    isInternal: boolean;
  }) => {
    if (!id) return;
    try {
      await dispatch(asyncRequestPrintActionCreator(id, data));
      // Refresh document details and print history
      dispatch(asyncGetDocumentByIdActionCreator(Number(id)));
      dispatch(asyncGetPrintHistoryActionCreator(Number(id)));
    } catch (error) {
      console.error("Print request failed:", error);
      throw error; // Let the dialog know it failed
    }
  };

  const handleOpenPreview = () => {
    if (!previewUrl) return;
    window.open(`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`, "_blank");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/documents/update/${id}`);
  };

  const handleRevise = () => {
    navigate(`/documents/revise/${id}`);
  };

  const isDraft =
    documentDetail?.status === "draft" ||
    documentDetail?.status === "rejected";

  // Get active print requests
  const printRequests = documentDetail?.printRequests || [];
  const pendingPrintRequests = documentDetail?.pendingPrintRequests || [];

  // Find internal (controlled) and external (uncontrolled) requests
  const internalRequest = printRequests.find(
    (pr: any) => pr.isInternal === true
  );
  const externalRequest = printRequests.find(
    (pr: any) => pr.isInternal === false
  );

  // Check if user can request more prints
  const canRequestMore = documentDetail?.canRequestMore ?? true;

  // Backward compatible checks
  const isPrintRequestPending = pendingPrintRequests.length > 0;
  const isPrintRequestRejected =
    documentDetail?.printRequestStatus === "rejected";

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
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Button>
          <div className="flex gap-2">
            {/* Request Print Button - show if doc is 100% approved and can request more prints */}
            {documentDetail.status === "approved" &&
              documentDetail.approvalProgress?.percentage === 100 &&
              canRequestMore && (
              <Button
                variant={isPrintRequestRejected ? "destructive" : "outline"}
                onClick={handleOpenPrintDialog}
                disabled={globalLoading || isPrintRequestPending}
              >
                {globalLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="mr-2 h-4 w-4" />
                )}
                {globalLoading
                  ? "Requesting..."
                  : isPrintRequestPending
                  ? "Request Pending"
                  : isPrintRequestRejected
                  ? "Request Rejected (Try Again)"
                  : printRequests.length === 1
                  ? "Request Another Print"
                  : "Request Print"}
              </Button>
            )}

            {/* Print Controlled Button (Internal) - Super Admin only, depends on approved request */}
            {internalRequest && isSuperAdmin && (
              <Button
                variant="outline"
                onClick={() => handlePrintRequest(internalRequest.id, true)}
                disabled={downloading}
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="mr-2 h-4 w-4" />
                )}
                Print Controlled
              </Button>
            )}

            {/* Print Uncontrolled Button (External) - Super Admin only, depends on approved request */}
            {externalRequest && isSuperAdmin && (
              <Button
                variant="outline"
                onClick={() => handlePrintRequest(externalRequest.id, false)}
                disabled={downloading}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="mr-2 h-4 w-4" />
                )}
                Print Uncontrolled
              </Button>
            )}

            {/* Edit for draft */}
            {isDraft && (
              <Button onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}

            {/* Revise for approved */}
            {documentDetail.status === "approved" && (
              <Button onClick={handleRevise}>
                <Edit className="mr-2 h-4 w-4" />
                Revise
              </Button>
            )}
          </div>
        </div>
        
        {/* Info Alert: Document Ready for Pickup */}
        {printRequests.some((pr: any) => pr.status === "ready" && pr.requesterId === authUser?.id) && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <PackageCheck className="h-4 w-4 text-blue-600" />
            <AlertTitle>Document Ready</AlertTitle>
            <AlertDescription>
              Your print request has been processed. Please pick up the physical document from Quality Assurance (QA).
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert: Print Approved, Processing by QA */}
        {printRequests.some((pr: any) => pr.status === "approved" && pr.requesterId === authUser?.id) && (
          <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Print Request Approved</AlertTitle>
            <AlertDescription>
              Your print request is approved. QA is currently processing the print. You will be notified when it's ready for pickup.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs for Detail, History, and Print History */}
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setSearchParams({ tab: value })}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="detail">Preview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="print-history">Print History</TabsTrigger>
          </TabsList>

          <TabsContent value="detail" className="mt-6">
            <DetailTab
              id={id}
              isDraft={isDraft}
              previewUrl={previewUrl}
              previewLoading={previewLoading}
              previewError={previewError}
              handleOpenPreview={handleOpenPreview}
              approvals={
                // Filter approvals to show only those matching current document revision
                // This prevents duplicate entries from previous revision's approvals
                (documentDetail.approvals || []).filter(
                  (approval: any) =>
                    approval.documentRevision === documentDetail.revision ||
                    approval.documentRevision === undefined // Fallback for older data
                )
              }
              getApprovalStatusBadge={getApprovalStatusBadge}
              documentDetail={documentDetail}
              getStatusBadge={getStatusBadge}
              handleDownloadMaster={handleDownloadMaster}
              downloadingMaster={downloadingMaster}
              handleDownloadOriginalMaster={handleDownloadOriginalMaster}
              downloadingOriginalMaster={downloadingOriginalMaster}
              pdfBlob={pdfBlob}
              isUser={isUser}
              canDownloadDocument={canDownloadDocument}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoryTab />
          </TabsContent>

          <TabsContent value="print-history" className="mt-6">
            <PrintHistoryTab />
          </TabsContent>
        </Tabs>
      </motion.div>

      <RequestPrintDialog
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        onSubmit={handleSubmitPrintRequest}
        documentName={documentDetail.name}
        documentCode={documentDetail.documentCode}
        existingTypes={{
          hasInternal:
            !!internalRequest ||
            pendingPrintRequests.some((pr: any) => pr.isInternal),
          hasExternal:
            !!externalRequest ||
            pendingPrintRequests.some((pr: any) => !pr.isInternal),
        }}
      />
    </Layout>
  );
}
