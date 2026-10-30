import { useEffect, useState } from 'react';

const readMatch = (query) => {
  try {
    return window.matchMedia?.(query).matches ?? false;
  } catch {
    return false;
  }
};

// Render condicional por breakpoint (evita duplicar inputs en el DOM con CSS hidden/block).
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => readMatch(query));

  useEffect(() => {
    let mediaList;
    try {
      mediaList = window.matchMedia(query);
    } catch {
      return undefined;
    }
    const handleChange = (event) => setMatches(event.matches);
    mediaList.addEventListener('change', handleChange);
    return () => mediaList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

export const DESKTOP_QUERY = '(min-width: 1024px)';
