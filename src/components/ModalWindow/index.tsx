import { useRef, useEffect } from 'react';

import {
  ModalContent,
  ModalBackground,
  ModalContentWithBorderTop,
} from './styles';

interface IModalProps extends React.HTMLAttributes<HTMLDivElement> {
  borderTop?: boolean | null;
  onClickOutside?: () => void;
}

export const ModalWindow = ({ onClickOutside, borderTop, ...props }: IModalProps): JSX.Element => {
  const refModal = useRef<any>(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (onClickOutside && refModal.current && !refModal.current.contains(event.target) && !event.target.closest('.select-search__select')) {
        onClickOutside();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ModalBackground>
      {borderTop ? <ModalContentWithBorderTop ref={refModal} {...props} /> : <ModalContent ref={refModal} {...props} />}
    </ModalBackground>
  );
};
