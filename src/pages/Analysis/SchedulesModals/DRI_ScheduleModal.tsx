import { ReactElement, useState } from 'react';
import { ModalWindow } from 'components';
import { Bluebar } from '../Integrations/IntegrRealTime/styles';
import {
  DRISchedForm,
  DriSchedModeOpts,
  ScheduleInfo,
} from './DRI_Shedule';
import { useTranslation } from 'react-i18next';
import { useStateVar } from 'helpers/useStateVar';
import { getKeyByValue } from '../Integrations/IntegrRealTime/DriContents';
import { toast } from 'react-toastify';
import { apiCall, ApiParams } from 'providers';
import moment from 'moment';
import { DevFullInfo } from 'store';
import { DriScheduleList } from './DRI_ScheduleList';
import { AxiosError } from 'axios';

type SelectedDays = {
  mon?: boolean;
  tue?: boolean;
  wed?: boolean;
  thu?: boolean;
  fri?: boolean;
  sat?: boolean;
  sun?: boolean;
}

type Interval = {
  startTime: string;
  endTime: string
}

export interface DriSchedule {
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

export interface DriException {
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

interface ModalEditSchedule {
  schedId: number | undefined;
  addEdit: 'Add' | 'Edit';
  name: string;
  active: boolean;
  operation: boolean;
  start_time: string;
  start_time_error: string;
  end_time: string;
  end_time_error: string;
  selectedDays: SelectedDays;
  isException: boolean;
  exceptionDate: string;
  repeatYearly: boolean;
  useSetpoint: boolean;
  setpointValue: string;
  mode: number | undefined;
}

interface DriScheduleEditModalProps {
  onClose: () => void;
  open: boolean;
  isException: boolean;
  devInfo: DevFullInfo;
  validateSchedule: () => boolean;
  modalEditSchedule?: ModalEditSchedule;
  refetch: () => void;
}

interface DriScheduleContentProps {
  schedules: DriSchedule[];
  exceptions: DriException[];
  devInfo: DevFullInfo;
  refetch: () => void;
  fixedContent?: boolean;
  hideAddButton?: boolean;
}

function checkExceptionDate(
  exceptionToCompare: DriException,
  exception: Pick<DriException, 'EXCEPTION_DATE' | 'EXCEPTION_REPEAT_YEARLY'>,
): boolean {
  if (exceptionToCompare.EXCEPTION_REPEAT_YEARLY === '1' || exception.EXCEPTION_REPEAT_YEARLY === '1') {
    return exceptionToCompare.EXCEPTION_DATE.slice(0, 5) === exception.EXCEPTION_DATE.slice(0, 5);
  }
  return exceptionToCompare.EXCEPTION_DATE === exception.EXCEPTION_DATE;
}

function checkWeekDayCommon(days1: SelectedDays, days2: SelectedDays): boolean {
  let result = days1.mon && days2.mon;
  result = result || (days1.tue && days2.tue);
  result = result || (days1.wed && days2.wed);
  result = result || (days1.thu && days2.thu);
  result = result || (days1.fri && days2.fri);
  result = result || (days1.sat && days2.sat);
  result = result || (days1.sun && days2.sun);

  return !!result;
}

function checkTimeConflict(intervalToCompare: Interval, interval: Interval) {
  return (intervalToCompare.startTime <= interval.startTime && interval.startTime <= intervalToCompare.endTime)
    || (interval.startTime <= intervalToCompare.startTime && intervalToCompare.startTime <= interval.endTime)
    || (intervalToCompare.startTime <= interval.startTime && interval.endTime <= intervalToCompare.endTime)
    || (interval.startTime <= intervalToCompare.startTime && intervalToCompare.endTime <= interval.endTime);
}

export const EditScheduleModal = ({
  onClose,
  open,
  isException,
  modalEditSchedule,
  validateSchedule,
  devInfo,
  refetch,
}: DriScheduleEditModalProps): ReactElement | null => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  function generateAddDriScheduleInput(): ApiParams['/dri/add-dri-sched'] | undefined {
    if (!modalEditSchedule) return;

    return {
      DRI_ID: devInfo.DEV_ID,
      NAME: modalEditSchedule.name,
      ACTIVE: modalEditSchedule.active ? '1' : '0',
      OPERATION: modalEditSchedule.operation ? '1' : '0',
      BEGIN_TIME: modalEditSchedule.start_time,
      END_TIME: modalEditSchedule.end_time,
      MODE: (modalEditSchedule.mode !== undefined) && DriSchedModeOpts[modalEditSchedule.mode] || undefined,
      DAYS: JSON.stringify(modalEditSchedule.selectedDays),
      SETPOINT: (modalEditSchedule.useSetpoint && Number(modalEditSchedule.setpointValue)) || undefined,
      EXCEPTION_DATE: (modalEditSchedule.isException && moment(modalEditSchedule.exceptionDate, 'DD/MM/YYYY').format('YYYY-MM-DD')) || undefined,
      EXCEPTION_REPEAT_YEARLY: (modalEditSchedule.isException && (modalEditSchedule.repeatYearly ? '1' : '0')) || undefined,
      AUTOMATION_INTERVAL: devInfo.dri?.automationCfg.AUTOMATION_INTERVAL,
    };
  }

  function generateUpdateDriScheduleInput(): ApiParams['/dri/update-dri-sched'] | undefined {
    if (!modalEditSchedule?.schedId) return;

    return {
      SCHED_ID: modalEditSchedule.schedId,
      DRI_ID: devInfo.DEV_ID,
      NAME: modalEditSchedule.name,
      ACTIVE: modalEditSchedule.active ? '1' : '0',
      OPERATION: modalEditSchedule.operation ? '1' : '0',
      BEGIN_TIME: modalEditSchedule.start_time,
      END_TIME: modalEditSchedule.end_time,
      MODE: (modalEditSchedule.mode !== undefined && DriSchedModeOpts[modalEditSchedule.mode]) || undefined,
      DAYS: JSON.stringify(modalEditSchedule.selectedDays) || undefined,
      SETPOINT: modalEditSchedule.useSetpoint ? Number(modalEditSchedule.setpointValue) : undefined,
      EXCEPTION_DATE: (modalEditSchedule.isException && moment(modalEditSchedule.exceptionDate, 'DD/MM/YYYY').format('YYYY-MM-DD')) || undefined,
      EXCEPTION_REPEAT_YEARLY: (modalEditSchedule.isException && (modalEditSchedule.repeatYearly ? '1' : '0')) || undefined,
      AUTOMATION_INTERVAL: devInfo.dri?.automationCfg.AUTOMATION_INTERVAL,
    };
  }

  async function callProgrammingRequest(): Promise<void> {
    if (modalEditSchedule?.addEdit === 'Add') {
      await apiCall('/dri/add-dri-sched', generateAddDriScheduleInput());
    } else if (modalEditSchedule?.addEdit === 'Edit' && modalEditSchedule.schedId) {
      await apiCall('/dri/update-dri-sched', generateUpdateDriScheduleInput());
    }
  }

  async function saveNewProgramming() {
    try {
      if (!modalEditSchedule) return;
      if (!devInfo?.GROUP_ID) {
        toast.warn(t('necessarioMaquinaAutomatizada'));
        return;
      }

      if (modalEditSchedule.name === '') return toast.error(t('erroDigiteNomeProgramacao'));
      if (!isException && modalEditSchedule.selectedDays && Object.values(modalEditSchedule.selectedDays).every((item) => item === false)) {
        return toast.error(t('erroSelecionePeloMenosUmDia'));
      }
      if (isException && (modalEditSchedule.exceptionDate.length !== 10 || modalEditSchedule.exceptionDate.includes('_'))) {
        return toast.error(t('erroDataExcecaoObrigatoria'));
      }
      if (!/^[0-2][0-9]:[0-5][0-9]$/.test(modalEditSchedule.start_time)) return toast.error(t('erroHorarioInvalido'));
      if (!/^[0-2][0-9]:[0-5][0-9]$/.test(modalEditSchedule.end_time)) return toast.error(t('erroHorarioInvalido'));

      if (!validateSchedule()) { return; }

      await callProgrammingRequest();

      refetch();

      toast.success(t('sucessoAdicionarProgramacao'));
      onClose();
    } catch (err) {
      console.log(err);
      if ((err as AxiosError).response?.data === t('erroProgramacoesSobrepostas')) {
        refetch();
        toast.error(t('erroProgramacoesSobrepostas'));
      } else {
        toast.error(t('erro'));
      }
    }
  }

  async function onConfirm(): Promise<void> {
    setLoading(true);
    await saveNewProgramming();
    setLoading(false);
  }

  function onCancel(): void {
    if (loading) return;
    onClose();
  }

  return open && devInfo.dri ? (
    <div>
      <ModalWindow
        style={{ padding: '0px' }}
        onClickOutside={onCancel}
        topBorder
      >
        <Bluebar />
        <DRISchedForm
          driCfg={devInfo.dri.varsCfg as unknown as { application: string, protocol: string }}
          modalEditSchedule={modalEditSchedule as ModalEditSchedule}
          onConfirm={onConfirm}
          onCancel={onCancel}
          loading={loading}
        />
      </ModalWindow>
    </div>
  ) : null;
};

export const DriScheduleContent = ({
  devInfo,
  exceptions,
  schedules,
  refetch,
  hideAddButton = false,
  fixedContent = false,
}: DriScheduleContentProps): ReactElement => {
  const { t } = useTranslation();

  const [state, render, setState] = useStateVar({
    showExceptions: false,
    modalEditSchedule: null as null | {
      schedId: number | undefined;
      addEdit: 'Add' | 'Edit';
      name: string;
      active: boolean;
      operation: boolean;
      start_time: string;
      start_time_error: string;
      end_time: string;
      end_time_error: string;
      selectedDays: SelectedDays;
      isException: boolean;
      exceptionDate: string;
      repeatYearly: boolean;
      useSetpoint: boolean;
      setpointValue: string;
      mode: number | undefined;
    },
    loading: false,
  });

  function generateDaysObject(days): SelectedDays {
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
      useSetpoint: !!item && item.SETPOINT != null && Number(getKeyByValue(DriSchedModeOpts, item.MODE)) !== 1,
      setpointValue: item && item.SETPOINT != null
        ? String(item.SETPOINT)
        : '24',
    };
  }

  function getSchedModeValues(item?: ScheduleInfo) {
    return {
      mode: item
        ? Number(getKeyByValue(DriSchedModeOpts, item.MODE))
        : undefined,
    };
  }

  function editAddProgramming(item?: ScheduleInfo) {
    try {
      const days = item && JSON.parse(item.DAYS);
      state.modalEditSchedule = {
        schedId: item && item.SCHED_ID,
        addEdit: item ? 'Edit' : 'Add',
        name: (item && item.NAME) || '',
        active: (item ? item.ACTIVE === '1' : true),
        operation: !!(item && item.OPERATION === '1'),
        ...getSchedTimesValues(item),
        selectedDays: !state.showExceptions ? generateDaysObject(days) : {},
        ...getSchedExceptionValues(item),
        ...getSchedSetpointValues(item),
        ...getSchedModeValues(item),
      };
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
  }

  async function deleteProgramming(sched) {
    try {
      setState({ loading: true });
      const { SCHED_ID, DRI_ID } = sched;
      await apiCall('/dri/delete-dri-sched', {
        SCHED_ID,
        DRI_ID,
        AUTOMATION_INTERVAL: devInfo.dri?.automationCfg.AUTOMATION_INTERVAL,
      });
      refetch();
      render();
      toast.success(t('sucessoRemoverProgramacao'));
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    } finally {
      setState({ loading: false });
    }
  }

  function validateException(): boolean {
    if (!state.modalEditSchedule) {
      return false;
    }

    for (const exception of exceptions) {
      if (exception.ACTIVE === '0') { continue; }
      if (state.modalEditSchedule.schedId && state.modalEditSchedule.schedId === exception.SCHED_ID) { continue; }
      if (!checkExceptionDate(exception, {
        EXCEPTION_DATE: state.modalEditSchedule.exceptionDate,
        EXCEPTION_REPEAT_YEARLY: state.modalEditSchedule.repeatYearly ? '1' : '0',
      })) { continue; }
      if (checkTimeConflict({
        startTime: exception.BEGIN_TIME,
        endTime: exception.END_TIME,
      }, {
        startTime: state.modalEditSchedule.start_time,
        endTime: state.modalEditSchedule.end_time,
      })) {
        const msgError = t('erroSalvarExcecoes', {
          value1: exception.NAME,
          value2: state.modalEditSchedule.name,
        });
        toast.error(msgError);
        return false;
      }
    }
    return true;
  }

  function validateSchedule(): boolean {
    if (!state.modalEditSchedule) {
      return false;
    }

    const {
      selectedDays, start_time, end_time, name,
    } = state.modalEditSchedule;
    for (const schedule of schedules) {
      if (!schedule.ACTIVE) { continue; }
      if (state.modalEditSchedule.schedId && state.modalEditSchedule.schedId === schedule.SCHED_ID) { continue; }
      if (!checkWeekDayCommon(JSON.parse(schedule.DAYS), selectedDays)) { continue; }
      if (checkTimeConflict(
        { startTime: schedule.BEGIN_TIME, endTime: schedule.END_TIME },
        { startTime: start_time, endTime: end_time },
      )
      ) {
        const msgError = t('erroSalvarProgramacoesHorarias', {
          value1: name,
          value2: schedule.NAME,
        });
        toast.error(msgError);
        return false;
      }
    }
    return true;
  }

  function validateSchedules(): boolean {
    if (!state.modalEditSchedule) {
      return false;
    }

    if (!state.modalEditSchedule.active) {
      return true;
    }

    return state.showExceptions ? validateException() : validateSchedule();
  }

  return (
    <>
      <EditScheduleModal
        devInfo={devInfo}
        isException={state.showExceptions}
        modalEditSchedule={state.modalEditSchedule ?? undefined}
        onClose={() => setState({ modalEditSchedule: undefined })}
        open={!!state.modalEditSchedule}
        validateSchedule={validateSchedules}
        refetch={refetch}
      />
      <DriScheduleList
        driCfg={devInfo.dri?.varsCfg as unknown as { application: string; protocol: string}}
        exceptions={exceptions}
        schedules={schedules}
        onDelete={deleteProgramming}
        onAddEdit={editAddProgramming}
        size={fixedContent ? 'small' : undefined}
        clientId={devInfo.CLIENT_ID}
        onChangeShowException={(value) => {
          setState({ showExceptions: value });
        }}
        hideAddButton={hideAddButton}
        loading={state.loading}
      />
    </>
  );
};

export const DriScheduleModal = (props: {
  devInfo: DevFullInfo;
  schedules: DriSchedule[];
  exceptions: DriException[];
  open: boolean;
  refetch: () => void;
  onClose: () => void;
  hideAddButton?: boolean;
}): ReactElement | null => {
  const {
    open, schedules, exceptions, onClose, devInfo, refetch, hideAddButton,
  } = props;

  return open ? (
    <div>
      <ModalWindow
        style={{
          padding: '0px',
          width: '55%',
          marginBottom: '20px',
          marginTop: '20px',
          minWidth: '500px',
        }}
        onClickOutside={onClose}
        topBorder
      >
        <Bluebar />
        <DriScheduleContent
          devInfo={devInfo}
          schedules={schedules}
          exceptions={exceptions}
          refetch={refetch}
          hideAddButton={hideAddButton}
        />
      </ModalWindow>
    </div>
  ) : null;
};
