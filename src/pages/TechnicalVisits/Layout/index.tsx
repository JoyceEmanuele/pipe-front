import { useLocation } from 'react-router-dom';

import { TabsContainer, TabsList, TabItem } from '../components/StyledComponents';
import { Header, Title, Link } from './styles';

const TABS = [
  {
    link: '/visita-tecnica',
    title: 'VTs',
  },
  {
    link: '/visita-tecnica/historico',
    title: 'Histórico',
  },
];

type LayoutProps = {
  children: JSX.Element | JSX.Element[];
}

export const Layout = ({ children }: LayoutProps): JSX.Element => {
  const { pathname } = useLocation();

  return (
    <Header>
      <Title>Visita Técnica</Title>
      <TabsContainer>
        <TabsList>
          {TABS.map((tab) => {
            const isThereATabWithExactPath = TABS.some((tab) => pathname === tab.link);
            let isActive = false;
            if (isThereATabWithExactPath) {
              if (pathname === tab.link) {
                isActive = true;
              }
            } else if (pathname.includes(tab.link)) isActive = true;
            return (
              <TabItem key={tab.title} isActive={isActive}>
                <Link to={tab.link} isActive={() => isActive} exact>{tab.title}</Link>
                <div style={{ height: 7, width: '100%' }} />
              </TabItem>
            );
          })}
        </TabsList>
      </TabsContainer>
      {children}
    </Header>
  );
};
