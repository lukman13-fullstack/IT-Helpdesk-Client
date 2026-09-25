import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserPortalLayout from "@/components/layout/UserPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getTicketByID, addTicketComment, Ticket } from "@/services/api/tickets";
import { notify } from "@/lib/toast";
import { format } from "date-fns";
import { ArrowLeft, Send } from "lucide-react";
import { useAppSelector } from "@/hooks/useAppSelector";

export default function PortalTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = useAppSelector((state) => state.authUser.user);
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) fetchTicket();
  }, [id]);

  useEffect(() => {
    // Scroll to bottom of comments when loaded
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.comments]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const data = await getTicketByID(id as string);
      setTicket(data);
    } catch (err: any) {
      notify.error(err.message || "Failed to load ticket");
      navigate("/portal/tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await addTicketComment(id as string, commentText);
      setCommentText("");
      fetchTicket(); // Reload to get new comment
    } catch (err: any) {
      notify.error(err.message || "Failed to send comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
      case 'WAITING_FOR_USER': return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200';
      default: return '';
    }
  };

  if (loading) {
    return (
      <UserPortalLayout>
        <div className="text-center py-20">Loading ticket details...</div>
      </UserPortalLayout>
    );
  }

  if (!ticket) return null;

  return (
    <UserPortalLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/portal/tickets")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{ticket.title}</h2>
              <Badge variant="outline" className={`text-xs uppercase ${getStatusColor(ticket.status)}`}>{ticket.status.replace(/_/g, " ")}</Badge>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
              <span className="font-mono text-primary font-medium">{ticket.ticketNumber}</span>
              <span>•</span>
              <span>Created on {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' HH:mm")}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
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
                    No comments yet. Leave a message to communicate with the IT team.
                  </div>
                )}
                <div ref={commentsEndRef} />
              </CardContent>
              <div className="p-4 border-t bg-muted/20">
                <div className="flex gap-2">
                  <Textarea 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type your message here..."
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
                <div className="text-[10px] text-muted-foreground mt-1 px-1">Press Enter to send, Shift+Enter for new line</div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1 text-xs uppercase font-semibold">Status</div>
                  <Badge variant="outline" className={getStatusColor(ticket.status)}>{ticket.status.replace(/_/g, " ")}</Badge>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-xs uppercase font-semibold">Priority</div>
                  <Badge variant={
                    ticket.priority === "CRITICAL" ? "destructive" :
                    ticket.priority === "HIGH" ? "destructive" :
                    ticket.priority === "MEDIUM" ? "default" : "secondary"
                  }>{ticket.priority}</Badge>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-xs uppercase font-semibold">Category</div>
                  <div>{ticket.category?.name || "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-xs uppercase font-semibold">Department</div>
                  <div>{ticket.department?.name || "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-xs uppercase font-semibold">Assigned To</div>
                  <div>{ticket.assignee?.fullName || "Unassigned"}</div>
                </div>
                
                {ticket.resolvedAt && (
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs uppercase font-semibold">Resolved At</div>
                    <div>{format(new Date(ticket.resolvedAt), "MMM d, yyyy HH:mm")}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserPortalLayout>
  );
}
