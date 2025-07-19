import { useEffect } from 'react';
import { getEntityDescription } from '@/lib/contentDetection';

export function useTooltipOnHover() {
  useEffect(() => {
    let currentTooltip: HTMLElement | null = null;
    let hideTimeout: NodeJS.Timeout | null = null;

    const showTooltip = async (element: HTMLElement, entityText: string, entityType: 'person' | 'place' | 'thing', scenario: string) => {
      // Remove any existing tooltip
      if (currentTooltip) {
        currentTooltip.remove();
        currentTooltip = null;
      }

      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      // Create tooltip container
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip-container';
      tooltip.innerHTML = '<span class="tooltip-loading">Loading...</span>';
      
      // Position relative to the hovered element
      element.style.position = 'relative';
      element.appendChild(tooltip);
      
      currentTooltip = tooltip;

      // Show tooltip with animation
      setTimeout(() => {
        if (tooltip.parentElement) {
          tooltip.classList.add('show');
        }
      }, 50);

      try {
        // Load description asynchronously
        const description = await getEntityDescription(entityText, entityType, scenario);
        
        // Update tooltip content if it's still attached and is the current tooltip
        if (tooltip.parentElement && currentTooltip === tooltip) {
          tooltip.innerHTML = description;
        }
      } catch (error) {
        console.error('Failed to load tooltip:', error);
        if (tooltip.parentElement && currentTooltip === tooltip) {
          tooltip.innerHTML = '<span class="tooltip-error">Failed to load description</span>';
        }
      }
    };

    const hideTooltip = () => {
      if (currentTooltip) {
        currentTooltip.classList.remove('show');
        hideTimeout = setTimeout(() => {
          if (currentTooltip) {
            currentTooltip.remove();
            currentTooltip = null;
          }
        }, 200); // Match CSS transition duration
      }
    };

    const handleMouseEnter = (event: Event) => {
      try {
        const target = event.target as HTMLElement;
        
        // Add comprehensive null/undefined checks
        if (!target || !target.dataset || !(target instanceof HTMLElement)) {
          return;
        }
        
        if (target.dataset.entityType && target.dataset.entityText) {
          const entityText = target.dataset.entityText;
          const entityType = target.dataset.entityType as 'person' | 'place' | 'thing';
          const scenario = target.dataset.scenario || 'general';
          
          showTooltip(target, entityText, entityType, scenario);
        }
      } catch (error) {
        console.error('Error in tooltip mouse enter handler:', error);
      }
    };

    const handleMouseLeave = () => {
      try {
        hideTooltip();
      } catch (error) {
        console.error('Error in tooltip mouse leave handler:', error);
      }
    };

    // Add global event listeners
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    // Cleanup function
    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      
      if (currentTooltip) {
        currentTooltip.remove();
      }
      
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, []);
}