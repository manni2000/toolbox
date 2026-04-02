import { cn } from "@/lib/utils";

/**
 * Responsive typography utility using CSS clamp()
 * Ensures text scales smoothly across all viewport sizes
 */

export const typography = {
  // Hero section text
  hero: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
  heroSubtext: "text-lg sm:text-xl md:text-2xl",
  
  // Page headings
  h1: "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight",
  h2: "text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight",
  h3: "text-xl sm:text-2xl md:text-3xl font-semibold",
  h4: "text-lg sm:text-xl md:text-2xl font-semibold",
  h5: "text-base sm:text-lg md:text-xl font-semibold",
  h6: "text-sm sm:text-base md:text-lg font-semibold",
  
  // Body text
  body: "text-sm sm:text-base leading-relaxed",
  bodyLarge: "text-base sm:text-lg leading-relaxed",
  bodySmall: "text-xs sm:text-sm leading-relaxed",
  
  // UI elements
  button: "text-sm sm:text-base font-medium",
  label: "text-xs sm:text-sm font-medium",
  caption: "text-xs sm:text-sm text-muted-foreground",
  
  // Tool-specific
  toolTitle: "text-xl sm:text-2xl md:text-3xl font-bold",
  toolDescription: "text-sm sm:text-base md:text-lg text-muted-foreground",
  cardTitle: "text-base sm:text-lg font-semibold",
  cardDescription: "text-xs sm:text-sm text-muted-foreground",
};

/**
 * CSS clamp() values for fluid typography
 * Format: clamp(min, preferred, max)
 */
export const fluidType = {
  xs: "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)", // 12px -> 14px
  sm: "clamp(0.875rem, 0.8rem + 0.35vw, 1rem)",    // 14px -> 16px
  base: "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)", // 16px -> 18px
  lg: "clamp(1.125rem, 1rem + 0.5vw, 1.25rem)",    // 18px -> 20px
  xl: "clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)",   // 20px -> 24px
  "2xl": "clamp(1.5rem, 1.3rem + 1vw, 1.875rem)",  // 24px -> 30px
  "3xl": "clamp(1.875rem, 1.5rem + 1.5vw, 2.25rem)", // 30px -> 36px
  "4xl": "clamp(2.25rem, 1.75rem + 2vw, 3rem)",    // 36px -> 48px
  "5xl": "clamp(3rem, 2.25rem + 3vw, 3.75rem)",    // 48px -> 60px
  "6xl": "clamp(3.75rem, 2.75rem + 4vw, 4.5rem)",  // 60px -> 72px
  "7xl": "clamp(4.5rem, 3.25rem + 5vw, 6rem)",     // 72px -> 96px
};

/**
 * Component for responsive text with automatic scaling
 */
interface ResponsiveTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  size?: keyof typeof fluidType;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  children: React.ReactNode;
}

export const ResponsiveText = ({
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  className,
  children,
  style,
  ...props
}: ResponsiveTextProps) => {
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <Component
      className={cn(weightClasses[weight], className)}
      style={{
        fontSize: fluidType[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
};
