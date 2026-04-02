import { FileX, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
};

export const NoFileSelected = ({ message = "No file selected" }: { message?: string }) => {
  return (
    <EmptyState
      icon={<FileX className="w-8 h-8 text-muted-foreground" />}
      title="No File Selected"
      description={message}
    />
  );
};

export const NoResults = ({ searchTerm }: { searchTerm?: string }) => {
  return (
    <EmptyState
      title="No Results Found"
      description={
        searchTerm 
          ? `We couldn't find any tools matching "${searchTerm}". Try different keywords.`
          : "No tools found. Try adjusting your search criteria."
      }
    />
  );
};

export const NoData = ({ message = "No data available" }: { message?: string }) => {
  return (
    <EmptyState
      icon={<Inbox className="w-8 h-8 text-muted-foreground" />}
      title="No Data"
      description={message}
    />
  );
};
