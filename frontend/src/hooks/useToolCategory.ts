import { useLocation } from "react-router-dom";
import { getToolCategory } from "@/data/toolSeoEnhancements";

export const useToolCategory = (): string | undefined => {
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
  
  if (toolSlug) {
    // Try to get the category from the SEO data
    const category = getToolCategory(toolSlug);
    
    // If we found a category, return it
    if (category) {
      return category;
    }
    
    // Fallback: try to extract category from path if it's in the format /tools/category/tool-name
    if (pathSegments[0] === 'tools' && pathSegments.length >= 3) {
      const potentialCategory = pathSegments[1];
      // Convert kebab-case to Title Case and add "Tools" if not present
      const formattedCategory = potentialCategory
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const finalCategory = formattedCategory.includes('Tools') 
        ? formattedCategory 
        : `${formattedCategory} Tools`;
      return finalCategory;
    }
    
    // Additional fallback: try to infer category from tool slug pattern
    
    // Common patterns for tool categories
    if (toolSlug.includes('pdf') || toolSlug.includes('word') || toolSlug.includes('excel') || toolSlug.includes('powerpoint')) {
      return 'PDF Tools';
    }
    if (toolSlug.includes('image') || toolSlug.includes('jpg') || toolSlug.includes('png') || toolSlug.includes('webp') || toolSlug.includes('qr') || toolSlug.includes('favicon') || toolSlug.includes('compress') || toolSlug.includes('resize') || toolSlug.includes('crop') || toolSlug.includes('background')) {
      return 'Image Tools';
    }
    if (toolSlug.includes('json') || toolSlug.includes('api') || toolSlug.includes('jwt') || toolSlug.includes('regex') || toolSlug.includes('curl') || toolSlug.includes('docker') || toolSlug.includes('color') || toolSlug.includes('lorem')) {
      return 'Developer Tools';
    }
    if (toolSlug.includes('password') || toolSlug.includes('hash') || toolSlug.includes('uuid') || toolSlug.includes('base64') || toolSlug.includes('security') || toolSlug.includes('encryption')) {
      return 'Security Tools';
    }
    if (toolSlug.includes('text') || toolSlug.includes('word') || toolSlug.includes('case') || toolSlug.includes('diff') || toolSlug.includes('markdown')) {
      return 'Text Tools';
    }
    if (toolSlug.includes('seo') || toolSlug.includes('meta') || toolSlug.includes('sitemap') || toolSlug.includes('robots') || toolSlug.includes('keyword')) {
      return 'SEO Tools';
    }
    if (toolSlug.includes('calculator') || toolSlug.includes('emi') || toolSlug.includes('currency') || toolSlug.includes('gst') || toolSlug.includes('budget') || toolSlug.includes('invoice') || toolSlug.includes('salary')) {
      return 'Finance Tools';
    }
    if (toolSlug.includes('video') || toolSlug.includes('audio') || toolSlug.includes('mp4') || toolSlug.includes('mp3')) {
      return toolSlug.includes('video') ? 'Video Tools' : 'Audio Tools';
    }
    if (toolSlug.includes('date') || toolSlug.includes('time') || toolSlug.includes('age') || toolSlug.includes('countdown') || toolSlug.includes('timer')) {
      return 'Date & Time Tools';
    }
    if (toolSlug.includes('study') || toolSlug.includes('education') || toolSlug.includes('percentage') || toolSlug.includes('scientific') || toolSlug.includes('cgpa')) {
      return 'Education Tools';
    }
  }
  return undefined;
};
