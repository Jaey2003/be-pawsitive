import { useEffect } from 'react';

/**
 * A custom hook that sets the document title
 * @param {string} title - The title to set
 */
function useDocumentTitle(title) {
  useEffect(() => {
    const appName = 'Be Pawsitive';
    
    if (title === appName) {
      // Just "Be Pawsitive" for the main landing page
      document.title = appName;
    } else {
      // Format: "Be Pawsitive - Page Name" for all other pages
      document.title = `${appName} - ${title}`;
    }
    
    // Clean up when component unmounts
    return () => {
      document.title = appName;
    };
  }, [title]);
}

export default useDocumentTitle; 