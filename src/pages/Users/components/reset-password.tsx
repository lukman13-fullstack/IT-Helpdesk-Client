import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AsyncResetPasswordActionCreator } from "@/store/users/action";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ResetPassword({
  id,
  isOpen,
  onOpenChange,
}: {
  id: number | string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const handleResetPassword = () => {
    dispatch(AsyncResetPasswordActionCreator(id, password));
    onOpenChange(false);
    setPassword("");
  };
  const [password, setPassword] = useState<string>("");
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription> Reset password for user </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="New Password"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="default" onClick={() => handleResetPassword()}>
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
