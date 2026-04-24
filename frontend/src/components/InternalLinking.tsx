import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getToolSeoMetadata } from '@/data/toolSeoEnhancements';

interface RelatedToolsProps {
  currentToolSlug: string;
  maxItems?: number;
}

/**
 * RelatedTools Component - Displays contextually relevant tools for internal linking
 * Improves SEO through strategic internal linking and user engagement
 */
export const RelatedTools = ({ currentToolSlug, maxItems = 3 }: RelatedToolsProps) => {
  const currentTool = getToolSeoMetadata(currentToolSlug);
  
  if (!currentTool || !currentTool.relatedTools || currentTool.relatedTools.length === 0) {
    return null;
  }

  const relatedToolMetadata = currentTool.relatedTools
    .slice(0, maxItems)
    .map(slug => getToolSeoMetadata(slug))
    .filter((tool): tool is NonNullable<typeof tool> => tool !== null);

  if (relatedToolMetadata.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border py-10 md:py-14">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">Related Tools</h2>
          <p className="mt-2 text-muted-foreground">
            Tools that work well together for your workflow
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relatedToolMetadata.map((tool) => (
            <Link
              key={tool.slug}
              to={`/${tool.slug}`}
              className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary">
                    {tool.title.replace(' - ', '\n').split('\n')[0]}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Try it
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * CategoryNavigation Component - Links to related tools in same category
 */
interface CategoryNavigationProps {
  category: string;
  currentToolSlug: string;
  maxItems?: number;
}

export const CategoryNavigation = ({ 
  category, 
  currentToolSlug, 
  maxItems = 4 
}: CategoryNavigationProps) => {
  return (
    <section className="border-t border-border py-10 md:py-14">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">More {category}</h2>
          <p className="mt-2 text-muted-foreground">
            Explore other tools in this category
          </p>
        </div>

        <Link
          to={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View All {category}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

/**
 * BreadcrumbNavigation Component - Improves SEO and site navigation
 */
interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbNavigation = ({ items }: BreadcrumbNavigationProps) => {
  return (
    <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <Link to="/" className="hover:text-primary">Home</Link>
      {items.map((item, index) => (
        <div key={item.path} className="flex items-center gap-2">
          <span>/</span>
          {index === items.length - 1 ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link to={item.path} className="hover:text-primary">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

/**
 * InternalLink Component - Semantic link for SEO
 */
interface InternalLinkProps {
  to: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const InternalLink = ({ 
  to, 
  label, 
  variant = 'primary' 
}: InternalLinkProps) => {
  const variants = {
    primary: 'inline-flex items-center gap-2 text-primary font-medium hover:underline',
    secondary: 'inline-flex items-center gap-2 text-muted-foreground hover:text-primary',
    outline: 'inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent',
  };

  return (
    <Link to={to} className={variants[variant]}>
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
};
