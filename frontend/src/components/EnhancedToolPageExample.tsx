import { motion } from "framer-motion";
import { Upload, Download, Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fadeInUp, scaleIn, staggerContainer, staggerItem } from "@/lib/animations";

/**
 * Example Enhanced Tool Page Component
 * 
 * This is a reference implementation showing how to use the new UI enhancements:
 * - Modern card designs with gradients and shadows
 * - Framer Motion animations (fadeInUp, scaleIn, stagger)
 * - Hover effects and micro-interactions
 * - Responsive layout patterns
 * - Color-coded category themes
 * 
 * Use this as a template for enhancing other tool pages.
 */

interface EnhancedToolPageExampleProps {
  categoryColor?: string;
}

export const EnhancedToolPageExample = ({
  categoryColor = "220 70% 50%", // Default primary color
}: EnhancedToolPageExampleProps) => {
  return (
    <div className="container py-8 sm:py-12">
      {/* Hero Section with gradient background */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-8 sm:p-12 mb-8"
      >
        {/* Animated background blob */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
          style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
        />

        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: `hsl(${categoryColor} / 0.15)`,
              boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
            }}
          >
            <Sparkles className="h-8 w-8" style={{ color: `hsl(${categoryColor})` }} />
          </motion.div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Enhanced Tool Example
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            This is an example of how to implement modern UI with animations, gradients, and micro-interactions.
          </p>
        </div>
      </motion.div>

      {/* Feature Cards with stagger animation */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8"
      >
        {/* Feature 1 */}
        <motion.div variants={staggerItem}>
          <Card className="group h-full border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500">
            <CardHeader>
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
              >
                <Upload className="h-6 w-6 text-primary" />
              </motion.div>
              <CardTitle className="group-hover:text-primary transition-colors">
                Easy Upload
              </CardTitle>
              <CardDescription>
                Drag & drop or click to upload files with visual feedback
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Feature 2 */}
        <motion.div variants={staggerItem}>
          <Card className="group h-full border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500">
            <CardHeader>
              <motion.div
                whileHover={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10"
              >
                <Zap className="h-6 w-6 text-green-500" />
              </motion.div>
              <CardTitle className="group-hover:text-primary transition-colors">
                Fast Processing
              </CardTitle>
              <CardDescription>
                Lightning-fast processing with real-time progress indicators
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Feature 3 */}
        <motion.div variants={staggerItem}>
          <Card className="group h-full border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500">
            <CardHeader>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10"
              >
                <Download className="h-6 w-6 text-blue-500" />
              </motion.div>
              <CardTitle className="group-hover:text-primary transition-colors">
                Instant Download
              </CardTitle>
              <CardDescription>
                Download your processed files instantly with one click
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Tool Card */}
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border shadow-xl">
          <CardHeader className="border-b border-border bg-muted/30">
            <CardTitle className="text-2xl">Upload & Process</CardTitle>
            <CardDescription>
              Use the area below to upload your files
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {/* Upload Zone Example */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/20 p-12 text-center transition-all hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
            >
              {/* Animated shimmer effect */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />

              <div className="relative">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
                >
                  <Upload className="h-10 w-10 text-primary" />
                </motion.div>
                <p className="text-lg font-semibold">Drop files here or click to browse</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Supports multiple file formats up to 10MB
                </p>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              className="mt-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="w-full sm:w-auto"
                style={{
                  background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                }}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Process Files
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 rounded-xl border border-border bg-muted/30 p-6"
      >
        <h3 className="mb-3 font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Pro Tips
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• All animations respect user's reduced-motion preferences</li>
          <li>• Cards use hover effects with smooth transitions</li>
          <li>• Color themes are customizable per category</li>
          <li>• Responsive design works on all screen sizes</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default EnhancedToolPageExample;
