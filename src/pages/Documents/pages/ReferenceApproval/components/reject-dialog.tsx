import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { asyncRejectReferenceCheckActionCreator } from "@/store/referenceApprovals/action";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkId: number;
  onSuccess: () => void;
}

export default function RejectDialog({
  open,
  onOpenChange,
  checkId,
  onSuccess,
}: RejectDialogProps) {
  const dispatch = useAppDispatch();
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleReject = async () => {
    if (!comments.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await dispatch(asyncRejectReferenceCheckActionCreator(checkId, comments));
      setComments("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Reference Check</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this reference check. The document uploader will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comments">
              Reason for Rejection <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="comments"
              placeholder="Please explain why this reference check is being rejected..."
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={isSubmitting}
            variant="destructive"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
