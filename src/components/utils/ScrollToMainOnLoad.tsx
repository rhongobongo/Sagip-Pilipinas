// src/components/utils/ScrollToMainOnLoad.tsx
'use client'; // <--- Mark this as a Client Component

import { useEffect } from 'react';

export default function ScrollToMainOnLoad() {
  useEffect(() => {
    // This code runs only once after the component mounts on the client-side
    const mainElement = document.getElementById('main-content-area');

    if (mainElement) {
      const mainRect = mainElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate the desired scroll position (Y-coordinate)
      // We need the absolute position of the middle of the main element
      // scrollY gives how much the page is already scrolled (usually 0 on initial load, but good practice)
      const mainAbsoluteMiddle =
        window.scrollY + mainRect.top + mainRect.height / 2;
      // Calculate where the top of the viewport should be to center the main element's middle
      let targetScrollY = mainAbsoluteMiddle - viewportHeight / 2;

      // Prevent scrolling to a negative position (if element is near the top)
      targetScrollY = Math.max(0, targetScrollY);

      // Perform the scroll immediately
      window.scrollTo({
        top: targetScrollY,
        behavior: 'auto', // Use 'auto' for instant jump on load, 'smooth' for animation
      });
    } else {
      // Optional: Log a warning if the main element wasn't found
      console.warn(
        'ScrollToMainOnLoad: Could not find element with ID "main-content-area" to scroll to.'
      );
    }
  }, []); // Empty dependency array means this effect runs only once on mount

  // This component doesn't need to render anything visible
  return null;
}
