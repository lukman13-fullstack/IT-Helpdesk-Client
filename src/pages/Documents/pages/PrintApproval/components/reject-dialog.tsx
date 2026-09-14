import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { rejectPrintRequest } from "@/services/api/documents";
import { useState } from "react";
import { notify } from "@/lib/toast";

export default function RejectDialog({
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
  const [reason, setReason] = useState("");

  const handleReject = async () => {
    try {
      setLoading(true);
      await rejectPrintRequest(approvalId, reason);
      notify.success("Print request rejected successfully");
      onSuccess();
      onOpenChange(false);
      setReason("");
    } catch (error) {
      console.error("Error rejecting print request:", error);
      notify.error("Failed to reject print request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Print Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Enter reject reason"
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
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleReject} disabled={loading} variant="destructive">
            {loading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
