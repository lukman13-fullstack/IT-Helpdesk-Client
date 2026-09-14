import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { LogOut, User } from "lucide-react";
import { useAppSelector } from "@/hooks/useAppSelector";
import type { RootState } from "@/store";
import { asyncLogout } from "@/store/authUser/action";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

export default function PopoverProfile() {
  const authUser = useAppSelector((state: RootState) => state.authUser);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const handleLogout = () => {
    dispatch(asyncLogout());
  };
  const handleDialogLogout = () => {
    setOpen(true);
  };

  return (
    <div className="flex w-full justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-background hover:ring-primary/40 transition-all duration-300">
            <Avatar className="h-8 w-8">
              <AvatarImage alt="@shadcn" />
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-xs font-bold">
                {authUser?.user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 rounded-2xl shadow-xl border-muted/50 p-0 overflow-hidden" align="end">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary/5 to-transparent">
            <Avatar className="h-10 w-10 ring-2 ring-primary/15">
              <AvatarImage alt="@shadcn" />
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-sm font-bold">
                {authUser?.user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-sm font-bold truncate">
                {authUser?.user?.username}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {authUser?.user?.email}
              </p>
            </div>
          </div>
          <Separator />
          <div className="p-1.5">
            <Link className="flex items-center" to="/profile">
              <Button variant="ghost" className="w-full justify-start rounded-xl h-9 hover:bg-primary/5 hover:text-primary transition-colors duration-200">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Button
              onClick={handleDialogLogout}
              variant="ghost"
              className="w-full justify-start rounded-xl h-9 hover:bg-destructive/5 hover:text-destructive transition-colors duration-200"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("profile.logOut")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("profile.logout")}</DialogTitle>
            <DialogDescription>
              {t("profile.logoutConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl">{t("profile.cancel")}</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={handleLogout} className="rounded-xl">{t("profile.logout")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

