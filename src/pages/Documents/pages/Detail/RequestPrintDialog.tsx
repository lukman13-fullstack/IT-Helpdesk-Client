import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RequestPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    reason: string;
    copies: number;
    storageLocation: string;
    isInternal: boolean;
    distribution: 'Internal' | 'External';
  }) => Promise<void>;
  documentName: string;
  documentCode: string;
  existingTypes?: { hasInternal: boolean; hasExternal: boolean };
}

export function RequestPrintDialog({
  open,
  onOpenChange,
  onSubmit,
  documentName,
  documentCode,
  existingTypes = { hasInternal: false, hasExternal: false },
}: RequestPrintDialogProps) {
  const { user } = useAppSelector((state) => state.authUser);
  const [reason, setReason] = useState("");
  const [copies, setCopies] = useState(1);
  const [storageLocation, setStorageLocation] = useState("");
  const [isInternal, setIsInternal] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);

  const isTypeForced = existingTypes.hasInternal || existingTypes.hasExternal;

  useEffect(() => {
    if (existingTypes.hasInternal && !existingTypes.hasExternal) {
      setIsInternal(false);
    } else if (existingTypes.hasExternal && !existingTypes.hasInternal) {
      setIsInternal(true);
    }
  }, [existingTypes]);

  const departmentName = user?.departments?.map((d: any) => typeof d === 'string' ? d : (d?.departmentCode || d?.department?.departmentCode || d?.name || '')).filter(Boolean).join(", ") || "-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ 
        reason, 
        copies, 
        storageLocation, 
        isInternal,
        distribution: isInternal ? 'Internal' : 'External'
      });
      onOpenChange(false);
      setReason("");
      setCopies(1);
      setStorageLocation("");
      setIsInternal(true);
    } catch (error) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Request Print Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info Section - Compact */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Requester</Label>
              <p className="font-medium truncate">{user?.fullName || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Department
              </Label>
              <p className="font-medium truncate">{departmentName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Document</Label>
              <p className="font-medium truncate">
                <span className="text-muted-foreground">{documentCode}</span>
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Document Name
              </Label>
              <p className="font-medium truncate">{documentName}</p>
            </div>
          </div>

          {/* Distribution - Compact */}
          <div className="space-y-2">
            <Label className="text-sm">
              Distribution <span className="text-red-500">*</span>
            </Label>
            {isTypeForced && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                ⚠️ Already have{" "}
                {existingTypes.hasInternal ? "Internal" : "External"} request.
              </p>
            )}
            <RadioGroup
              value={isInternal ? "internal" : "external"}
              onValueChange={(value: string) =>
                !isTypeForced && setIsInternal(value === "internal")
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="internal"
                  id="internal"
                  disabled={existingTypes.hasInternal}
                />
                <Label
                  htmlFor="internal"
                  className={`cursor-pointer text-sm ${
                    existingTypes.hasInternal ? "text-muted-foreground" : ""
                  }`}
                >
                  Internal PTI {existingTypes.hasInternal && "(Requested)"}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="external"
                  id="external"
                  disabled={existingTypes.hasExternal}
                />
                <Label
                  htmlFor="external"
                  className={`cursor-pointer text-sm ${
                    existingTypes.hasExternal ? "text-muted-foreground" : ""
                  }`}
                >
                  External PTI {existingTypes.hasExternal && "(Requested)"}
                </Label>
              </div>
            </RadioGroup>
            <p
              className={`text-xs ${
                isInternal ? "text-blue-600" : "text-red-600"
              }`}
            >
              {isInternal
                ? "✓ CONTROLLED watermark (blue)"
                : "✓ UNCONTROLLED watermark (red)"}
            </p>
          </div>

          {/* Reason - Compact */}
          <div className="space-y-1">
            <Label htmlFor="reason" className="text-sm">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              required
              placeholder="Enter reason for print request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[60px] text-sm resize-none"
            />
          </div>



          {/* Copies & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="copies" className="text-sm">
                Copies <span className="text-red-500">*</span>
              </Label>
              <Input
                id="copies"
                type="number"
                min={1}
                required
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value))}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="location" className="text-sm">
                Storage Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                required
                placeholder="e.g. Cabinet A"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
