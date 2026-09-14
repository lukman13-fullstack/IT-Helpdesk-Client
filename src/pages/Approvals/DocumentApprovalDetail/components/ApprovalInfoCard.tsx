import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { FileText, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApprovalInfoCardProps {
  approval: any;
  onApprove: () => void;
  onReject: () => void;
}

export function ApprovalInfoCard({ approval, onApprove, onReject }: ApprovalInfoCardProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: "Pending", class: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approved", class: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", class: "bg-red-100 text-red-800" },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return <Badge className={badge.class}>{badge.label}</Badge>;
  };

  const formatRevision = (revision: number | undefined) => {
    return String(revision ?? 0).padStart(2, "0");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {approval.document && approval.document.version > 1
              ? `Document Revision Approval (v${approval.document.version})`
              : "New Document Approval"}
          </CardTitle>
          {getStatusBadge(approval.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Information */}
        <div>
          <h3 className="font-semibold mb-3">Document Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Document Code</p>
              <p className="font-mono">{approval.document?.documentCode || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Document Name</p>
              <p className="font-medium">{approval.document?.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p>{approval.document?.category || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p>{approval.document?.department?.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="font-semibold">{approval.document?.version || 1}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revision</p>
              <p className="font-semibold">{formatRevision(approval.document?.revision)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Request Information */}
        {approval.document?.proposalObjective && (
          <>
            <div>
              <h3 className="font-semibold mb-3">Request Purpose</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">{approval.document.proposalObjective}</p>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Approval Information */}
        <div>
          <h3 className="font-semibold mb-3">Approval Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Requested By</p>
              <p className="font-medium">{approval.creator?.fullName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requested</p>
              <p>
                {formatDistanceToNow(new Date(approval.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approval Level</p>
              <p>Level {approval.level || 1}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approver</p>
              <p className="font-medium">{approval.approver?.fullName || "-"}</p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {(approval.status === "approved" || approval.status === "rejected") &&
          (approval.comments || approval.reason) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">
                  {approval.status === "approved" ? "Approval" : "Rejection"} Reason
                </h3>
                <div
                  className={`p-3 rounded-md ${
                    approval.status === "approved"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      approval.status === "approved" ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {approval.comments || approval.reason}
                  </p>
                </div>
              </div>
            </>
          )}

        {/* Actions */}
        {approval.status === "pending" && (
          <>
            <Separator />
            <div className="flex gap-3">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={onApprove}>
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button variant="destructive" className="flex-1" onClick={onReject}>
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
