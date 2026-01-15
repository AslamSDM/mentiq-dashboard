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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorldMap } from "@/components/world-map";
import { useStore } from "@/lib/store";
import { centralizedData } from "@/lib/services/centralized-data";
import { Loader2, MapPin, Globe, TrendingUp } from "lucide-react";

interface LocationData {
  by_country: CountryData[];
  by_city: CityData[];
  summary: {
    total_countries: number;
    total_cities: number;
    top_country: string;
    top_city: string;
    international_rate: number;
  };
}

interface CountryData {
  country: string;
  country_code: string;
  sessions: number;
  users: number;
  events: number;
  conversion_rate: number;
}

interface CityData {
  city: string;
  country: string;
  sessions: number;
  users: number;
  events: number;
  revenue: number;
}

export default function LocationAnalyticsPage() {
  const { getEffectiveProjectId } = useStore();
  const selectedProjectId = getEffectiveProjectId();
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const fetchLocationAnalytics = async () => {
    if (!selectedProjectId) return;

    setIsLoading(true);
    try {
      const response = await centralizedData.getLocationData(
        selectedProjectId,
        dateRange.start,
        dateRange.end
      );

      if (response.data && response.data.locations) {
        // Transform the API data to match the expected format
        const countries = response.data.locations.reduce(
          (acc: any[], loc: any) => {
            const existing = acc.find((c) => c.country === loc.country);
            if (existing) {
              existing.sessions += loc.session_count || 1;
              existing.users += loc.unique_users;
              existing.events += loc.event_count;
            } else {
              acc.push({
                country: loc.country,
                country_code: getCountryCodeFromName(loc.country),
                sessions: loc.session_count || 1,
                users: loc.unique_users,
                events: loc.event_count,
                conversion_rate: 0, // Would need actual conversion data
              });
            }
            return acc;
          },
          []
        );

        const cities = response.data.locations
          .filter((loc: any) => loc.city)
          ?.map((loc: any) => ({
            city: loc.city || "Unknown",
            country: loc.country,
            sessions: loc.session_count || 1,
            users: loc.unique_users,
            events: loc.event_count,
            revenue: 0, // Would need revenue data from another source
          }));

        setLocationData({
          by_country: countries
            .sort((a: any, b: any) => b.users - a.users)
            .slice(0, 10),
          by_city: cities
            .sort((a: any, b: any) => b.users - a.users)
            .slice(0, 10),
          summary: {
            total_countries: [
              ...new Set(response.data.locations?.map((l: any) => l.country)),
            ].length,
            total_cities: [
              ...new Set(
                response.data.locations
                  .filter((l: any) => l.city)
                  ?.map((l: any) => l.city)
              ),
            ].length,
            top_country: countries.length > 0 ? countries[0].country : "N/A",
            top_city: cities.length > 0 ? cities[0].city : "N/A",
            international_rate: 0.35, // Would need to calculate from data
          },
        });
      }
    } catch (error) {
      // Silent fail - data will show empty state
    } finally {
      setIsLoading(false);
    }
  };

  const getCountryCodeFromName = (country: string): string => {
    const countryMap: Record<string, string> = {
      "United States": "US",
      "United Kingdom": "GB",
      Germany: "DE",
      Canada: "CA",
      France: "FR",
      Australia: "AU",
      India: "IN",
      Japan: "JP",
      Brazil: "BR",
      Italy: "IT",
      Spain: "ES",
      Netherlands: "NL",
      Sweden: "SE",
      Norway: "NO",
      Denmark: "DK",
      Finland: "FI",
      Belgium: "BE",
      Switzerland: "CH",
      Austria: "AT",
      Poland: "PL",
    };
    return countryMap[country] || "US";
  };

  useEffect(() => {
    fetchLocationAnalytics();
  }, [selectedProjectId, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      US: "🇺🇸",
      CA: "🇨🇦",
      GB: "🇬🇧",
      DE: "🇩🇪",
      AU: "🇦🇺",
      FR: "🇫🇷",
      NL: "🇳🇱",
      SE: "🇸🇪",
      ES: "🇪🇸",
      IT: "🇮🇹",
    };
    return flags[countryCode] || "🌍";
  };

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Location Analytics"
          description="Geographical distribution and performance by location"
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            Please select a project to view location analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Location Analytics"
        description="Geographical distribution and performance by location"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Stats */}
        {locationData && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Countries</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locationData.summary.total_countries}
                </div>
                <p className="text-xs text-muted-foreground">
                  Top: {locationData.summary.top_country}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cities</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locationData.summary.total_cities}
                </div>
                <p className="text-xs text-muted-foreground">
                  Top: {locationData.summary.top_city}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  International Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(locationData.summary.international_rate * 100)?.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Traffic from outside primary market
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Events
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locationData.by_country
                    .reduce((sum, country) => sum + country.events, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all locations
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="countries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="countries">Countries</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="map">World Map</TabsTrigger>
          </TabsList>

          <TabsContent value="countries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Country</CardTitle>
                <CardDescription>
                  User engagement and conversion rates across different
                  countries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : locationData ? (
                  <div className="space-y-4">
                    {locationData.by_country?.map((country) => (
                      <div
                        key={country.country_code}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getCountryFlag(country.country_code)}
                          </span>
                          <div>
                            <p className="font-medium">{country.country}</p>
                            <p className="text-sm text-muted-foreground">
                              {country.country_code}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-6 text-right">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Events
                            </p>
                            <p className="font-medium">
                              {country.events.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Sessions
                            </p>
                            <p className="font-medium">
                              {country.sessions.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Users
                            </p>
                            <p className="font-medium">
                              {country.users.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Conversion Rate
                            </p>
                            <Badge
                              variant={
                                country.conversion_rate > 3.5
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {country.conversion_rate?.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Cities</CardTitle>
                <CardDescription>
                  Cities generating the most sessions and revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : locationData ? (
                  <div className="space-y-4">
                    {locationData.by_city?.map((city, index) => (
                      <div
                        key={`${city.city}-${city.country}`}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{city.city}</p>
                            <p className="text-sm text-muted-foreground">
                              {city.country}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-6 text-right">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Events
                            </p>
                            <p className="font-medium">
                              {city.events.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Sessions
                            </p>
                            <p className="font-medium">
                              {city.sessions.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Users
                            </p>
                            <p className="font-medium">
                              {city.users.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Revenue
                            </p>
                            <p className="font-medium">
                              {formatCurrency(city.revenue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>
                  Visual heatmap of events, sessions, and users across the globe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] w-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : locationData && locationData.by_country.length > 0 ? (
                    <WorldMap
                      geoData={locationData.by_country?.map((country) => ({
                        country: country.country,
                        users: country.users,
                        sessions: country.sessions,
                        events: country.events,
                        code: country.country_code,
                        lat: 0,
                        lng: 0,
                      }))}
                      metric="events"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No location data available. Events will appear here once users start interacting with your application.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
          <Button
            onClick={fetchLocationAnalytics}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}
