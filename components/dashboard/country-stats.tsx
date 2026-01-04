import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CountryData {
  name: string;
  value: number;
  percentage: number;
  flag: string;
}

interface CountryStatsProps {
  totalUsers: number;
  data: CountryData[];
}

export function CountryStats({ totalUsers, data }: CountryStatsProps) {
  return (
    <Card className="border-none shadow-sm h-full">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-[#2B3674]">Country</CardTitle>
            <div className="bg-[#F4F7FE] p-2 rounded-lg text-sm text-[#4363C7] cursor-pointer hover:bg-gray-100 font-medium">
               View All
            </div>
        </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-[#2B3674] mb-2">{totalUsers.toLocaleString()}</div>
        <div className="flex items-center gap-2 mb-8">
             <span className="bg-[#05CD99] text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                 +39.2%
             </span>
             <span className="text-sm text-[#4363C7]">Since last month</span>
        </div>

        <div className="space-y-6">
          {data.map((country, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium text-[#4363C7]">
                  <span className="text-lg">{country.flag}</span>
                  {country.name}
                </div>
                <div className="font-bold text-[#2B3674]">
                    {country.value.toLocaleString()} ({country.percentage}%)
                </div>
              </div>
              <Progress value={country.percentage} className="h-2 bg-[#F4F7FE]" indicatorClassName="bg-[#4318FF]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
