import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { asyncApproveBatchDocumentsActionCreator } from "@/store/approvals/action";

interface BatchApprovalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string | null;
  pendingApprovals: any[];
  onSuccess: () => void;
}

export default function BatchApprovalModal({
  isOpen,
  onOpenChange,
  batchId,
  pendingApprovals,
  onSuccess,
}: BatchApprovalModalProps) {
  const dispatch = useAppDispatch();
  const [isApproving, setIsApproving] = useState(false);
  const [batchDocuments, setBatchDocuments] = useState<any[]>([]);

  // Filter documents that belong to this batch using the explicit batchId property
  useEffect(() => {
    if (isOpen && batchId && pendingApprovals.length > 0) {
      const batchTimestamp = parseInt(batchId, 10);
      
      // Find all pending approvals that match this specific batchId
      const matchingDocs = pendingApprovals.filter((a) => {
        if (a.status !== "pending") return false;

        // 1. Primary Filter: Match explicit batchId column
        if (a.batchId && String(a.batchId) === String(batchId)) {
          return true;
        }

        // 2. Fallback: Match timestamp window (within 30 seconds of the batchId timestamp)
        // This handles older records or cases where batchId wasn't explicitly persisted
        if (batchTimestamp > 0) {
          const docTimestamp = new Date(a.createdAt).getTime();
          return Math.abs(docTimestamp - batchTimestamp) <= 30000;
        }

        return false;
      });

      setBatchDocuments(matchingDocs);
    }
  }, [isOpen, batchId, pendingApprovals]);

  const handleApproveAll = async () => {
    if (batchDocuments.length === 0) return;
    
    setIsApproving(true);
    try {
      const ids = batchDocuments.map((doc) => doc.id);
      await dispatch(asyncApproveBatchDocumentsActionCreator(ids));
      onSuccess();
      onOpenChange(false);
      
      // Clean up URL to remove batchId after successful approval
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("Failed to approve batch:", error);
    } finally {
      setIsApproving(false);
    }
  };


  if (!batchId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Batch Migration Approval
          </DialogTitle>
          <DialogDescription>
            You have {batchDocuments.length} pending documents from a recent mass migration.
            You can review them below and approve all of them at once.
          </DialogDescription>
        </DialogHeader>

        {batchDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg">
            <AlertCircle className="w-10 h-10 text-muted-foreground mb-3 shadow-md" />
            <p className="text-muted-foreground font-medium">No pending documents found for this batch.</p>
            <p className="text-xs text-muted-foreground mt-1">They may have already been approved.</p>
          </div>
        ) : (
          <ScrollArea className={`flex-grow border rounded-md p-4 bg-muted/10 ${batchDocuments.length > 3 ? "h-[320px]" : ""}`}>
            <div className="space-y-4">
              {batchDocuments.map((approval) => (
                <div 
                  key={approval.id} 
                  className="flex items-center justify-between p-3 bg-card border shadow-sm rounded-lg"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {approval.document?.documentCode || "N/A"}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {approval.document?.category}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {approval.document?.name}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      By {approval.createdByName || approval.document?.uploader?.fullName || "System"}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="mt-4 gap-2 sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isApproving}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleApproveAll}
            disabled={isApproving || batchDocuments.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isApproving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Approve All ({batchDocuments.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
