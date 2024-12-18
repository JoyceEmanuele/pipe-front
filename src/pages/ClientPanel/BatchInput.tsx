import { useState, useEffect } from 'react';

import queryString from 'query-string';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';

import { Loader, Select } from '~/components';
import { Card as CardUntitled } from '~/components/Card';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall } from '~/providers';
import { BatchInputDACs } from './BatchInput/BatchInputDACs';
import { BatchInputDAMs } from './BatchInput/BatchInputDAMs';
import { BatchInputDUTs } from './BatchInput/BatchInputDUTs';
import { BatchInputDRIs } from './BatchInput/BatchInputDRIs';
import { BatchInputEnvironmentTypes } from './BatchInput/BatchInputEnvironmentTypes';
import { BatchInputSupervisors } from './BatchInput/BatchInputSupervisors';
import { BatchInputInvoices } from './BatchInput/BatchInputInvoices';
import { BatchInputDMAs } from './BatchInput/BatchInputDMAs';
import { BatchInputUnified } from './BatchInput/BatchInputUnified';
import { withTransaction } from '@elastic/apm-rum-react';

export const BatchInput = () => {
  const history = useHistory();
  const routeParams = useParams<{ tipo: string }>();
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      clients: [] as {}[],
      selectedClient: null as null|{
        CLIENT_ID: number;
        NAME: string;
        PERMS_C: string;
        EMAIL?: string;
        PICTURE?: string;
        ENABLED?: string;
      },
    };
    return state;
  });

  let clientId = (state.selectedClient && state.selectedClient.CLIENT_ID);
  if ((!clientId) && profile.singleClientViewId) {
    clientId = profile.singleClientViewId;
  }

  useEffect(() => {
    fetchServerData();
  }, [clientId]);

  async function fetchServerData() {
    try {
      if (profile.viewMultipleClients) {
        state.isLoading = true; render();
        const { list: clients } = await apiCall('/clients/get-clients-list', {});
        state.clients = clients;
        const queryPars = queryString.parse(history.location.search);
        if (queryPars.idcliente && state.selectedClient == null) {
          state.selectedClient = clients.find((x) => String(x.CLIENT_ID) === queryPars.idcliente) || null;
        }
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.isLoading = false; render();
  }

  if (state.isLoading) return <Loader />;

  return (
    <div>
      {profile.viewMultipleClients && (
        <Select
          options={state.clients}
          propLabel="NAME"
          value={state.selectedClient}
          placeholder="Cliente"
          onSelect={(item) => { state.selectedClient = item; render(); }}
          style={{ width: '300px' }}
        />
      )}
      {(!clientId) && <div style={{ marginTop: '20px' }}>Nenhum cliente selecionado</div>}
      {(clientId) && (
        <>
          {((!routeParams.tipo) || (routeParams.tipo === 'dacs')) && (
            <CardUntitled>
              <BatchInputDACs clientId={clientId} />
            </CardUntitled>
          )}
          {((!routeParams.tipo) || (routeParams.tipo === 'tipos-ambiente')) && (
            <CardUntitled>
              <BatchInputEnvironmentTypes clientId={clientId} />
            </CardUntitled>
          )}
          {((!routeParams.tipo) || (routeParams.tipo === 'duts')) && (
            <CardUntitled>
              <BatchInputDUTs clientId={clientId} />
            </CardUntitled>
          )}
          {((!routeParams.tipo) || (routeParams.tipo === 'dmas')) && (
            <CardUntitled>
              <BatchInputDMAs clientId={clientId} />
            </CardUntitled>
          )}
          {((!routeParams.tipo) || (routeParams.tipo === 'dams')) && (
            <CardUntitled>
              <BatchInputDAMs clientId={clientId} />
            </CardUntitled>
          )}
          {((!routeParams.tipo) || (routeParams.tipo === 'dris')) && (
            <CardUntitled>
              <BatchInputDRIs clientId={clientId} />
            </CardUntitled>
          )}

          {((!routeParams.tipo) || (routeParams.tipo === 'responsaveis'))
            && (
            <CardUntitled>
              <BatchInputSupervisors clientId={clientId} />
            </CardUntitled>
            )}
          {((!routeParams.tipo) || (routeParams.tipo === 'faturas')) && (
            <CardUntitled>
              <BatchInputInvoices clientId={clientId} />
            </CardUntitled>
          )}
          {((!routeParams.tipo) || (routeParams.tipo === 'unificada')) && (
            <CardUntitled noPadding>
              <BatchInputUnified clientId={clientId} />
            </CardUntitled>
          )}
        </>
      )}
    </div>
  );
};

export default withTransaction('BatchInput', 'component')(BatchInput);
