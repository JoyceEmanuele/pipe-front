import { useEffect } from 'react';

export const useOuterClickNotifier = (onOuterClick: (e: MouseEvent) => void, innerRef: React.MutableRefObject<any>): void => {
  useEffect(() => {
    if (innerRef.current) {
      document.addEventListener('click', handleClick);
    }

    return () => document.removeEventListener('click', handleClick);

    function handleClick(e: MouseEvent) {
      innerRef.current && !innerRef.current.contains(e.target) && onOuterClick(e);
    }
  }, [onOuterClick, innerRef]);
};
