'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function GoogleTranslate() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if already loaded
    if (document.querySelector('script[src*="translate.google.com"]')) {
      // Script already exists, try to init
      if (window.google && window.google.translate && !initialized) {
        initTranslate();
      }
      return;
    }

    // Define init function
    window.googleTranslateElementInit = () => {
      initTranslate();
    };

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
    };
  }, []);

  const initTranslate = () => {
    if (initialized) return;
    
    try {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,te,hi,ta,kn,ml,mr,bn',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
      setInitialized(true);
    } catch (e) {
      console.log('Google Translate init error:', e);
    }
  };

  // Function to translate
  const translateTo = (langCode: string) => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  return (
    <div 
      id="google_translate_element" 
      style={{ 
        position: 'fixed',
        top: '-100px',
        left: '-100px',
        opacity: 0,
        pointerEvents: 'none',
        height: 0,
        overflow: 'hidden'
      }} 
    />
  );
}

// Export function to change language
export function setLanguage(langCode: string) {
  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  return false;
}
