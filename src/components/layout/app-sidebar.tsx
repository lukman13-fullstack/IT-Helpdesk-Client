import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Settings,
  User,
  Users2,
  ChevronDown,
  ChevronUp,
  Book,
  FolderSync,
  Files,
  Shield,
  Share2,
  Trash,
  BookMarked,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useLanguage } from "@/context/LanguageContext";

interface SidebarItem {
  title: string;
  url: string;
  icon?: React.ComponentType<any>;
  permission?: string;
}

interface CollapsibleGroup {
  title: string;
  permission?: string;
  icon: React.ComponentType<any>;
  subItems: SidebarItem[];
}

export function AppSidebar() {
  const { t } = useLanguage();

  const mainItems: SidebarItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: CheckCircle2,
    },
  ];

  const collapsibleGroups: CollapsibleGroup[] = [
    {
      title: "Master Data",
      icon: Settings,
      permission: "MANAGE_USERS", // or create specific permissions
      subItems: [
        { title: "Users", url: "/users", icon: User, permission: "MANAGE_USERS" },
        { title: "Roles", url: "/roles", icon: Shield, permission: "MANAGE_ROLES" },
        { title: "Departments", url: "/departments", icon: Users2, permission: "MANAGE_DEPARTMENTS" },
        { title: "Ticket Categories", url: "/ticket-categories", icon: FolderSync },
      ],
    },
  ];

  const location = useLocation();
  const navigate = useNavigate();
  const authUser = useAppSelector((state) => state.authUser.user);
  const { state: sidebarState, setOpen } = useSidebar();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("sidebarOpenGroups");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpenGroups", JSON.stringify(openGroups));
  }, [openGroups]);

  useEffect(() => {
    if (sidebarState === "collapsed") {
      setOpenGroups({});
    }
  }, [sidebarState]);

  const isActive = (path: string) => {
    const { pathname } = location;
    
    // If exact match, it's definitely active
    if (pathname === path) return true;
    
    // Prevent parent paths from being active when a specific sub-menu item is active
    if (path === "/records" && pathname.startsWith("/records/approvals")) return false;
    if (path === "/documents" && pathname.startsWith("/documents/migrate")) return false;
    
    // Otherwise, use prefix matching for detail pages, etc.
    return pathname.startsWith(`${path}/`);
  };

  const hasPermission = (permission?: string): boolean => {
    if (!authUser) return false;
    if (!permission) return true;
    if (permission.toUpperCase() === "ALL") return true;

    const userPermissions = authUser.role.permissions.map(
      (p) => p.permission.name
    );

    return userPermissions.includes(permission);
  };

  const checkGroupPermission = (group: CollapsibleGroup): boolean => {
    if (group.permission && !hasPermission(group.permission)) {
      return false;
    }

    return group.subItems.some((subItem) => hasPermission(subItem.permission));
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/50 pb-2">
        <div className="flex items-center gap-3 px-2 py-3 bg-gradient-to-r from-primary/10 to-transparent rounded-lg m-1 border border-primary/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <img src="/pwa-192x192.png" alt="Logo" className="h-9 w-9 object-contain" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-bold text-sm tracking-tight text-sidebar-foreground">IT Helpdesk</span>
            <span className="text-[10px] font-medium text-primary">Administration</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.application")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {collapsibleGroups.map((group) => {
                // Check if user has permission to see this group
                if (!checkGroupPermission(group)) return null;

                const isOpen = openGroups[group.title] ?? false;

                return (
                  <Collapsible
                    key={group.title}
                    open={isOpen}
                    onOpenChange={(open) =>
                      setOpenGroups((prev) => ({
                        ...prev,
                        [group.title]: open,
                      }))
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          tooltip={group.title}
                          onClick={() => {
                            if (sidebarState === "collapsed") {
                              setOpen(true);
                            }
                          }}
                        >
                          <group.icon />
                          <span>{group.title}</span>
                          {sidebarState === "expanded" && (
                            <div className="ml-auto">
                              {openGroups[group.title] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="animate-in ml-3.5 border-l-2 border-l-muted-foreground">
                      {group.subItems
                        .filter((subItem) => hasPermission(subItem.permission))
                        .map((subItem) => (
                          <SidebarMenuItem
                            className="text-xs ml-4"
                            key={subItem.title}
                          >
                            <SidebarMenuButton
                              onClick={() => navigate(subItem.url)}
                              isActive={isActive(subItem.url)}
                              tooltip={subItem.title}
                            >
                              {subItem.icon && <subItem.icon />}
                              <span>{subItem.title}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
