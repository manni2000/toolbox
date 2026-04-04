import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InteractiveSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  prefix?: string;
  showValue?: boolean;
  categoryColor?: string;
  className?: string;
  formatValue?: (value: number) => string;
  description?: string;
}

export const InteractiveSlider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  suffix = '',
  prefix = '',
  showValue = true,
  categoryColor = '173 80% 40%',
  className,
  formatValue,
  description,
}: InteractiveSliderProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  const percentage = ((localValue - min) / (max - min)) * 100;
  const displayValue = formatValue ? formatValue(localValue) : `${prefix}${localValue}${suffix}`;

  return (
    <div className={cn('space-y-3', `interactive-slider-${categoryColor.replace(/\s/g, '-')}`, className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          {showValue && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={localValue}
                onChange={handleInputChange}
                min={min}
                max={max}
                step={step}
                title={label || 'Slider value'}
                className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-offset-2"
              />
              {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
            </div>
          )}
        </div>
      )}

      <div className="relative pt-1">
        <motion.div
          animate={{
            scale: isDragging ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          {/* Track background */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            {/* Filled portion */}
            <motion.div
              initial={false}
              animate={{
                width: `${percentage}%`,
              }}
              transition={{ duration: 0.1 }}
              className="h-full rounded-full"
              style={{
                backgroundColor: `hsl(${categoryColor})`,
                boxShadow: `0 0 10px hsl(${categoryColor} / 0.3)`,
              }}
            />
          </div>

          {/* Slider input */}
          <input
            type="range"
            value={localValue}
            onChange={handleChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            min={min}
            max={max}
            step={step}
            title={label || 'Slider'}
            className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent focus:outline-none"
            style={{
              WebkitAppearance: 'none',
            }}
          />
        </motion.div>

        {/* Min/Max labels */}
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{formatValue ? formatValue(min) : `${prefix}${min}${suffix}`}</span>
          <span>{formatValue ? formatValue(max) : `${prefix}${max}${suffix}`}</span>
        </div>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .interactive-slider-${categoryColor.replace(/\s/g, '-')} input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: white;
            border: 2px solid hsl(${categoryColor});
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          .interactive-slider-${categoryColor.replace(/\s/g, '-')} input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px hsl(${categoryColor} / 0.4);
          }
          
          .interactive-slider-${categoryColor.replace(/\s/g, '-')} input[type="range"]::-webkit-slider-thumb:active {
            transform: scale(1.15);
            box-shadow: 0 4px 16px hsl(${categoryColor} / 0.5);
          }
          
          .interactive-slider-${categoryColor.replace(/\s/g, '-')} input[type="range"]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: white;
            border: 2px solid hsl(${categoryColor});
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          .interactive-slider-${categoryColor.replace(/\s/g, '-')} input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px hsl(${categoryColor} / 0.4);
          }
          
          .interactive-slider-${categoryColor.replace(/\s/g, '-')} input[type="range"]::-moz-range-thumb:active {
            transform: scale(1.15);
            box-shadow: 0 4px 16px hsl(${categoryColor} / 0.5);
          }
        `
      }} />
    </div>
  );
};
