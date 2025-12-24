"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { teamService, TeamMember, Invitation } from "@/lib/api";
import {
  Users,
  Mail,
  Crown,
  Shield,
  Eye,
  UserX,
  Send,
  X,
  RefreshCw,
  ArrowUpCircle,
} from "lucide-react";
import Link from "next/link";

const ROLE_ICONS = {
  owner: <Crown className="h-4 w-4 text-yellow-500" />,
  admin: <Shield className="h-4 w-4 text-blue-500" />,
  member: <Users className="h-4 w-4 text-green-500" />,
  viewer: <Eye className="h-4 w-4 text-gray-500" />,
};

const ROLE_DESCRIPTIONS = {
  owner: "Full control over account and billing",
  admin: "Can manage team members and settings",
  member: "Can access and use all features",
  viewer: "Read-only access to data",
};

export default function TeamPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  // Team info
  const [teamInfo, setTeamInfo] = useState({ total: 0, limit: 0, tier: "" });

  // Dialogs
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [inviteToCancel, setInviteToCancel] = useState<Invitation | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersData, invitesData] = await Promise.all([
        teamService.listMembers(),
        teamService.listInvitations("pending"),
      ]);

      setMembers(membersData.members);
      setTeamInfo({
        total: membersData.total,
        limit: membersData.limit,
        tier: membersData.tier,
      });
      setInvitations(invitesData.invitations);

      // Find current user from members list
      const response = await fetch("/api/auth/session");
      const sessionData = await response.json();
      const currentEmail = sessionData?.user?.email;

      if (currentEmail) {
        setCurrentUserEmail(currentEmail);
        const currentMember = membersData.members.find(
          (m: TeamMember) => m.email === currentEmail
        );
        if (currentMember) {
          setCurrentUserRole(currentMember.role);

          // Check if user has permission to view team page
          if (
            currentMember.role !== "owner" &&
            currentMember.role !== "admin"
          ) {
            toast({
              title: "Access Denied",
              description: "Only owners and admins can manage team members",
              variant: "destructive",
            });
            // Optionally redirect
            window.location.href = "/dashboard";
            return;
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load team data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await teamService.createInvitation(inviteEmail, inviteRole);
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}`,
      });
      setInviteEmail("");
      setInviteRole("member");
      fetchData();
    } catch (error: any) {
      if (
        error.response?.status === 403 &&
        error.response?.data?.upgrade_required
      ) {
        setShowUpgradeDialog(true);
      } else {
        toast({
          title: "Error",
          description:
            error.response?.data?.error || "Failed to send invitation",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await teamService.updateMemberRole(memberId, newRole);
      toast({
        title: "Success",
        description: "Member role updated",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await teamService.removeMember(memberToRemove.id);
      toast({
        title: "Success",
        description: "Team member removed",
      });
      setMemberToRemove(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const confirmCancelInvite = async () => {
    if (!inviteToCancel) return;

    try {
      await teamService.cancelInvitation(inviteToCancel.id);
      toast({
        title: "Success",
        description: "Invitation canceled",
      });
      setInviteToCancel(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      });
    }
  };

  const handleResendInvite = async (invitationId: string) => {
    try {
      await teamService.resendInvitation(invitationId);
      toast({
        title: "Success",
        description: "Invitation resent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  const getUsageColor = () => {
    if (teamInfo.limit === 0) return "text-green-600";
    const usage = teamInfo.total / teamInfo.limit;
    if (usage >= 1) return "text-red-600";
    if (usage >= 0.8) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Team Members"
          description="Manage your team and invite new members"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading team...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalUsers = teamInfo.total + invitations.length;
  const isAtLimit = teamInfo.limit > 0 && totalUsers >= teamInfo.limit;

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Team Members"
        description="Manage your team and invite new members"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Team Size Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Size</CardTitle>
                <CardDescription>
                  Current plan:{" "}
                  <span className="font-semibold capitalize">
                    {teamInfo.tier}
                  </span>
                </CardDescription>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getUsageColor()}`}>
                  {members.length +1} / {teamInfo.limit === 0 ? "∞" : teamInfo.limit}
                </div>
                <p className="text-sm text-muted-foreground">
                  {members.length +1} Members, {invitations.length} Pending
                </p>
                {teamInfo.limit > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    You can invite {teamInfo.limit - (members.length +1)} more{" "}
                    {teamInfo.limit - (members.length +1) === 1 ? "member" : "members"}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          {isAtLimit && (
            <CardContent>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
                <ArrowUpCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Team limit reached
                  </p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                    Your plan includes {teamInfo.limit} total{" "}
                    {teamInfo.limit === 1 ? "user" : "users"} (you +{" "}
                    {teamInfo.limit - 1}{" "}
                    {teamInfo.limit - 1 === 1 ? "team member" : "team members"}
                    ). Upgrade to add more members.
                  </p>
                </div>
                <Link href="/pricing">
                  <Button size="sm" variant="outline">
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Invite Section */}
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
            <CardDescription>
              {teamInfo.limit > 0
                ? `Send an invitation to add a new team member (${
                    teamInfo.limit - totalUsers
                  } ${
                    teamInfo.limit - totalUsers === 1 ? "slot" : "slots"
                  } remaining)`
                : "Send an invitation email to add a new team member"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={
                    submitting ||
                    isAtLimit ||
                    (currentUserRole !== "owner" && currentUserRole !== "admin")
                  }
                />
              </div>
              <Select
                value={inviteRole}
                onValueChange={setInviteRole}
                disabled={
                  submitting ||
                  isAtLimit ||
                  (currentUserRole !== "owner" && currentUserRole !== "admin")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="submit"
                disabled={
                  submitting ||
                  isAtLimit ||
                  (currentUserRole !== "owner" && currentUserRole !== "admin")
                }
              >
                <Mail className="h-4 w-4 mr-2" />
                {submitting ? "Sending..." : "Send Invite"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              {ROLE_DESCRIPTIONS[inviteRole as keyof typeof ROLE_DESCRIPTIONS]}
            </p>
          </CardContent>
        </Card>

        {/* Team Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({members.length})</CardTitle>
            <CardDescription>Manage roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No team members yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.full_name}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {ROLE_ICONS[member.role]}
                            {member.role === "owner" ? (
                              <Badge variant="secondary" className="capitalize">
                                Owner
                              </Badge>
                            ) : (
                              <Select
                                value={member.role}
                                onValueChange={(value) =>
                                  handleUpdateRole(member.id, value)
                                }
                                disabled={
                                  currentUserRole !== "owner" &&
                                  currentUserRole !== "admin"
                                }
                              >
                                <SelectTrigger className="w-[130px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(member.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {member.role === "owner" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              title="Cannot remove owner"
                            >
                              <UserX className="h-4 w-4 text-gray-400" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMemberToRemove(member)}
                              disabled={
                                currentUserRole !== "owner" &&
                                currentUserRole !== "admin"
                              }
                            >
                              <UserX className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
              <CardDescription>
                Invitations waiting to be accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-medium">
                          {invite.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {invite.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invite.invited_by?.full_name || "Unknown"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(invite.expires_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendInvite(invite.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInviteToCancel(invite)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Member Limit Reached</DialogTitle>
            <DialogDescription>
              Your current plan ({teamInfo.tier}) includes {teamInfo.limit}{" "}
              total {teamInfo.limit === 1 ? "user" : "users"} (you +{" "}
              {teamInfo.limit - 1} additional{" "}
              {teamInfo.limit - 1 === 1 ? "member" : "members"}). Upgrade to add
              more members to your team.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Current usage:{" "}
              <span className="font-semibold">
                {totalUsers} / {teamInfo.limit}
              </span>
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
            >
              Cancel
            </Button>
            <Link href="/pricing">
              <Button>
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{memberToRemove?.full_name}</strong> from your team? They
              will lose access to all projects and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invitation Dialog */}
      <AlertDialog
        open={!!inviteToCancel}
        onOpenChange={() => setInviteToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation to{" "}
              <strong>{inviteToCancel?.email}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelInvite}>
              Yes, Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
