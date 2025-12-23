"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { PRICING_TIERS, getTierByUserCount, PricingTier } from "@/lib/constants";

// Color mapping for tiers
const TIER_COLORS: Record<string, string> = {
  launch: "from-blue-500 to-cyan-500",
  traction: "from-purple-500 to-pink-500",
  momentum: "from-orange-500 to-red-500",
  scale: "from-green-500 to-emerald-500",
  expansion: "from-yellow-500 to-amber-500",
  enterprise: "from-yellow-500 to-amber-500",
};

// Create checkpoints from tier ranges (midpoint of each range)
const createCheckpoints = () => {
  const checkpoints: {
    value: number;
    label: string;
    tierName: string;
    range: readonly [number, number];
  }[] = PRICING_TIERS.filter((t) => t.id !== "enterprise").map((tier) => {
    const midpoint = Math.floor((tier.range[0] + tier.range[1]) / 2);
    return {
      value: midpoint,
      label: tier.range[1].toLocaleString(),
      tierName: tier.name,
      range: tier.range,
    };
  });
  checkpoints.push({
    value: 11000,
    label: "10,000+",
    tierName: "Enterprise",
    range: [10001, Infinity],
  });
  return checkpoints;
};

const CHECKPOINTS = createCheckpoints();

interface UserCountSliderProps {
  userCount: number;
  onUserCountChange: (count: number) => void;
  showPrice?: boolean;
  compact?: boolean;
}

export function UserCountSlider({
  userCount,
  onUserCountChange,
  showPrice = true,
  compact = false,
}: UserCountSliderProps) {
  const currentTier = getTierByUserCount(userCount);
  const currentIndex = CHECKPOINTS.findIndex((cp) => cp.value === userCount);

  const handleSliderChange = (value: number[]) => {
    onUserCountChange(CHECKPOINTS[value[0]].value);
  };

  const calculatePrice = (tier: PricingTier) => {
    return tier.basePrice;
  };

  return (
    <div className="space-y-6">
      {/* Main display - showing MAX users for the tier */}
      <div className="text-center transition-all duration-300">
        <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-400">
          {userCount > 10000
            ? "10,000+"
            : currentTier
              ? currentTier.range[1].toLocaleString()
              : userCount.toLocaleString()}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {currentTier && userCount <= 10000 && (
            <span>Maximum paid users in this tier</span>
          )}
          {userCount > 10000 && <span>Unlimited paid users</span>}
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-3">
        <div className="relative px-2">
          <Slider
            value={[currentIndex >= 0 ? currentIndex : 0]}
            onValueChange={handleSliderChange}
            min={0}
            max={CHECKPOINTS.length - 1}
            step={1}
            className="w-full"
          />
        </div>
        <div className="relative px-2 h-12">
          <div className="flex justify-between text-xs text-gray-500">
            {CHECKPOINTS.map((cp, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center"
                style={{
                  position: "absolute",
                  left: `${(idx / (CHECKPOINTS.length - 1)) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="h-2 w-0.5 bg-gray-600 mb-1"></div>
                <span className="whitespace-nowrap">{cp.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tier badge and price */}
      {showPrice && currentTier && userCount <= 10000 && (
        <div className="flex items-center justify-center gap-3 text-sm animate-in fade-in-50 duration-500">
          <Badge
            variant="secondary"
            className={`px-4 py-2 text-base font-semibold transition-all duration-300 bg-gradient-to-r ${
              TIER_COLORS[currentTier.id]
            } text-white border-0 shadow-lg`}
          >
            {currentTier.name} Tier
          </Badge>
          <span className="text-lg font-bold text-white">
            ${calculatePrice(currentTier)}/month
          </span>
        </div>
      )}

      {showPrice && userCount > 10000 && (
        <div className="flex items-center justify-center gap-3 text-sm animate-in fade-in-50 duration-500">
          <Badge
            variant="secondary"
            className="px-4 py-2 text-base font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-lg"
          >
            Enterprise
          </Badge>
          <span className="text-lg font-bold text-white">Custom pricing</span>
        </div>
      )}
    </div>
  );
}

// Export checkpoints and tier colors for use in parent components
export { CHECKPOINTS, TIER_COLORS };
