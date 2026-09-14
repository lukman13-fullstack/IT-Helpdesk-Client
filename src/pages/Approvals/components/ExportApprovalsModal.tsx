import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { asyncGetDepartmentsActionCreator } from "@/store/departments/action";
import { exportApprovalsToExcel } from "@/lib/exportApprovalsToExcel";
import { exportQaPerformanceToExcel } from "@/lib/exportQaPerformanceToExcel";
import { ApprovalRequest } from "@/services/api/types/documents.types";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";

export default function ExportApprovalsModal({
  open,
  onOpenChange,
  approvals,
  hideDepartmentFilter,
  dynamicLevels,
  exportType = "standard",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvals: ApprovalRequest[];
  hideDepartmentFilter?: boolean;
  dynamicLevels?: any[];
  exportType?: "standard" | "qa-performance" | "qa-time-performance";
}) {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { departments } = useAppSelector((state) => state.departments);
  
  const [departmentId, setDepartmentId] = useState<string>("all");
  const [slaStatus, setSlaStatus] = useState<string>("all");
  const [approvalStage, setApprovalStage] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (open && departments.length === 0) {
      dispatch(asyncGetDepartmentsActionCreator(1, 100));
    }
  }, [open, dispatch, departments.length]);

  const handleExport = async () => {
    setIsExporting(true);
    
    // Filter approvals
    let filteredApprovals = [...approvals];

    if (departmentId !== "all") {
      filteredApprovals = filteredApprovals.filter(
        (a) => a.document?.department?.id === Number(departmentId)
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filteredApprovals = filteredApprovals.filter((a) => {
        const date = new Date(a.createdAt);
        return date >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredApprovals = filteredApprovals.filter((a) => {
        const date = new Date(a.createdAt);
        return date <= end;
      });
    }

    if ((exportType === "standard" || exportType === "qa-time-performance") && slaStatus !== "all") {
      filteredApprovals = filteredApprovals.filter((a) => {
        if (!a.createdAt) return false;
        const start = new Date(a.createdAt);
        const end = a.approvedAt ? new Date(a.approvedAt) : new Date();
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (slaStatus === "within3") return diffDays <= 3;
        if (slaStatus === "over3") return diffDays > 3;
        return true;
      });
    }

    if (exportType === "qa-performance") {
      let targetLvl = 1;
      if (approvalStage === "qa") {
        targetLvl = 1;
      } else if (approvalStage.startsWith("lev")) {
        targetLvl = parseInt(approvalStage.replace("lev", ""));
      }

      filteredApprovals = filteredApprovals.map((a) => {
        if (approvalStage === "pending") {
          let pendingStep: any = undefined;
          let currentLevel = 1;
          
          if (a.document?.approvalProgress?.steps) {
             pendingStep = a.document.approvalProgress.steps.find((s: any) => s.status === "pending");
             if (pendingStep) {
               if (pendingStep.title?.toLowerCase().includes("qa") || pendingStep.title?.toLowerCase().includes("lvl 0")) {
                 currentLevel = 1;
               } else {
                 const match = pendingStep.title?.match(/lvl (\d+)/i) || pendingStep.title?.match(/level (\d+)/i);
                 if (match && match[1]) {
                   currentLevel = parseInt(match[1]) + 1;
                 }
               }
               return {
                 ...a,
                 level: currentLevel,
                 status: "pending",
                 approver: { ...a.approver, fullName: pendingStep.approverName } as any,
                 reason: a.reason,
               };
             }
          }
          
          if (!pendingStep && a.document?.approvals) {
            const pendingApp = a.document.approvals.find((app: any) => app.status === "pending" && (app.type === "approval" || app.type === "revision"));
            if (pendingApp) {
              return {
                ...a,
                level: pendingApp.level,
                status: "pending",
                approver: pendingApp.approver || { fullName: "Unknown" } as any,
                reason: a.reason,
              };
            }
          }
          
          return { ...a, level: -1 }; 
        }
        let extractedReason = a.reason;
        let matchedApproval = undefined;

        if (a.document?.approvals) {
          matchedApproval = a.document.approvals.find((app: any) => app.level === targetLvl);
          if (matchedApproval && matchedApproval.reason) {
            extractedReason = matchedApproval.reason;
          }
        }

        // Try approvalProgress first
        if (a.document?.approvalProgress?.steps) {
          const steps = a.document.approvalProgress.steps;
          
          let matchedStep = steps.find((s: any) => {
            if (targetLvl === 1) return s.title?.toLowerCase().includes("qa") || s.title?.toLowerCase().includes("lvl 0");
            const searchLvl = targetLvl - 1;
            return s.title?.toLowerCase().includes(`lvl ${searchLvl}`) || s.title?.toLowerCase().includes(`level ${searchLvl}`);
          });
          
          if (!matchedStep) {
            matchedStep = steps[targetLvl - 1]; // Fallback to index
          }
          
          if (matchedStep) {
            return {
              ...a,
              level: targetLvl,
              status: matchedStep.status as any,
              approver: { ...a.approver, fullName: matchedStep.approverName } as any,
              reason: extractedReason || a.reason,
            };
          }
        }
        
        // Fallback to a.document.approvals
        if (matchedApproval) {
          return {
            ...a,
            level: targetLvl,
            status: matchedApproval.status as any,
            approver: matchedApproval.approver || { fullName: "Unknown" } as any,
            reason: extractedReason || a.reason,
          };
        }

        return { ...a, level: targetLvl, status: "pending" as any, reason: extractedReason || a.reason }; 
      }).filter((a) => {
        if (a.level === -1) return false;
        
        if (approvalStage === "all") {
          return true;
        } else if (approvalStage === "qa") {
          return a.level === 1 || a.level === 0;
        } else if (approvalStage === "pending") {
          return a.status === "pending";
        } else if (approvalStage.startsWith("lev")) {
          return a.level === targetLvl;
        }
        return true;
      });
    }

    try {
      if (exportType === "qa-performance") {
        await exportQaPerformanceToExcel(filteredApprovals, "QA_Performance_Export", false);
      } else if (exportType === "qa-time-performance") {
        await exportQaPerformanceToExcel(filteredApprovals, "QA_Time_Performance_Export", true);
      } else {
        await exportApprovalsToExcel(filteredApprovals);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("approvals.export.title") || "Export Approvals"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!hideDepartmentFilter && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="department">{t("approvals.export.department") || "Department"}</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("approvals.export.allDepartments") || "All Departments"}</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id?.toString() || ""}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {exportType === "standard" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="slaStatus">{t("approvals.export.slaStatus") || "SLA Status"}</Label>
              <Select value={slaStatus} onValueChange={setSlaStatus}>
                <SelectTrigger id="slaStatus">
                  <SelectValue placeholder="Select SLA Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("approvals.export.allSla") || "All Statuses"}</SelectItem>
                  <SelectItem value="within3">{t("approvals.export.within3Days") || "Within 3 Days"}</SelectItem>
                  <SelectItem value="over3">{t("approvals.export.over3Days") || "Over 3 Days"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="approvalStage">{t("approvals.export.approvalStage") || "Approval Stage"}</Label>
              <Select value={approvalStage} onValueChange={setApprovalStage}>
                <SelectTrigger id="approvalStage">
                  <SelectValue placeholder="Select Approval Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("approvals.export.allStages") || "All Stages"}</SelectItem>
                  <SelectItem value="qa">{t("approvals.export.qaApprove") || "QA Approve"}</SelectItem>
                  {dynamicLevels?.map((lvl) => {
                    return (
                      <SelectItem key={`lev${lvl.level}`} value={`lev${lvl.level}`}>
                        Level {lvl.level - 1} Approv
                      </SelectItem>
                    );
                  })}
                  <SelectItem value="pending">Outstanding Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="startDate">{t("approvals.export.startDate") || "Start Date"}</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="endDate">{t("approvals.export.endDate") || "End Date"}</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("approvals.export.button") || "Export Excel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
