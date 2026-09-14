import { exportToExcel } from "@/utils/exportToExcel";
import { ApprovalRequest } from "@/services/api/types/documents.types";

export const exportQaPerformanceToExcel = async (
  approvals: ApprovalRequest[],
  fileName: string = "QA_Performance_Export",
  isTimePerformance: boolean = false
) => {
  // Helper functions
  const getApprovalType = (approval: any): string => {
    if (approval.isReferenceCheck) return "Reference";
    if (approval.type === "deletion") return "Deletion";
    if (approval.type === "print" || approval.printRequestId) return "Print";
    if (approval.type === "revision") return "Revision";
    return "New Document";
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = date.getDate().toString().padStart(2, '0');
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    return `${d}-${m}-${y}`; // Format exactly like 20-Jul-2026 based on screenshot
  };

  const getCategoryLabelForExport = (cat: string) => {
    if (cat === "instruksi_kerja") return "Working Instruction";
    if (cat === "form") return "Form";
    if (cat === "prosedur") return "Procedure";
    if (cat === "manual_perusahaan") return "Manual Company Document";
    if (cat === "manual_halal") return "Manual Halal";
    if (cat === "standard") return "Standard";
    return cat.replace(/_/g, " ").toUpperCase();
  };

  const getStatusText = (approval: any) => {
    if (isTimePerformance) {
      if (approval.status === "pending") return "Pending Approval";
      if (!approval.createdAt) return "-";
      const start = new Date(approval.createdAt);
      const end = approval.approvedAt ? new Date(approval.approvedAt) : new Date();
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 ? "Within 3 Days" : "Over 3 Days";
    }

    const level = approval.level || 0;
    const approverName = approval.approver?.fullName || "-";
    
    // Determine if it's QA or next level
    // Assuming QA is level 0 or no level, and higher levels are Lev 1, Lev 2, etc.
    // If the system treats level 1 as QA, we will check if it's QA by looking at some indicator.
    // We'll use a simple heuristic:
    const isApproved = approval.status?.toLowerCase() === "approved";
    const isRejected = approval.status?.toLowerCase() === "rejected";
    
    if (level === 1 || level === 0) {
      if (isApproved) return "QA Approved";
      if (isRejected) return "QA Rejected";
      return "Pending QA Approval";
    } else {
      const displayLevel = level > 1 ? level - 1 : level;
      if (isApproved) return `Lev ${displayLevel} Approved (${approverName})`;
      if (isRejected) return `Lev ${displayLevel} Rejected (${approverName})`;
      return `Lev ${displayLevel} Approval (${approverName})`;
    }
  };

  const getQAApprovalDate = (approval: any) => {
    if (!approval.document?.approvals) return "-";
    const currentRev = approval.documentRevision ?? approval.document?.revision;
    const qaApproval = approval.document.approvals.find(
      (a: any) => 
        a.level === 1 && 
        (a.type === "approval" || a.type === "revision") && 
        (a.status === "approved" || a.status === "rejected") &&
        a.documentRevision === currentRev
    );
    
    if (qaApproval?.approvedAt) return formatDate(qaApproval.approvedAt);
    if (qaApproval?.rejectedAt) return formatDate(qaApproval.rejectedAt);
    if (qaApproval?.updatedAt) return formatDate(qaApproval.updatedAt);
    return "-";
  };

  // Define columns based on the UI table screenshot
  const columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Register Date", key: "registerDate", width: 15 },
    { header: "Approval Date by QA", key: "approvalDateQA", width: 20 },
    { header: "Requester", key: "requester", width: 20 },
    { header: "Department", key: "department", width: 20 },
    { header: "Document Code", key: "documentCode", width: 20 },
    { header: "Revision", key: "revision", width: 10, style: { numFmt: "00" } },
    { header: "Document Name", key: "documentName", width: 30 },
    { header: "Category", key: "category", width: 15 },
    { header: "Type Document", key: "typeDocument", width: 15 },
    { header: "Revision Purpose", key: "revisionPurpose", width: 20 },
    { header: "Proposal Objective", key: "proposalObjective", width: 20 },
    { header: "Status", key: "status", width: 25 },
  ];

  // Format data for Excel
  const data = approvals.map((approval: any, index: number) => {
    const type = getApprovalType(approval);
    
    let requester = "-";
    if (type === "Print") {
      requester = approval.printRequest?.requester?.fullName || approval.creator?.fullName || "-";
    } else {
      requester = approval.creator?.fullName || "-";
    }

    return {
      no: index + 1,
      registerDate: formatDate(approval.createdAt),
      requester: requester,
      department: approval.document?.department?.departmentCode || approval.document?.department?.name || "-",
      documentCode: approval.document?.documentCode || "-",
      revision: Number(approval.documentRevision ?? approval.document?.revision ?? 0),
      documentName: approval.document?.name || "-",
      category: approval.document?.category ? getCategoryLabelForExport(approval.document.category) : "-",
      typeDocument: approval.document?.isInternal !== undefined ? (approval.document.isInternal ? "Internal Document" : "External Document") : "-",
      revisionPurpose: approval.reason || (
        ((approval.documentRevision === 0 || approval.document?.revision === 0) && approval.document?.proposalObjective) 
          ? approval.document.proposalObjective 
          : "-"
      ),
      proposalObjective: approval.document?.proposalObjective || "-",
      approvalDateQA: getQAApprovalDate(approval),
      status: getStatusText(approval),
    };
  });

  await exportToExcel(data, columns, fileName);
};
