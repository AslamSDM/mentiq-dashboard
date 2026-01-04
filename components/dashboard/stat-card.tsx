import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  iconBg?: string;
}

export function StatCard({ title, value, trend, trendLabel, icon, iconBg }: StatCardProps) {
  const isPositive = trend && trend > 0;

  return (
    <Card className="border-none shadow-sm hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-[#4363C7]">{title}</p>
            <h3 className="text-2xl font-bold text-[#2B3674] mt-1">{value}</h3>
          </div>
          {icon && (
            <div className={cn("p-3 rounded-full flex items-center justify-center", iconBg || "bg-[#F4F7FE]")}>
              {icon}
            </div>
          )}
        </div>
        
        {trend !== undefined && (
          <div className="flex items-center gap-2 mt-4 text-sm">
            <span
              className={cn(
                "flex items-center font-bold",
                isPositive ? "text-[#05CD99]" : "text-[#EE5D50]"
              )}
            >
              {isPositive ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
              {Math.abs(trend)}%
            </span>
            <span className="text-[#4363C7] text-xs">{trendLabel || "since last month"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
