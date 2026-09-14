import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { asyncApproveDocumentActionCreator } from "@/store/approvals/action";
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
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalId: string | number;
  isPrintRequest?: boolean;
  isReferenceCheck?: boolean;
  originalId?: number;
  onSuccess?: () => void;
}) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.approvals);
  const [reason, setReason] = useState("");

  const handleApprove = async () => {
    // Close dialog immediately and reset state
    const currentReason = reason;
    setReason(""); // Reset reason state
    onOpenChange(false); // Close dialog immediately
    
    try {
      if (isReferenceCheck && originalId) {
        const response = await approveReferenceCheck(originalId, currentReason);
        if (response.success) {
          notify.success("Reference check approved successfully");
          if (onSuccess) {
            onSuccess();
          }
        }
      } else {
        await dispatch(
          asyncApproveDocumentActionCreator(
            approvalId,
            { comments: currentReason },
            isPrintRequest
          )
        );
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error approving:", error);
    }
  };

  const isLoading = loading;

  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading && !newOpen) return;
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReferenceCheck
              ? "Approve Reference Check"
              : isPrintRequest
              ? "Approve Print Request"
              : "Approve Document"}
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
