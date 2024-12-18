import { useState } from 'react';

import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import {
  EmptyWrapper, Loader,
} from 'components';
import { AnalysisLayout } from 'pages/Analysis/AnalysisLayout';
import { apiCall } from 'providers';
import { FullProg_v4 } from 'providers/types';

import { FullProgEdit } from '../SchedulesModals/FullProgEdit';
import { serializeFullProg } from './ScheduleCheck';
import { useTranslation } from 'react-i18next';
// TODO: Botão de atualizar

export const BatchSchedule = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [, stateChanged] = useState({});
  function render() { stateChanged({}); }
  const [state] = useState(() => {
    const state = {
      changed() { stateChanged({}); },
      set(obj) { Object.assign(state, obj); stateChanged({}); },
      isLoading: false,
      initialProg: null as null|FullProg_v4,
      expectedProgS: null as null|string,
      damsList: [] as { damId: string; currentS: string; }[],
    };

    Promise.resolve().then(() => {
      fetchListFromServer();
    });

    return state;
  });

  async function fetchListFromServer() {
    state.isLoading = true;
    render();
    try {
      const { ids } = queryString.parse(history.location.search);
      const damIds = (ids && (ids as string).split('*')) || [];
      const { list } = await apiCall('/dam/get-sched-list-v2', { damIds });
      state.damsList = list.map((damInf) => {
        if ((!state.initialProg) && (damInf.desired)) {
          state.initialProg = damInf.desired;
        }
        return {
          damId: damInf.damId,
          currentS: serializeFullProg(damInf.current),
        };
      });
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    state.isLoading = false;
    render();
  }

  function sendSchedule(sched) {
    state.expectedProgS = serializeFullProg(sched);
    render();

    Promise.resolve().then(async () => {
      try {
        const { ids } = queryString.parse(history.location.search);
        const damIds = (ids && (ids as string).split('*')) || [];
        state.isLoading = true;
        render();
        await apiCall('/set-full-sched-batch-v2', {
          ...sched,
          damIds,
        });
      } catch (err) { console.log(err); toast.error(t('houveErro')); }
      await fetchListFromServer();
    });
  }

  function updateSchedule(sched) {
    state.expectedProgS = serializeFullProg(sched);
    render();
  }
  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaAutomacao')}</title>
      </Helmet>
      <AnalysisLayout />
      {(state.damsList.length > 0)
        && (
        <div style={{ display: 'flex', paddingTop: '15px', flexWrap: 'wrap' }}>
          <ElevatedCard style={{ width: '800px' }}>
            <FullProgEdit fullProg={state.initialProg} onConfirm={sendSchedule} onChange={updateSchedule} />
          </ElevatedCard>
        </div>
        )}
      <ElevatedCard style={{ marginTop: '40px' }}>
        {state.isLoading ? (
          <EmptyWrapper>
            <Loader variant="primary" size="large" />
          </EmptyWrapper>
        ) : (
          <>
            <p>
              <button type="button" onClick={fetchListFromServer}>{t('recarregar')}</button>
              {/* <div>{state.expectedProgS}</div> */}
            </p>
            {(state.damsList.length === 0)
              && (
              <div>
                {t('nenhumDam')}
              </div>
              )}
            <div>
              {state.damsList.map((dam) => (
                <div>
                  <span>{dam.damId}</span>
                  <span style={{ paddingLeft: '20px' }}>{(dam.currentS === state.expectedProgS) ? 'igual' : 'diferente'}</span>
                  {/* <span>{dam.currentS.replace(/\]\[/g, '] [')}</span> */}
                </div>
              ))}
            </div>
          </>
        )}
      </ElevatedCard>
    </>
  );
};

const ElevatedCard = styled.div`
  padding: 32px;
  border-radius: 10px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;
