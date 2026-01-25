"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminService, type WaitlistEntry } from "@/lib/services/admin";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  CheckCircle,
  Clock,
  Users,
  Mail,
  Building,
  Calendar,
} from "lucide-react";

export default function AdminWaitlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [grantingAccess, setGrantingAccess] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated" && session && !session.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      router.push("/dashboard");
    }
  }, [session, status, router, toast]);

  // Fetch waitlist entries
  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        setLoading(true);
        const data = await adminService.getWaitlist();
        setWaitlistEntries(data.entries || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load waitlist. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.isAdmin) {
      fetchWaitlist();
    }
  }, [session, status, toast]);

  // Handle granting access
  const handleGrantAccess = async (id: string) => {
    setGrantingAccess(id);
    try {
      const result = await adminService.grantWaitlistAccess(id);
      // Update the local state
      setWaitlistEntries((prev) =>
        prev.map((entry) => (entry.id === id ? result.entry : entry)),
      );
      toast({
        title: "Access Granted",
        description: "User has been granted access and notified via email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to grant access. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGrantingAccess(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter entries based on search query
  const filteredEntries = waitlistEntries.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.email.toLowerCase().includes(query) ||
      entry.full_name.toLowerCase().includes(query) ||
      (entry.company && entry.company.toLowerCase().includes(query))
    );
  });

  // Calculate stats
  const totalEntries = waitlistEntries.length;
  const pendingEntries = waitlistEntries.filter(
    (e) => !e.access_granted,
  ).length;
  const grantedEntries = waitlistEntries.filter((e) => e.access_granted).length;

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!session?.isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader
        title="Admin - Waitlist Management"
        description="View and manage waitlist signups"
      />

      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Signups
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {pendingEntries}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Access Granted
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {grantedEntries}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Waitlist Table */}
        <Card>
          <CardHeader>
            <CardTitle>Waitlist Entries</CardTitle>
            <CardDescription>
              Grant access to users on the waitlist. They will receive an email
              notification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="relative mb-4 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email, name, or company..."
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Users className="h-12 w-12 mb-4 opacity-50" />
                <p>
                  {searchQuery
                    ? "No entries match your search"
                    : "No waitlist entries yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Expected Users</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {entry.full_name}
                            </span>
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {entry.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.company ? (
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3 text-slate-400" />
                              {entry.company}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.user_count ? (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-slate-400" />
                              {entry.user_count.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.source ? (
                            <Badge variant="outline">{entry.source}</Badge>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm text-slate-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(entry.created_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {entry.access_granted ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Granted
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-700"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.access_granted ? (
                            <span className="text-xs text-slate-400">
                              {entry.access_granted_at
                                ? formatDate(entry.access_granted_at)
                                : "Granted"}
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleGrantAccess(entry.id)}
                              disabled={grantingAccess === entry.id}
                            >
                              {grantingAccess === entry.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Granting...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Grant Access
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
