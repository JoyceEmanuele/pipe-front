import { Route } from 'react-router-dom';
import { apmElastic } from 'helpers/apmElastic';

type PublicRouteProps = {
  component: React.ElementType;
}

export const SpecialRoute = ({ component: Component, ...params }: PublicRouteProps): JSX.Element => (
  <Route
    {...params}
    render={(props) => {
      if (process.env.REACT_APP_APM_ELASTIC) {
        apmElastic(props.location.pathname);
      }
      return <Component {...props} />;
    }}
  />
);
