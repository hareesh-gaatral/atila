'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { homeContentHydrated } from '@/store/slices/contentSlice';

interface HomeContentHydratorProps {
  sections: any[];
  settings: Record<string, string>;
}

/**
 * Server components render the full home content (SSR). This tiny client
 * component copies that same payload into the Redux content store on mount so
 * client components (admin previews, future client-rendered sections) can read
 * from Redux without issuing a duplicate network request.
 */
export default function HomeContentHydrator({ sections, settings }: HomeContentHydratorProps) {
  const dispatch = useAppDispatch();
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    dispatch(homeContentHydrated({ sections: sections || [], settings: settings || {} }));
  }, [dispatch, sections, settings]);

  return null;
}
