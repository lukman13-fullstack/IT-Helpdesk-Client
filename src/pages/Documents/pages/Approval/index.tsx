import Layout from "@/components/layout/layout";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useEffect, useState } from "react";
import { asyncGetApprovalRequestsActionCreator } from "@/store/approvals/action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check, Eye, X, Lock } from "lucide-react";
import ApproveDialog from "./components/approve-dialog";
import RejectDialog from "./components/reject-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Approval() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { approvalRequests } = useAppSelector((state) => state.approvals);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);

  const [rejectId, setRejectId] = useState<string | number>("");
  const [approveId, setApproveId] = useState<string | number>("");
  const [isPrintRequest, setIsPrintRequest] = useState(false);
  const [isReferenceCheck, setIsReferenceCheck] = useState(false);
  const [originalId, setOriginalId] = useState<number | undefined>(undefined);

  useEffect(() => {
    dispatch(asyncGetApprovalRequestsActionCreator());
  }, [dispatch]);

  // Check if reference check action buttons should be disabled
  // Backend sends canAct flag for reference checks
  const isReferenceCheckDisabled = (approvalRequest: any) => {
    if (!approvalRequest.isReferenceCheck) return false;
    // Use canAct flag from backend (false means user has pending hierarchy approval)
    return approvalRequest.canAct === false;
  };

  const handleOpenApproveDialog = (
    id: string | number,
    isPrint: boolean = false,
    isRefCheck: boolean = false,
    origId?: number
  ) => {
    setApproveId(id);
    setIsPrintRequest(isPrint);
    setIsReferenceCheck(isRefCheck);
    setOriginalId(origId);
    setOpenApproveDialog(true);
  };

  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
    setApproveId("");
    setIsPrintRequest(false);
    setIsReferenceCheck(false);
    setOriginalId(undefined);
  };

  const handleOpenRejectDialog = (
    id: string | number,
    isPrint: boolean = false,
    isRefCheck: boolean = false,
    origId?: number
  ) => {
    setRejectId(id);
    setIsPrintRequest(isPrint);
    setIsReferenceCheck(isRefCheck);
    setOriginalId(origId);
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectId("");
    setIsPrintRequest(false);
    setIsReferenceCheck(false);
    setOriginalId(undefined);
  };

  const getTypeBadge = (approvalRequest: any) => {
    if (approvalRequest.isReferenceCheck) {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-500">
          Reference Check: {approvalRequest.reference?.code}
        </Badge>
      );
    }
    if (approvalRequest.isPrintRequest) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-500">
          Print Request
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        {approvalRequest.type}
      </Badge>
    );
  };

  return (
    <Layout
      title="Approval Documents"
      items={[
        { label: "Home", href: "/" },
        { label: "Documents", href: "/documents" },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>Approval Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Code</TableHead>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvalRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No pending approval requests found.
                  </TableCell>
                </TableRow>
              ) : (
                approvalRequests.map((approvalRequest: any) => {
                  const isDisabled = isReferenceCheckDisabled(approvalRequest);
                  
                  return (
                    <TableRow
                      key={`${approvalRequest.isReferenceCheck ? "ref" : approvalRequest.isPrintRequest ? "pr" : "da"}-${
                        approvalRequest.id
                      }`}
                    >
                      <TableCell>{approvalRequest.document.documentCode}</TableCell>
                      <TableCell>{approvalRequest.document.name}</TableCell>
                      <TableCell>
                        {getTypeBadge(approvalRequest)}
                      </TableCell>
                      <TableCell>{approvalRequest.creator.fullName}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(approvalRequest.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    !isDisabled && navigate(`/documents/detail/${approvalRequest.document.id}`)
                                  }
                                  title="View Document"
                                  disabled={isDisabled}
                                  className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                  {isDisabled ? (
                                    <Lock className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {isDisabled && (
                              <TooltipContent>
                                <p>Please approve document hierarchy first</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  onClick={() =>
                                    handleOpenApproveDialog(
                                      approvalRequest.id,
                                      !!approvalRequest.isPrintRequest,
                                      !!approvalRequest.isReferenceCheck,
                                      approvalRequest.originalId
                                    )
                                  }
                                  variant="outline"
                                  size="icon"
                                  className={isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-green-50 hover:border-green-500"}
                                  title="Approve"
                                  disabled={isDisabled}
                                >
                                  {isDisabled ? (
                                    <Lock className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Check className="h-4 w-4 text-green-500" />
                                  )}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {isDisabled && (
                              <TooltipContent>
                                <p>Please approve document hierarchy first</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  onClick={() =>
                                    handleOpenRejectDialog(
                                      approvalRequest.id,
                                      !!approvalRequest.isPrintRequest,
                                      !!approvalRequest.isReferenceCheck,
                                      approvalRequest.originalId
                                    )
                                  }
                                  variant="outline"
                                  size="icon"
                                  className={isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50 hover:border-red-500"}
                                  title="Reject"
                                  disabled={isDisabled}
                                >
                                  {isDisabled ? (
                                    <Lock className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                  )}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {isDisabled && (
                              <TooltipContent>
                                <p>Please approve document hierarchy first</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ApproveDialog
        open={openApproveDialog}
        onOpenChange={handleCloseApproveDialog}
        approvalId={approveId}
        isPrintRequest={isPrintRequest}
        isReferenceCheck={isReferenceCheck}
        originalId={originalId}
      />
      <RejectDialog
        open={openRejectDialog}
        onOpenChange={handleCloseRejectDialog}
        approvalId={rejectId}
        isPrintRequest={isPrintRequest}
        isReferenceCheck={isReferenceCheck}
        originalId={originalId}
      />
    </Layout>
  );
}
