import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { approvePrintRequest } from "@/services/api/documents";
import { useState } from "react";
import { notify } from "@/lib/toast";

export default function ApproveDialog({
  open,
  onOpenChange,
  approvalId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalId: string | number;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      await approvePrintRequest(approvalId);
      notify.success("Print request approved successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error approving print request:", error);
      notify.error("Failed to approve print request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Print Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve this print request?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={loading}>
            {loading ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
