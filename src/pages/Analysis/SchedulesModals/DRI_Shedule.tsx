import {
  apiCall, ApiResps,
} from '~/providers';
import {
  NotyIconStyle, NotyNumStyle, ControlButton, ControlButtonIcon, Title, Data, DataText, NotyIconStyleMini, NotyNumStyleMini, ControlButtonIconMini, ControlButtonMini, TextLine, WeekDayButton, SelectContainer, Sidebar, SchedCardContainer,
  LinkButton,
} from './styles';
import {
  Bluebar,
} from '../Integrations/IntegrRealTime/styles';
import {
  ModalWindow,
  Button,
  Loader,
  Input,
  Checkbox,
} from '~/components';
import {
  driApplicationOpts,
  driFancoilsApplications,
  driMeterApplications,
  driProtocolsOpts,
  driVAVsApplications,
} from '~/helpers/driConfigOptions';
import { Flex } from 'reflexbox';
import { useTranslation } from 'react-i18next';
import { useStateVar } from '~/helpers/useStateVar';
import {
  getCachedDevInfo, getCachedDevInfoSync,
} from '~/helpers/cachedStorage';

import { toast } from 'react-toastify';
import {
  ChangeEvent, ReactElement, useEffect, useState,
} from 'react';
import { colors } from '~/styles/colors';

import { ToggleSwitchMini } from 'components/ToggleSwitch';
import {
  EditIcon,
  CheckboxIcon,
  VAVOpenedIcon,
  VAVClosedIcon,
} from '~/icons';
import { SmallTrashIcon } from '~/icons/Trash';
import img_schedule from '~/assets/img/cool_ico/schedule.svg';
import img_mode_cool from '~/assets/img/cool_ico/mode_cool.svg';
import img_mode_fan from '~/assets/img/cool_ico/mode_fan.svg';

import { t } from 'i18next';
import ReactTooltip from 'react-tooltip';
import { checkProtocolValue } from '~/helpers/driConfig';
import { getUserProfile } from '~/helpers/userProfile';
import { ExceptionsHeader } from './components/ExceptionsHeader';

export interface ScheduleInfo {
  SCHED_ID: number;
  DRI_ID: string;
  NAME: string;
  ACTIVE: string;
  OPERATION: string;
  BEGIN_TIME: string;
  END_TIME: string;
  MODE: string;
  DAYS: string;
  SETPOINT: number;
  EXCEPTION_DATE: string;
  EXCEPTION_REPEAT_YEARLY: string;
}

interface ButtonShowScheduleProps {
  onClick: () => void;
  loading: boolean;
  status?: string;
}

export const DriSchedModeOpts = {
  0: 'COOL',
  1: 'FAN',
};

export const MIN_SETPOINT = 15;
export const MAX_SETPOINT = 30;

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

const ButtonShowSchedule = ({
  loading,
  onClick,
  status,
}: ButtonShowScheduleProps): ReactElement => (
  <ControlButton
    onClick={onClick}
  >
    {loading
      ? <Loader />
      : (
        <ControlButtonIcon
          alt={t('programacao')}
          status={status}
          src={img_schedule}
        />
      )}
    <span style={{
      fontWeight: 'bold',
      color: colors.Blue300,
      fontSize: '12px',
    }}
    >
      Ver Programações
    </span>
  </ControlButton>
);

export const DRIScheduleSummary = (props: { driId: string, layout: 'asset' | 'small-btn' | 'large-btn', devInfo: ApiResps['/get-integration-info']['info'], varsCfg?: { application: string, protocol: string, worksheetName: string }|null|undefined}): JSX.Element => {
  const {
    driId, varsCfg, layout,
  } = props;
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);

  const [state, render, setState] = useStateVar({
    driScheds: null as null | {
      SCHED_ID: number;
      DRI_ID: string;
      NAME: string;
      ACTIVE: string;
      OPERATION: string;
      BEGIN_TIME: string;
      END_TIME: string;
      MODE: string;
      DAYS: string;
      SETPOINT: number;
      EXCEPTION_DATE: string;
      EXCEPTION_REPEAT_YEARLY: string;
    }[],
    driExceptionScheds: null as null | {
      SCHED_ID: number;
      DRI_ID: string;
      NAME: string;
      ACTIVE: string;
      OPERATION: string;
      BEGIN_TIME: string;
      END_TIME: string;
      MODE: string;
      DAYS: string;
      SETPOINT: number;
      EXCEPTION_DATE: string;
      EXCEPTION_REPEAT_YEARLY: string;
    }[],
    modalEditSchedule: null as null | {
      schedId: number | undefined
      addEdit: 'Add' | 'Edit'
      name: string
      active: boolean
      operation: boolean
      start_time: string
      start_time_error: string
      end_time: string
      end_time_error: string
      selectedDays: {
        mon?: boolean
        tue?: boolean
        wed?: boolean
        thu?: boolean
        fri?: boolean
        sat?: boolean
        sun?: boolean
      }
      isException: boolean
      exceptionDate: string
      repeatYearly: boolean
      useSetpoint: boolean
      setpointValue: string
      mode: number | undefined
    },
    showScheds: false,
    showExceptions: false,
    shouldRender: true,
    devInfo: getCachedDevInfoSync(driId),
    loadingSchedule: false,
    loading: false,
    driInterval: null as null | number,
    totalScheds: 0,
  });
  useEffect(() => {
    if (state.shouldRender) {
      Promise.resolve().then(async () => {
        try {
          const [
            devInfo,
            { list: driScheds },
          ] = await Promise.all([
            getCachedDevInfo(driId, {}),
            apiCall('/dri/get-dri-scheds', { DRI_ID: driId }),
          ]);
          state.devInfo = devInfo;
          state.driInterval = devInfo.dri.varsCfg.driConfigs.find((cfg) => checkProtocolValue(cfg, 'interval'))?.value;
          state.driScheds = [];
          state.driExceptionScheds = [];
          state.totalScheds = driScheds.length;
          driScheds.forEach((sched) => {
            if (sched.EXCEPTION_DATE) {
              state.driExceptionScheds && state.driExceptionScheds.push(sched);
            } else {
              state.driScheds && state.driScheds.push(sched);
            }
          });
          render();
        } catch (err) {
          toast.error(t('erro'));
          console.error(err);
        }
      });
    }
    setState({ shouldRender: false });
  }, [state.shouldRender]);

  function generateDaysObject(days) {
    return {
      mon: days ? days.mon : false,
      tue: days ? days.tue : false,
      wed: days ? days.wed : false,
      thu: days ? days.thu : false,
      fri: days ? days.fri : false,
      sat: days ? days.sat : false,
      sun: days ? days.sun : false,
    };
  }

  function getSchedTimesValues(item?: ScheduleInfo) {
    return {
      start_time: item ? item.BEGIN_TIME : '',
      start_time_error: '',
      end_time: item ? item.END_TIME : '',
      end_time_error: '',
    };
  }

  function getSchedExceptionValues(item?: ScheduleInfo) {
    return {
      isException: state.showExceptions,
      exceptionDate: (item && item.EXCEPTION_DATE) || '',
      repeatYearly: !!(item && item.EXCEPTION_REPEAT_YEARLY === '1'),
    };
  }

  function getSchedSetpointValues(item?: ScheduleInfo) {
    return {
      useSetpoint: item ? (item.SETPOINT != null && Number(getKeyByValue(DriSchedModeOpts, item.MODE)) !== 1) : false,
      setpointValue: item ? (item.SETPOINT != null) ? String(item.SETPOINT) : '24' : '24',
    };
  }

  function getSchedModeValues(item?: ScheduleInfo) {
    return {
      mode: item ? Number(getKeyByValue(DriSchedModeOpts, item.MODE)) : undefined,
    };
  }

  function editAddProgramming(item?: ScheduleInfo) {
    try {
      const days = item && JSON.parse(item.DAYS);
      state.modalEditSchedule = {
        schedId: item && item.SCHED_ID,
        addEdit: item ? 'Edit' : 'Add',
        name: (item && item.NAME) || '',
        active: item ? item.ACTIVE === '1' : true,
        operation: !!(item && item.OPERATION === '1'),
        ...getSchedTimesValues(item),
        selectedDays: !state.showExceptions ? generateDaysObject(days) : {},
        ...getSchedExceptionValues(item),
        ...getSchedSetpointValues(item),
        ...getSchedModeValues(item),
      };
      render();
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  function formatStringToDate(str?: string) {
    return str && `${str.substring(6, 10)}-${str.substring(3, 5)}-${str.substring(0, 2)}` || undefined;
  }

  async function saveNewProgramming() {
    try {
      if (!state.modalEditSchedule) return;
      if (!state.devInfo.GROUP_ID) {
        toast.warn(t('necessarioMaquinaAutomatizada'));
        return;
      }

      if (state.modalEditSchedule.name === '') return toast.error(t('erroDigiteNomeProgramacao'));
      if (!state.showExceptions && state.modalEditSchedule.selectedDays && Object.values(state.modalEditSchedule.selectedDays).every((item) => item === false)) {
        return toast.error(t('erroSelecionePeloMenosUmDia'));
      }
      if (state.showExceptions && (state.modalEditSchedule.exceptionDate.length !== 10 || state.modalEditSchedule.exceptionDate.includes('_'))) {
        return toast.error(t('erroDataExcecaoObrigatoria'));
      }
      if (!/^[0-2][0-9]:[0-5][0-9]$/.test(state.modalEditSchedule.start_time)) return toast.error(t('erroHorarioInvalido'));
      if (!/^[0-2][0-9]:[0-5][0-9]$/.test(state.modalEditSchedule.end_time)) return toast.error(t('erroHorarioInvalido'));

      setState({ loading: true });

      if (state.modalEditSchedule.addEdit === 'Add') {
        await apiCall('/dri/add-dri-sched', {
          DRI_ID: state.devInfo.DEV_ID,
          NAME: state.modalEditSchedule.name,
          ACTIVE: state.modalEditSchedule.active ? '1' : '0',
          OPERATION: state.modalEditSchedule.operation ? '1' : '0',
          BEGIN_TIME: state.modalEditSchedule.start_time,
          END_TIME: state.modalEditSchedule.end_time,
          MODE: (state.modalEditSchedule.mode !== undefined) && DriSchedModeOpts[state.modalEditSchedule.mode] || undefined,
          DAYS: JSON.stringify(state.modalEditSchedule.selectedDays),
          SETPOINT: (state.modalEditSchedule.useSetpoint && Number(state.modalEditSchedule.setpointValue)) || undefined,
          EXCEPTION_DATE: (state.modalEditSchedule.isException && formatStringToDate(state.modalEditSchedule.exceptionDate)) || undefined,
          EXCEPTION_REPEAT_YEARLY: (state.modalEditSchedule.isException && (state.modalEditSchedule.repeatYearly ? '1' : '0')) || undefined,
        });
      } else if (state.modalEditSchedule.addEdit === 'Edit' && state.modalEditSchedule.schedId) {
        await apiCall('/dri/update-dri-sched', {
          SCHED_ID: state.modalEditSchedule.schedId,
          DRI_ID: state.devInfo.DEV_ID,
          NAME: state.modalEditSchedule.name,
          ACTIVE: state.modalEditSchedule.active ? '1' : '0',
          OPERATION: state.modalEditSchedule.operation ? '1' : '0',
          BEGIN_TIME: (state.modalEditSchedule && state.modalEditSchedule.start_time) || undefined,
          END_TIME: (state.modalEditSchedule && state.modalEditSchedule.end_time) || undefined,
          MODE: (state.modalEditSchedule.mode !== undefined && DriSchedModeOpts[state.modalEditSchedule.mode]) || undefined,
          DAYS: JSON.stringify(state.modalEditSchedule.selectedDays) || undefined,
          SETPOINT: state.modalEditSchedule.useSetpoint ? Number(state.modalEditSchedule.setpointValue) : undefined,
          EXCEPTION_DATE: (state.modalEditSchedule.isException && formatStringToDate(state.modalEditSchedule.exceptionDate)) || undefined,
          EXCEPTION_REPEAT_YEARLY: (state.modalEditSchedule.isException && (state.modalEditSchedule.repeatYearly ? '1' : '0')) || undefined,
        });
      }
      state.modalEditSchedule = null;
      setState({ shouldRender: true });
      render();
      toast.success(t('sucessoAdicionarProgramacao'));
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    } finally {
      setState({ loading: false });
    }
  }

  async function deleteProgramming(sched) {
    try {
      setState({ loading: true });
      const { SCHED_ID, DRI_ID } = sched;
      await apiCall('/dri/delete-dri-sched', { SCHED_ID, DRI_ID });
      setState({ shouldRender: true });
      render();
      toast.success(t('sucessoRemoverProgramacao'));
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    } finally {
      setState({ loading: false });
    }
  }
  function showScheds() {
    try {
      state.showScheds = true;
      render();
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  function verifyProfileCanManageProgramming() {
    return !!(profile.manageAllClients || profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === state.devInfo?.CLIENT_ID));
  }

  return (
    <Flex flexWrap="wrap" flexDirection="row" fontSize="13px">
      {layout === 'asset' && (
      <>
        <Flex flexDirection="column" width="190px">
          <Title>Informações</Title>
          <Data>
            <DataText color={colors.Grey400} fontWeight="bold">
              {t('fonteDados')}
            </DataText>
            <DataText>{driId || '-'}</DataText>
          </Data>
          <Data>
            <DataText color={colors.Grey400} fontWeight="bold">
              {t('aplicacao')}
            </DataText>
            <DataText>
              {varsCfg && (
                getKeyByValue(driApplicationOpts, varsCfg.application)
          || (getKeyByValue(driMeterApplications, varsCfg.application) && t('medidorEnergia'))
          || (getKeyByValue(driVAVsApplications, varsCfg.application) && 'VAV') || (getKeyByValue(driFancoilsApplications, varsCfg.application) && 'Fancoil')
              ) || '-'}

            </DataText>
          </Data>
          {varsCfg && (
            getKeyByValue(driMeterApplications, varsCfg.application)
        || getKeyByValue(driVAVsApplications, varsCfg.application) || getKeyByValue(driFancoilsApplications, varsCfg.application)
          ) && (
          <Data>
            <DataText color={colors.Grey400} fontWeight="bold">
              {t('modelo')}
            </DataText>
            <DataText>
              {' '}
              {getKeyByValue(driMeterApplications, varsCfg.application) || getKeyByValue(driVAVsApplications, varsCfg.application) || getKeyByValue(driFancoilsApplications, varsCfg.application) || '-'}
            </DataText>
          </Data>
          )}
          <Data>
            <DataText color={colors.Grey400} fontWeight="bold">
              {t('protocoloComunicacao')}
            </DataText>
            <DataText>
              {' '}
              {varsCfg && getKeyByValue(driProtocolsOpts, varsCfg.protocol) || '-'}
            </DataText>
          </Data>
          <Data>
            <DataText color={colors.Grey400} fontWeight="bold">
              {t('planilha')}
            </DataText>
            <DataText>{varsCfg && varsCfg.worksheetName || '-'}</DataText>
          </Data>

        </Flex>
        {varsCfg?.application?.startsWith('fancoil') && (
          <Flex justifyContent="flex-start" flexDirection="column" width="190px">
            <Title>Funcionamento</Title>
            <NotyIconStyle>
              {state.driScheds && state.driScheds?.length > 0 ? <NotyNumStyle>{state.driScheds?.length}</NotyNumStyle> : null}
              <ButtonShowSchedule
                loading={state.loadingSchedule}
                onClick={() => showScheds()}
                status={state.devInfo?.status}
              />
            </NotyIconStyle>
          </Flex>
        )}
      </>
      )}

      {layout === 'small-btn' && (
        <NotyIconStyleMini>
          {state.driScheds && state.driScheds?.length > 0 ? <NotyNumStyleMini>{state.driScheds?.length}</NotyNumStyleMini> : null}
          <ControlButtonMini
            onClick={() => { showScheds(); }}
            style={{ margin: '0 10px' }}
          >
            {state.loadingSchedule
              ? <Loader />
              : <ControlButtonIconMini alt={t('programacao')} status={state.devInfo?.status} src={img_schedule} />}
          </ControlButtonMini>
        </NotyIconStyleMini>
      )}

      {layout === 'large-btn' && (
      <NotyIconStyle>
        {state.driScheds && state.driScheds?.length > 0 ? <NotyNumStyle>{state.driScheds?.length}</NotyNumStyle> : null}
        <ButtonShowSchedule
          loading={state.loadingSchedule}
          onClick={() => showScheds()}
          status={state.devInfo?.status}
        />
      </NotyIconStyle>
      )}

      {(state.showScheds) && (
      <div style={{ zIndex: 3 }}>
        <ModalWindow
          style={{
            padding: '0px',
            width: '55%',
            marginBottom: 'auto',
            marginTop: '8%',
            minWidth: '500px',
          }}
          topBorder
          onClickOutside={() => {
            if (!state.modalEditSchedule && !state.loading) {
              setState({ showScheds: false });
            }
          }}
        >
          <Bluebar />
          <Flex
            flexWrap="nowrap"
            flexDirection="column"
            alignItems="left"
            width="768px"
            style={{
              borderRadius: '10px',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '150px 6px 150px auto',
                height: '5px',
                marginTop: '24px',
              }}
            >
              <span
                style={{
                  borderTop: '1px solid lightgrey',
                  borderRight: '1px solid lightgrey',
                  borderLeft: '1px solid lightgrey',
                  borderRadius: '6px 6px 0 0',
                  backgroundColor: state.showExceptions ? '#f4f4f4' : 'transparent',
                }}
              />
              <span />
              <span
                style={{
                  border: '1px solid lightgrey',
                  borderBottom: 'none',
                  borderRadius: '6px 6px 0 0',
                  backgroundColor: state.showExceptions ? 'transparent' : '#f4f4f4',
                }}
              />
              <span />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 6px 150px auto' }}>
              <button
                style={{
                  borderTop: 0,
                  borderRight: '1px solid lightgrey',
                  borderLeft: '1px solid lightgrey',
                  textAlign: 'center',
                  fontSize: '90%',
                  borderBottom: state.showExceptions ? '1px solid lightgrey' : 'none',
                  backgroundColor: state.showExceptions ? '#f4f4f4' : 'transparent',
                  cursor: state.showExceptions ? 'pointer' : undefined,
                  fontWeight: state.showExceptions ? 'normal' : 'bold',
                  padding: '4px 1px',
                  outline: 0,
                }}
                onClick={() => { state.showExceptions && setState({ showExceptions: !state.showExceptions }); }}
                type="button"
              >
                {t('programacoes')}
              </button>
              <span
                style={{
                  borderBottom: '1px solid lightgrey',
                }}
              />
              <button
                style={{
                  borderTop: 0,
                  borderLeft: '1px solid lightgrey',
                  borderRight: '1px solid lightgrey',
                  textAlign: 'center',
                  fontSize: '90%',
                  borderBottom: state.showExceptions ? 'none' : '1px solid lightgrey',
                  backgroundColor: state.showExceptions ? 'transparent' : '#f4f4f4',
                  cursor: (!state.showExceptions) ? 'pointer' : undefined,
                  fontWeight: !state.showExceptions ? 'normal' : 'bold',
                  padding: '4px 1px',
                  outline: 0,
                }}
                type="button"
                onClick={() => { (!state.showExceptions) && setState({ showExceptions: !state.showExceptions }); }}
              >
                {t('excecoes')}
              </button>
              <span
                style={{
                  borderBottom: '1px solid lightgrey',
                }}
              />
            </div>
          </Flex>
          <div style={{
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          >
            <span style={{ fontSize: '18px' }}>{`Total: ${(!state.showExceptions ? state.driScheds?.length : state.driExceptionScheds?.length) || 0}`}</span>
            { verifyProfileCanManageProgramming() && (
            <Button
              variant="primary"
              style={{ width: 'fit-content', padding: '6px 15px', backgroundColor: '#363BC4' }}
              onClick={() => editAddProgramming()}
              disabled={state.loading || state.loadingSchedule}
            >
              {t('botaoAdicionarProgramacaoExcecao', { value: !state.showExceptions ? t('Programação') : t('excecao') })}
            </Button>
            )}
          </div>
          <div style={{
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
          >
            {!state.showExceptions && state.driScheds?.map((sched) => (
              <SchedCard
                key={sched.SCHED_ID}
                canManageProgramming={verifyProfileCanManageProgramming()}
                driCfg={state.devInfo.dri?.varsCfg}
                sched={sched}
                onEdit={() => editAddProgramming(sched)}
                onDelete={() => deleteProgramming(sched)}
                loading={state.loading}
              />
            ))}
            {state.showExceptions && state.driExceptionScheds && (
            <>
              <ExceptionsHeader />
              {state.driExceptionScheds?.map((exception) => (
                <Flex
                  style={{
                    marginTop: '5px',
                    marginLeft: '16px',
                  }}
                  flexDirection="column"
                  key={exception.SCHED_ID}
                >
                  <ExceptionSchedCard
                    sched={exception}
                    onEdit={() => editAddProgramming(exception)}
                    onDelete={() => deleteProgramming(exception)}
                    loading={state.loading}
                  />
                </Flex>
              ))}
            </>
            )}
          </div>
        </ModalWindow>
      </div>
      )}
      {(state.modalEditSchedule) && (
      <div style={{ zIndex: 3 }}>
        <ModalWindow
          style={{ padding: '0px' }}
          topBorder
          onClickOutside={() => { !state.loading && setState({ modalEditSchedule: null }); }}
        >
          <Bluebar />
          <DRISchedForm
            driCfg={state.devInfo.dri?.varsCfg}
            modalEditSchedule={state.modalEditSchedule}
            onConfirm={saveNewProgramming}
            onCancel={() => { setState({ modalEditSchedule: null }); }}
            loading={state.loading}
          />
        </ModalWindow>
      </div>
      )}
    </Flex>

  );
};

export function DRISchedForm(props: {
  driCfg: { application: string, protocol: string },
  modalEditSchedule: {
    addEdit: 'Add' | 'Edit'
    name: string
    active: boolean
    operation: boolean
    start_time: string
    start_time_error: string
    end_time: string
    end_time_error: string
    selectedDays: {
      mon?: boolean
      tue?: boolean
      wed?: boolean
      thu?: boolean
      fri?: boolean
      sat?: boolean
      sun?: boolean
    }
    isException: boolean
    exceptionDate: string
    repeatYearly: boolean
    useSetpoint: boolean
    setpointValue: string
    mode: number | undefined
  },
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}): JSX.Element {
  const [state, render] = useStateVar({
    entireDay: (props.modalEditSchedule.start_time === '00:00' && props.modalEditSchedule.end_time === '23:59') as boolean,
    editSetpoint: true,
  });

  const isEdit = props.modalEditSchedule.addEdit === 'Edit';

  function selectDay(day: string) {
    if (props.modalEditSchedule.selectedDays && props.modalEditSchedule.selectedDays[day] !== undefined) {
      props.modalEditSchedule.selectedDays[day] = !props.modalEditSchedule.selectedDays[day];
      render();
    }
  }

  function onClickOperationToggle(): void {
    props.modalEditSchedule.operation = !props.modalEditSchedule.operation;
    if (props.modalEditSchedule.operation) {
      if (props.driCfg.protocol === 'carrier-ecosplit' || props.driCfg.application.startsWith('fancoil')) {
        props.modalEditSchedule.mode = 0;
      }
      props.modalEditSchedule.useSetpoint = true;
    } else {
      if (props.driCfg.protocol === 'carrier-ecosplit' || props.driCfg.application.startsWith('fancoil')) {
        props.modalEditSchedule.mode = undefined;
      }
      props.modalEditSchedule.useSetpoint = false;
    }
    render();
  }

  const isFancoilCarrierEcosplit = (props.driCfg?.protocol === 'carrier-ecosplit' || props.driCfg?.application.startsWith('fancoil'));

  return (
    <div style={{ padding: '40px 80px 40px 80px', wordBreak: 'normal' }}>
      <div style={{ fontWeight: 'bold', fontSize: '120%' }}>{t('editarAdicionarProgramacao', { value: isEdit ? t('editar') : t('botaoAdicionar') })}</div>
      <div style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      >
        <div>
          <div style={{ fontWeight: 'bold' }}>{t('titulo')}</div>
          <Input
            style={{ width: '200px', padding: '8px', minHeight: '0' }}
            value={props.modalEditSchedule.name}
            placeholder={t('digiteUmTitulo')}
            onChange={(e) => { props.modalEditSchedule.name = e.target.value; render(); }}
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontWeight: 'bold' }}>{t('Programação')}</div>
          <div style={{ display: 'flex' }}>
            {props.modalEditSchedule.active ? t('habilitada') : t('desabilitada')}
            <ToggleSwitchMini
              onOff
              checked={!props.modalEditSchedule.active}
              style={{ marginLeft: '12px' }}
              onClick={() => { props.modalEditSchedule.active = !props.modalEditSchedule.active; render(); }}
            />
          </div>
        </div>
      </div>

      <div style={{
        width: '100%',
        height: '1px',
        backgroundColor: colors.LightGrey_v3,
        borderRadius: '10px',
        margin: '30px 0px 30px 0px',
      }}
      />

      <div style={{ marginTop: '10px' }}>
        <div style={{ fontWeight: 'bold' }}>{t('selecioneDias')}</div>
        {props.modalEditSchedule.isException ? (
          <Flex
            flexDirection="column"
            style={{
              marginTop: '7px',
            }}
          >
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
            >
              <TextLine style={{ width: '199px' }}>
                <Input
                  style={{ width: '199px' }}
                  value={props.modalEditSchedule.exceptionDate}
                  label=""
                  mask={[/[0-3]/, /[0-9]/, '/', /[0-1]/, /[0-9]/, '/', /[2]/, /[0]/, /[0-9]/, /[0-9]/]}
                  onChange={(e) => { props.modalEditSchedule.exceptionDate = e.target.value; render(); }}
                />
              </TextLine>
              <div
                style={{
                  marginLeft: '27px',
                  marginTop: '13px',
                }}
              >
                <label
                  onClick={() => {
                    props.modalEditSchedule.repeatYearly = !props.modalEditSchedule.repeatYearly;
                    render();
                  }}
                >
                  <Checkbox checked={props.modalEditSchedule.repeatYearly}>
                    {props.modalEditSchedule.repeatYearly ? <CheckboxIcon /> : null}
                  </Checkbox>
                </label>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginTop: '15px',
                }}
              >
                {t('repetirTodoOAno')}
              </div>
            </Flex>
            <p style={{
              fontStyle: 'italic', fontSize: 'small', marginTop: '20px', maxWidth: '370px', color: colors.Grey300,
            }}
            >
              {t('maquinaPermaneceraDesligadaIntervalosHorariosNaoDefinidos')}
            </p>
          </Flex>
        ) : (
          <div style={{ display: 'flex', paddingTop: '10px', fontSize: '90%' }}>
            <WeekDayButton checked={props.modalEditSchedule.selectedDays.sun || false} onClick={() => selectDay('sun')}>DOM</WeekDayButton>
            <WeekDayButton checked={props.modalEditSchedule.selectedDays.mon || false} onClick={() => selectDay('mon')}>SEG</WeekDayButton>
            <WeekDayButton checked={props.modalEditSchedule.selectedDays.tue || false} onClick={() => selectDay('tue')}>TER</WeekDayButton>
            <WeekDayButton checked={props.modalEditSchedule.selectedDays.wed || false} onClick={() => selectDay('wed')}>QUA</WeekDayButton>
            <WeekDayButton checked={props.modalEditSchedule.selectedDays.thu || false} onClick={() => selectDay('thu')}>QUI</WeekDayButton>
            <WeekDayButton checked={props.modalEditSchedule.selectedDays.fri || false} onClick={() => selectDay('fri')}>SEX</WeekDayButton>
            <WeekDayButton checked={props.modalEditSchedule.selectedDays.sat || false} onClick={() => selectDay('sat')}>SAB</WeekDayButton>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          marginTop: '10px',
        }}
      >
        <div>
          <div>{t('horarioInicio')}</div>
          <Input
            style={{ width: '100px', padding: '5px', minHeight: '0' }}
            value={props.modalEditSchedule.start_time}
            error={props.modalEditSchedule.start_time_error}
            mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { props.modalEditSchedule!.start_time = e.target.value; render(); }}
          />
        </div>
        <div>
          <div>{t('horarioTermino')}</div>
          <Input
            style={{ width: '100px', padding: '5px', minHeight: '0' }}
            value={props.modalEditSchedule.end_time}
            error={props.modalEditSchedule.end_time_error}
            mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { props.modalEditSchedule!.end_time = e.target.value; render(); }}
          />
        </div>
        <Checkbox
          label={t('diaInteiro')}
          style={{ justifyContent: 'flex-start', marginTop: '20px' }}
          checked={state.entireDay}
          onClick={() => {
            state.entireDay = !state.entireDay;
            if (state.entireDay) {
              props.modalEditSchedule.start_time = '00:00';
              props.modalEditSchedule.end_time = '23:59';
            } else {
              props.modalEditSchedule.start_time = '';
              props.modalEditSchedule.end_time = '';
            }
            render();
          }}
        />
      </div>

      <div style={{ marginTop: '10px' }}>
        {isFancoilCarrierEcosplit && (
          <div style={{ fontWeight: 'bold' }}>{t('funcionamento')}</div>
        )}
        {props.driCfg?.application.startsWith('vav') && (
          <div style={{ fontWeight: 'bold' }}>{t('atuadorVav')}</div>
        )}
        <div style={{ marginTop: '10px' }}>
          {isFancoilCarrierEcosplit && (
            <span>{t('ligadoMin')}</span>
          )}
          {props.driCfg?.application.startsWith('vav') && (
            <span>{t('aberto')}</span>
          )}
          <ToggleSwitchMini
            onOff
            checked={!props.modalEditSchedule.operation}
            style={{ margin: '0 8px' }}
            onClick={onClickOperationToggle}
          />
          {isFancoilCarrierEcosplit && (
            <span>{t('desligadoMin')}</span>
          )}
          {props.driCfg?.application.startsWith('vav') && (
            <span>{t('fechado')}</span>
          )}
        </div>
      </div>

      {props.modalEditSchedule.operation && (
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
          {isFancoilCarrierEcosplit && (
            <div style={{ width: '50%' }}>
              {t('selecioneModo')}
              <SelectContainer style={{
                display: 'flex',
                flexDirection: 'row',
                position: 'relative',
                width: 'fit-content',
              }}
              >
                <div>
                  <ControlButton
                    id="cool"
                    data-for="cool"
                    data-tip
                    style={{ width: '50px', height: '50px' }}
                    noBorder
                    isActive={props.modalEditSchedule.mode === 0}
                    onClick={() => { props.modalEditSchedule.mode = 0; props.modalEditSchedule.useSetpoint = true; render(); }}
                  >
                    <ControlButtonIcon isActive={props.modalEditSchedule.mode === 1} style={{ width: '20px' }} alt="cool" src={img_mode_cool} />
                  </ControlButton>
                </div>
                <div>
                  <ControlButton
                    id="fan"
                    data-for="fan"
                    data-tip
                    style={{ width: '50px', height: '50px' }}
                    noBorder
                    isActive={props.modalEditSchedule.mode === 1}
                    onClick={() => { props.modalEditSchedule.mode = 1; props.modalEditSchedule.useSetpoint = false; render(); }}
                  >
                    <ControlButtonIcon isActive={props.modalEditSchedule.mode === 0} style={{ width: '20px' }} alt="fan" src={img_mode_fan} />
                  </ControlButton>
                </div>
                <ReactTooltip
                  id="fan"
                  place="right"
                  border
                  textColor="#000000"
                  backgroundColor="rgba(255, 255, 255, 0.9)"
                  borderColor="rgba(0, 0, 0, 0.33)"
                >
                  {t('ventilar')}
                </ReactTooltip>
                <ReactTooltip
                  id="cool"
                  place="right"
                  border
                  textColor="#000000"
                  backgroundColor="rgba(255, 255, 255, 0.9)"
                  borderColor="rgba(0, 0, 0, 0.33)"
                >
                  {t('refrigerar')}
                </ReactTooltip>

              </SelectContainer>
            </div>
          )}
          {props.modalEditSchedule.useSetpoint && (
            <div>
              <div style={{ display: 'flex' }}>
                <div style={{ fontWeight: 'bold' }}>Setpoint &nbsp;</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {state.editSetpoint && (
                  <div style={{ alignSelf: 'flex-end', marginRight: '5px' }}>
                    <div
                      style={{
                        border: '8px solid transparent',
                        borderBottomColor: colors.BlueSecondary,
                        cursor: 'pointer',
                        marginBottom: '10px',
                      }}
                      onClick={() => {
                        if ((Number(props.modalEditSchedule.setpointValue) + 1) >= MIN_SETPOINT
                          && (Number(props.modalEditSchedule.setpointValue) + 1) <= MAX_SETPOINT) {
                          props.modalEditSchedule.setpointValue = String(Number(props.modalEditSchedule.setpointValue) + 1);
                          render();
                        }
                      }}
                    />
                    <div
                      style={{
                        border: '8px solid transparent',
                        borderTopColor: colors.BlueSecondary,
                        cursor: 'pointer',
                        marginBottom: '4px',
                      }}
                      onClick={() => {
                        if ((Number(props.modalEditSchedule.setpointValue) - 1) >= MIN_SETPOINT
                          && (Number(props.modalEditSchedule.setpointValue) - 1) <= MAX_SETPOINT) {
                          props.modalEditSchedule.setpointValue = String(Number(props.modalEditSchedule.setpointValue) - 1);
                          render();
                        }
                      }}
                    />
                  </div>
                )}
                <div style={{ fontSize: '200%', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>
                  {props.modalEditSchedule.setpointValue}
                </div>
                <div style={{ color: 'grey' }}>&nbsp;°C</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
        <Button
          variant={props.loading ? 'disabled' : 'primary'}
          style={{ width: '150px', backgroundColor: props.loading ? colors.Grey100 : colors.BlueSecondary }}
          onClick={props.onConfirm}
          disabled={props.loading}
        >
          {isEdit ? t('botaoSalvar') : t('botaoAdicionar')}
        </Button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <LinkButton
          onClick={props.onCancel}
          disabled={props.loading}
          type="button"
        >
          {t('botaoCancelar')}
        </LinkButton>
      </div>
    </div>
  );
}

export function SchedCard(props: {
  sched: ScheduleInfo
  driCfg: { application: string, protocol: string },
  onEdit: () => void,
  onDelete: () => void,
  size?: 'small',
  canManageProgramming: boolean,
  loading?: boolean,
}): JSX.Element {
  const [, render] = useStateVar({});
  const {
    sched, onEdit, onDelete, size, loading,
  } = props;
  const days = JSON.parse(sched.DAYS);

  return (
    <SchedCardContainer size={size}>
      <Sidebar active={props.sched.ACTIVE} />
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        width: size === 'small' ? '334px' : '100%',
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold' }}>{sched.NAME}</span>
            {
              props.canManageProgramming && (
                <div style={{ display: 'flex' }}>
                  <Button
                    style={{
                      border: '0px',
                      backgroundColor: 'white',
                      padding: '0px',
                      marginRight: '5px',
                      width: 'fit-content',
                    }}
                    onClick={onEdit}
                    disabled={loading}
                  >
                    <EditIcon color={loading ? 'grey' : colors.Blue300} />
                  </Button>
                  <Button
                    style={{
                      border: '0px',
                      backgroundColor: 'white',
                      padding: '0px',
                      width: 'fit-content',
                    }}
                    onClick={onDelete}
                    disabled={loading}
                  >
                    <SmallTrashIcon color={loading ? 'grey' : 'red'} />
                  </Button>
                </div>
              )
            }
          </div>

          <div>
            <div style={{ fontWeight: 'bold' }}>{t('Programação')}</div>
            <div style={{ display: 'flex' }}>
              {sched.ACTIVE === '1' ? t('habilitada') : t('desabilitada')}
            </div>
          </div>
        </div>

        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: colors.LightGrey_v3,
          borderRadius: '10px',
          margin: '20px 0px 20px 0px',
        }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 'bold' }}>{ props.driCfg?.application.startsWith('fancoil') ? t('statusAutomacao') : t('funcionamento')}</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {props.driCfg?.application.startsWith('vav') && (
                  <div>
                    {sched.OPERATION === '1' ? t('aberto') : t('fechado')}
                    {sched.OPERATION === '1' && <VAVOpenedIcon color={colors.Black} />}
                    {sched.OPERATION === '0' && <VAVClosedIcon color={colors.Black} />}
                  </div>
                )}
                {(props.driCfg?.protocol === 'carrier-ecosplit' || props.driCfg?.application.startsWith('fancoil')) && (
                  <div>
                    {(!props.driCfg?.application.startsWith('fancoil')) && (sched.OPERATION === '1' ? t('ligadoMin') : t('desligadoMin'))}
                    {props.driCfg?.application.startsWith('fancoil') && (sched.OPERATION === '1' ? (sched.MODE === 'COOL' ? 'Refrigerar' : 'Ventilar') : t('desligadoMin'))}

                    {sched.OPERATION === '1' && sched.MODE === 'COOL' && (
                      <ControlButtonIcon
                        style={{
                          width: '25px',
                          height: '25px',
                          strokeWidth: 2,
                          margin: '0px 20px 0px 10px',
                        }}
                        alt="cool"
                        src={img_mode_cool}
                      />
                    )}
                    {sched.OPERATION === '1' && sched.MODE === 'FAN' && (
                      <ControlButtonIcon
                        style={{
                          width: '25px',
                          height: '25px',
                          strokeWidth: 2,
                          margin: '0px 20px 0px 10px',
                        }}
                        alt="fan"
                        src={img_mode_fan}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>
                    {t('horarioDeInicio')}
                    :&nbsp;
                  </span>
                  <span>
                    {sched.BEGIN_TIME}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>
                    {t('horarioDeFim')}
                    :&nbsp;
                  </span>
                  <span>
                    {sched.END_TIME}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {sched.OPERATION === '1' && sched.MODE !== 'FAN' && (
            <div>
              <div style={{ fontWeight: 700 }}>Setpoint</div>
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                <div style={{ fontSize: '300%', fontWeight: 'bold' }}>{sched.SETPOINT}</div>
                <div style={{ color: 'grey' }}>&nbsp;°C</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '10px' }}>
          {days && (
            <div style={{ display: 'flex', paddingTop: '10px', fontSize: '90%' }}>
              <WeekDayButton checked={days.sun} status={props.sched.ACTIVE} size={size}>DOM</WeekDayButton>
              <WeekDayButton checked={days.mon} status={props.sched.ACTIVE} size={size}>SEG</WeekDayButton>
              <WeekDayButton checked={days.tue} status={props.sched.ACTIVE} size={size}>TER</WeekDayButton>
              <WeekDayButton checked={days.wed} status={props.sched.ACTIVE} size={size}>QUA</WeekDayButton>
              <WeekDayButton checked={days.thu} status={props.sched.ACTIVE} size={size}>QUI</WeekDayButton>
              <WeekDayButton checked={days.fri} status={props.sched.ACTIVE} size={size}>SEX</WeekDayButton>
              <WeekDayButton checked={days.sat} status={props.sched.ACTIVE} size={size}>SAB</WeekDayButton>
            </div>
          )}
        </div>
      </div>
    </SchedCardContainer>
  );
}

export const ExceptionSchedCard = (props: {
  sched: ScheduleInfo,
  onEdit: () => void,
  onDelete: () => void,
  size?: 'small',
  loading?: boolean,
}): JSX.Element => {
  const [, render] = useStateVar({});

  const {
    sched, onEdit, onDelete, loading,
  } = props;

  return (
    <Flex
      flexWrap="nowrap"
      flexDirection="row"
      height="32px"
      width="709px"
      style={{
        borderTop: '1px solid #D7D7D7',
        borderRight: '1px solid #D7D7D7',
        borderBottom: '1px solid #D7D7D7',
        borderLeft: `10px solid ${sched.ACTIVE === '1' ? '#363BC4' : colors.Grey200}`,
        borderRadius: '5px',
        marginLeft: '10px',
      }}
    >
      <div
        style={{
          marginLeft: '17px',
          marginTop: '5px',
          fontSize: '12px',
          width: '151px',
          fontWeight: 'bold',
        }}
      >
        {sched.NAME}
      </div>
      <div
        style={{
          marginLeft: '74px',
          marginTop: '5px',
          fontSize: '12px',
          width: '70px',
          wordWrap: 'unset',
        }}
      >
        {sched.EXCEPTION_DATE.substring(0, sched.EXCEPTION_REPEAT_YEARLY === '1' ? 5 : 10)}
      </div>
      <div
        style={{
          marginLeft: '33px',
          marginTop: '5px',
          fontSize: '12px',
          width: '70px',
        }}
      >
        {`${sched.EXCEPTION_REPEAT_YEARLY === '1' ? t('sim') : t('nao')}`}
      </div>
      <div
        style={{
          marginLeft: '69px',
          marginTop: '5px',
          fontSize: '12px',
          width: '52px',
        }}
      >
        {sched.BEGIN_TIME}
      </div>
      <div
        style={{
          marginLeft: '23px',
          marginTop: '5px',
          fontSize: '12px',
          width: '52px',
        }}
      >
        {sched.END_TIME}
      </div>
      <div style={{ display: 'flex' }}>
        <Button
          style={{
            border: '0px',
            backgroundColor: 'white',
            padding: '0px',
            marginRight: '5px',
            width: 'fit-content',
          }}
          onClick={onEdit}
          disabled={loading}
        >
          <EditIcon color={loading ? 'grey' : colors.Blue300} />
        </Button>
        <Button
          style={{
            border: '0px',
            backgroundColor: 'white',
            padding: '0px',
            width: 'fit-content',
          }}
          onClick={onDelete}
          disabled={loading}
        >
          <SmallTrashIcon color={loading ? 'grey' : 'red'} />
        </Button>
      </div>
    </Flex>
  );
};

export function LimitExceedTooltip({
  disabled,
  isException,
  children,
}: { disabled: boolean, isException: boolean, children: ReactElement }): ReactElement {
  const warnMessage = t(isException ? 'limiteCadastroExcecoesAtingido' : 'limiteCadastroProgramacoesAtingido');
  return (
    <>
      {disabled ? (
        <div data-tip={warnMessage} data-for="tooltip-limit-exceed">
          {children}
          <ReactTooltip
            id="tooltip-limit-exceed"
            place="top"
            effect="solid"
            delayHide={100}
            textColor="#000000"
            border
            backgroundColor="rgba(256, 256, 256, 1)"
          />
        </div>
      ) : (children)}
    </>
  );
}
