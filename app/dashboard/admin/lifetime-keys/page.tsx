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
import { adminService, type LifetimeKey } from "@/lib/services/admin";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  Key,
  CheckCircle,
  Clock,
  Plus,
  Copy,
  Filter,
} from "lucide-react";

type FilterType = "all" | "available" | "redeemed";

export default function AdminLifetimeKeysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [keys, setKeys] = useState<LifetimeKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  // Generate form
  const [generateCount, setGenerateCount] = useState(1);
  const [generateNote, setGenerateNote] = useState("");
  const [generating, setGenerating] = useState(false);

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

  const fetchKeys = async (f?: FilterType) => {
    try {
      setLoading(true);
      const data = await adminService.getLifetimeKeys(f ?? filter);
      setKeys(data.keys || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load lifetime keys.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.isAdmin) {
      fetchKeys();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    fetchKeys(newFilter);
  };

  const handleGenerate = async () => {
    if (generateCount < 1 || generateCount > 100) return;
    setGenerating(true);
    try {
      const data = await adminService.generateLifetimeKeys(
        generateCount,
        generateNote || undefined,
      );
      toast({
        title: "Keys Generated",
        description: data.message,
      });
      setGenerateNote("");
      setGenerateCount(1);
      fetchKeys();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate keys.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied", description: "Key copied to clipboard." });
  };

  const copyAllAvailable = () => {
    const available = filteredKeys
      .filter((k) => !k.is_redeemed)
      .map((k) => k.key);
    if (available.length === 0) {
      toast({
        title: "Nothing to copy",
        description: "No available keys match your search.",
      });
      return;
    }
    navigator.clipboard.writeText(available.join("\n"));
    toast({
      title: "Copied",
      description: `${available.length} key(s) copied to clipboard.`,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredKeys = keys.filter((key) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      key.key.toLowerCase().includes(q) ||
      (key.note && key.note.toLowerCase().includes(q)) ||
      (key.redeemed_by && key.redeemed_by.toLowerCase().includes(q))
    );
  });

  const totalKeys = keys.length;
  const availableCount = keys.filter((k) => !k.is_redeemed).length;
  const redeemedCount = keys.filter((k) => k.is_redeemed).length;

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
        title="Admin - Lifetime Keys"
        description="Generate and manage lifetime activation keys"
      />

      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalKeys}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Clock className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {availableCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redeemed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {redeemedCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Keys */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Keys</CardTitle>
            <CardDescription>
              Create new lifetime activation keys. Keys follow the format
              MQ-XXXX-XXXX-XXXX-XXXX.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Count
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={generateCount}
                  onChange={(e) =>
                    setGenerateCount(
                      Math.max(1, Math.min(100, Number(e.target.value))),
                    )
                  }
                  className="w-24"
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-slate-700">
                  Note (optional)
                </label>
                <Input
                  placeholder='e.g. "AppSumo batch 1"'
                  value={generateNote}
                  onChange={(e) => setGenerateNote(e.target.value)}
                />
              </div>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Keys Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Keys</CardTitle>
            <CardDescription>
              Click a key to copy it. Use the filter to narrow results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by key, note, or redeemer..."
                  className="pl-10"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1 rounded-lg border p-1">
                <Filter className="h-4 w-4 text-slate-400 ml-2" />
                {(["all", "available", "redeemed"] as FilterType[]).map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={filter === f ? "default" : "ghost"}
                    className="h-7 text-xs capitalize"
                    onClick={() => handleFilterChange(f)}
                  >
                    {f}
                  </Button>
                ))}
              </div>

              {/* Bulk copy */}
              <Button
                size="sm"
                variant="outline"
                onClick={copyAllAvailable}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Available
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Key className="h-12 w-12 mb-4 opacity-50" />
                <p>
                  {searchQuery
                    ? "No keys match your search"
                    : "No keys generated yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Redeemed</TableHead>
                      <TableHead>Redeemed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>
                          <button
                            onClick={() => copyToClipboard(key.key)}
                            className="font-mono text-sm hover:text-blue-600 transition-colors flex items-center gap-1.5 group"
                            title="Click to copy"
                          >
                            {key.key}
                            <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </TableCell>
                        <TableCell>
                          {key.note ? (
                            <span className="text-sm text-slate-600">
                              {key.note}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {key.is_redeemed ? (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Redeemed
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-700"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Available
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {formatDate(key.created_at)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {formatDate(key.redeemed_at)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 font-mono">
                          {key.redeemed_by ? (
                            <span title={key.redeemed_by}>
                              {key.redeemed_by.slice(0, 8)}...
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
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
