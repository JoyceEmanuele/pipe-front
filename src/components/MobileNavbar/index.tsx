import { useState, useEffect } from 'react';

import { useDispatch } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import LogoCelciusColor from '../../assets/img/logos/LogoCelciusColor.svg';
import UserIcon from '~/assets/img/sidebar/UserAzul.svg';
import IconSidebar from '~/assets/img/sidebar/menu_azul.svg';
import { MenuMobile } from '~/components/MenuMobile';
import { getUserProfile } from '~/helpers/userProfile';
import { useTranslation } from 'react-i18next';
import {
  StyledLink,
  NavItem,
  UserContainer,
  WrapperItem,
  RelativeWrapper,
  CloseWrapper,
  ModalNavItems,
  ActionableWrapper,
  Icon,
  Topbar,
  Wrapper,
  IconRotate,
} from './styles';
import { apiCall } from '~/providers';
import { SpringerLogo } from '~/icons';
import { getUserClientId } from '~/helpers/getClientsHelper';

const MobileNavbar = ({ history }) => {
  const { t } = useTranslation();
  const [isModalNavItemsOpen, setIsModalNavItemsOpen] = useState(false);
  const [isModalUserOpen, setIsModalUserOpen] = useState(false);
  const [profile] = useState(getUserProfile);
  const me = profile.fullName;
  const { user } = profile;
  const dispatch = useDispatch();
  const [clientIds, setClientIds] = useState<number[] | null>(null);

  const logout = () => {
    localStorage.clear();
    dispatch({ type: 'RESET_DATA' });
    history.push('/login');
  };

  useEffect(() => {
    if (!isModalUserOpen && !isModalNavItemsOpen) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }, [isModalUserOpen, isModalNavItemsOpen]);

  useEffect(() => {
    getUserClientId({ profile, setClientIds });
  }, []);

  return (
    <Wrapper>
      <Topbar>
        <ActionableWrapper onClick={() => setIsModalNavItemsOpen(true)}>
          <Icon src={IconSidebar} alt="user-icon" color="#363BC4" />
        </ActionableWrapper>
        <Link to="/visao-geral">
          {/* 157 - Atacadão
          158 - Carrier */}
          {
            (clientIds && clientIds?.filter((item) => (item !== 157 && item !== 158)).length !== 0 || profile.permissions.isAdminSistema) && <img src={LogoCelciusColor} alt="logoCelcius " />
          }
          {
            (clientIds && clientIds?.filter((item) => (item !== 157 && item !== 158)).length === 0 && !profile.permissions.isAdminSistema) && <SpringerLogo color="black" />
          }
        </Link>
        <ActionableWrapper onClick={() => setIsModalUserOpen(true)}>
          <Icon src={UserIcon} alt="user-icon" color="#363BC4" />
        </ActionableWrapper>
      </Topbar>
      {(isModalNavItemsOpen || isModalUserOpen) && (
        <ModalNavItems>
          <RelativeWrapper>
            <CloseWrapper
              onClick={() => (isModalNavItemsOpen ? setIsModalNavItemsOpen(false) : setIsModalUserOpen(false))}
            >
              <IconRotate src={IconSidebar} alt="user-icon" color="#363BC4" />
            </CloseWrapper>
            {isModalNavItemsOpen ? (
              <MenuMobile setIsModalNavItemsOpen={setIsModalNavItemsOpen} />
            ) : (
              <UserContainer>
                <NavItem isBold>{me || user || ''}</NavItem>
                <ActionableWrapper onClick={() => setIsModalUserOpen(false)}>
                  <StyledLink to="/configuracoes">
                    <NavItem>{t('configuracoes')}</NavItem>
                  </StyledLink>
                </ActionableWrapper>
                <WrapperItem style={{ bottom: 150 }}>
                  <NavItem onClick={logout}>{t('sair')}</NavItem>
                </WrapperItem>
              </UserContainer>
            )}
          </RelativeWrapper>
        </ModalNavItems>
      )}
    </Wrapper>
  );
};

const MobileNavbarWrapper = withRouter(MobileNavbar);

export { MobileNavbarWrapper as MobileNavbar };
