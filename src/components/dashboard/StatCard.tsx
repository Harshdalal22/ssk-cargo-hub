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
  onClick?: () => void;
}

const StatCard = ({ title, value, change, icon: Icon, iconColor, iconBgColor, onClick }: StatCardProps) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/80 border-2 hover:border-primary/30 active:scale-95"
      onClick={onClick}
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* 3D Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Animated Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <CardContent className="relative p-3 lg:p-6 z-10">
        <div className="flex items-start justify-between mb-2 lg:mb-4">
          <div className={`${iconBgColor} p-2 lg:p-4 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
            <Icon className={`h-4 w-4 lg:h-6 lg:w-6 ${iconColor} group-hover:rotate-12 transition-transform duration-300`} />
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
          <p className="text-xl lg:text-3xl font-bold text-foreground truncate group-hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            {value}
          </p>
          <p className="text-xs lg:text-sm text-muted-foreground truncate group-hover:text-foreground/70 transition-colors duration-300">
            {title}
          </p>
        </div>
        
        {/* Click Indicator */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary/50 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
