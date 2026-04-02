import { forwardRef, useState } from 'react';
import { Input as BaseInput } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { Check, X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  tooltip?: string;
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ label, error, success, hint, tooltip, className, required, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = !!error;
    const showSuccess = success && !hasError && !isFocused;

    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center gap-2">
            <Label htmlFor={props.id} className="flex items-center gap-1">
              {label}
              {required && <span className="text-destructive text-sm" aria-label="required">*</span>}
            </Label>
            {tooltip && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
        <div className="relative">
          <BaseInput
            ref={ref}
            className={cn(
              className,
              hasError && 'border-destructive focus-visible:ring-destructive',
              showSuccess && 'border-green-500 focus-visible:ring-green-500'
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined
            }
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {showSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check className="w-4 h-4 text-green-500" aria-label="Valid input" />
            </div>
          )}
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-destructive" aria-label="Invalid input" />
            </div>
          )}
        </div>
        {hasError && (
          <p id={`${props.id}-error`} className="text-sm text-destructive flex items-center gap-1">
            <X className="w-3 h-3" />
            {error}
          </p>
        )}
        {hint && !hasError && (
          <p id={`${props.id}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export { EnhancedInput };
