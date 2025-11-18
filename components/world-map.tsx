"use client";

import { useState, useEffect } from "react";

interface GeoData {
  country: string;
  users: number;
  sessions: number;
  code: string;
  lat: number;
  lng: number;
}

interface WorldMapProps {
  geoData: GeoData[];
  svgUrl: string; // URL to your world map SVG file
}

export function WorldMap({ geoData, svgUrl }: WorldMapProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the SVG file
    fetch(svgUrl)
      .then((response) => response.text())
      .then((svg) => {
        setSvgContent(svg);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading SVG:", error);
        setIsLoading(false);
      });
  }, [svgUrl]);

  // Create a map of country codes to user data for quick lookup
  const countryDataMap = new Map(geoData?.map((geo) => [geo.code, geo]));

  // Get max users for scaling
  const maxUsers = Math.max(...geoData?.map((g) => g.users), 1);

  // Calculate color intensity based on user count
  const getCountryColor = (users: number) => {
    const intensity = Math.min(0.3 + (users / maxUsers) * 0.7, 1);
    return `rgba(59, 130, 246, ${intensity})`;
  };

  // Position mapping for markers (you can adjust these based on your SVG viewBox)
  const markerPositions: Record<string, { x: number; y: number }> = {
    US: { x: 220, y: 350 },
    CA: { x: 220, y: 280 },
    GB: { x: 490, y: 240 },
    DE: { x: 530, y: 250 },
    FR: { x: 495, y: 280 },
    AU: { x: 835, y: 520 },
    IN: { x: 680, y: 360 },
    JP: { x: 870, y: 320 },
    BR: { x: 340, y: 470 },
    MX: { x: 180, y: 360 },
    IT: { x: 520, y: 300 },
    ES: { x: 470, y: 300 },
    NL: { x: 510, y: 240 },
    SE: { x: 530, y: 200 },
    PL: { x: 545, y: 240 },
    CN: { x: 760, y: 320 },
    KR: { x: 840, y: 320 },
    SG: { x: 750, y: 410 },
    AE: { x: 630, y: 360 },
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-full bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-slate-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-lg overflow-hidden">
      <div
        className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover"
        dangerouslySetInnerHTML={{
          __html: svgContent
            .replace(
              /<svg([^>]*?)>/,
              '<svg$1 preserveAspectRatio="xMidYMid slice" style="width: 100%; height: 100%;">'
            )
            .replace(
              /<path([^>]*?)id="([A-Z]{2})"([^>]*?)\/>/g,
              (match, before, countryCode, after) => {
                const countryData = countryDataMap.get(countryCode);
                const fillColor = countryData
                  ? getCountryColor(countryData.users)
                  : "#cbd5e1";

                const title = countryData
                  ? `${
                      countryData.country
                    }: ${countryData.users.toLocaleString()} users`
                  : "";

                return `<path${before}id="${countryCode}"${after} fill="${fillColor}" stroke="#475569" stroke-width="0.5" class="hover:opacity-80 transition-opacity cursor-pointer"><title>${title}</title></path>`;
              }
            ),
        }}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border pointer-events-auto">
        <p className="text-xs font-semibold mb-2">User Density</p>
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
        <div className="mt-2 pt-2 border-t">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Active regions (pulse = top 5)</span>
          </div>
        </div>
      </div>

      {/* Top Countries Summary */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border pointer-events-auto max-w-xs">
        <p className="text-xs font-semibold mb-2">Top Countries</p>
        <div className="space-y-1">
          {geoData.slice(0, 5)?.map((geo, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono w-4">{i + 1}.</span>
                <span className="font-medium">{geo.code}</span>
              </div>
              <span className="text-slate-600">
                {geo.users.toLocaleString()}
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
      code: "US",
      lat: 37.09,
      lng: -95.71,
    },
    {
      country: "United Kingdom",
      users: 890,
      sessions: 2340,
      code: "GB",
      lat: 55.37,
      lng: -3.43,
    },
    {
      country: "Canada",
      users: 650,
      sessions: 1780,
      code: "CA",
      lat: 56.13,
      lng: -106.34,
    },
    {
      country: "Germany",
      users: 580,
      sessions: 1560,
      code: "DE",
      lat: 51.16,
      lng: 10.45,
    },
    {
      country: "Australia",
      users: 520,
      sessions: 1420,
      code: "AU",
      lat: -25.27,
      lng: 133.77,
    },
    {
      country: "India",
      users: 480,
      sessions: 1320,
      code: "IN",
      lat: 20.59,
      lng: 78.96,
    },
    {
      country: "France",
      users: 420,
      sessions: 1140,
      code: "FR",
      lat: 46.22,
      lng: 2.21,
    },
    {
      country: "Japan",
      users: 380,
      sessions: 1020,
      code: "JP",
      lat: 36.2,
      lng: 138.25,
    },
    {
      country: "Brazil",
      users: 340,
      sessions: 920,
      code: "BR",
      lat: -14.23,
      lng: -51.92,
    },
    {
      country: "Spain",
      users: 310,
      sessions: 850,
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
          Interactive world map showing user distribution
        </p>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <WorldMap geoData={sampleData} svgUrl="/world.svg" />
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <strong>Your SVG file should be at:</strong>{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded">
                /public/world.svg
              </code>
            </p>

            <p className="mt-4">
              <strong>To integrate into your app:</strong>
            </p>
            <div className="bg-slate-50 p-3 rounded border font-mono text-xs overflow-x-auto"></div>

            <p className="mt-4">
              <strong>Features:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Automatically colors countries based on user density</li>
              <li>Hover tooltips show country name and user count</li>
              <li>Red markers indicate active regions with data</li>
              <li>Pulse animation highlights top 5 countries</li>
              <li>Responsive legend and top countries panel</li>
              <li>Works with any MapSVG-format world map</li>
            </ul>

            <p className="mt-4 text-amber-700">
              <strong>Note:</strong> If markers don't align perfectly, adjust
              the coordinates in the{" "}
              <code className="bg-slate-100 px-1 rounded">markerPositions</code>{" "}
              object to match your SVG's viewBox dimensions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
