import { useEffect } from 'react';

import { Helmet } from 'react-helmet';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import { Loader, LayerBackgroundModal } from 'components';
import { EnvGroupAnalysis } from 'components/EnvGroupAnalysis';
import { getCachedDevInfo, getCachedDevInfoSync } from 'helpers/cachedStorage';
import { useStateVar } from 'helpers/useStateVar';
import { DevLayout } from 'pages/Analysis/DEVs/DevLayout';
import {
  SchedulesList, SchedulesRemove, SchedulesEdit,
} from 'pages/Analysis/SchedulesModals/DAM_Schedule';
import { apiCall } from 'providers';
import { DayProg, FullProg_v4 } from 'providers/types';
import i18n from '~/i18n';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

const t = i18n.t.bind(i18n);

function handleSelectTitle(type: 'List'|'Edit'|'Remove'|'Add'): string {
  switch (type) {
    case 'List':
      return t('programacao');
    case 'Edit':
      return t('editarProgramacao');
    case 'Remove':
      return t('excluirProgramacao');
    case 'Add':
      return t('adicionarProgramacao');

    default:
      return '-';
  }
}

export const DamSchedule = (): JSX.Element => {
  const routeParams = useParams<{ devId: string }>();
  const [, render] = useStateVar({});
  const devInfo = getCachedDevInfoSync(routeParams.devId);
  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(routeParams.devId, t('detalhesDAM'))}</title>
      </Helmet>
      <DevLayout devInfo={devInfo} />
      <div style={{ height: '30px' }} />
      <DamScheduleContents onDevInfoUpdate={render} />
    </>
  );
};

export function DamScheduleContents(props: {
  onDevInfoUpdate?: () => void
  hideAnalysis?: boolean
}) {
  const { onDevInfoUpdate, hideAnalysis } = props;
  const routeParams = useParams<{ devId: string }>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      damId: routeParams.devId,
      devInfo: getCachedDevInfoSync(routeParams.devId),
      isLoading: true,
      isSaving: false,
      devSched: {} as FullProg_v4,
      schedulesTypeActive: 'List' as ('List'|'Add'|'Edit'|'Remove'),
      selectedDay: null as null|('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'),
      relDutInfo: null as null|{
        DEV_ID: string;
        ROOM_NAME: string;
        TUSEMAX: number;
        TUSEMIN: number;
        workPeriods: { [day: string]: string };
        workPeriodExceptions: { [day: string]: string };
      },
      groups: [] as {
        name: string
        groupId: number
        dacs: { DAC_ID: string, DAC_NAME: string }[]
        dris: { DRI_ID: string }[]
      }[],
    };
    return state;
  });

  async function fetchDamInfo(damId: string) {
    state.devInfo = await getCachedDevInfo(damId, {});
    if (onDevInfoUpdate) onDevInfoUpdate();

    if (state.devInfo!.dam!.REL_DUT_ID) {
      const dutInfo = await apiCall('/dut/get-dut-info', { DEV_ID: state.devInfo!.dam!.REL_DUT_ID });
      state.relDutInfo = {
        workPeriods: dutInfo.workPeriods,
        workPeriodExceptions: dutInfo.workPeriodExceptions,
        ...dutInfo.info,
      };
    }

    if (!state.devInfo!.dam!.groups) return;
    if (state.devInfo!.dam!.groups.length === 0) return;
    const groupIds = state.devInfo!.dam!.groups.map((x) => x.GROUP_ID);
    const { list: dacsList } = await apiCall('/dac/get-dacs-list', { groupIds });
    const filteredByGroupName: {
      [k: string]: {
        name: string
        groupId: number
        dacs: { DAC_ID: string, DAC_NAME: string }[]
        dris: { DRI_ID: string }[]
      }
    } = {};
    for (const dac of dacsList) {
      if (!dac.GROUP_NAME) continue;
      const groupName = dac.GROUP_NAME;
      const groupId = String(dac.GROUP_ID);
      if (!filteredByGroupName[groupId]) {
        filteredByGroupName[groupId] = {
          name: groupName, groupId: dac.GROUP_ID, dacs: [], dris: [],
        };
      }
      const group = filteredByGroupName[groupId];
      group.dacs.push(dac);
    }
    state.groups = Object.values(filteredByGroupName); render();
  }

  async function handleGetDamProgramming(damId: string) {
    if (damId) {
      try {
        state.isLoading = true; render();
        state.devSched = await apiCall('/dam/get-programming-v3', { damId });
      } catch (err) {
        console.log(err);
        toast.warn(t('erroNaoExisteProgramacoes'));
      }
    }
  }

  useEffect(() => {
    (async function () {
      try {
        state.isLoading = true; render();
        await Promise.all([
          handleGetDamProgramming(routeParams.devId),
          fetchDamInfo(routeParams.devId),
        ]);
      } catch (err) { console.log(err); toast.error(t('houveErro')); }
      state.isLoading = false; render();
    }());
  }, []);

  async function onConfirmRemoveProg(day: keyof FullProg_v4['week']) {
    try {
      const newProg = cloneProg()!;
      if (newProg.week[day]) {
        delete newProg.week[day];
        await saveProg(newProg);
        toast.success(t('sucessoExcluirProgramacao'));
      }
      setState({ schedulesTypeActive: 'List', selectedDay: null });
    } catch (err) {
      console.log(err);
      toast.error(t('erroExcluirProgramacao'));
    }
  }

  async function onConfirmProg(days: ('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun')[], prog: DayProg) {
    try {
      const newProg = cloneProg()!;
      for (const day of days) {
        newProg.week[day] = prog;
      }
      await saveProg(newProg);
      setState({ schedulesTypeActive: 'List', selectedDay: null });
      toast.success(t('sucessoProgramacaoAdicionada'));
      state.selectedDay = null;
      state.schedulesTypeActive = 'List';
    } catch (err) {
      console.log(err);
      toast.error(t('erroAdicionarProgramacao'));
    }
    setState({ isSaving: false });
  }

  async function onConfirmExcept(day: string, prog: DayProg) {
    try {
      const newProg = cloneProg()!;
      if (!newProg.exceptions) newProg.exceptions = {};
      newProg.exceptions[day] = prog;
      await saveProg(newProg);
      setState({ schedulesTypeActive: 'List', selectedDay: null });
      toast.success(t('sucessoProgramacaoAdicionada'));
      state.selectedDay = null;
      state.schedulesTypeActive = 'List';
    } catch (err) {
      console.log(err);
      toast.error(t('erroAdicionarProgramacao'));
    }
    setState({ isSaving: false });
  }

  async function onDelException(exception_date: string) {
    const newProg = cloneProg()!;
    if (!newProg.exceptions) return;
    if (!newProg.exceptions[exception_date]) return;
    if (!window.confirm(t('temCerteza'))) return;
    try {
      delete newProg.exceptions[exception_date];
      await saveProg(newProg);
      toast.success(t('sucessoExcluirProgramacao'));
    } catch (err) {
      console.log(err);
      toast.error(t('erroExcluirProgramacao'));
    }
  }

  async function wantSaveVent(ventTime: { begin: string, end: string }) {
    try {
      const newProg = cloneProg()!;
      newProg.ventTime = { begin: (Number(ventTime.begin) || 0), end: (Number(ventTime.end) || 0) };
      await saveProg(newProg);
    } catch (err) {
      console.log(err);
      toast.error('Erro');
    }
  }

  function cloneProg(): typeof state.devSched {
    const newprog: typeof state.devSched = JSON.parse(JSON.stringify(state.devSched));
    if (!newprog.week) newprog.week = {};
    if (!newprog.exceptions) newprog.exceptions = {};
    return newprog;
  }

  async function saveProg(prog: FullProg_v4) {
    try {
      setState({ isSaving: true });
      const devSched = await apiCall('/dam/set-programming-v3', {
        damId: state.damId,
        ...prog,
      });
      state.devSched = devSched;
      toast.success(t('sucessoSalvarProgramacao'));
    } catch (err) {
      console.log(err);
      toast.error(t('erroSalvarProgramacao'));
    }
    setState({ isSaving: false });
  }

  let modalContent: null|JSX.Element = null;
  if (state.schedulesTypeActive === 'Edit') {
    modalContent = (
      <SchedulesEdit
        devSched={state.devSched}
        selectedDay={state.selectedDay}
        onConfirmProg={onConfirmProg}
        onConfirmExcept={onConfirmExcept}
        onCancel={() => setState({ schedulesTypeActive: 'List', selectedDay: null })}
        isSending={state.isSaving}
      />
    );
  }
  if (state.schedulesTypeActive === 'Remove') {
    modalContent = (
      <SchedulesRemove
        selectedDay={state.selectedDay!}
        onConfirm={onConfirmRemoveProg}
        onCancel={() => setState({ schedulesTypeActive: 'List', selectedDay: null })}
        isRemoving={state.isSaving}
      />
    );
  }
  if (state.schedulesTypeActive === 'Add') {
    modalContent = (
      <SchedulesEdit
        devSched={state.devSched}
        selectedDay={null}
        onConfirmProg={onConfirmProg}
        onConfirmExcept={onConfirmExcept}
        onCancel={() => setState({ schedulesTypeActive: 'List', selectedDay: null })}
        isSending={state.isSaving}
      />
    );
  }

  const isDac = !!(state.devInfo && state.devInfo.dac);

  return (
    <Flex pt="10px" flexDirection="column">
      {state.isLoading ? (
        <Loader />
      ) : (state.devInfo && (
      <>
        <div>
          <ElevatedCard style={{ maxWidth: '800px' }}>
            <SchedulesList
              hideId
              damId={state.damId}
              devSched={state.devSched}
              wantDelException={onDelException}
              wantSaveVent={wantSaveVent}
              wantAddProg={() => setState({ schedulesTypeActive: 'Add', selectedDay: null })}
              wantEditDay={(day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') => setState({ schedulesTypeActive: 'Edit', selectedDay: day })}
              wantRemoveDay={(day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') => setState({ schedulesTypeActive: 'Remove', selectedDay: day })}
              isLoading={state.isLoading}
            />
          </ElevatedCard>
        </div>
        {(!hideAnalysis)
          && (
          <div style={{ paddingTop: '30px' }}>
            <ElevatedCard>
              <EnvGroupAnalysis
                ambientes={state.relDutInfo ? [state.relDutInfo] : []}
                conjuntos={state.groups}
                unitId={state.devInfo.UNIT_ID}
                unitName={state.devInfo.UNIT_NAME}
                includePower={false}
                L1only
                height={400}
                temperatureLimits={state.relDutInfo}
                splitLcmp={isDac}
              />
            </ElevatedCard>
          </div>
          )}
        {modalContent
          && (
          <LayerBackgroundModal>
            <Flex width={1} justifyContent="center" alignItems="center">
              <Box width={[1, 1, 1, 2 / 3, '800px']} maxHeight="100vh" pt={24}>
                <Card title={handleSelectTitle(state.schedulesTypeActive)}>
                  {modalContent}
                </Card>
              </Box>
            </Flex>
          </LayerBackgroundModal>
          )}
      </>
      ))}
    </Flex>
  );
}

const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
  background-color: white;
`;
const ElevatedCard = styled.div`
  padding: 32px;
  border-radius: 10px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export default withTransaction('DamSchedule', 'component')(DamSchedule);
