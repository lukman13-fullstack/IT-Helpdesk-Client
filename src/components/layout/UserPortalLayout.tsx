import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { asyncLogout } from "@/store/authUser/action";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Ticket, User as UserIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import PopoverProfile from "./profile";
import NotificationDropdown from "@/components/common/NotificationDropdown";

interface UserPortalLayoutProps {
  children: React.ReactNode;
}

export default function UserPortalLayout({ children }: UserPortalLayoutProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    dispatch(asyncLogout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/portal" className="flex items-center gap-2">
              <img src="/pwa-192x192.png" alt="IT Helpdesk" className="h-8" />
              <span className="font-bold text-lg hidden sm:inline-block">
                IT Portal
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link to="/portal">
                <Button variant="ghost" className="h-9 gap-2">
                  <Home className="h-4 w-4" /> Home
                </Button>
              </Link>
              <Link to="/portal/tickets">
                <Button variant="ghost" className="h-9 gap-2">
                  <Ticket className="h-4 w-4" /> My Tickets
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <NotificationDropdown />
            <PopoverProfile />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground mt-auto bg-white/50 dark:bg-black/50">
        <p>Copyright © 2026 PT. Toyo Ink Indonesia. All rights reserved.</p>
      </footer>
    </div>
  );
}
