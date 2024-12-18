import { t } from 'i18next';
import { Flex } from 'reflexbox';
import { ModalWindow } from '~/components';
import { HorizontalLine, ModalTitle } from '../Menu/styles';
import { useEffect } from 'react';
import { CloseIcon } from '~/icons/CloseV2';

export default function ModalUserGuide(props: {
  handleCloseModal: () => void;
  menuToggle: boolean
}): JSX.Element {
  const { handleCloseModal, menuToggle } = props;

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [handleCloseModal]);
  return (
    <>
      <ModalWindow
        borderTop
        style={{
          marginLeft: menuToggle ? '200px' : '10px',
          marginRight: '30px',
          width: '90%',
          height: '90%',
          marginTop: '50px',
          marginBottom: '70px',
          overflow: 'hidden',
        }}
        onClickOutside={() => {
          handleCloseModal();
        }}
      >
        <Flex
          flexDirection="row"
          justifyContent="space-between"
          zIndex="100000"
          style={{
            marginBottom: '10px',
          }}
        >
          <ModalTitle>{t('guiaDoUsuario')}</ModalTitle>
          <CloseIcon onClick={() => { handleCloseModal(); }} />
        </Flex>
        <Flex
          style={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <iframe
            src="/userGuide.pdf"
            width="100%"
            height="95%"
            title={t('guiaDoUsuario')}
            frameBorder="0"
            allowFullScreen
          />
        </Flex>
      </ModalWindow>
    </>
  );
}
