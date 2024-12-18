import { useHistory } from 'react-router-dom';
import { getUserProfile } from '../../helpers/userProfile';
import LogoCelciusColor from '../../assets/img/logos/LogoCelciusColor.svg';
import {
  StyledLink,
  Background,
  LogoContainer,
  MenuItem,
  MenuHighlight,
  MenuItemName,
} from './styles';
import { useEffect, useState } from 'react';
import { apiCall } from '~/providers';
import { SpringerLogo } from '~/icons';
import { getUserClientId } from '~/helpers/getClientsHelper';

export const MenuMobile = ({ setIsModalNavItemsOpen }): JSX.Element => {
  const history = useHistory();
  const [profile] = useState(getUserProfile);
  const ActionableWrapper = ({ children }) => <div style={{ width: '100%' }} onClick={() => setIsModalNavItemsOpen(false)}>{children}</div>;
  const [clientIds, setClientIds] = useState<number[] | null>(null);

  const itemsMenu = [
    {
      to: '/visao-geral',
      visible: !profile.permissions.isInstaller,
      name: 'Visão Geral',
      isActive: history.location.pathname.includes('/visao-geral'),
    },
    {
      to: '/analise/unidades',
      visible: true,
      name: 'Análise',
      isActive: history.location.pathname.includes('/analise'),
    },
    {
      to: '/notificacoes/gerenciamento',
      visible: !profile.permissions.isInstaller,
      name: 'Notificações',
      isActive: history.location.pathname.includes('/notificacoes'),
    },
    {
      to: '/usuarios',
      visible: !profile.permissions.isInstaller,
      name: 'Usuários',
      isActive: history.location.pathname.includes('/usuarios'),
    },
  ];

  useEffect(() => {
    getUserClientId({ profile, setClientIds });
  }, []);

  return (
    <Background>
      <ActionableWrapper>
        <LogoContainer>
          <div style={{ width: '18px' }} />
          {/* 157 - Atacadão
          158 - Carrier */}
          <StyledLink style={{ paddingRight: '12px' }} to="/visao-geral">
            {
              (clientIds && clientIds?.filter((item) => (item !== 157 && item !== 158)).length !== 0 || profile.permissions.isAdminSistema) && <img src={LogoCelciusColor} alt="logoCelcius " />
            }
            {
              (clientIds && clientIds?.filter((item) => (item !== 157 && item !== 158)).length === 0 && !profile.permissions.isAdminSistema) && <SpringerLogo color="black" />
            }
          </StyledLink>
          <div style={{ width: '20px' }} />
        </LogoContainer>
      </ActionableWrapper>
      {
        itemsMenu.map((item) => (
          <ItemsMenu key={item.name} item={item} ActionableWrapper={ActionableWrapper} />
        ))
      }
    </Background>
  );
};

interface IMenuItems {
  item: {
    to: string
    visible: boolean
    name: string
    isActive: boolean
  }
  ActionableWrapper: ({ children }: {
    children: any;
  }) => JSX.Element
}

const ItemsMenu = ({ item, ActionableWrapper }:IMenuItems) => {
  if (item.visible) {
    return (
      <ActionableWrapper style={{ width: '100%' }}>
        <StyledLink to={item.to}>
          <MenuItem isActive={item.isActive}>
            <MenuHighlight isActive={item.isActive} />
            <MenuItemName>{item.name}</MenuItemName>
          </MenuItem>
        </StyledLink>
      </ActionableWrapper>
    );
  }
  return (
    <>
    </>
  );
};
