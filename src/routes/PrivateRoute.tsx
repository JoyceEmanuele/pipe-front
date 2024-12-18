import { Route, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import MenuContext from '~/contexts/menuContext';
import { DesktopNavbar } from '~/components/DesktopNavbar';
import { MobileNavbar } from '~/components/MobileNavbar';
import { useContext } from 'react';
import { apmElastic } from 'helpers/apmElastic';

const PrivateRouteWrapper = styled.div<{ isMenuOpen }>(
  ({ isMenuOpen }) => `
  padding: 24px 16px;
  @media (min-width: 768px) {
    padding-top: 70px;
    padding-left: ${isMenuOpen ? '270px' : '75px'};
    padding-right: 20px;
  }
`,
);

type PrivateRouteProps = {
  component: React.ElementType
}

export const PrivateRoute = ({ component: Component, ...params }: PrivateRouteProps): JSX.Element => {
  const isLogged = !!localStorage.getItem('@diel:token');
  const { menuToogle } = useContext(MenuContext);
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
      <PrivateRouteWrapper isMenuOpen={menuToogle}>
        <Route
          {...params}
          render={(props) => {
            if (process.env.REACT_APP_APM_ELASTIC) {
              apmElastic(props.location.pathname);
            }
            return isLogged ? <Component {...props} /> : <Redirect to="/login" />;
          }}
        />
      </PrivateRouteWrapper>
    </>
  );
};
