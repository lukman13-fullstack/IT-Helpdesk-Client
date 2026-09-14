import React, { ReactNode, useEffect, useRef, useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BreadcrumbItemType } from "@/types/breadcrumb";
import PopoverProfile from "./profile";
import NotificationPopover from "@/components/common/notification-popover";
import ThemeColorPicker from "@/components/common/theme-color-picker";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  items?: BreadcrumbItemType[];
}

const Layout: React.FC<LayoutProps> = ({ children, title, items = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const mainRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [pageKey, setPageKey] = useState(location.pathname);

  React.useEffect(() => {
    if (title) {
      document.title = `DMS | ${title}`;
    }
  }, [title]);

  // Reset page animation on route change
  useEffect(() => {
    setPageKey(location.pathname);
  }, [location.pathname]);

  // Scroll-reveal observer for parallax elements
  useScrollReveal();

  // Parallax scroll effect
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handleScroll = () => {
      setScrollY(main.scrollTop);
    };

    main.addEventListener("scroll", handleScroll, { passive: true });
    return () => main.removeEventListener("scroll", handleScroll);
  }, []);

  // Header parallax transforms
  const headerOpacity = Math.max(0.85, 1 - scrollY / 600);
  const headerBlur = Math.min(16, 6 + scrollY / 40);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-0">
        <header
          className="sticky top-0 z-50 flex h-14 items-center gap-4 px-4 lg:h-16 transition-all duration-300"
          style={{
            backdropFilter: `blur(${headerBlur}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${headerBlur}px) saturate(180%)`,
            backgroundColor: `color-mix(in srgb, var(--background) ${Math.round(headerOpacity * 100)}%, transparent)`,
            borderBottom: '1px solid color-mix(in srgb, var(--border) 40%, transparent)',
          }}
        >
          <SidebarTrigger />
          <div className="flex-1">
            <h1
              className="text-sm font-semibold transition-all duration-300"
              style={{
                transform: `translateY(${Math.min(scrollY * 0.02, 2)}px)`,
                opacity: Math.max(0.7, 1 - scrollY / 800),
              }}
            >
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <LanguageSwitcher />
            <NotificationPopover />
            <ThemeColorPicker />
            <PopoverProfile />
          </div>
        </header>
        {/* Animated gradient line under header */}
        <div
          className="h-[1px] w-full gradient-animated"
          style={{
            opacity: Math.min(0.6, scrollY / 200),
            transition: 'opacity 0.3s ease',
          }}
        />
        <main ref={mainRef} className="flex-1 px-5 overflow-auto overflow-x-hidden">
          <Breadcrumb className="mt-4">
            <BreadcrumbList>
              {items.map((item, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink
                    className="cursor-pointer hover:text-primary transition-colors duration-200"
                    onClick={() => navigate(item.href)}
                  >
                    {item.label}
                  </BreadcrumbLink>
                  {index < items.length - 1 && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              ))}
              {items.length > 0 && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="cursor-pointer text-primary font-medium">
                      {title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <div
            key={pageKey}
            className="container mx-auto py-6 page-entrance"
          >
            {children}
          </div>
        </main>
        <footer
          className="w-full text-center py-3 bg-background text-xs text-muted-foreground"
          style={{
            borderTop: '1px solid color-mix(in srgb, var(--border) 30%, transparent)',
          }}
        >
          <p>{t("layout.copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("layout.allRightsReserved")}</p>
          <p className="mt-1 font-semibold text-[10px] opacity-70">Project by Siti Nurjanah (QA) | Developer by Lukman Pirmansah (IT)</p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;

