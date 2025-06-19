import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Target,
} from "lucide-react";

interface ChartProps {
  title: string;
  data: number[];
  labels: string[];
  color: string;
  type: "bar" | "line" | "progress" | "circular";
  showTrend?: boolean;
  trendValue?: number;
}

export const InteractiveChart: React.FC<ChartProps> = ({
  title,
  data,
  labels,
  color,
  type,
  showTrend = false,
  trendValue = 0,
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(1);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const renderChart = () => {
    const maxValue = Math.max(...data);

    switch (type) {
      case "bar":
        return (
          <div className="flex items-end justify-between h-20 px-2">
            {data.map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="rounded-t w-6 transition-all duration-1000 ease-out"
                  style={{
                    height: `${(value / maxValue) * 60 * animationProgress}px`,
                    backgroundColor: color,
                    boxShadow: isHovered ? `0 0 10px ${color}66` : "none",
                  }}
                />
                <span className="text-xs mt-1 text-muted-foreground">
                  {labels[index]}
                </span>
              </div>
            ))}
          </div>
        );

      case "progress":
        const progressValue = data[0] || 0;
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span className="font-semibold">{progressValue}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progressValue * animationProgress}%`,
                  backgroundColor: color,
                  boxShadow: isHovered ? `0 0 10px ${color}66` : "none",
                }}
              />
            </div>
            {showTrend && (
              <div className="flex items-center justify-center text-sm">
                <TrendingUp
                  className={`h-4 w-4 mr-1 ${trendValue > 0 ? "text-green-500" : "text-red-500"}`}
                />
                <span
                  className={trendValue > 0 ? "text-green-600" : "text-red-600"}
                >
                  {trendValue > 0 ? "+" : ""}
                  {trendValue}%
                </span>
              </div>
            )}
          </div>
        );

      case "circular":
        const circularValue = data[0] || 0;
        const radius = 30;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = `${(circularValue / 100) * circumference * animationProgress} ${circumference}`;

        return (
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke={color}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 0 8px ${color})`
                      : "none",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{circularValue}%</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`transition-all duration-300 ${isHovered ? "transform scale-105" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      {renderChart()}
    </div>
  );
};

export const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card className="supabase-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
            Progresso dos Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InteractiveChart
            title="Progresso Médio"
            data={[78]}
            labels={["Progresso"]}
            color="#3b82f6"
            type="progress"
            showTrend
            trendValue={12}
          />
        </CardContent>
      </Card>

      <Card className="supabase-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Tendência Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InteractiveChart
            title="Últimos 7 dias"
            data={[65, 72, 68, 75, 82, 78, 85]}
            labels={["S", "T", "Q", "Q", "S", "S", "D"]}
            color="#10b981"
            type="bar"
          />
        </CardContent>
      </Card>

      <Card className="supabase-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-500" />
            Meta Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InteractiveChart
            title="Eficiência"
            data={[85]}
            labels={["Meta"]}
            color="#8b5cf6"
            type="circular"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
