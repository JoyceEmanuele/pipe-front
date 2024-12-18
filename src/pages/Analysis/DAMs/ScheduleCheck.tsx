import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import {
  EmptyWrapper, Loader,
} from 'components';
import { AnalysisLayout } from 'pages/Analysis/AnalysisLayout';
import { apiCall } from 'providers';
import { DayProg, FullProg_v4 } from 'providers/types';
import { useTranslation } from 'react-i18next';
import { withTransaction } from '@elastic/apm-rum-react';

function serializeDayProg(dayProg: DayProg|null|undefined) {
  if (!dayProg) return '';
  return `${dayProg.permission};${dayProg.start}-${dayProg.end}`;
}
function serializeFullProg2(fullProg: FullProg_v4) {
  const descWeekList = [] as string[];
  descWeekList.push(`[mon:${serializeDayProg(fullProg.week && fullProg.week.mon)}]`);
  descWeekList.push(`[tue:${serializeDayProg(fullProg.week && fullProg.week.tue)}]`);
  descWeekList.push(`[wed:${serializeDayProg(fullProg.week && fullProg.week.wed)}]`);
  descWeekList.push(`[thu:${serializeDayProg(fullProg.week && fullProg.week.thu)}]`);
  descWeekList.push(`[fri:${serializeDayProg(fullProg.week && fullProg.week.fri)}]`);
  descWeekList.push(`[sat:${serializeDayProg(fullProg.week && fullProg.week.sat)}]`);
  descWeekList.push(`[sun:${serializeDayProg(fullProg.week && fullProg.week.sun)}]`);
  const fullDescWeek = descWeekList.join('');

  let fullDescVent = `[ventilation-begin:${(fullProg.ventTime && fullProg.ventTime.begin) || ''}]`;
  fullDescVent += `[ventilation-end:${(fullProg.ventTime && fullProg.ventTime.end) || ''}]`;

  const descExceptList = [] as string[];
  for (const [day, prog] of Object.entries(fullProg.exceptions || {})) {
    descExceptList.push(`[${day}:${serializeDayProg(prog)}]`);
  }
  const fullDescExcept = descExceptList.sort().join('');
  return {
    fullDescWeek, fullDescVent, fullDescExcept, descWeekList, descExceptList,
  };
}
export function serializeFullProg(fullProg: FullProg_v4) {
  let fullDesc = '';
  fullDesc += `[mon:${serializeDayProg(fullProg.week && fullProg.week.mon)}]`;
  fullDesc += `[tue:${serializeDayProg(fullProg.week && fullProg.week.tue)}]`;
  fullDesc += `[wed:${serializeDayProg(fullProg.week && fullProg.week.wed)}]`;
  fullDesc += `[thu:${serializeDayProg(fullProg.week && fullProg.week.thu)}]`;
  fullDesc += `[fri:${serializeDayProg(fullProg.week && fullProg.week.fri)}]`;
  fullDesc += `[sat:${serializeDayProg(fullProg.week && fullProg.week.sat)}]`;
  fullDesc += `[sun:${serializeDayProg(fullProg.week && fullProg.week.sun)}]`;
  fullDesc += `[ventilation-begin:${(fullProg.ventTime && fullProg.ventTime.begin) || ''}]`;
  fullDesc += `[ventilation-end:${(fullProg.ventTime && fullProg.ventTime.end) || ''}]`;
  for (const [day, prog] of Object.entries(fullProg.exceptions || {})) {
    fullDesc += `[${day}:${serializeDayProg(prog)}]`;
  }
  return fullDesc;
}

export const ScheduleCheck = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [, stateChanged] = useState({});
  function render() { stateChanged({}); }
  const [state] = useState(() => {
    const state = {
      changed() { stateChanged({}); },
      set(obj) { Object.assign(state, obj); stateChanged({}); },
      isLoading: false,
      damsList: [] as {
        damId: string
        currentS: { fullDescWeek: string, fullDescVent: string, fullDescExcept: string, descWeekList: string[], descExceptList: string[] }
        desiredS: { fullDescWeek: string, fullDescVent: string, fullDescExcept: string, descWeekList: string[], descExceptList: string[] }
      }[],
    };

    return state;
  });

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchListFromServer();
    });
  }, []);

  async function fetchListFromServer() {
    state.isLoading = true;
    render();
    try {
      const { list } = await apiCall('/dam/get-sched-list-v2', {});
      state.damsList = list.map((damInf) => ({
        damId: damInf.damId,
        currentS: serializeFullProg2(damInf.current),
        desiredS: serializeFullProg2(damInf.desired),
      }));
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    state.isLoading = false;
    render();
  }
  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaAutomacao')}</title>
      </Helmet>
      <AnalysisLayout />
      <ElevatedCard style={{ marginTop: '40px' }}>
        {state.isLoading
          ? (
            <EmptyWrapper>
              <Loader variant="primary" size="large" />
            </EmptyWrapper>
          )
          : (
            <>
              {(state.damsList.length === 0)
              && (
              <div>
                {t('nenhumDam')}
              </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto auto auto auto' }}>
                {state.damsList.map((dam) => {
                  if ((dam.currentS.fullDescWeek + dam.currentS.fullDescWeek + dam.currentS.fullDescExcept)
                  === (dam.desiredS.fullDescWeek + dam.desiredS.fullDescWeek + dam.desiredS.fullDescExcept)) {
                    return null;
                  }
                  return (
                    <>
                      <GridCell>{dam.damId}</GridCell>

                      <GridCell style={{ paddingLeft: '20px' }}>
                        {(dam.currentS.fullDescWeek === dam.desiredS.fullDescWeek)
                          ? t('igual')
                          : dam.currentS.descWeekList.map((day) => <div key={day}>{day}</div>)}
                      </GridCell>
                      <GridCell style={{ paddingLeft: '20px' }}>
                        {(dam.currentS.fullDescWeek === dam.desiredS.fullDescWeek)
                          ? ''
                          : dam.desiredS.descWeekList.map((day) => <div key={day}>{day}</div>)}
                      </GridCell>

                      <GridCell style={{ paddingLeft: '20px' }}>
                        {(dam.currentS.fullDescVent === dam.desiredS.fullDescVent) ? t('igual') : dam.currentS.fullDescVent}
                      </GridCell>
                      <GridCell style={{ paddingLeft: '20px' }}>
                        {(dam.currentS.fullDescVent === dam.desiredS.fullDescVent) ? '' : dam.desiredS.fullDescVent}
                      </GridCell>

                      <GridCell style={{ paddingLeft: '20px' }}>
                        {(dam.currentS.fullDescExcept === dam.desiredS.fullDescExcept)
                          ? t('igual')
                          : dam.currentS.descExceptList.length
                            ? dam.currentS.descExceptList.map((day) => <div key={day}>{day}</div>)
                            : `(${t('nenhuma')})`}
                      </GridCell>
                      <GridCell style={{ paddingLeft: '20px' }}>
                        {(dam.currentS.fullDescExcept === dam.desiredS.fullDescExcept)
                          ? ''
                          : dam.desiredS.descExceptList.length
                            ? dam.desiredS.descExceptList.map((day) => <div key={day}>{day}</div>)
                            : `(${t('nenhuma')})`}
                      </GridCell>
                    </>
                  );
                })}
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
const GridCell = styled.div`
  border: 1px solid grey;
`;

export default withTransaction('ScheduleCheck', 'component')(ScheduleCheck);
