import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTicketByID, addTicketComment, updateTicket, Ticket } from "@/services/api/tickets";
import { notify } from "@/lib/toast";
import { format } from "date-fns";
import { Send, ArrowLeft, Save } from "lucide-react";
import { useAppSelector } from "@/hooks/useAppSelector";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = useAppSelector((state) => state.authUser.user);
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [updating, setUpdating] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) fetchTicket();
  }, [id]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.comments]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const data = await getTicketByID(id as string);
      setTicket(data);
      setStatus(data.status);
      setPriority(data.priority);
    } catch (err: any) {
      notify.error(err.message || "Failed to load ticket");
      navigate("/tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await updateTicket(id as string, { status, priority });
      notify.success("Ticket updated successfully");
      fetchTicket();
    } catch (err: any) {
      notify.error(err.message || "Failed to update ticket");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignToMe = async () => {
    if (!authUser) return;
    setUpdating(true);
    try {
      const payload: any = { assigneeId: authUser.id };
      if (ticket?.status === 'OPEN') {
        payload.status = 'IN_PROGRESS';
      }
      await updateTicket(id as string, payload);
      notify.success("Ticket assigned to you");
      fetchTicket();
    } catch (err: any) {
      notify.error(err.message || "Failed to assign ticket");
    } finally {
      setUpdating(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await addTicketComment(id as string, commentText);
      setCommentText("");
      fetchTicket();
    } catch (err: any) {
      notify.error(err.message || "Failed to send comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Ticket Detail">
        <div className="text-center py-20">Loading ticket details...</div>
      </Layout>
    );
  }

  if (!ticket) return null;

  return (
    <Layout title="Ticket Detail" items={[
      { label: "Home", href: "/dashboard" }, 
      { label: "Tickets", href: "/tickets" },
      { label: ticket.ticketNumber, href: `/tickets/detail/${ticket.id}` }
    ]}>
      <div className="container mx-auto p-4 space-y-6 max-w-5xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/tickets")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{ticket.title}</h2>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
              <span className="font-mono text-primary font-medium">{ticket.ticketNumber}</span>
              <span>•</span>
              <span>Requested by {ticket.requester?.fullName} on {format(new Date(ticket.createdAt), "MMM d, yyyy HH:mm")}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">{ticket.description}</div>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-[500px]">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Discussion & Feedback</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((comment) => {
                    const isMe = authUser?.id === comment.userId;
                    return (
                      <div key={comment.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div className="text-xs text-muted-foreground mb-1 px-1">
                          {isMe ? "You" : comment.user?.fullName} • {format(new Date(comment.createdAt), "MMM d, HH:mm")}
                        </div>
                        <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
                          isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                        }`}>
                          {comment.content}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-10">
                    No comments yet. Respond to the user here.
                  </div>
                )}
                <div ref={commentsEndRef} />
              </CardContent>
              <div className="p-4 border-t bg-muted/20">
                <div className="flex gap-2">
                  <Textarea 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type your reply to the user..."
                    className="min-h-[40px] max-h-[120px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendComment();
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    className="h-10 w-10 shrink-0" 
                    disabled={!commentText.trim() || submittingComment}
                    onClick={handleSendComment}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manage Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs uppercase font-semibold text-muted-foreground">Status</div>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="WAITING_FOR_USER">Waiting for User</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs uppercase font-semibold text-muted-foreground">Priority</div>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full mt-2" 
                  onClick={handleUpdateStatus} 
                  disabled={updating || (status === ticket.status && priority === ticket.priority)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>

                {ticket.status !== 'CLOSED' && (
                  <Button 
                    variant="destructive"
                    className="w-full mt-2" 
                    onClick={async () => {
                      if (confirm("Are you sure you want to close this ticket?")) {
                        setUpdating(true);
                        try {
                          await updateTicket(id as string, { status: "CLOSED" });
                          notify.success("Ticket closed successfully");
                          fetchTicket();
                        } catch (err: any) {
                          notify.error(err.message || "Failed to close ticket");
                        } finally {
                          setUpdating(false);
                        }
                      }
                    }} 
                    disabled={updating}
                  >
                    Close Ticket
                  </Button>
                )}

                <div className="pt-4 border-t space-y-3 mt-4">
                  <div>
                    <div className="text-muted-foreground mb-1 text-[10px] uppercase font-semibold">Category</div>
                    <div className="text-sm">{ticket.category?.name || "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1 text-[10px] uppercase font-semibold">Department</div>
                    <div className="text-sm">{ticket.department?.name || "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1 text-[10px] uppercase font-semibold">Assigned To</div>
                    <div className="text-sm flex items-center justify-between">
                      <span>{ticket.assignee?.fullName || "Unassigned"}</span>
                      {!ticket.assignee && authUser?.role?.name !== 'User' && ticket.status !== 'CLOSED' && (
                        <Button size="sm" variant="outline" onClick={handleAssignToMe} disabled={updating} className="h-7 px-2 text-xs">Take</Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
