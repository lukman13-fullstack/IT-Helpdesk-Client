import Layout from "@/components/layout/layout";
import { useEffect, useState } from "react";
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
import { Check, Eye, X, Printer, Loader2 } from "lucide-react";
import ApproveDialog from "./components/approve-dialog";
import RejectDialog from "./components/reject-dialog";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { asyncGetApprovalRequestsActionCreator } from "@/store/approvals/action";

export default function PrintApprovalPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get approvals from Redux store and filter only print requests
  const { approvalRequests, loading } = useAppSelector(
    (state) => state.approvals
  );
  const printApprovals = approvalRequests.filter(
    (req: any) => req.isPrintRequest === true
  );

  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number>("");

  const fetchApprovals = () => {
    dispatch(asyncGetApprovalRequestsActionCreator("pending"));
  };

  useEffect(() => {
    fetchApprovals();
  }, [dispatch]);

  const handleOpenApproveDialog = (id: string | number) => {
    setSelectedId(id);
    setOpenApproveDialog(true);
  };

  const handleOpenRejectDialog = (id: string | number) => {
    setSelectedId(id);
    setOpenRejectDialog(true);
  };

  return (
    <Layout
      title="Print Approvals"
      items={[
        { label: "Home", href: "/" },
        { label: "Documents", href: "/documents" },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Approval Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Code</TableHead>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {printApprovals.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No pending print approvals found.
                    </TableCell>
                  </TableRow>
                ) : (
                  printApprovals.map((approval: any) => (
                    <TableRow key={approval.id}>
                      <TableCell className="font-mono">
                        {approval.printApproval?.printRequest?.document
                          ?.documentCode || approval.document?.documentCode}
                      </TableCell>
                      <TableCell>
                        {approval.printApproval?.printRequest?.document?.name ||
                          approval.document?.name}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {approval.printApproval?.printRequest?.requester
                            ?.fullName || approval.creator?.fullName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            approval.printApproval?.printRequest?.isInternal
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {approval.printApproval?.printRequest?.isInternal
                            ? "Controlled"
                            : "Uncontrolled"}
                        </span>
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={
                          approval.printApproval?.printRequest?.reason || "-"
                        }
                      >
                        {approval.printApproval?.printRequest?.reason || "-"}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(approval.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          alt="View Document"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            navigate(
                              `/documents/detail/${
                                approval.printApproval?.printRequest?.document
                                  ?.id || approval.document?.id
                              }`
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleOpenApproveDialog(approval.id)}
                          alt="Approve"
                          variant="outline"
                          size="icon"
                          className="hover:bg-green-50 hover:border-green-500"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          onClick={() => handleOpenRejectDialog(approval.id)}
                          alt="Reject"
                          variant="outline"
                          size="icon"
                          className="hover:bg-red-50 hover:border-red-500"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ApproveDialog
        open={openApproveDialog}
        onOpenChange={setOpenApproveDialog}
        approvalId={selectedId}
        onSuccess={fetchApprovals}
      />
      <RejectDialog
        open={openRejectDialog}
        onOpenChange={setOpenRejectDialog}
        approvalId={selectedId}
        onSuccess={fetchApprovals}
      />
    </Layout>
  );
}
