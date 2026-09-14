import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { asyncApproveDocumentActionCreator, asyncGetApprovalRequestsActionCreator } from "@/store/approvals/action";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useState } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { approveReferenceCheck } from "@/services/api/referenceApprovals";
import { notify } from "@/lib/toast";

export default function ApproveDialog({
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

  const handleApprove = async () => {
    try {
      if (isReferenceCheck && originalId) {
        setSubmitting(true);
        const response = await approveReferenceCheck(originalId, reason);
        if (response.success) {
          notify.success("Reference check approved successfully");
          onOpenChange(false);
          // Refresh data seamlessly
          dispatch(asyncGetApprovalRequestsActionCreator());
        }
      } else {
        await dispatch(
          asyncApproveDocumentActionCreator(approvalId, { comments: reason }, isPrintRequest)
        );
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error approving:", error);
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
            {isReferenceCheck ? "Approve Reference Check" : "Approve Document"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Enter approval reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] w-full break-words whitespace-pre-wrap break-all"
            />
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
          <Button onClick={handleApprove} disabled={isLoading}>
            {isLoading ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
