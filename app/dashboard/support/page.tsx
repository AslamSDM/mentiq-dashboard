"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Loader2,
  Timer,
  XCircle,
} from "lucide-react";
import {
  SupportTicket,
  ticketService,
} from "@/lib/services/tickets";

const priorityColors = {
  low: "bg-gray-100 text-gray-600 border-gray-200",
  medium: "bg-blue-50 text-blue-600 border-blue-200",
  high: "bg-orange-50 text-orange-600 border-orange-200",
  urgent: "bg-red-50 text-red-600 border-red-200",
};

const statusColors = {
  open: "bg-green-50 text-green-600 border-green-200",
  in_progress: "bg-blue-50 text-blue-600 border-blue-200",
  resolved: "bg-purple-50 text-purple-600 border-purple-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusIcons = {
  open: AlertCircle,
  in_progress: Timer,
  resolved: CheckCircle2,
  closed: XCircle,
};

const categoryLabels: Record<string, string> = {
  bug: "Bug Report",
  feature_request: "Feature Request",
  billing: "Billing",
  general: "General",
  technical: "Technical Support",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("general");

  // Comment state
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const data = await ticketService.getTickets();
      setTickets(data || []);
    } catch (err) {
      // Silent fail - tickets will show empty state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await ticketService.createTicket({
        subject,
        description,
        priority,
        category,
      });
      setIsCreateDialogOpen(false);
      setSubject("");
      setDescription("");
      setPriority("medium");
      setCategory("general");
      fetchTickets();
    } catch (err: any) {
      setError(err.message || "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTicket = async (ticketId: string) => {
    try {
      const ticket = await ticketService.getTicket(ticketId);
      setSelectedTicket(ticket);
      setIsDetailDialogOpen(true);
    } catch (err) {
      // Silent fail - dialog will show empty state
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;
    setIsAddingComment(true);

    try {
      const comment = await ticketService.addComment(selectedTicket.id, { content: newComment });
      setSelectedTicket({
        ...selectedTicket,
        comments: [...(selectedTicket.comments || []), comment],
      });
      setNewComment("");
    } catch (err) {
      // Silent fail - comment will not be added
    } finally {
      setIsAddingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2B3674] flex items-center gap-3">
              <LifeBuoy className="h-8 w-8 text-[#4318FF]" />
              Support
            </h1>
            <p className="text-[#A3AED0] mt-1">
              Get help from our team. View your tickets and create new ones.
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#E0E5F2] max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-[#2B3674]">Create Support Ticket</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTicket} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-[#A3AED0] mb-1.5 block">Subject</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="bg-[#F4F7FE] border-[#E0E5F2] text-[#2B3674] placeholder:text-[#A3AED0]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#A3AED0] mb-1.5 block">Priority</label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="bg-[#F4F7FE] border-[#E0E5F2] text-[#2B3674]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E0E5F2]">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-[#A3AED0] mb-1.5 block">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-[#F4F7FE] border-[#E0E5F2] text-[#2B3674]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E0E5F2]">
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feature_request">Feature Request</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#A3AED0] mb-1.5 block">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="bg-[#F4F7FE] border-[#E0E5F2] text-[#2B3674] placeholder:text-[#A3AED0] min-h-[120px]"
                    required
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="text-[#A3AED0] hover:text-[#2B3674]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Ticket"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-3xl border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#4318FF] mx-auto" />
              <p className="text-[#A3AED0] mt-2">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <LifeBuoy className="h-12 w-12 text-[#A3AED0] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#2B3674] mb-2">No tickets yet</h3>
              <p className="text-[#A3AED0] mb-4">
                Create a support ticket to get help from our team.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Ticket
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[#F4F7FE]">
              {tickets.map((ticket) => {
                const StatusIcon = statusIcons[ticket.status] || AlertCircle;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => handleViewTicket(ticket.id)}
                    className="p-4 hover:bg-[#F4F7FE] cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className="h-4 w-4 text-[#4318FF] flex-shrink-0" />
                          <h3 className="text-[#2B3674] font-medium truncate">
                            {ticket.subject}
                          </h3>
                        </div>
                        <p className="text-[#A3AED0] text-sm line-clamp-1">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-[#A3AED0]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(ticket.created_at)}
                          </span>
                          <span>{categoryLabels[ticket.category] || ticket.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-2 py-1 text-xs rounded-full border ${
                            priorityColors[ticket.priority]
                          }`}
                        >
                          {ticket.priority}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full border ${
                            statusColors[ticket.status]
                          }`}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ticket Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-white border-[#E0E5F2] max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${
                        statusColors[selectedTicket.status]
                      }`}
                    >
                      {selectedTicket.status.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${
                        priorityColors[selectedTicket.priority]
                      }`}
                    >
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <DialogTitle className="text-[#2B3674] text-xl mt-2">
                    {selectedTicket.subject}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Ticket description */}
                  <div className="bg-[#F4F7FE] rounded-xl p-4">
                    <p className="text-[#2B3674] whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-[#A3AED0]">
                      <span>Created: {formatDate(selectedTicket.created_at)}</span>
                      <span>•</span>
                      <span>{categoryLabels[selectedTicket.category] || selectedTicket.category}</span>
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="text-[#2B3674] font-medium mb-4 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#4318FF]" />
                      Comments ({selectedTicket.comments?.length || 0})
                    </h4>
                    
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {selectedTicket.comments?.map((comment) => (
                        <div
                          key={comment.id}
                          className={`bg-[#F4F7FE] rounded-xl p-3 ${
                            comment.is_internal ? "border-l-2 border-yellow-500" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-[#2B3674]">
                              {comment.user?.name || comment.user?.email || "Support"}
                            </span>
                            <span className="text-xs text-[#A3AED0]">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-[#2B3674] text-sm whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                      {(!selectedTicket.comments || selectedTicket.comments.length === 0) && (
                        <p className="text-[#A3AED0] text-sm text-center py-4">
                          No comments yet
                        </p>
                      )}
                    </div>

                    {/* Add comment */}
                    {selectedTicket.status !== "closed" && (
                      <div className="flex gap-2">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Type your message..."
                          className="bg-[#F4F7FE] border-[#E0E5F2] text-[#2B3674] placeholder:text-[#A3AED0] min-h-[60px] flex-1"
                        />
                        <Button
                          onClick={handleAddComment}
                          disabled={isAddingComment || !newComment.trim()}
                          className="bg-[#4318FF] hover:bg-[#3311CC] text-white self-end rounded-xl"
                        >
                          {isAddingComment ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
