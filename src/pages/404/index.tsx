import { Route, Redirect } from 'react-router-dom';

export const Route404 = ({ ...params }): JSX.Element => {
  const isLogged = !!localStorage.getItem('@diel:token');
  return (
    <Route
      {...params}
      render={() => (isLogged ? <Redirect to="/analise/unidades" /> : <Redirect to="/login" />)}
    />
  );
};
