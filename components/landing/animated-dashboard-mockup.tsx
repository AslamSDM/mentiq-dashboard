"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Activity, BarChart3, AlertCircle, Sparkles, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  delay?: number;
}

function MetricCard({ label, value, change, trend, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#E0E5F2] p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#4363C7] font-medium">{label}</span>
        <div className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
          trend === "up" && "bg-emerald-100 text-emerald-700",
          trend === "down" && "bg-red-100 text-red-700",
          trend === "neutral" && "bg-gray-100 text-gray-600"
        )}>
          {change}
        </div>
      </div>
      <div className="text-xl font-bold text-[#2B3674]">{value}</div>
      <div className="mt-2 h-8 flex items-end gap-0.5">
        {[40, 60, 45, 70, 55, 80, 65, 90, 75, 85].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.5, delay: delay + 0.1 + i * 0.05 }}
            className="flex-1 bg-gradient-to-t from-primary/60 to-primary/30 rounded-sm"
          />
        ))}
      </div>
    </motion.div>
  );
}

interface InsightCardProps {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  delay?: number;
}

function InsightCard({ title, description, priority, delay = 0 }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#E0E5F2] p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          priority === "high" && "bg-red-100 text-red-600",
          priority === "medium" && "bg-amber-100 text-amber-600",
          priority === "low" && "bg-blue-100 text-blue-600"
        )}>
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[#2B3674]">{title}</h4>
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize",
              priority === "high" && "bg-red-100 text-red-700",
              priority === "medium" && "bg-amber-100 text-amber-700",
              priority === "low" && "bg-blue-100 text-blue-700"
            )}>
              {priority}
            </span>
          </div>
          <p className="text-xs text-[#4363C7] mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedChart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#E0E5F2] p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-[#2B3674]">Retention Cohort</h4>
          <p className="text-xs text-[#4363C7]">Weekly retention trends</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-[10px] text-[#4363C7]">Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#E0E5F2]"></div>
            <span className="text-[10px] text-[#4363C7]">Previous</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-32">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-dashed border-[#E0E5F2]"
            style={{ top: `${i * 25}%` }}
          />
        ))}
        
        {/* Animated line chart */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <motion.path
            d="M0,100 Q50,80 100,70 T200,60 T300,50 T400,45"
            fill="url(#lineGradient)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          
          {/* Main line */}
          <motion.path
            d="M0,100 Q50,80 100,70 T200,60 T300,50 T400,45"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
          />
          
          {/* Data points */}
          {[
            { x: 0, y: 100 },
            { x: 100, y: 70 },
            { x: 200, y: 60 },
            { x: 300, y: 50 },
            { x: 400, y: 45 },
          ].map((point, i) => (
            <motion.circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke="var(--primary)"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
            />
          ))}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-[#4363C7]">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-[10px] text-[#4363C7]">
        <span>Week 1</span>
        <span>Week 2</span>
        <span>Week 3</span>
        <span>Week 4</span>
      </div>
    </motion.div>
  );
}

function ActivityFeed() {
  const activities = [
    { icon: Users, text: "12 at-risk accounts identified", time: "2m ago", color: "text-red-500" },
    { icon: TrendingUp, text: "Retention improved by 8%", time: "15m ago", color: "text-emerald-500" },
    { icon: Sparkles, text: "AI playbook triggered for 5 accounts", time: "1h ago", color: "text-primary" },
    { icon: Shield, text: "Health score updated for 234 users", time: "2h ago", color: "text-blue-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#E0E5F2] p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[#2B3674]">Recent Activity</h4>
        <Activity className="w-4 h-4 text-[#4363C7]" />
      </div>
      
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={`w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center ${activity.color}`}>
              <activity.icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#2B3674] truncate">{activity.text}</p>
              <p className="text-[10px] text-[#4363C7]">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function AnimatedDashboardMockup({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={cn(
        "relative rounded-2xl border border-[#E0E5F2] bg-white/60 backdrop-blur-xl shadow-2xl overflow-hidden",
        className
      )}
    >
      {/* Glow effects */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
      
      {/* Header */}
      <div className="relative border-b border-[#E0E5F2] p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-[#F4F7FE] rounded-lg">
              <BarChart3 className="w-4 h-4 text-[#4363C7]" />
              <span className="text-xs text-[#4363C7]">Mentiq Dashboard</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="relative p-4 space-y-4">
        {/* Top Row - Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Active Users"
            value="2,847"
            change="+12.5%"
            trend="up"
            delay={0.1}
          />
          <MetricCard
            label="Churn Rate"
            value="4.2%"
            change="-2.1%"
            trend="up"
            delay={0.2}
          />
          <MetricCard
            label="Health Score"
            value="87/100"
            change="+5.3%"
            trend="up"
            delay={0.3}
          />
        </div>
        
        {/* Middle Row - Chart & Insights */}
        <div className="grid grid-cols-2 gap-3">
          <AnimatedChart />
          <div className="space-y-3">
            <InsightCard
              title="At-Risk Accounts"
              description="42 accounts showing usage drop + billing friction"
              priority="high"
              delay={0.4}
            />
            <InsightCard
              title="Save Priority"
              description="High-value segment: 10-50 seats with expansion potential"
              priority="medium"
              delay={0.5}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 p-3"
            >
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#2B3674]">AI Recommendation</h4>
                  <p className="text-[10px] text-[#4363C7] mt-0.5">
                    Trigger outreach playbook before renewal window closes
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Bottom Row - Activity */}
        <ActivityFeed />
      </div>
      
      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </motion.div>
  );
}

export function CompactDashboardMockup({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={cn(
        "relative rounded-2xl border border-[#E0E5F2] bg-white/70 backdrop-blur-xl shadow-xl overflow-hidden",
        className
      )}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-medium text-[#4363C7]">Your data, simplified</div>
            <div className="mt-1 font-sans text-xl tracking-tight text-[#2B3674]">
              What's happening — and what to do next
            </div>
          </div>
          <div className="rounded-xl border border-[#E0E5F2] bg-[#F4F7FE] p-2">
            <Zap className="h-5 w-5 text-[#4363C7]" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-[#E0E5F2] bg-[#F4F7FE] p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#4363C7]">At-risk accounts</div>
              <div className="text-xs text-emerald-600 font-medium">42</div>
            </div>
            <div className="mt-1 text-xs text-[#4363C7]">Usage drop + billing friction pattern.</div>
          </div>

          <div className="rounded-xl border border-[#E0E5F2] bg-[#F4F7FE] p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#4363C7]">Save priority</div>
              <div className="text-xs text-emerald-600 font-medium">High</div>
            </div>
            <div className="mt-1 text-xs text-[#4363C7]">Segment: 10–50 seats · expansion likely.</div>
          </div>

          <div className="rounded-xl border border-[#E0E5F2] bg-[#F4F7FE] p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#4363C7]">Next best action</div>
              <div className="text-xs text-emerald-600 font-medium">Playbook</div>
            </div>
            <div className="mt-1 text-xs text-[#4363C7]">Trigger outreach before renewal window.</div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#E0E5F2] bg-gradient-to-r from-[#F4F7FE] to-white p-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl border border-[#E0E5F2] bg-white p-2">
              <Sparkles className="h-4 w-4 text-[#4363C7]" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#4363C7]">Plain-English takeaway</div>
              <div className="mt-1 text-xs leading-relaxed text-[#4363C7]">
                One page shows: who's slipping, what changed, and the next best playbook.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-[10px] text-[#4363C7]">Updated Sunday · 7-day snapshot</div>
          <div className="inline-flex items-center gap-1 text-[10px] text-[#4363C7]">
            View full report
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
