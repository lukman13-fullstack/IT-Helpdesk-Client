import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  yesText,
  noText,
  onYes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  yesText: string;
  noText: string;
  onYes: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{noText}</Button>
          </DialogClose>
          <Button onClick={onYes}>{yesText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
