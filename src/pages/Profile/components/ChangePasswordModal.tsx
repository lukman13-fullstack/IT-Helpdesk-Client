import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { notify } from "@/lib/toast";
import { useDispatch } from "react-redux";
import { asyncChangePassword } from "@/store/authUser/action";
import type { AppDispatch } from "@/store";

export default function ChangePasswordModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [shakeInputs, setShakeInputs] = useState(false); // State to trigger shake animation
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShakeInputs(false);
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = null;
    }
  };

  const triggerShake = () => {
    setShakeInputs(true);
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
    shakeTimeoutRef.current = setTimeout(() => {
      setShakeInputs(false);
      shakeTimeoutRef.current = null;
    }, 500);
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      notify.error("All fields are required.");
      triggerShake();
      return;
    } else if (newPassword !== confirmNewPassword) {
      notify.error("New password and confirm new password do not match");
      triggerShake();
      return;
    } else if (newPassword === oldPassword) {
      notify.error("New password and old password cannot be the same");
      triggerShake();
      return;
    } else if (newPassword.length < 6) {
      notify.error("New password must be at least 6 characters long");
      triggerShake();
      return;
    } else {
      setIsOpenConfirm(true);
      onOpenChange(false);
    }
  };

  const handleConfirmChangePassword = () => {
    setIsOpenConfirm(false);

    setTimeout(() => {
      dispatch(asyncChangePassword({ oldPassword, newPassword }));
      resetForm();
    }, 300);
  };

  const handleCancel = () => {
    setIsOpenConfirm(false);
    onOpenChange(true);
  };

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val) {
            resetForm();
          }
          onOpenChange(val);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <Input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className={shakeInputs ? "shake-animation" : ""}
          />
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={shakeInputs ? "shake-animation" : ""}
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className={shakeInputs ? "shake-animation" : ""}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleChangePassword}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isOpenConfirm} onOpenChange={setIsOpenConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Change Password</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to change your password?</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleConfirmChangePassword}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
