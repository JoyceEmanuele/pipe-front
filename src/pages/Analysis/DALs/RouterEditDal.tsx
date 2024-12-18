import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { Flex } from 'reflexbox';
import { Button, Loader, ModalWindow } from '~/components';
import { AlertSignalIcon } from '~/icons';

interface Props {
  when?: boolean,
  onQuit?: any,
  onSave?: any,
  children?: JSX.Element | (JSX.Element[]) | null | string,
}

export function RouterEditDal(props: Props) {
  const {
    when, onQuit, onSave,
  } = props;
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const unblock = history.block((location, action): any => {
      const bool = true;
      if (when) {
        setCurrentPath(location.pathname);
        setShowModal(true);
        return '';
      }
      return bool;
    });

    return () => {
      unblock();
    };
  }, [when, history]);

  const handleSairSemSalvar = useCallback(async (e) => {
    e.preventDefault();
    if (onQuit) {
      const canRoute = await Promise.resolve(onQuit());
      setShowModal(false);
      if (canRoute) {
        history.push(currentPath);
      }
    }
  }, [currentPath, history, onQuit]);

  const handleSalvarSair = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await Promise.resolve(onSave());
    setShowModal(false);
    if (response) {
      history.push(currentPath);
    }
    setLoading(false);
  }, [currentPath, history, onSave]);

  return showModal ? (

    <ModalWindow
      onClickOutside={() => { setShowModal(false); }}
      borderTop
      style={{
        zIndex: 3, width: '420px', padding: '40px', fontFamily: 'Inter',
      }}
    >
      <Flex flexDirection="column" width="95%" marginLeft={10}>
        <div style={{
          display: 'flex', position: 'relative', gap: '5px', marginBottom: '8px', right: '22px',
        }}
        >
          <AlertSignalIcon />
          <span style={{ fontWeight: 'bold' }}>{t('sairSemSalvar')}</span>
        </div>

        <Flex marginBottom="8px">
          <span style={{ lineHeight: '15px' }}>
            {t('saindoDestaTela')}
            <span style={{ fontWeight: 'bold' }}>
              {t('perderaTodasAsNovas')}
            </span>
            {t('queVoceConfigurou')}
          </span>
        </Flex>

        <span style={{ marginBottom: '25px' }}> O que deseja fazer?</span>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            style={{ width: '150px' }}
            onClick={(e) => handleSalvarSair(e)}
            variant="primary"
          >

            {loading
              ? (
                <Loader
                  size="small"
                  variant="secondary"
                />
              )
              : (
                <>
                  {t('salvarSair')}
                </>
              )}

          </Button>
          <Button
            style={{
              width: '150px', border: 'solid 3px #4950CC', backgroundColor: 'white', color: '#4950CC',
            }}
            onClick={(e) => handleSairSemSalvar(e)}
            variant="primary"
          >
            {`${t('sairSemSalvar')}`}
          </Button>
        </div>
      </Flex>
    </ModalWindow>

  ) : null;
}
