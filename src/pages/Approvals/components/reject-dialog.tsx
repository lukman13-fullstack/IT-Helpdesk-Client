import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { asyncRejectDocumentActionCreator } from "@/store/approvals/action";
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
  const [error, setError] = useState("");

  const handleReject = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    
    // Close dialog immediately and reset state
    const currentReason = reason;
    setError("");
    setReason(""); // Reset reason state
    onOpenChange(false); // Close dialog immediately

    try {
      if (isReferenceCheck && originalId) {
        const response = await rejectReferenceCheck(originalId, currentReason);
        if (response.success) {
          notify.success("Reference check rejected");
          if (onSuccess) {
            onSuccess();
          }
        }
      } else {
        await dispatch(
          asyncRejectDocumentActionCreator(
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
      console.error("Error rejecting:", error);
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
              ? "Reject Reference Check"
              : isPrintRequest
              ? "Reject Print Request"
              : "Reject Document"}
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
            {error && <p className="text-sm text-destructive">{error}</p>}
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
          <Button
            onClick={handleReject}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
