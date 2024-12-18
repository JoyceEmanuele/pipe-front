import { useEffect, useState } from 'react';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import { LayerBackgroundModal, Card } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { CloseIcon } from 'icons';
import { apiCall } from 'providers';
import { DayProg, FullProg_v4 } from 'providers/types';
import { colors } from 'styles/colors';

import { SchedulesEdit, SchedulesList, SchedulesRemove } from '../../SchedulesModals/DAM_Schedule';
import { TUnitInfo } from '../UnitLayout';
import { getUserProfile } from '~/helpers/userProfile';

const cardTitle = {
  List: t('programacao'),
  Edit: t('editarProgramacao'),
  Remove: t('excluirProgramacao'),
  Add: t('adicionarProgramacao'),
};

export function Schedules(props: { closeScheduleModal: () => void, damId: string, unitInfo: null | TUnitInfo }) {
  const { closeScheduleModal, damId, unitInfo } = props;
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      isSaving: false,
      devSched: { week: {}, exceptions: {} } as FullProg_v4,
      schedulesTypeActive: 'List' as ('List'|'Add'|'Edit'|'Remove'),
      editedDay: null as null|('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'),
      damId,
    };
    return state;
  });

  let permissionProfile = (unitInfo && unitInfo.CLIENT_ID
    ? profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === unitInfo?.CLIENT_ID)
    : false) || profile.manageAllClients;

  if (permissionProfile === false || permissionProfile === undefined) {
    permissionProfile = !!profile.adminClientProg?.UNIT_MANAGE.some((item) => item === unitInfo?.UNIT_ID);
  }

  state.damId = damId;

  function CloseSchedulesModal() {
    return (
      <IconWrapper
        onClick={() => {
          closeScheduleModal();
          state.schedulesTypeActive = 'List'; render();
        }}
      >
        <CloseIcon color={colors.White} />
      </IconWrapper>
    );
  }

  function ModalMobile(props: {
    title: string
    children: JSX.Element
    closeScheduleModal: () => void
  }) {
    const { title, children, closeScheduleModal } = props;
    return (
      <MobileWrapper>
        <Flex mb={32}>
          <Box width={1}>
            <ModalSection>
              <ModalTitleContainer>
                <ModalTitle>{title}</ModalTitle>
                <CloseIcon
                  size="12px"
                  onClick={closeScheduleModal}
                />
              </ModalTitleContainer>
            </ModalSection>
          </Box>
        </Flex>
        <Flex>
          <Box width={1} p="24px 32px">
            {children}
          </Box>
        </Flex>
      </MobileWrapper>
    );
  }

  useEffect(() => {
    handleGetDamProgramming(damId);
  }, [damId]);

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
    state.isLoading = false; render();
  }

  async function onConfirmRemoveProg(day: keyof FullProg_v4['week']) {
    try {
      const newProg = cloneProg();
      if (newProg.week && newProg.week[day]) {
        delete newProg.week[day];
        await saveProg(newProg);
        toast.success(t('sucessoExcluirProgramacao'));
      }
      setState({ schedulesTypeActive: 'List', editedDay: null });
    } catch (err) {
      console.log(err);
      toast.error(t('erroExcluirProgramacao'));
    }
  }

  async function onConfirmProg(days: ('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun')[], prog: DayProg) {
    try {
      const newProg = cloneProg();
      for (const day of days) {
        newProg.week[day] = prog;
      }
      await saveProg(newProg);
      toast.success(t('sucessoProgramacaoAdicionada'));
      state.editedDay = null;
      state.schedulesTypeActive = 'List';
    } catch (err) {
      console.log(err);
      toast.error(t('erroAdicionarProgramacao'));
    }
    setState({ isSaving: false });
  }

  async function onConfirmExcept(day: string, prog: DayProg) {
    try {
      const newProg = cloneProg();
      if (!newProg.exceptions) newProg.exceptions = {};
      newProg.exceptions[day] = prog;
      await saveProg(newProg);
      toast.success(t('sucessoProgramacaoAdicionada'));
      state.editedDay = null;
      state.schedulesTypeActive = 'List';
    } catch (err) {
      console.log(err);
      toast.error(t('erroAdicionarProgramacao'));
    }
    setState({ isSaving: false });
  }

  async function onDelException(exception_date: string) {
    const newProg = cloneProg();
    if (!newProg.exceptions) return;
    if (!newProg.exceptions[exception_date]) return;
    if (!window.confirm(t('temCerteza'))) return;
    try {
      delete newProg.exceptions[exception_date];
      await saveProg(newProg);
      toast.success(t('sucessoExcluirProgramacao'));
      // state.schedulesTypeActive = 'List'; render()
    } catch (err) {
      console.log(err);
      toast.error(t('erroExcluirProgramacao'));
    }
    state.isLoading = false; render();
  }

  // async function wantSaveVent(ventInput: string) {
  //   try {
  //     const newProg = cloneProg();
  //     const ventilation = (ventInput && Number(ventInput)) || 0;
  //     newProg.ventTime = { begin: ventilation, end: ventilation };
  //     await saveProg(newProg);
  //   } catch (err) {
  //     console.log(err);
  //     toast.error('Erro');
  //   }
  // }

  async function wantSaveVent(ventTime: { begin: string, end: string }) {
    try {
      const newProg = cloneProg()!;
      newProg.ventTime = { begin: (Number(ventTime.begin) || 0), end: (Number(ventTime.end) || 0) };
      await saveProg(newProg);
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
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
      const devSched = await apiCall('/dam/set-programming-v3', {
        damId,
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

  const contents = getActivePage();
  function getActivePage() {
    switch (state.schedulesTypeActive) {
      case 'Edit': return (
        <SchedulesEdit
          devSched={state.devSched}
          selectedDay={state.editedDay}
          onConfirmProg={onConfirmProg}
          onConfirmExcept={onConfirmExcept}
          onCancel={() => setState({ schedulesTypeActive: 'List', editedDay: null })}
          isSending={state.isSaving}
        />
      );
      case 'Remove': return (
        <SchedulesRemove
          selectedDay={state.editedDay!}
          onConfirm={onConfirmRemoveProg}
          onCancel={() => setState({ schedulesTypeActive: 'List', editedDay: null })}
          isRemoving={state.isSaving}
        />
      );
      case 'Add': return (
        <SchedulesEdit
          devSched={state.devSched}
          selectedDay={null}
          onConfirmProg={onConfirmProg}
          onConfirmExcept={onConfirmExcept}
          onCancel={() => setState({ schedulesTypeActive: 'List', editedDay: null })}
          isSending={state.isSaving}
        />
      );
      default: return (
        <SchedulesList
          damId={damId}
          devSched={state.devSched}
          wantDelException={onDelException}
          wantSaveVent={wantSaveVent}
          wantAddProg={() => setState({ schedulesTypeActive: 'Add', editedDay: null })}
          wantEditDay={(day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') => setState({ schedulesTypeActive: 'Edit', editedDay: day })}
          wantRemoveDay={(day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') => setState({ schedulesTypeActive: 'Remove', editedDay: day })}
          isLoading={state.isLoading}
          hideId={false}
          readOnly={!permissionProfile}
        />
      );
    }
  }

  return (
    <Container>
      <Flex>
        <Box width={1} justifyContent="center" alignItems="center">
          <ModalDesktop>
            <LayerBackgroundModal>
              <Flex width={1} justifyContent="center" alignItems="center">
                <Box width={[1, 1, 1, 2 / 3, '800px']} maxHeight="100vh" pt={100} style={{ zIndex: '9999' }}>
                  <Card title={cardTitle[state.schedulesTypeActive]} IconsContainer={CloseSchedulesModal}>
                    {contents}
                  </Card>
                </Box>
              </Flex>
            </LayerBackgroundModal>
          </ModalDesktop>
          <ModalMobile
            title={cardTitle[state.schedulesTypeActive]}
            closeScheduleModal={() => { closeScheduleModal(); setState({ schedulesTypeActive: 'List' }); }}
          >
            {contents}
          </ModalMobile>
        </Box>
      </Flex>
    </Container>
  );
}

const IconWrapper = styled.div`
  cursor: pointer;
`;

const ModalDesktop = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`;

const MobileWrapper = styled.div`
  top: 0;
  left: 0;
  display: block;
  position: fixed;
  background-color: ${colors.White};
  width: 100%;
  height: 100vh;
  z-index: 1;
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.5s ease-in-out;

  @media (min-width: 768px) {
    display: none;
  }
`;

const ModalTitle = styled.span`
  font-weight: bold;
  font-size: 1.25em;
  line-height: 27px;
  color: ${colors.Grey400};
`;

const ModalTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 16px;
  svg {
    cursor: pointer;
  }
`;

const ModalSection = styled.div`
  width: 100%;
  height: 80px;
  background: ${colors.Grey030};
  border-bottom: 2px solid ${colors.Grey100};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.3);
`;

const Container = styled.div`
`;
