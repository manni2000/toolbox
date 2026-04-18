import { useLocation } from "react-router-dom";

export const useCurrentTool = (): string | undefined => {
  const location = useLocation();
  
  // Extract tool slug from the current path
  // Path format: /tools/category/tool-name, /tools/tool-name, or /tool-name
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  let toolSlug = '';
  
  // Check if we're in a tool page
  if (pathSegments[0] === 'tools' && pathSegments.length >= 2) {
    // Format: /tools/category/tool-name or /tools/tool-name
    toolSlug = pathSegments[pathSegments.length - 1];
  } else if (pathSegments.length === 1) {
    // Format: /tool-name (direct tool path)
    toolSlug = pathSegments[0];
  }
  
  return toolSlug || undefined;
};
