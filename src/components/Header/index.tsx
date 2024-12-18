import {
  useState, useEffect, useCallback, useRef,
  useContext,
} from 'react';
import { useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import posthog from 'posthog-js';
import { getUserProfile } from '../../helpers/userProfile';

import {
  Container,
  UserOptions,
  Welcome,
  Expand,
  List,
  Item,
  ItemTitle,
} from './styles';
import { CelciusColorLogo, SpringerLogo } from '~/icons';
import MenuContext from '~/contexts/menuContext';
import { getUserClientId } from '~/helpers/getClientsHelper';
import { t } from 'i18next';
import { LogoutIcon } from '~/icons/Logout';
import { UserGuideIcon } from '~/icons/UserGuide';
import { ConfigIcon } from '~/icons/Config';
import ModalUserGuide from './ModalUserGuide';

const HeaderComp = ({ history }): JSX.Element => {
  const dispatch = useDispatch();
  const [focus, setFocus] = useState(false);
  const refContainer = useRef<any>(null);
  const [profile] = useState(getUserProfile);
  const me = profile.fullName;
  const { user } = profile;
  const hasToken = !!localStorage.getItem('@diel:token');
  const { menuToogle } = useContext(MenuContext);// true = open, false = not Open
  const handleClickOutside = useCallback((event) => {
    if (refContainer.current && !refContainer.current.contains(event.target)) {
      setFocus(false);
    }
  }, []);
  const [clientIds, setClientIds] = useState<number[] | null>(null);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const logout = () => {
    localStorage.clear();
    posthog.reset();
    dispatch({ type: 'RESET_DATA' });
    history.push('/login');
  };

  useEffect(() => {
    getUserClientId({ profile, setClientIds });
  }, []);

  useEffect(() => {
    focus
      ? document.addEventListener('mousedown', handleClickOutside)
      : document.removeEventListener('mousedown', handleClickOutside);
  }, [focus, handleClickOutside]);

  function getUserName() {
    return `${profile.name} ${profile.lastName}`;
  }

  return (
    <>
      <Container MenuOpen={menuToogle}>
        <div style={{ padding: menuToogle ? '0px 208px' : '0px 35px', marginLeft: '20px' }}>
          {/* 157 - Atacadão
        158 - Carrier */}
          {
          (clientIds && clientIds?.filter((item) => (item !== 157 && item !== 158)).length !== 0 || profile.permissions.isAdminSistema) && <CelciusColorLogo />
        }
          {
          (clientIds && clientIds?.filter((item) => (item !== 157 && item !== 158)).length === 0 && !profile.permissions.isAdminSistema) && <SpringerLogo color="black" />
        }
        </div>
        {/* <CustomLogo style={{ marginRight: '20px' }} src={CelciusLogoWhiteBallWhite} alt="logoDiel" /> */}
        {hasToken && (
        <UserOptions ref={refContainer} onClick={() => setFocus(!focus)}>
          <Welcome>
            {t('bemVindo')}
            {', '}
            <strong>{getUserName()}</strong>
          </Welcome>
          <Expand expanded={focus} />
          {focus && (
            <List>
              <Item onClick={() => setShowUserGuide(true)}>
                <UserGuideIcon />
                <ItemTitle>{t('guiaDoUsuario')}</ItemTitle>
              </Item>
              <div style={{ width: '100%', borderBottom: '1px solid #74747433' }} />
              <Item onClick={() => history.push('/configuracoes')}>
                <ConfigIcon />
                <ItemTitle>{t('configuracoes')}</ItemTitle>
              </Item>
              <Item onClick={logout}>
                <LogoutIcon />
                <ItemTitle>{t('sair')}</ItemTitle>
              </Item>
            </List>
          )}
        </UserOptions>
        )}

      </Container>
      {showUserGuide && (
        <ModalUserGuide handleCloseModal={() => setShowUserGuide(false)} menuToggle={menuToogle} />
      )}

    </>
  );
};

const Header = withRouter(HeaderComp);

export { Header };
