"use client";

import { useState, useEffect } from "react";
// @ts-ignore
import World from "@react-map/world";

interface GeoData {
  country: string;
  users: number;
  sessions: number;
  events?: number;
  code: string;
  lat: number;
  lng: number;
}

type MetricType = "users" | "sessions" | "events";

interface WorldMapProps {
  geoData: GeoData[];
  metric?: MetricType;
  onMetricChange?: (metric: MetricType) => void;
}

interface TooltipState {
  country: string;
  x: number;
  y: number;
}

export function WorldMap({ geoData, metric = "sessions", onMetricChange }: WorldMapProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>(metric);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Create a lookup map for quick data access
  const dataByCountry = Object.fromEntries(
    geoData.map((geo) => [geo.country, geo])
  );

  // Track mouse position and hovered country
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as SVGPathElement;
      if (target.tagName === "path" && target.id) {
        // Extract country name from the element id (format: "CountryName-instanceId")
        const countryName = target.id.replace(/-[^-]+$/, "");
        if (dataByCountry[countryName]) {
          setTooltip({
            country: countryName,
            x: e.clientX,
            y: e.clientY,
          });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as SVGPathElement;
      if (target.tagName === "path") {
        setTooltip(null);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [dataByCountry]);

  const handleMetricChange = (newMetric: MetricType) => {
    setSelectedMetric(newMetric);
    onMetricChange?.(newMetric);
  };

  // Get value based on selected metric
  const getValue = (geo: GeoData): number => {
    switch (selectedMetric) {
      case "users":
        return geo.users;
      case "sessions":
        return geo.sessions;
      case "events":
        return geo.events ?? geo.sessions;
      default:
        return geo.sessions;
    }
  };

  // Get max value for scaling
  const maxValue = Math.max(...geoData?.map((g) => getValue(g)), 1);

  // Calculate color intensity based on value
  const getCountryColor = (value: number) => {
    const intensity = Math.min(0.3 + (value / maxValue) * 0.7, 1);
    return `rgba(59, 130, 246, ${intensity})`;
  };

  // Library uses full country names as keys, not ISO codes
  const cityColors = Object.fromEntries(
    geoData.map((geo) => [geo.country, getCountryColor(getValue(geo))])
  );

  // Sort data by current metric for the summary
  const sortedData = [...geoData].sort((a, b) => getValue(b) - getValue(a));

  const metricLabels: Record<MetricType, string> = {
    users: "Users",
    sessions: "Sessions",
    events: "Events",
  };

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto">
          <World
            type="select-single"
            mapColor="#cbd5e1"
            strokeColor="#475569"
            strokeWidth={0.5}
            hoverColor="rgba(59, 130, 246, 0.8)"
            cityColors={cityColors}
            hints={false}
          />
        </div>
      </div>

      {/* Custom Tooltip */}
      {tooltip && dataByCountry[tooltip.country] && (
        <div
          className="fixed z-50 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border pointer-events-none"
          style={{
            top: tooltip.y + 15,
            left: tooltip.x + 15,
          }}
        >
          <p className="font-semibold text-sm mb-2">{tooltip.country}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Events:</span>
              <span className="font-medium">
                {(dataByCountry[tooltip.country].events ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Sessions:</span>
              <span className="font-medium">
                {dataByCountry[tooltip.country].sessions.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Users:</span>
              <span className="font-medium">
                {dataByCountry[tooltip.country].users.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Metric Toggle */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border pointer-events-auto">
        <div className="flex gap-1">
          {(["sessions", "users", "events"] as MetricType[]).map((m) => (
            <button
              key={m}
              onClick={() => handleMetricChange(m)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                selectedMetric === m
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {metricLabels[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border pointer-events-auto">
        <p className="text-xs font-semibold mb-2">{metricLabels[selectedMetric]} Density</p>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.3)" }}
            ></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.65)" }}
            ></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "rgba(59, 130, 246, 1)" }}
            ></div>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Top Countries Summary */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border pointer-events-auto max-w-xs">
        <p className="text-xs font-semibold mb-2">Top Countries by {metricLabels[selectedMetric]}</p>
        <div className="space-y-1">
          {sortedData.slice(0, 5)?.map((geo, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono w-4">{i + 1}.</span>
                <span className="font-medium">{geo.code}</span>
              </div>
              <span className="text-slate-600">
                {getValue(geo).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Demo component with sample data
export default function WorldMapDemo() {
  const sampleData: GeoData[] = [
    {
      country: "United States",
      users: 1250,
      sessions: 3420,
      events: 8540,
      code: "US",
      lat: 37.09,
      lng: -95.71,
    },
    {
      country: "United Kingdom",
      users: 890,
      sessions: 2340,
      events: 5820,
      code: "GB",
      lat: 55.37,
      lng: -3.43,
    },
    {
      country: "Canada",
      users: 650,
      sessions: 1780,
      events: 4210,
      code: "CA",
      lat: 56.13,
      lng: -106.34,
    },
    {
      country: "Germany",
      users: 580,
      sessions: 1560,
      events: 3890,
      code: "DE",
      lat: 51.16,
      lng: 10.45,
    },
    {
      country: "Australia",
      users: 520,
      sessions: 1420,
      events: 3540,
      code: "AU",
      lat: -25.27,
      lng: 133.77,
    },
    {
      country: "India",
      users: 480,
      sessions: 1320,
      events: 3280,
      code: "IN",
      lat: 20.59,
      lng: 78.96,
    },
    {
      country: "France",
      users: 420,
      sessions: 1140,
      events: 2850,
      code: "FR",
      lat: 46.22,
      lng: 2.21,
    },
    {
      country: "Japan",
      users: 380,
      sessions: 1020,
      events: 2540,
      code: "JP",
      lat: 36.2,
      lng: 138.25,
    },
    {
      country: "Brazil",
      users: 340,
      sessions: 920,
      events: 2280,
      code: "BR",
      lat: -14.23,
      lng: -51.92,
    },
    {
      country: "Spain",
      users: 310,
      sessions: 850,
      events: 2120,
      code: "ES",
      lat: 40.46,
      lng: -3.74,
    },
  ];

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Geographic Analytics Dashboard
        </h1>
        <p className="text-slate-600 mb-6">
          Interactive world map showing event distribution by country
        </p>

        <div className="bg-white rounded-xl shadow-lg p-6 h-[500px]">
          <WorldMap geoData={sampleData} metric="events" />
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <strong>Features:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Toggle between Events, Sessions, and Users metrics</li>
              <li>Countries colored based on selected metric density</li>
              <li>Hover tooltips show country name</li>
              <li>Responsive legend and top countries panel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
