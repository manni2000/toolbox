import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface PresetOption {
  label: string;
  value: any;
  icon?: LucideIcon;
  description?: string;
}

interface PresetButtonGroupProps {
  options: PresetOption[];
  onSelect: (value: any) => void;
  selectedValue?: any;
  categoryColor?: string;
  className?: string;
  columns?: number;
  variant?: 'default' | 'compact';
}

export const PresetButtonGroup = ({
  options,
  onSelect,
  selectedValue,
  categoryColor = '173 80% 40%',
  className,
  columns = 3,
  variant = 'default',
}: PresetButtonGroupProps) => {
  const isSelected = (optionValue: any) => {
    if (typeof optionValue === 'object' && selectedValue !== undefined && selectedValue !== null) {
      return JSON.stringify(optionValue) === JSON.stringify(selectedValue);
    }
    return optionValue === selectedValue;
  };

  return (
    <div
      className={cn(
        'grid gap-3',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        className
      )}
    >
      {options.map((option, index) => {
        const selected = isSelected(option.value);
        const Icon = option.icon;

        return (
          <motion.button
            key={index}
            onClick={() => onSelect(option.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'relative overflow-hidden rounded-lg border-2 transition-all duration-300',
              variant === 'default' && 'p-4',
              variant === 'compact' && 'p-3',
              selected
                ? 'border-current shadow-lg'
                : 'border-border bg-card hover:border-muted-foreground/30 hover:shadow-md'
            )}
            style={
              selected
                ? {
                    borderColor: `hsl(${categoryColor})`,
                    backgroundColor: `hsl(${categoryColor} / 0.05)`,
                  }
                : {}
            }
          >
            {selected && (
              <motion.div
                layoutId="preset-selected"
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundColor: `hsl(${categoryColor} / 0.08)`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            <div className="relative z-10">
              {Icon && (
                <div className="mb-2 flex items-center justify-center">
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-lg',
                      variant === 'default' && 'h-10 w-10',
                      variant === 'compact' && 'h-8 w-8'
                    )}
                    style={
                      selected
                        ? {
                            backgroundColor: `hsl(${categoryColor} / 0.15)`,
                          }
                        : {
                            backgroundColor: 'hsl(var(--muted))',
                          }
                    }
                  >
                    <Icon
                      className={cn(
                        variant === 'default' && 'h-5 w-5',
                        variant === 'compact' && 'h-4 w-4'
                      )}
                      style={
                        selected
                          ? { color: `hsl(${categoryColor})` }
                          : { color: 'hsl(var(--muted-foreground))' }
                      }
                    />
                  </div>
                </div>
              )}

              <div className={cn('text-center', variant === 'compact' && Icon && 'mt-1')}>
                <p
                  className={cn(
                    'font-medium',
                    variant === 'default' && 'text-sm',
                    variant === 'compact' && 'text-xs'
                  )}
                  style={selected ? { color: `hsl(${categoryColor})` } : {}}
                >
                  {option.label}
                </p>
                {option.description && variant === 'default' && (
                  <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                )}
              </div>
            </div>

            {selected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-2 top-2 h-5 w-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `hsl(${categoryColor})` }}
              >
                <svg
                  className="h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
