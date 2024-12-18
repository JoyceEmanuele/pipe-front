import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import { colors } from '~/styles/colors';
import { ButtonAdd } from './styles';
import { Box, Flex } from 'reflexbox';

const WrapperClickOut = ({ children, handleClickOutside }: { children: React.ReactNode, handleClickOutside: () => void }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutsideComponent = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        handleClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutsideComponent);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideComponent);
    };
  }, [handleClickOutside]);

  return <div ref={wrapperRef}>{children}</div>;
};

export const ModalCreateNotification = (): JSX.Element => {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isOpen: false,
    };
    return state;
  });

  const handleClickOutside = () => {
    setState({ isOpen: false });
  };

  return (
    <Flex style={{ justifyContent: 'flex-end', position: 'relative', top: '-65px' }}>
      <Box
        width={[1, 1, 1, 1 / 2, 1 / 3, 1 / 4]}
        style={{
          display: 'flex', justifyContent: 'end', position: 'absolute',
        }}
      >

        <WrapperClickOut handleClickOutside={handleClickOutside}>
          <OptionWrapper>
            <ButtonAdd onClick={() => setState({ isOpen: !state.isOpen })}>
              {t('botaoAdicionarNotificacao')}
            </ButtonAdd>
            <OptionMenu isOpen={state.isOpen}>
              <OptionItem>
                <Item to="/notificacoes/adicionar-notificacao?tipo=Agua">{t('agua')}</Item>
              </OptionItem>
              <OptionItem>
                <Item to="/notificacoes/adicionar-notificacao?tipo=Ambientes">{t('ambiente')}</Item>
              </OptionItem>
              <OptionItem>
                <Item to="/notificacoes/adicionar-notificacao?tipo=Energia">{t('energia')}</Item>
              </OptionItem>
              <OptionItem>
                <Item to="/notificacoes/adicionar-notificacao?tipo=IndiceSaude">{t('indiceSaude')}</Item>
              </OptionItem>
              <OptionItem>
                <Item to="/notificacoes/adicionar-notificacao?tipo=UsoCondensadora">{t('usoCondensadora')}</Item>
              </OptionItem>
              {(profile.manageAllClients) && (
                <OptionItem>
                  <Item to="/notificacoes/adicionar-notificacao?tipo=VRF">VRF</Item>
                </OptionItem>
              )}
            </OptionMenu>

          </OptionWrapper>
        </WrapperClickOut>
      </Box>
    </Flex>

  );
};

const OptionWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const OptionMenu = styled.div<{ isOpen }>(
  ({ isOpen }) => `
  display: ${isOpen ? 'block' : 'none'};
  position: absolute;
  background-color: ${colors.White};
  width: 100%;
  padding: 10px;
  margin-top: 15px;
  border-radius: 16px;
  box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.12), 0px 11px 15px rgba(85, 97, 115, 0.1);
`,
);
const OptionItem = styled.div`
  width: 100%;
  padding: 5px 0;
`;
const Item = styled(Link)`
  width: 120%;
  text-decoration: none;
  color: ${colors.Grey300};
`;
