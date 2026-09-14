import Layout from "@/components/layout/layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import ApproveDialog from "../components/approve-dialog";
import RejectDialog from "../components/reject-dialog";
import { useApprovalDetail } from "./hooks/useApprovalDetail";
import { ApprovalInfoCard } from "./components/ApprovalInfoCard";
import { DocumentPreviewCard } from "./components/DocumentPreviewCard";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function DocumentApprovalDetail() {
  // Use custom hook for logic
  const { approval, loading, previewState, actions } = useApprovalDetail();
  
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);

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
          Approval request not found. It may have been processed, deleted, or you might not have permission to view it.
        </div>
      </Layout>
    );
  }

  // Handle retry for preview
  const handleRetryPreview = () => {
    if (approval && approval.document?.id) {
        actions.loadPreview(approval.document.id);
    }
  };

  return (
    <Layout
      title="Document Approval Detail"
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
        <Button variant="outline" onClick={actions.handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Approvals
        </Button>

        {/* Approval Information Card */}
        <ApprovalInfoCard 
            approval={approval}
            onApprove={() => setOpenApproveDialog(true)}
            onReject={() => setOpenRejectDialog(true)}
        />

        {/* Document Preview Section */}
        {approval.document?.id && (
          <DocumentPreviewCard 
            documentName={approval.document.name}
            loading={previewState.loading}
            error={previewState.error}
            pdfBlob={previewState.blob}
            numPages={previewState.numPages}
            isFullScreen={previewState.isFullScreen}
            onLoadSuccess={actions.onDocumentLoadSuccess}
            onToggleFullScreen={actions.toggleFullScreen}
            onRetry={handleRetryPreview}
          />
        )}
        
        {/* Full screen modal is handled inside DocumentPreviewCard when isFullScreen is true */}
        {previewState.isFullScreen && (
             <div className="fixed inset-0 z-50">
                 <DocumentPreviewCard 
                    documentName={approval.document.name}
                    loading={previewState.loading}
                    error={previewState.error}
                    pdfBlob={previewState.blob}
                    numPages={previewState.numPages}
                    isFullScreen={true}
                    onLoadSuccess={actions.onDocumentLoadSuccess}
                    onToggleFullScreen={actions.toggleFullScreen}
                    onRetry={handleRetryPreview}
                />
             </div>
        )}
      </motion.div>

      <ApproveDialog
        open={openApproveDialog}
        onOpenChange={setOpenApproveDialog}
        approvalId={approval.id}
        isPrintRequest={false}
        onSuccess={actions.handleSuccess}
      />
      <RejectDialog
        open={openRejectDialog}
        onOpenChange={setOpenRejectDialog}
        approvalId={approval.id}
        isPrintRequest={false}
        onSuccess={actions.handleSuccess}
      />
    </Layout>
  );
}
