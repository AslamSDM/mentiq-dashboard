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
      // Silent fail - data will show empty state
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
      // Silent fail - dialog will show empty state
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      const updated = await ticketService.updateTicket(selectedTicket.id, { status: newStatus });
      setSelectedTicket(updated);
      fetchData();
    } catch (err) {
      // Silent fail - UI will reflect original status
    }
  };

  const handleUpdatePriority = async (newPriority: string) => {
    if (!selectedTicket) return;
    try {
      const updated = await ticketService.updateTicket(selectedTicket.id, { priority: newPriority });
      setSelectedTicket(updated);
      fetchData();
    } catch (err) {
      // Silent fail - UI will reflect original status
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

  const filteredTickets = tickets.filter((ticket) =>
    searchQuery
      ? ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#2B3674] flex items-center gap-3">
            <Ticket className="h-8 w-8 text-[#4318FF]" />
            Support Tickets
          </h1>
          <p className="text-[#4363C7] mt-1">
            Manage and respond to customer support requests.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-white rounded-2xl border border-[#E0E5F2] p-4 shadow-sm">
              <p className="text-[#4363C7] text-sm">Total</p>
              <p className="text-2xl font-bold text-[#2B3674]">{stats.total}</p>
            </div>
            <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
              <p className="text-green-600 text-sm">Open</p>
              <p className="text-2xl font-bold text-green-700">{stats.open}</p>
            </div>
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
              <p className="text-blue-600 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-blue-700">{stats.in_progress}</p>
            </div>
            <div className="bg-purple-50 rounded-2xl border border-purple-200 p-4">
              <p className="text-purple-600 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-purple-700">{stats.resolved}</p>
            </div>
            <div className="bg-gray-100 rounded-2xl border border-gray-200 p-4">
              <p className="text-gray-600 text-sm">Closed</p>
              <p className="text-2xl font-bold text-gray-700">{stats.closed}</p>
            </div>
            <div className="bg-red-50 rounded-2xl border border-red-200 p-4">
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Urgent
              </p>
              <p className="text-2xl font-bold text-red-700">{stats.urgent}</p>
            </div>
            <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4">
              <p className="text-orange-600 text-sm">High Priority</p>
              <p className="text-2xl font-bold text-orange-700">{stats.high}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#E0E5F2] p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4363C7]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="pl-10 bg-[#F4F7FE] border-[#E0E5F2] text-[#2B3674]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#4363C7]" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-[#F4F7FE] border-[#E0E5F2] text-[#2B3674]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E0E5F2]">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] bg-[#F4F7FE] border-[#E0E5F2] text-[#2B3674]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E0E5F2]">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] bg-[#F4F7FE] border-[#E0E5F2] text-[#2B3674]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E0E5F2]">
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
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-2xl border border-[#E0E5F2] overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#4318FF] mx-auto" />
              <p className="text-[#4363C7] mt-2">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="h-12 w-12 text-[#4363C7] mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-[#2B3674] mb-2">No tickets found</h3>
              <p className="text-[#4363C7]">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No support tickets have been created yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0E5F2] bg-[#F4F7FE]">
                    <th className="text-left py-3 px-4 text-[#4363C7] font-semibold text-sm">Ticket</th>
                    <th className="text-left py-3 px-4 text-[#4363C7] font-semibold text-sm">Customer</th>
                    <th className="text-left py-3 px-4 text-[#4363C7] font-semibold text-sm">Category</th>
                    <th className="text-left py-3 px-4 text-[#4363C7] font-semibold text-sm">Priority</th>
                    <th className="text-left py-3 px-4 text-[#4363C7] font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-[#4363C7] font-semibold text-sm">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E5F2]">
                  {filteredTickets.map((ticket) => {
                    const StatusIcon = statusIcons[ticket.status] || AlertCircle;
                    return (
                      <tr
                        key={ticket.id}
                        onClick={() => handleViewTicket(ticket.id)}
                        className="hover:bg-[#F4F7FE] cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="max-w-xs">
                            <p className="text-[#2B3674] font-medium truncate">{ticket.subject}</p>
                            <p className="text-[#4363C7] text-sm truncate">{ticket.description}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[#4363C7]" />
                            <div>
                              <p className="text-[#2B3674] text-sm">{ticket.user?.email || "Unknown"}</p>
                              {ticket.account && (
                                <p className="text-[#4363C7] text-xs flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {ticket.account.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#4363C7] text-sm">
                            {categoryLabels[ticket.category] || ticket.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full border font-medium ${
                              priorityColors[ticket.priority]
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full border inline-flex items-center gap-1 font-medium ${
                              statusColors[ticket.status]
                            }`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {ticket.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#4363C7] text-sm">
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
          <DialogContent className="bg-white border-[#E0E5F2] max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl">
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
                        <SelectContent className="bg-white border-[#E0E5F2]">
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
                        <SelectContent className="bg-white border-[#E0E5F2]">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogTitle className="text-[#2B3674] text-xl mt-4">
                    {selectedTicket.subject}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Customer info */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-[#4363C7]">
                      <User className="h-4 w-4" />
                      <span>{selectedTicket.user?.email || "Unknown"}</span>
                    </div>
                    {selectedTicket.account && (
                      <div className="flex items-center gap-2 text-[#4363C7]">
                        <Building2 className="h-4 w-4" />
                        <span>{selectedTicket.account.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[#4363C7]">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(selectedTicket.created_at)}</span>
                    </div>
                  </div>

                  {/* Ticket description */}
                  <div className="bg-[#F4F7FE] rounded-xl p-4 border border-[#E0E5F2]">
                    <p className="text-[#2B3674] whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="text-[#2B3674] font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comments ({selectedTicket.comments?.length || 0})
                    </h4>

                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {selectedTicket.comments?.map((comment) => (
                        <div
                          key={comment.id}
                          className={`rounded-xl p-4 border ${
                            comment.is_internal
                              ? "border-l-4 border-l-yellow-500 bg-yellow-50 border-yellow-200"
                              : "bg-[#F4F7FE] border-[#E0E5F2]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#2B3674]">
                                {comment.user?.name || comment.user?.email || "Support"}
                              </span>
                              {comment.is_internal && (
                                <span className="text-xs text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded">
                                  Internal Note
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[#4363C7]">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-[#2B3674] text-sm whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                      {(!selectedTicket.comments || selectedTicket.comments.length === 0) && (
                        <p className="text-[#4363C7] text-sm text-center py-4">
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
                        className="bg-[#F4F7FE] border-[#E0E5F2] text-[#2B3674] min-h-[80px]"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-[#4363C7] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isInternalComment}
                            onChange={(e) => setIsInternalComment(e.target.checked)}
                            className="rounded border-[#E0E5F2]"
                          />
                          Internal note (not visible to customer)
                        </label>
                        <Button
                          onClick={handleAddComment}
                          disabled={isAddingComment || !newComment.trim()}
                          className="bg-[#4318FF] hover:bg-[#3311CC] text-white"
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
