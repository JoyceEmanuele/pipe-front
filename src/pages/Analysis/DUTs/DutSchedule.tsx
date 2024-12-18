import { useEffect } from 'react';

import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import { Loader, LayerBackgroundModal } from 'components';
import { getCachedDevInfo, getCachedDevInfoSync } from 'helpers/cachedStorage';
import { useStateVar } from 'helpers/useStateVar';
import { DevLayout } from 'pages/Analysis/DEVs/DevLayout';
import { SchedulesList, SchedulesRemove, SchedulesEdit } from 'pages/Analysis/SchedulesModals/DUT_Schedule';
import { apiCall } from 'providers';
import { DayProg, FullProg_v4 } from 'providers/types';

const handleSelectTitle = {
  List: 'Programação',
  Edit: 'Editar programação',
  Remove: 'Excluir programação',
  Add: 'Adicionar programação',
};

export const DutSchedule = (): JSX.Element => {
  const routeParams = useParams<{ devId: string }>();
  const [, render] = useStateVar({});
  const devInfo = getCachedDevInfoSync(routeParams.devId);
  return (
    <>
      <Helmet>
        <title>Diel Energia - Programação DUT</title>
      </Helmet>
      <DevLayout devInfo={devInfo} />
      <div style={{ height: '30px' }} />
      <DutScheduleContents onDevInfoUpdate={render} />
    </>
  );
};

export function DutScheduleContents(props: { onDevInfoUpdate?: () => void }) {
  const { onDevInfoUpdate } = props;
  const routeParams = useParams<{ devId: string }>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      isSaving: false,
      devId: routeParams.devId,
      devInfo: getCachedDevInfoSync(routeParams.devId),
      devSched: { week: {}, exceptions: {} } as FullProg_v4,
      schedulesTypeActive: null as null|('Edit'|'Remove'|'Add'),
      editedDay: null as null|('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'),
    };
    return state;
  });

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    try {
      setState({ isLoading: true });
      const schedProm = apiCall('/dut/get-programming-v3', { dutId: state.devId });
      schedProm.catch((err) => { console.log(err); });
      const devInfo = await getCachedDevInfo(state.devId, {});
      state.devInfo = devInfo;
      if (onDevInfoUpdate) onDevInfoUpdate();
      const devSched = await schedProm;
      if (!devSched) throw Error('Could not get device schedule');
      if (!devSched.week) devSched.week = {};
      if (!devSched.exceptions) devSched.exceptions = {};
      state.devSched = devSched;
    } catch (err) {
      console.log(err);
      // toast.warn('Não existem programações ativas')
      toast.error('Houve erro');
    }
    setState({ isLoading: false });
  }

  function cloneProg(): typeof state.devSched {
    const newProg: typeof state.devSched = JSON.parse(JSON.stringify(state.devSched));
    if (!newProg.week) newProg.week = {};
    if (!newProg.exceptions) newProg.exceptions = {};
    return newProg;
  }

  async function saveProg(prog: FullProg_v4) {
    try {
      setState({ isSaving: true });
      const devSched = await apiCall('/dut/set-programming-v3', {
        dutId: state.devId,
        ...prog,
      });
      state.devSched = devSched;
      toast.success('Programação salva com sucesso!');
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível salvar a programação');
    }
    setState({ isSaving: false });
  }

  async function wantSaveVent(ventInput: string) {
    const newProg = cloneProg();
    const ventilation = (ventInput && Number(ventInput)) || 0;
    newProg.ventTime = { begin: ventilation, end: ventilation };
    await saveProg(newProg);
  }

  // async function wantSaveCtrl(mode: '0_NO_CONTROL'|'1_CONTROL'|'2_SOB_DEMANDA'|'3_BACKUP', temperature: number) {
  //   const newProg = cloneProg();
  //   newProg.temprtControl = { mode, temperature };
  //   await saveProg(newProg);
  // }

  async function wantDelException(day: string) {
    const newProg = cloneProg();
    if (!newProg.exceptions) return;
    if (!newProg.exceptions[day]) return;
    if (!window.confirm('Tem certeza?')) return;
    delete newProg.exceptions[day];
    await saveProg(newProg);
  }

  async function onConfirmProg(days: ('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun')[], prog: DayProg) {
    try {
      const newProg = cloneProg();
      for (const day of days) {
        newProg.week[day] = prog;
      }
      await saveProg(newProg);
      toast.success('Programação adicionada com sucesso!');
      state.editedDay = null;
      state.schedulesTypeActive = null;
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível adicionar a programação.');
    }
    setState({ isSaving: false });
  }

  async function onConfirmExcept(day: string, prog: DayProg) {
    try {
      const newProg = cloneProg();
      if (!newProg.exceptions) newProg.exceptions = {};
      newProg.exceptions[day] = prog;
      await saveProg(newProg);
      toast.success('Programação adicionada com sucesso!');
      state.editedDay = null;
      state.schedulesTypeActive = null;
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível adicionar a programação.');
    }
    setState({ isSaving: false });
  }

  async function onConfirmRemoveProg(day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') {
    const newProg = cloneProg();
    if (newProg.week[day]) {
      delete newProg.week[day];
      await saveProg(newProg);
    }
    setState({ schedulesTypeActive: null, editedDay: null });
  }

  return (
    <Flex pt="10px" flexDirection="column">
      {state.isLoading ? (
        <Loader />
      ) : (state.devSched && (
      <>
        <div>
          <ElevatedCard style={{ maxWidth: '800px' }}>
            <SchedulesList
              devSched={state.devSched}
              wantDelException={wantDelException}
              wantSaveVent={wantSaveVent}
              wantSaveCtrl={null}
              wantAddProg={() => setState({ schedulesTypeActive: 'Add', editedDay: null })}
              wantEditDay={(day) => setState({ schedulesTypeActive: 'Edit', editedDay: day })}
              wantRemoveDay={(day) => setState({ schedulesTypeActive: 'Remove', editedDay: day })}
              isLoading={state.isSaving}
            />
          </ElevatedCard>
        </div>
        {(state.schedulesTypeActive)
          && (
            <LayerBackgroundModal>
              <Flex width={1} justifyContent="center" alignItems="center">
                <Box width={[1, 1, 1, 2 / 3, '800px']} maxHeight="100vh" pt={24}>
                  <Card title={handleSelectTitle[state.schedulesTypeActive]}>
                    {(state.schedulesTypeActive === 'Edit') && (
                      <SchedulesEdit
                        devSched={state.devSched}
                        selectedDay={state.editedDay}
                        onConfirmProg={onConfirmProg}
                        onConfirmExcept={onConfirmExcept}
                        onCancel={() => setState({ schedulesTypeActive: null, editedDay: null })}
                        isSending={state.isSaving}
                      />
                    )}
                    {(state.schedulesTypeActive === 'Remove') && (
                      <SchedulesRemove
                        selectedDay={state.editedDay!}
                        onConfirm={onConfirmRemoveProg}
                        onCancel={() => setState({ schedulesTypeActive: null, editedDay: null })}
                        isRemoving={state.isSaving}
                      />
                    )}
                    {(state.schedulesTypeActive === 'Add') && (
                      <SchedulesEdit
                        devSched={state.devSched}
                        selectedDay={null}
                        onConfirmProg={onConfirmProg}
                        onConfirmExcept={onConfirmExcept}
                        onCancel={() => setState({ schedulesTypeActive: null, editedDay: null })}
                        isSending={state.isSaving}
                      />
                    )}
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
