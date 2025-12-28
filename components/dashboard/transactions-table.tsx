import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Filter, Download, MoreHorizontal } from "lucide-react";

interface Transaction {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: "Completed" | "Pending" | "Failed";
  payment: string;
  date: string;
}

// Mock data as per image if real data not available
const mockTransactions: Transaction[] = [
  {
    id: "#893427",
    customer: "Alex Morgan",
    product: "Jacket",
    amount: "$49.20",
    status: "Completed",
    payment: "Apple Pay",
    date: "Nov 12, 2025 3:42 PM",
  },
  {
    id: "#A74329",
    customer: "Megan Rapin",
    product: "Watch",
    amount: "$150.75",
    status: "Failed",
    payment: "PayPal",
    date: "Nov 13, 2025 4:20 PM",
  },
   {
    id: "#B8652C",
    customer: "Kristie Mewis",
    product: "Sunglass",
    amount: "$120.62",
    status: "Completed",
    payment: "Bank Transfer",
    date: "Nov 14, 2025 5:42 PM",
  },
  {
    id: "#C8872F",
    customer: "Rose Lavelle",
    product: "Cap",
    amount: "$200.45",
    status: "Pending",
    payment: "Stripe",
    date: "Nov 15, 2025 5:54 PM",
  },
];

export function TransactionsTable() {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-[#2B3674]">Recent Transactions</CardTitle>
        <div className="flex gap-2">
            <div className="relative">
                 <input 
                    type="text" 
                    placeholder="Search" 
                    className="pl-8 pr-4 py-2 rounded-full bg-[#F4F7FE] text-sm text-[#2B3674] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-[#4318FF]"
                 />
                 <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
            </div>
            <Button variant="outline" size="sm" className="rounded-full text-[#A3AED0] border-none bg-[#F4F7FE]">
                <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="rounded-full text-[#A3AED0] border-none bg-[#F4F7FE]">
                <Download className="h-4 w-4 mr-2" /> Export
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E0E5F2] hover:bg-transparent">
              <TableHead className="text-[#A3AED0] font-medium text-xs uppercase tracking-wider">ID</TableHead>
              <TableHead className="text-[#A3AED0] font-medium text-xs uppercase tracking-wider">Customer</TableHead>
              <TableHead className="text-[#A3AED0] font-medium text-xs uppercase tracking-wider">Product</TableHead>
              <TableHead className="text-[#A3AED0] font-medium text-xs uppercase tracking-wider">Amount</TableHead>
              <TableHead className="text-[#A3AED0] font-medium text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[#A3AED0] font-medium text-xs uppercase tracking-wider">Payment</TableHead>
              <TableHead className="text-[#A3AED0] font-medium text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-[#A3AED0] font-medium text-xs uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTransactions.map((tx) => (
              <TableRow key={tx.id} className="border-b border-transparent hover:bg-gray-50/50">
                <TableCell className="font-bold text-[#2B3674]">{tx.id}</TableCell>
                <TableCell className="font-bold text-[#2B3674]">{tx.customer}</TableCell>
                <TableCell className="font-bold text-[#2B3674]">{tx.product}</TableCell>
                <TableCell className="font-bold text-[#2B3674]">{tx.amount}</TableCell>
                <TableCell>
                  <Badge 
                    className={
                        tx.status === "Completed" ? "bg-[#05CD99] text-white hover:bg-[#05CD99]/90" : 
                        tx.status === "Failed" ? "bg-[#EE5D50] text-white hover:bg-[#EE5D50]/90" : 
                        "bg-[#FFCE20] text-white hover:bg-[#FFCE20]/90"
                    }
                  >
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-[#2B3674]">{tx.payment}</TableCell>
                <TableCell className="font-bold text-[#2B3674]">{tx.date}</TableCell>
                <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#A3AED0]">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
