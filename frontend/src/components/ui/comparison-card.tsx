import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface ComparisonItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  highlighted?: boolean;
  description?: string;
}

interface ComparisonCardProps {
  title: string;
  subtitle?: string;
  items: ComparisonItem[];
  beforeData?: {
    title: string;
    value: string | number;
    items?: ComparisonItem[];
  };
  afterData?: {
    title: string;
    value: string | number;
    items?: ComparisonItem[];
  };
  categoryColor?: string;
  variant?: 'vertical' | 'horizontal';
  className?: string;
  showArrow?: boolean;
}

export const ComparisonCard = ({
  title,
  subtitle,
  items,
  beforeData,
  afterData,
  categoryColor = '173 80% 40%',
  variant = 'horizontal',
  className,
  showArrow = true,
}: ComparisonCardProps) => {
  // Simple card with items list
  if (!beforeData && !afterData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          'rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-all duration-300',
          className
        )}
      >
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>}

        <div className="space-y-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between rounded-lg p-3 transition-colors',
                  item.highlighted ? 'bg-muted/70' : 'bg-muted/30'
                )}
              >
                <div className="flex items-center gap-3">
                  {Icon && (
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: item.highlighted
                          ? `hsl(${categoryColor} / 0.15)`
                          : 'hsl(var(--muted))',
                      }}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={
                          item.highlighted
                            ? { color: `hsl(${categoryColor})` }
                            : { color: 'hsl(var(--muted-foreground))' }
                        }
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </div>
                <p
                  className="text-lg font-bold"
                  style={item.highlighted ? { color: `hsl(${categoryColor})` } : {}}
                >
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // Before/After comparison layout
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground -mt-2">{subtitle}</p>}

      <div
        className={cn(
          'grid gap-4',
          variant === 'horizontal' && 'lg:grid-cols-2',
          variant === 'vertical' && 'grid-cols-1'
        )}
      >
        {/* Before Section */}
        {beforeData && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {beforeData.title}
              </p>
              <p className="mt-2 text-3xl font-bold" style={{ color: `hsl(${categoryColor})` }}>
                {beforeData.value}
              </p>
            </div>

            {beforeData.items && (
              <div className="space-y-2">
                {beforeData.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-muted/30 p-2"
                    >
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Arrow indicator for horizontal layout */}
        {showArrow && variant === 'horizontal' && beforeData && afterData && (
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 shadow-lg"
              style={{ borderColor: `hsl(${categoryColor})` }}
            >
              <ArrowRight className="h-6 w-6" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
          </div>
        )}

        {/* After Section */}
        {afterData && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative overflow-hidden rounded-xl border-2 bg-card p-6 shadow-lg"
            style={{ borderColor: `hsl(${categoryColor})` }}
          >
            <motion.div
              animate={{
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0"
              style={{ backgroundColor: `hsl(${categoryColor} / 0.05)` }}
            />

            <div className="relative mb-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {afterData.title}
              </p>
              <p className="mt-2 text-3xl font-bold" style={{ color: `hsl(${categoryColor})` }}>
                {afterData.value}
              </p>
            </div>

            {afterData.items && (
              <div className="relative space-y-2">
                {afterData.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg p-2"
                      style={{ backgroundColor: `hsl(${categoryColor} / 0.1)` }}
                    >
                      <div className="flex items-center gap-2">
                        {Icon && (
                          <Icon className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
                        )}
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: `hsl(${categoryColor})` }}
                      >
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
