import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, ClipboardList, BookOpen, Building2 } from "lucide-react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { getDepartments } from "@/services/api/departments";
import { useLanguage } from "@/context/LanguageContext";

interface ViewIndexDialogProps {
  departmentId?: string | number;
  trigger?: React.ReactNode;
}

export default function ViewIndexDialog({
  departmentId,
  trigger,
}: ViewIndexDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [indexType, setIndexType] = useState<"master" | "form">("master");
  const [documentType, setDocumentType] = useState<"internal" | "external">(
    "internal"
  );
  const { t } = useLanguage();

  // Get auth user to detect QA user
  const user = useAppSelector((state: any) => state.authUser?.user);

  const isQAUser = user?.departments?.some((dept: any) => {
    const deptName =
      typeof dept === "string"
        ? dept
        : dept?.departmentCode ||
          dept?.department?.departmentCode ||
          dept?.name ||
          "";
    return (
      deptName.toLowerCase().includes("qa") ||
      deptName.toLowerCase().includes("quality assurance")
    );
  });

  // Department list fetched from API for QA users
  const [allDepartments, setAllDepartments] = useState<
    { id: number; name: string; departmentCode: string }[]
  >([]);

  // Selected department for QA user — default to the passed departmentId
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    departmentId?.toString() || ""
  );

  // Fetch all departments when dialog opens for QA user
  useEffect(() => {
    if (open && isQAUser && allDepartments.length === 0) {
      getDepartments(1, 100)
        .then((res) => {
          const depts = res.departments.map((d: any) => ({
            id: typeof d.id === "string" ? parseInt(d.id) : d.id,
            name: d.name,
            departmentCode: d.departmentCode,
          }));
          setAllDepartments(depts);
        })
        .catch((err) => {
          console.error("Failed to fetch departments:", err);
        });
    }
  }, [open, isQAUser]);

  // Reset selectedDeptId when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setSelectedDeptId(departmentId?.toString() || "");
    }
  };

  const handleOpenIndex = () => {
    let basePath: string;

    if (indexType === "master" && documentType === "external") {
      // External documents have their own dedicated page
      basePath = "/shared-documents/external-master-index";
    } else if (indexType === "master") {
      basePath = "/shared-documents/master-index";
    } else {
      basePath = "/shared-documents/form-master-index";
    }

    const params = new URLSearchParams();

    // Use selected department ID (QA user can pick any dept), fallback to prop
    const finalDeptId =
      isQAUser && selectedDeptId
        ? selectedDeptId
        : departmentId?.toString();

    if (finalDeptId) {
      params.append("departmentId", finalDeptId);
    }

    // Only add isInternal param for non-external master index
    if (!(indexType === "master" && documentType === "external")) {
      params.append("isInternal", (documentType === "internal").toString());
    }

    const queryString = params.toString();
    const targetUrl = `${basePath}${queryString ? `?${queryString}` : ""}`;

    // Close dialog first, then defer navigation to allow Radix portal to fully
    // unmount before React processes the route change (prevents removeChild error)
    setOpen(false);
    setTimeout(() => {
      navigate(targetUrl);
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            {t("viewIndex.viewIndexLabel")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("viewIndex.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("viewIndex.dialogDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Index Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("viewIndex.indexType")}
            </Label>
            <RadioGroup
              value={indexType}
              onValueChange={(val) => setIndexType(val as "master" | "form")}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="master"
                  id="master-index"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="master-index"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-aria-checked:border-primary [&:has([aria-checked=true])]:border-primary cursor-pointer"
                >
                  <FileText className="mb-2 h-6 w-6" />
                  <span className="text-xs font-medium">{t("viewIndex.masterIndex")}</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="form"
                  id="form-index"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="form-index"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-aria-checked:border-primary [&:has([aria-checked=true])]:border-primary cursor-pointer"
                >
                  <ClipboardList className="mb-2 h-6 w-6" />
                  <span className="text-xs font-medium">{t("viewIndex.formIndex")}</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Document Category */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("viewIndex.documentCategory")}
            </Label>
            <RadioGroup
              value={documentType}
              onValueChange={(val) =>
                setDocumentType(val as "internal" | "external")
              }
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="internal"
                  id="internal-docs"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="internal-docs"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-aria-checked:border-primary [&:has([aria-checked=true])]:border-primary cursor-pointer"
                >
                  <span className="text-sm font-bold mb-1">{t("viewIndex.internal")}</span>
                  <span className="text-[10px] text-muted-foreground text-center">
                    {t("viewIndex.internalDesc")}
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="external"
                  id="external-docs"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="external-docs"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-aria-checked:border-primary [&:has([aria-checked=true])]:border-primary cursor-pointer"
                >
                  <span className="text-sm font-bold mb-1">{t("viewIndex.external")}</span>
                  <span className="text-[10px] text-muted-foreground text-center">
                    {t("viewIndex.externalDesc")}
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Department Selector — dropdown for QA users */}
          {isQAUser && allDepartments.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t("viewIndex.department")}
              </Label>
              <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {allDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{dept.departmentCode || dept.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleOpenIndex} className="w-full">
            {t("viewIndex.viewSelectedIndex")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
