import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

const StatCard = ({ title, value, change, icon: Icon, iconColor, iconBgColor }: StatCardProps) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`${iconBgColor} p-4 rounded-lg`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {isPositive ? <ArrowUpRight className="h-4 w-4" /> : isNegative ? <ArrowDownRight className="h-4 w-4" /> : null}
              {change > 0 ? '+' : ''}{change}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
