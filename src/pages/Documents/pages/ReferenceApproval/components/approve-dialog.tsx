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
import { asyncApproveReferenceCheckActionCreator } from "@/store/referenceApprovals/action";

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkId: number;
  onSuccess: () => void;
}

export default function ApproveDialog({
  open,
  onOpenChange,
  checkId,
  onSuccess,
}: ApproveDialogProps) {
  const dispatch = useAppDispatch();
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(asyncApproveReferenceCheckActionCreator(checkId, comments));
      setComments("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Reference Check</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve this reference check? The document uploader will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comments">Comments (Optional)</Label>
            <Textarea
              id="comments"
              placeholder="Add any comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[100px] w-full break-words whitespace-pre-wrap break-all"
            />
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
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
