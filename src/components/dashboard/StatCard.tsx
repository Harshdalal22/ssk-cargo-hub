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
      <CardContent className="p-3 lg:p-6">
        <div className="flex items-start justify-between mb-2 lg:mb-4">
          <div className={`${iconBgColor} p-2 lg:p-4 rounded-lg`}>
            <Icon className={`h-4 w-4 lg:h-6 lg:w-6 ${iconColor}`} />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-0.5 lg:gap-1 text-xs lg:text-sm font-medium ${
              isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {isPositive ? <ArrowUpRight className="h-3 w-3 lg:h-4 lg:w-4" /> : isNegative ? <ArrowDownRight className="h-3 w-3 lg:h-4 lg:w-4" /> : null}
              {change > 0 ? '+' : ''}{change}%
            </div>
          )}
        </div>
        <div className="space-y-0.5 lg:space-y-1">
          <p className="text-xl lg:text-3xl font-bold text-foreground truncate">{value}</p>
          <p className="text-xs lg:text-sm text-muted-foreground truncate">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
