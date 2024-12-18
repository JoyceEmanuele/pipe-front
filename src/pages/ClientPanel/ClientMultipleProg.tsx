import { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';

import queryString from 'query-string';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import { Loader, Select, Button } from '~/components';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';

import { MultipleDevProg } from '~/pages/Analysis/Units/UnitProfile/MultipleDevProg';
import { withTransaction } from '@elastic/apm-rum-react';

export const ClientMultipleProg = () => {
  const history = useHistory();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      clientId: undefined as undefined|number,
      type: undefined as undefined|string,
    };
    return state;
  });

  useEffect(() => {
    const queryPars = queryString.parse(history.location.search);
    const clientId = queryPars.idcliente;
    const type = queryPars.type;

    setState({ isLoading: false, clientId: Number(clientId), type: String(type) });
  }, []);

  if (state.isLoading) return <Loader />;

  return (
    <div>
      <MultipleDevProg clientId={state.clientId} type={state.type} />
      <Link to={`/painel/clientes/editar-cliente/${state.clientId}`}>
        <SimpleButton variant="primary">VOLTAR</SimpleButton>
      </Link>
    </div>
  );
};

const SimpleButton = styled(Button)`
  width: initial;
  padding: 8px 15px;
  margin: 20px 0px;
`;

export default withTransaction('ClientMultipleProg', 'component')(ClientMultipleProg);
