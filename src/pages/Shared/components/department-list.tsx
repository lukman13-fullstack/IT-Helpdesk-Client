import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Grid3x3,
  List,
  FolderOpen,
  Folder,
  FileText,
  BookOpen,
  ChevronRight,
  Building2,
  Search as SearchIcon,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { asyncGetDepartmentsActionCreator } from "@/store/departments/action";
import PaginationComponent from "@/components/common/Pagination";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import ViewIndexDialog from "./ViewIndexDialog";
import { Badge } from "@/components/ui/badge";

type ViewMode = "card" | "list" | "folder";

export default function DepartmentList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);

  const { departments, pagination } = useAppSelector((state) => state.departments);

  const currentPage = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 100;
  const searchQuery = searchParams.get("q") || "";
  const viewMode = (searchParams.get("view") as ViewMode) || "card";

  useEffect(() => {
    dispatch(asyncGetDepartmentsActionCreator(currentPage, limit, searchQuery));
  }, [dispatch, currentPage, limit, searchQuery]);

  useEffect(() => {
    if (departments.length > 0) {
      const timer = setTimeout(() => setIsLoaded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [departments]);

  const currentItems = departments;
  const totalPages = pagination?.totalPages || 1;

  const handleViewChange = (mode: ViewMode) => {
    setSearchParams((prev) => {
      prev.set("view", mode);
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/30">
      {/* Refined Modern Header */}
      <Card className="mb-8 overflow-hidden border-slate-200 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div className="h-1 w-full bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
        
        <div className="px-6 py-5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary shadow-inner">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 font-modern">
                  Documents Departments
                </h1>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  list of all shared documents department
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-bold bg-primary/10 text-primary border-0">
                    {pagination?.total || 0} total
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:min-w-[240px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchParams(
                      (prev) => {
                        prev.set("q", e.target.value);
                        prev.set("page", "1");
                        return prev;
                      },
                      { replace: true }
                    );
                  }}
                  placeholder="Search departments..."
                  className="h-10 border-slate-200 bg-slate-50/50 pl-10 text-sm focus:bg-white transition-all rounded-xl"
                />
              </div>

              <div className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/50 p-1">
                {[
                  { id: "card", icon: Grid3x3, label: "Card" },
                  { id: "list", icon: List, label: "List" },
                  { id: "folder", icon: Folder, label: "Folder" },
                ].map((mode) => (
                  <Button
                    key={mode.id}
                    onClick={() => handleViewChange(mode.id as ViewMode)}
                    variant={viewMode === mode.id ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-8 gap-2 rounded-lg px-3 text-xs font-semibold transition-all duration-300",
                      viewMode === mode.id 
                        ? "shadow-sm" 
                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                    )}
                  >
                    <mode.icon className="h-3.5 w-3.5" />
                    <span>{mode.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-5 opacity-50" />

          {/* Master Index Access Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
             <ViewIndexDialog
                trigger={
                  <Button
                    variant="outline"
                    className="h-9 gap-2 border-primary/20 bg-primary/[0.02] text-primary hover:bg-primary hover:text-white rounded-full transition-all text-xs font-bold px-4 shadow-sm"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    View Global Master Index
                  </Button>
                }
              />
              <span className="text-[11px] font-medium text-slate-400">
                Click to view index for all departments
              </span>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="relative">
        {viewMode === "card" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {currentItems.map((dept, index) => (
              <PremiumCard key={dept.id} dept={dept} index={index} isLoaded={isLoaded} navigate={navigate} />
            ))}
          </div>
        )}

        {viewMode === "list" && (
          <ListView items={currentItems} isLoaded={isLoaded} navigate={navigate} />
        )}

        {viewMode === "folder" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {currentItems.map((dept, index) => (
              <FolderItem key={dept.id} dept={dept} index={index} isLoaded={isLoaded} navigate={navigate} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {currentItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <SearchIcon className="h-10 w-10 opacity-20" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 font-modern">No departments found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search query.</p>
          </div>
        )}

        {/* Pagination Container */}
        <div className="mt-12 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 pl-2">
             <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-900">{currentItems.length}</span> departments
            </p>
          </div>
          <PaginationComponent
            limit={limit}
            limitChange={(newLimit) => {
              setSearchParams((prev) => {
                prev.set("limit", String(newLimit));
                prev.set("page", "1");
                return prev;
              });
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setSearchParams((prev) => {
                prev.set("page", String(page));
                return prev;
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

// --- Sub-components with refined styling ---

function PremiumCard({ dept, index, isLoaded, navigate }: { dept: any; index: number; isLoaded: boolean; navigate: any }) {
  const departmentColors = [
    { primary: "text-emerald-600", bg: "bg-emerald-50" },
    { primary: "text-blue-600", bg: "bg-blue-50" },
    { primary: "text-indigo-600", bg: "bg-indigo-50" },
    { primary: "text-amber-600", bg: "bg-amber-50" },
    { primary: "text-rose-600", bg: "bg-rose-50" },
    { primary: "text-cyan-600", bg: "bg-cyan-50" },
  ];
  const color = departmentColors[index % departmentColors.length];

  return (
    <Card
      onClick={() => navigate(`/shared-documents/departments/${dept.id}`)}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden border-slate-200 bg-white cursor-pointer transition-all duration-500",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-slate-200/50",
        isLoaded ? "animate-fade-in-up" : "opacity-0"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", color.bg, color.primary)}>
            <FolderOpen className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="h-5 border-slate-100 bg-slate-50/50 px-2 text-[10px] font-bold text-slate-400">
            {dept.departmentCode}
          </Badge>
        </div>
        <h3 className="mb-2 line-clamp-1 text-sm font-bold text-slate-800 transition-colors group-hover:text-primary">
          {dept.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <FileText className="h-3 w-3 opacity-60" />
          <span>{dept._count?.documents || 0} items</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/20 px-5 py-3 transition-colors group-hover:bg-slate-50/50">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-primary/70">Open Directory</span>
        <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-primary" />
      </div>
    </Card>
  );
}

function ListView({ items, isLoaded, navigate }: { items: any[]; isLoaded: boolean; navigate: any }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", isLoaded ? "animate-scale-in" : "opacity-0")}>
      {items.map((dept, index) => (
        <div
          key={dept.id}
          onClick={() => navigate(`/shared-documents/departments/${dept.id}`)}
          className={cn(
            "group flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3.5 last:border-0 cursor-pointer transition-all duration-300 hover:bg-slate-50/40",
            isLoaded ? "animate-slide-in-right" : "opacity-0"
          )}
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all group-hover:bg-primary group-hover:text-white">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{dept.name}</h4>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{dept.departmentCode}</span>
                <span className="opacity-30">•</span>
                <span>{dept._count?.documents || 0} documents</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-primary" />
        </div>
      ))}
    </div>
  );
}

function FolderItem({ dept, index, isLoaded, navigate }: { dept: any; index: number; isLoaded: boolean; navigate: any }) {
  return (
    <div
      onClick={() => navigate(`/shared-documents/departments/${dept.id}`)}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 cursor-pointer transition-all duration-400 hover:border-primary/20 hover:shadow-md",
        isLoaded ? "animate-fade-in-up" : "opacity-0"
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
       <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-primary/5 group-hover:text-primary">
          <Folder className="h-6 w-6 fill-current opacity-20 group-hover:opacity-40" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{dept.name}</h4>
        <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Badge variant="secondary" className="h-4 bg-slate-100 text-[9px] text-slate-500 border-0">{dept.departmentCode}</Badge>
          <span>•</span>
          <span>{dept._count?.documents || 0} documents</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-primary opacity-0 group-hover:opacity-100" />
    </div>
  );
}
