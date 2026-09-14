import { exportToExcel } from "@/utils/exportToExcel";
import { ApprovalRequest } from "@/services/api/types/documents.types";

export const exportApprovalsToExcel = async (
  approvals: ApprovalRequest[],
  fileName: string = "Approvals_Export"
) => {
  // Helper functions
  const getApprovalType = (approval: any): string => {
    if (approval.isReferenceCheck) return "Reference";
    if (approval.type === "deletion") return "Deletion";
    if (approval.type === "print" || approval.printRequestId) return "Print";
    if (approval.type === "revision") return "Revision";
    return "New Document";
  };

  const getReason = (approval: any, type: string) => {
    if (type === "Deletion" || type === "Revision") return approval.reason || "-";
    if (type === "Print") return approval.printRequest?.reason || "-";
    return approval.document?.proposalObjective || "-";
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcSlaStatus = (approval: any) => {
    if (!approval.createdAt) return "-";
    const start = new Date(approval.createdAt);
    const end = approval.approvedAt ? new Date(approval.approvedAt) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 ? "Within 3 Days" : "Over 3 Days";
  };

  // Define columns based on the UI table
  const columns = [
    { header: "Type", key: "type", width: 15 },
    { header: "Document Code", key: "documentCode", width: 25 },
    { header: "Document Name", key: "documentName", width: 40 },
    { header: "Requester", key: "requester", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Reason/Purpose", key: "reasonPurpose", width: 30 },
    { header: "Requested Date", key: "requestedDate", width: 20 },
    { header: "Approve Date", key: "approveDate", width: 20 },
    { header: "Category", key: "category", width: 20 },
    { header: "Department", key: "department", width: 25 },
    { header: "SLA Status", key: "slaStatus", width: 20 },
  ];

  // Format data for Excel
  const data = approvals.map((approval: any) => {
    const type = getApprovalType(approval);
    
    let requester = "-";
    if (type === "Print") {
      requester = approval.printRequest?.requester?.fullName || approval.creator?.fullName || "-";
    } else {
      requester = approval.creator?.fullName || "-";
    }

    return {
      type: type,
      documentCode: approval.document?.documentCode || "-",
      documentName: approval.document?.name || "-",
      requester: requester,
      status: approval.status ? approval.status.charAt(0).toUpperCase() + approval.status.slice(1) : "-",
      reasonPurpose: getReason(approval, type),
      requestedDate: formatDate(approval.createdAt),
      approveDate: (approval.status === "approved" || approval.status === "rejected") ? formatDate(approval.approvedAt || approval.rejectedAt || approval.updatedAt) : "-",
      category: approval.document?.category ? approval.document.category.replace(/_/g, " ").toUpperCase() : "-",
      department: approval.document?.department?.name || "-",
      slaStatus: calcSlaStatus(approval),
    };
  });

  await exportToExcel(data, columns, fileName);
};
