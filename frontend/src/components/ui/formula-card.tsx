import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown, Calculator, BookOpen } from 'lucide-react';

interface FormulaVariable {
  symbol: string;
  description: string;
  example?: string;
}

interface FormulaCardProps {
  title: string;
  formula: string;
  variables: FormulaVariable[];
  example?: {
    description: string;
    calculation: string;
    result: string;
  };
  categoryColor?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export const FormulaCard = ({
  title,
  formula,
  variables,
  example,
  categoryColor = '173 80% 40%',
  className,
  defaultExpanded = false,
}: FormulaCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'overflow-hidden rounded-xl border border-border transition-all duration-300',
        isExpanded ? 'shadow-lg' : 'shadow-md hover:shadow-lg',
        className
      )}
      style={
        isExpanded
          ? {
              borderColor: `hsl(${categoryColor} / 0.3)`,
              backgroundColor: `hsl(${categoryColor} / 0.02)`,
            }
          : {}
      }
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-6 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.15)` }}
          >
            <Calculator className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg mb-2">{title}</h3>

            {/* Formula Display */}
            <div
              className="rounded-lg px-4 py-3 font-mono text-sm sm:text-base overflow-x-auto"
              style={{
                backgroundColor: 'hsl(var(--muted))',
                color: `hsl(${categoryColor})`,
              }}
            >
              {formula}
            </div>
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-6 sm:px-6 space-y-4">
              {/* Variables Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
                  <h4 className="text-sm font-semibold">Variables:</h4>
                </div>
                <div className="space-y-2">
                  {variables.map((variable, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
                    >
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded font-mono text-sm font-bold"
                        style={{
                          backgroundColor: `hsl(${categoryColor} / 0.15)`,
                          color: `hsl(${categoryColor})`,
                        }}
                      >
                        {variable.symbol}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{variable.description}</p>
                        {variable.example && (
                          <p className="mt-1 text-xs text-muted-foreground font-mono">
                            e.g., {variable.example}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Example Section */}
              {example && (
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: `hsl(${categoryColor} / 0.08)` }}
                >
                  <h4
                    className="mb-3 text-sm font-semibold flex items-center gap-2"
                    style={{ color: `hsl(${categoryColor})` }}
                  >
                    <Calculator className="h-4 w-4" />
                    Example Calculation
                  </h4>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium mb-1">Problem:</p>
                      <p className="text-muted-foreground">{example.description}</p>
                    </div>

                    <div>
                      <p className="font-medium mb-1">Calculation:</p>
                      <div
                        className="rounded bg-background/70 px-3 py-2 font-mono text-xs sm:text-sm overflow-x-auto"
                      >
                        {example.calculation}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-1">Result:</p>
                      <div
                        className="rounded px-3 py-2 font-mono text-base sm:text-lg font-bold"
                        style={{
                          backgroundColor: `hsl(${categoryColor} / 0.15)`,
                          color: `hsl(${categoryColor})`,
                        }}
                      >
                        {example.result}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
