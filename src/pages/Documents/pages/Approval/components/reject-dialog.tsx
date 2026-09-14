import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { asyncRejectDocumentActionCreator, asyncGetApprovalRequestsActionCreator } from "@/store/approvals/action";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useState } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { rejectReferenceCheck } from "@/services/api/referenceApprovals";
import { notify } from "@/lib/toast";

export default function RejectDialog({
  open,
  onOpenChange,
  approvalId,
  isPrintRequest = false,
  isReferenceCheck = false,
  originalId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalId: string | number;
  isPrintRequest?: boolean;
  isReferenceCheck?: boolean;
  originalId?: number;
}) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.approvals);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleReject = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    setError("");
    
    try {
      if (isReferenceCheck && originalId) {
        setSubmitting(true);
        const response = await rejectReferenceCheck(originalId, reason);
        if (response.success) {
          notify.success("Reference check rejected");
          onOpenChange(false);
          // Refresh data seamlessly
          dispatch(asyncGetApprovalRequestsActionCreator());
        }
      } else {
        await dispatch(
          asyncRejectDocumentActionCreator(approvalId, { comments: reason }, isPrintRequest)
        );
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error rejecting:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading && !newOpen) return;
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReferenceCheck ? "Reject Reference Check" : "Reject Document"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Enter reject reason (required)"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              className={`min-h-[100px] w-full break-words whitespace-pre-wrap break-all ${error ? "border-destructive" : ""}`}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleReject} disabled={isLoading} variant="destructive">
            {isLoading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
