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
} from "@/components/ui/dialog";
import {
  Ticket,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Loader2,
  Timer,
  XCircle,
  AlertTriangle,
  User,
  Building2,
} from "lucide-react";
import {
  SupportTicket,
  TicketStats,
  ticketService,
} from "@/lib/services/tickets";

const priorityColors = {
  low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusColors = {
  open: "bg-green-500/20 text-green-400 border-green-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  resolved: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
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

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Comment state
  const [newComment, setNewComment] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (priorityFilter !== "all") filters.priority = priorityFilter;
      if (categoryFilter !== "all") filters.category = categoryFilter;

      const [ticketsData, statsData] = await Promise.all([
        ticketService.getAllTickets(filters),
        ticketService.getTicketStats(),
      ]);
      setTickets(ticketsData || []);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const handleViewTicket = async (ticketId: string) => {
    try {
      const ticket = await ticketService.getTicket(ticketId);
      setSelectedTicket(ticket);
      setIsDetailDialogOpen(true);
    } catch (err) {
      console.error("Failed to fetch ticket:", err);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      const updated = await ticketService.updateTicket(selectedTicket.id, { status: newStatus });
      setSelectedTicket(updated);
      fetchData();
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  };

  const handleUpdatePriority = async (newPriority: string) => {
    if (!selectedTicket) return;
    try {
      const updated = await ticketService.updateTicket(selectedTicket.id, { priority: newPriority });
      setSelectedTicket(updated);
      fetchData();
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;
    setIsAddingComment(true);

    try {
      const comment = await ticketService.addComment(selectedTicket.id, {
        content: newComment,
        is_internal: isInternalComment,
      });
      setSelectedTicket({
        ...selectedTicket,
        comments: [...(selectedTicket.comments || []), comment],
      });
      setNewComment("");
      setIsInternalComment(false);
    } catch (err) {
      console.error("Failed to add comment:", err);
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

  const filteredTickets = tickets.filter((ticket) =>
    searchQuery
      ? ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Ticket className="h-8 w-8 text-primary" />
            Support Tickets
          </h1>
          <p className="text-gray-400 mt-1">
            Manage and respond to customer support requests.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4">
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-green-500/10 rounded-xl border border-green-500/20 p-4">
              <p className="text-green-400 text-sm">Open</p>
              <p className="text-2xl font-bold text-green-400">{stats.open}</p>
            </div>
            <div className="bg-blue-500/10 rounded-xl border border-blue-500/20 p-4">
              <p className="text-blue-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-blue-400">{stats.in_progress}</p>
            </div>
            <div className="bg-purple-500/10 rounded-xl border border-purple-500/20 p-4">
              <p className="text-purple-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-purple-400">{stats.resolved}</p>
            </div>
            <div className="bg-gray-500/10 rounded-xl border border-gray-500/20 p-4">
              <p className="text-gray-400 text-sm">Closed</p>
              <p className="text-2xl font-bold text-gray-400">{stats.closed}</p>
            </div>
            <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-4">
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Urgent
              </p>
              <p className="text-2xl font-bold text-red-400">{stats.urgent}</p>
            </div>
            <div className="bg-orange-500/10 rounded-xl border border-orange-500/20 p-4">
              <p className="text-orange-400 text-sm">High Priority</p>
              <p className="text-2xl font-bold text-orange-400">{stats.high}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-zinc-900/50 rounded-xl border border-white/10 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-gray-400 mt-2">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No tickets found</h3>
              <p className="text-gray-400">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No support tickets have been created yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Ticket</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Customer</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Category</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Priority</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTickets.map((ticket) => {
                    const StatusIcon = statusIcons[ticket.status] || AlertCircle;
                    return (
                      <tr
                        key={ticket.id}
                        onClick={() => handleViewTicket(ticket.id)}
                        className="hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="max-w-xs">
                            <p className="text-white font-medium truncate">{ticket.subject}</p>
                            <p className="text-gray-500 text-sm truncate">{ticket.description}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-gray-300 text-sm">{ticket.user?.email || "Unknown"}</p>
                              {ticket.account && (
                                <p className="text-gray-500 text-xs flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {ticket.account.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-400 text-sm">
                            {categoryLabels[ticket.category] || ticket.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full border ${
                              priorityColors[ticket.priority]
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full border inline-flex items-center gap-1 ${
                              statusColors[ticket.status]
                            }`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {ticket.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-500 text-sm">
                            {formatDate(ticket.created_at)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ticket Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-3xl max-h-[85vh] overflow-y-auto">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedTicket.status}
                        onValueChange={handleUpdateStatus}
                      >
                        <SelectTrigger
                          className={`w-[130px] border ${statusColors[selectedTicket.status]}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedTicket.priority}
                        onValueChange={handleUpdatePriority}
                      >
                        <SelectTrigger
                          className={`w-[110px] border ${priorityColors[selectedTicket.priority]}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogTitle className="text-white text-xl mt-4">
                    {selectedTicket.subject}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Customer info */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="h-4 w-4" />
                      <span>{selectedTicket.user?.email || "Unknown"}</span>
                    </div>
                    {selectedTicket.account && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Building2 className="h-4 w-4" />
                        <span>{selectedTicket.account.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(selectedTicket.created_at)}</span>
                    </div>
                  </div>

                  {/* Ticket description */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comments ({selectedTicket.comments?.length || 0})
                    </h4>

                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {selectedTicket.comments?.map((comment) => (
                        <div
                          key={comment.id}
                          className={`bg-white/5 rounded-lg p-3 ${
                            comment.is_internal
                              ? "border-l-4 border-yellow-500 bg-yellow-500/5"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">
                                {comment.user?.name || comment.user?.email || "Support"}
                              </span>
                              {comment.is_internal && (
                                <span className="text-xs text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded">
                                  Internal Note
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                      {(!selectedTicket.comments || selectedTicket.comments.length === 0) && (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No comments yet
                        </p>
                      )}
                    </div>

                    {/* Add comment */}
                    <div className="space-y-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type your response..."
                        className="bg-white/5 border-white/10 text-white min-h-[80px]"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isInternalComment}
                            onChange={(e) => setIsInternalComment(e.target.checked)}
                            className="rounded border-white/20 bg-white/5"
                          />
                          Internal note (not visible to customer)
                        </label>
                        <Button
                          onClick={handleAddComment}
                          disabled={isAddingComment || !newComment.trim()}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isAddingComment ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Send Reply
                        </Button>
                      </div>
                    </div>
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
