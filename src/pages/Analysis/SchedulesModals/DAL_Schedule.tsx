import {
  apiCall,
} from '~/providers';
import {
  NotyIconStyle, NotyNumStyle, ControlButton, ControlButtonIcon, WeekDayButton, Sidebar, SchedCardContainer, TextLine, DefaultModeContainer,
} from './styles';
import {
  ModalWindow,
  Button,
  Loader,
  Input,
  Checkbox,
  RadioButton,
} from '~/components';
import { Box, Flex } from 'reflexbox';
import { useTranslation } from 'react-i18next';
import { useStateVar } from '~/helpers/useStateVar';
import { toast } from 'react-toastify';
import { ChangeEvent, useEffect } from 'react';
import { colors } from '~/styles/colors';
import { ToggleSwitchMini } from 'components/ToggleSwitch';
import {
  EditIcon,
  CheckboxIcon,
  ProgIcon,
} from '~/icons';
import { SmallTrashIcon } from '~/icons/Trash';
import img_schedule from '~/assets/img/cool_ico/schedule.svg';

import { t } from 'i18next';
import { Select } from '~/components/NewSelect';
import { Label } from '../styles';
import { AxiosError } from 'axios';
import { FullProg_v4 } from '~/providers/types';
import { UnderlineBtn } from '../Units/UnitProfile/styles';
import { SmallWarningIcon } from '~/icons/WarningIcon';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { BtnClean } from '../DALs/styles';
import ReactTooltip from 'react-tooltip';
import { validateStringTimeInterval } from '~/helpers/validateTime';

export interface ScheduleInfo {
  ID?: number;
  DAL_ID?: number;
  ILLUMINATION_ID: number;
  TITLE: string;
  ACTIVE: string;
  BEGIN_TIME: string;
  END_TIME: string;
  DAYS: string;
  STATUS: string;
  DEFAULT_MODE?: string;
  DELETE?: boolean;
  INSERT?: boolean;
  EDIT?: boolean;
}

export interface ExceptionInfo {
  ID?: number;
  DAL_ID?: number;
  ILLUMINATION_ID: number;
  TITLE: string;
  ACTIVE: string;
  BEGIN_TIME: string;
  END_TIME: string;
  EXCEPTION_DATE: string;
  REPEAT_YEARLY: string;
  STATUS: string;
  DELETE?: boolean;
  INSERT?: boolean;
  EDIT?: boolean;
}

export const parseDamProgToDalProg = (damProg: FullProg_v4) => {
  const uniqueProgs = {};
  for (const day of Object.keys(damProg.week)) {
    if (uniqueProgs[JSON.stringify(damProg.week[day])]) {
      uniqueProgs[JSON.stringify(damProg.week[day])].days.push(day);
    } else {
      uniqueProgs[JSON.stringify(damProg.week[day])] = {
        days: [day],
        permission: damProg.week[day].permission,
        start: damProg.week[day].start,
        end: damProg.week[day].end,
      };
    }
  }
  const scheds = [] as {
    ID: number;
    DAL_ID: number;
    ILLUMINATION_ID: number;
    TITLE: string;
    ACTIVE: string;
    BEGIN_TIME: string;
    END_TIME: string;
    DAYS: string;
    STATUS: string;
    DEFAULT_MODE?: string;
  }[];
  let index = 0;
  for (const sched of Object.keys(uniqueProgs)) {
    const schedBase = {
      ID: null as any,
      DAL_ID: null as any,
      ILLUMINATION_ID: null as any,
      TITLE: `Programação ${index}`,
      ACTIVE: '1',
      BEGIN_TIME: '',
      END_TIME: '',
      DAYS: '',
      STATUS: '1',
    };
    schedBase.BEGIN_TIME = uniqueProgs[sched].start;
    schedBase.END_TIME = uniqueProgs[sched].end;
    schedBase.STATUS = uniqueProgs[sched].permission === 'allow' ? '1' : '0';

    const days = {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false,
    };
    for (const day of uniqueProgs[sched].days) {
      days[day] = true;
    }
    schedBase.DAYS = JSON.stringify(days);

    index++;
    scheds.push(schedBase);
  }

  const excepts = [] as {
    ID: number;
    DAL_ID: number;
    ILLUMINATION_ID: number;
    TITLE: string;
    ACTIVE: string;
    BEGIN_TIME: string;
    END_TIME: string;
    EXCEPTION_DATE: string;
    REPEAT_YEARLY: string;
    STATUS: string;
    DEFAULT_MODE?: string;
  }[];
  index = 0;
  if (damProg.exceptions) {
    for (const date of Object.keys(damProg.exceptions)) {
      const [_, month, day] = date.split('-');
      const exceptBase = {
        ID: null as any,
        DAL_ID: null as any,
        ILLUMINATION_ID: null as any,
        TITLE: `Exceção ${index} `,
        ACTIVE: '1',
        BEGIN_TIME: damProg.exceptions[date].start,
        END_TIME: damProg.exceptions[date].end,
        EXCEPTION_DATE: `${day.padStart(2, '0')}/${month.padStart(2, '0')}`,
        REPEAT_YEARLY: '1',
        STATUS: damProg.exceptions[date].permission === 'allow' ? '1' : '0',
      };
      index++;
      excepts.push(exceptBase);
    }
  }

  return { scheds, excepts };
};

export const DALSchedule = (props: {
  deviceCode: string,
  illumId: number,
  illumName: string,
  canEdit: boolean,
  isModal: boolean,
  styledIcon?: boolean,
  getScheds?: (scheds, exceptions) => void,
  onlyIcon?: boolean,
  editDefaultMode?: (defaultMode: string, illuminationId: number) => void,
  defaultMode?: string,
  isEditDAL?: boolean,
  isEditUtility?: boolean,
  handleHasEdited?: () => void,
  exceededExceptionLimit?: boolean
  setExceededExceptionLimit?: (value: boolean) => void,
}): JSX.Element => {
  const {
    deviceCode, illumId, illumName,
  } = props;
  const { t } = useTranslation();
  const match = useRouteMatch();
  const history = useHistory();
  const [state, render, setState] = useStateVar({
    dalScheds: null as null | ScheduleInfo[],
    larguraPage: window.innerWidth,
    openModal: null as null | string,
    linkBase: match.url.split('/analise')[0],
    modalEditSchedule: null as null | {
      schedId: number | undefined
      addEdit: 'Add' | 'Edit'
      title: string
      active: boolean
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
      status: boolean
      index: number
    },
    dalExceptions: null as null | ExceptionInfo[],
    modalEditException: null as null | {
      exceptionId: number | undefined
      addEdit: 'Add' | 'Edit'
      title: string
      active: boolean
      start_time: string
      start_time_error: string
      end_time: string
      end_time_error: string
      status: boolean
      exceptionDate: string
      repeatYearly: boolean
      index: number
    },
    showScheds: false,
    showExceptions: false,
    loadingSchedule: false,
    loading: true,
    loadingSet: false,
    totalScheds: 0,
    dalSchedsToEdit: { } as {[key: string]: {[key: string]: {schedId: number, delete: boolean, days: string}[]}},
    dalExceptsToDelete: { } as {[key: string]: {[key: string]: number[]}},
    illumWithConflict: false,
  });

  document.body.onresize = function () {
    setState({ larguraPage: document.body.clientWidth });
  };

  async function getScheds() {
    try {
      if (deviceCode.startsWith('DAL')) {
        const { scheds, exceptions } = await apiCall('/dal/get-dal-scheds', { DAL_CODE: deviceCode, ILLUMINATION_ID: illumId });
        state.dalScheds = scheds.filter((sched) => sched.ILLUMINATION_ID === illumId);
        state.dalExceptions = exceptions.filter((exception) => exception.ILLUMINATION_ID === illumId);
        if (props.getScheds && (state.dalScheds.length || state.dalExceptions.length)) props.getScheds(state.dalScheds, state.dalExceptions);
        render();
      } else if (deviceCode.startsWith('DAM')) {
        const { current } = await apiCall('/dam/get-sched', { damId: deviceCode });
        const damSched = current;

        const { scheds, excepts } = parseDamProgToDalProg(damSched);
        state.dalScheds = scheds;
        state.dalExceptions = excepts;
        render();
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
  }

  useEffect(() => {
    getScheds();
  }, [illumId]);

  function editAddProgramming(index: number) {
    if (state.showExceptions) editAddException(index);
    else editAddSched(index);
  }

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

  function editAddSched(index: number, item?: ScheduleInfo) {
    try {
      const days = item?.DAYS && JSON.parse(item.DAYS);
      state.modalEditSchedule = {
        schedId: item?.ID,
        addEdit: item ? 'Edit' : 'Add',
        title: (item?.TITLE) ?? '',
        active: item ? (item.ACTIVE === '1') : true,
        start_time: item ? item.BEGIN_TIME : '',
        start_time_error: '',
        end_time: item ? item.END_TIME : '',
        end_time_error: '',
        selectedDays: !state.showExceptions ? generateDaysObject(days) : {},
        status: item ? !!(item && item.STATUS === '1') : true,
        index,
      };
      render();
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  function editAddException(index: number, item?: ExceptionInfo) {
    try {
      state.modalEditException = {
        exceptionId: item?.ID,
        addEdit: item ? 'Edit' : 'Add',
        title: (item?.TITLE) ?? '',
        active: item ? !!(item && item.ACTIVE === '1') : true,
        start_time: item ? item.BEGIN_TIME : '',
        start_time_error: '',
        end_time: item ? item.END_TIME : '',
        end_time_error: '',
        exceptionDate: (item && item.EXCEPTION_DATE) || '',
        repeatYearly: !!(item && item.REPEAT_YEARLY === '1'),
        status: item ? !!(item && item.STATUS === '1') : true,
        index,
      };
      render();
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  function formatStringToDate(str: string) {
    return `${str.substring(6, 10)}-${str.substring(3, 5)}-${str.substring(0, 2)}`;
  }

  async function addNewSched() {
    if (!state.modalEditSchedule) return;
    if (props.getScheds) {
      state.dalScheds?.push({
        DAL_CODE: deviceCode,
        ILLUMINATION_ID: illumId,
        TITLE: state.modalEditSchedule.title,
        ACTIVE: state.modalEditSchedule.active ? '1' : '0',
        BEGIN_TIME: state.modalEditSchedule.start_time,
        END_TIME: state.modalEditSchedule.end_time,
        DAYS: JSON.stringify(state.modalEditSchedule.selectedDays),
        STATUS: state.modalEditSchedule.status ? '1' : '0',
        INSERT: true,
      });
      props.getScheds(state.dalScheds, state.dalExceptions);
      return;
    }
    if (props.canEdit && !props.getScheds) {
      state.dalScheds?.push({
        DAL_CODE: deviceCode,
        ILLUMINATION_ID: illumId,
        TITLE: state.modalEditSchedule.title,
        ACTIVE: state.modalEditSchedule.active ? '1' : '0',
        BEGIN_TIME: state.modalEditSchedule.start_time,
        END_TIME: state.modalEditSchedule.end_time,
        DAYS: JSON.stringify(state.modalEditSchedule.selectedDays),
        STATUS: state.modalEditSchedule.status ? '1' : '0',
        INSERT: true,
      });
      render();
    }
  }

  async function editSched(index) {
    if (!state.modalEditSchedule) return;
    if (props.getScheds) {
      const sched = state.dalScheds?.[index];
      state.dalScheds?.splice(index, 1, {
        ...sched,
        DAL_CODE: deviceCode,
        ILLUMINATION_ID: illumId,
        TITLE: state.modalEditSchedule.title,
        ACTIVE: (state.modalEditSchedule?.active ? '1' : '0'),
        BEGIN_TIME: (state.modalEditSchedule?.start_time),
        END_TIME: (state.modalEditSchedule?.end_time),
        DAYS: JSON.stringify(state.modalEditSchedule.selectedDays),
        STATUS: (state.modalEditSchedule?.status ? '1' : '0'),
        EDIT: true,
      });
      props.getScheds(state.dalScheds, state.dalExceptions);
      return;
    }

    if (props.canEdit && !props.getScheds) {
      const sched = state.dalScheds?.[index];
      state.dalScheds?.splice(index, 1, {
        ...sched,
        DAL_CODE: deviceCode,
        ILLUMINATION_ID: illumId,
        TITLE: state.modalEditSchedule.title,
        ACTIVE: (state.modalEditSchedule?.active ? '1' : '0'),
        BEGIN_TIME: (state.modalEditSchedule?.start_time),
        END_TIME: (state.modalEditSchedule?.end_time),
        DAYS: JSON.stringify(state.modalEditSchedule.selectedDays),
        STATUS: (state.modalEditSchedule?.status ? '1' : '0'),
        EDIT: true,
      });
      render();
    }
  }

  async function saveEditNewSched(index) {
    try {
      // setState({ loadingSet: true });
      if (!state.modalEditSchedule) return;
      if (state.modalEditSchedule.title === '') return toast.error(t('erroDigiteNomeProgramacao'));
      if (!state.showExceptions && state.modalEditSchedule.selectedDays && Object.values(state.modalEditSchedule.selectedDays).every((item) => item === false)) {
        return toast.error(t('erroSelecionePeloMenosUmDia'));
      }

      if (!validateStringTimeInterval({
        startTime: state.modalEditSchedule.start_time,
        endTime: state.modalEditSchedule.end_time,
      }, t)) {
        return;
      }

      if (state.modalEditSchedule.addEdit === 'Add') {
        await addNewSched();
      } else if (state.modalEditSchedule.addEdit === 'Edit') {
        await editSched(index);
      }
      state.modalEditSchedule = null;
      // setState({ loadingSet: false });
      render();
      toast.success(t('sucessoAdicionarProgramacao'));
    } catch (err) {
      const error = err as AxiosError;
      toast.error(error?.response?.data);
      // setState({ loadingSet: false });
    }
  }

  async function addNewException() {
    if (!state.modalEditException) return;
    if (props.getScheds) {
      state.dalExceptions?.push({
        DAL_CODE: deviceCode,
        ILLUMINATION_ID: illumId,
        TITLE: state.modalEditException.title,
        ACTIVE: state.modalEditException.active ? '1' : '0',
        BEGIN_TIME: state.modalEditException.start_time,
        END_TIME: state.modalEditException.end_time,
        EXCEPTION_DATE: state.modalEditException.exceptionDate,
        REPEAT_YEARLY: state.modalEditException.repeatYearly ? '1' : '0',
        STATUS: state.modalEditException.status ? '1' : '0',
        INSERT: true,
      });
      props.getScheds(state.dalScheds, state.dalExceptions);
      return;
    }

    if (props.canEdit && !props.getScheds) {
      state.dalExceptions?.push({
        DAL_CODE: deviceCode,
        ILLUMINATION_ID: illumId,
        TITLE: state.modalEditException.title,
        ACTIVE: state.modalEditException.active ? '1' : '0',
        BEGIN_TIME: state.modalEditException.start_time,
        END_TIME: state.modalEditException.end_time,
        EXCEPTION_DATE: state.modalEditException.exceptionDate,
        REPEAT_YEARLY: state.modalEditException.repeatYearly ? '1' : '0',
        STATUS: state.modalEditException.status ? '1' : '0',
        INSERT: true,
      });
      render();
    }
  }

  async function editException(index) {
    if (!state.modalEditException) return;
    if (props.getScheds) {
      const exception = state.dalExceptions?.[index];
      state.dalExceptions?.splice(index, 1, {
        ...exception,
        DAL_CODE: deviceCode,
        ILLUMINATION_ID: illumId,
        TITLE: state.modalEditException.title,
        ACTIVE: state.modalEditException.active ? '1' : '0',
        BEGIN_TIME: state.modalEditException?.start_time,
        END_TIME: state.modalEditException?.end_time,
        EXCEPTION_DATE: state.modalEditException.exceptionDate,
        REPEAT_YEARLY: state.modalEditException.repeatYearly ? '1' : '0',
        STATUS: state.modalEditException.status ? '1' : '0',
        EDIT: true,
      });
      props.getScheds(state.dalScheds, state.dalExceptions);
      return;
    }

    if (props.canEdit && !props.getScheds) {
      const exception = state.dalExceptions?.[index];
      state.dalExceptions?.splice(index, 1, {
        ...exception,
        DAL_CODE: deviceCode,
        ILLUMINATION_ID: illumId,
        TITLE: state.modalEditException.title,
        ACTIVE: state.modalEditException.active ? '1' : '0',
        BEGIN_TIME: state.modalEditException?.start_time,
        END_TIME: state.modalEditException?.end_time,
        EXCEPTION_DATE: state.modalEditException.exceptionDate,
        REPEAT_YEARLY: state.modalEditException.repeatYearly ? '1' : '0',
        STATUS: state.modalEditException.status ? '1' : '0',
        EDIT: true,
      });
      render();
    }
  }

  async function saveEditNewException(index) {
    try {
      if (!state.modalEditException) return;
      if (state.modalEditException.title === '') return toast.error(t('erroDigiteNomeProgramacao'));
      if ((state.modalEditException.exceptionDate.length !== 10 || state.modalEditException.exceptionDate.includes('_'))) {
        return toast.error(t('erroDataExcecaoObrigatoria'));
      }

      if (!validateStringTimeInterval({
        startTime: state.modalEditException.start_time,
        endTime: state.modalEditException.end_time,
      }, t)) {
        return;
      }

      if (state.modalEditException.addEdit === 'Add') {
        await addNewException();
      } else if (state.modalEditException.addEdit === 'Edit') {
        await editException(index);
      }
      state.modalEditException = null;
      render();
      toast.success(t('sucessoAdicionarProgramacao'));
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  async function deleteSchedule(sched: ScheduleInfo, index: number) {
    try {
      const { ID, ILLUMINATION_ID } = sched;
      if (props.getScheds) {
        const sched = state.dalScheds?.[index];
        // @ts-ignore
        state.dalScheds?.splice(index, 1, {
          ...sched,
          DAL_CODE: deviceCode,
          ILLUMINATION_ID,
          DELETE: true,
        });
        render();
        props.getScheds(state.dalScheds, state.dalExceptions);
        return;
      }
      if (props.canEdit && !props.getScheds) {
        const sched = state.dalScheds?.[index];
        // @ts-ignore
        state.dalScheds?.splice(index, 1, {
          ...sched,
          DAL_CODE: deviceCode,
          ILLUMINATION_ID,
          DELETE: true,
        });
        render();
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
  }
  async function deleteException(sched: ExceptionInfo, index: number) {
    try {
      const { ID, ILLUMINATION_ID } = sched;
      if (props.getScheds) {
        const except = state.dalExceptions?.[index];
        // @ts-ignore
        state.dalExceptions?.splice(index, 1, {
          ...except,
          DAL_CODE: deviceCode,
          ILLUMINATION_ID,
          DELETE: true,
        });
        render();
        props.getScheds(state.dalScheds, state.dalExceptions);
        return;
      }

      if (props.canEdit && !props.getScheds) {
        const except = state.dalExceptions?.[index];
        // @ts-ignore
        state.dalExceptions?.splice(index, 1, {
          ...except,
          DAL_CODE: deviceCode,
          ILLUMINATION_ID,
          DELETE: true,
        });
        render();
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
  }
  function showScheds() {
    try {
      state.showScheds = true;
      render();
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  function changeShowExceptions(value: boolean) {
    setState({ showExceptions: value });
  }

  function changeDefaultMode(defaultMode: string, illuminationId:number) {
    props.editDefaultMode && props.editDefaultMode(defaultMode, illuminationId);
  }

  function changeHasEdited() {
    props.handleHasEdited && props.handleHasEdited();
  }

  interface DaySched {
    BEGIN_TIME: string;
    END_TIME: string;
    DAYS: string;
    ID?: number;
  }

  const getNewSchedDays = (convergence: DaySched,
    newSched: DaySched) => {
    let newDays;
    if (newSched?.ID) {
      newDays = JSON.parse(newSched.DAYS);
      const convergenceDays = JSON.parse(convergence.DAYS);
      for (const day of Object.keys(convergenceDays)) {
        if (convergenceDays[day]) newDays[day] = false;
      }
    } else if (convergence?.ID) {
      newDays = JSON.parse(convergence.DAYS);
      const convergenceDays = JSON.parse(newSched.DAYS);
      for (const day of Object.keys(convergenceDays)) {
        if (convergenceDays[day]) newDays[day] = false;
      }
    }

    return newDays;
  };

  function checkConvergence(
    currentScheds: DaySched[],
    newSched: DaySched,
  ) {
    const convergence = currentScheds.find((x) => (
      compareTimes(newSched, x)
    ));

    if (convergence) {
      const newDays = getNewSchedDays(convergence, newSched);
      let deleteSched = true;
      if (newDays !== undefined) {
        for (const day of Object.keys(newDays)) {
          if (newDays[day]) deleteSched = false;
        }
      }

      return {
        foundConvergence: true, schedId: newSched?.ID ?? convergence?.ID, days: JSON.stringify(newDays), deleteSched,
      };
    }
    return {
      foundConvergence: false, schedId: undefined, days: undefined, deleteSched: false,
    };
  }

  const checkDalSchedsCardsConflicts = (newScheds: ScheduleInfo[], persisted?: ScheduleInfo[]) => {
    const daysProgs = {
      sun: [],
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
    } as {[day: string]:DaySched[]};
    const ans = {
      hasConflict: false,
      schedsIdToEdit: [] as {schedId: number, delete: boolean, days: string}[],
    };

    const deleted = newScheds.filter((sched) => sched.ID && sched.DELETE);
    const deletedIds = deleted.map((sched) => sched.ID);

    const inserted = newScheds.filter((sched) => sched.INSERT && !sched.DELETE);

    const edited = newScheds.filter((sched) => sched.EDIT && !sched.DELETE);
    const editedIds = edited.map((sched) => sched.ID);

    let schedsToValidate: ScheduleInfo[] = [];
    if (persisted?.length === 0 || (persisted?.length && persisted?.length >= 0)) {
      const persistedWithoutEditeds = persisted.filter((sched) => (!deletedIds.includes(sched.ID) && !editedIds.includes(sched.ID)));
      schedsToValidate = inserted.concat(edited).concat(persistedWithoutEditeds);
    } else {
      schedsToValidate = newScheds;
    }
    for (const sched of schedsToValidate) {
      const days = JSON.parse(sched.DAYS) || {};
      for (const [day, selected] of Object.entries(days)) {
        if (!selected) continue;
        const dayScheds = daysProgs[day];
        const checkConvAns = checkConvergence(dayScheds, sched);
        if (checkConvAns.foundConvergence) {
          ans.hasConflict = true;
          if (checkConvAns.schedId && !ans.schedsIdToEdit.find((s) => s.schedId === checkConvAns.schedId)) {
            ans.schedsIdToEdit.push({
              schedId: checkConvAns.schedId, delete: checkConvAns.deleteSched, days: checkConvAns.days,
            });
          }
        }
        dayScheds.unshift(sched);
      }
    }
    return ans;
  };

  interface DayExcept {
    BEGIN_TIME: string;
    END_TIME: string;
    ID?: number;
  }

  const compareTimes = (time_1: DayExcept, time_2: DayExcept) => ((time_1.BEGIN_TIME <= time_2.BEGIN_TIME && time_2.BEGIN_TIME <= time_1.END_TIME)
  || (time_2.BEGIN_TIME <= time_1.BEGIN_TIME && time_1.BEGIN_TIME <= time_2.END_TIME)
  || (time_1.BEGIN_TIME <= time_2.BEGIN_TIME && time_2.END_TIME <= time_1.END_TIME)
  || (time_2.BEGIN_TIME <= time_1.BEGIN_TIME && time_1.END_TIME <= time_2.END_TIME));

  const hasHoursConflicts = (excepts: DayExcept[]) => {
    const ans = {
      foundConvergence: false,
      exceptsIds: [] as number[],
    };
    for (let i = 0; i < excepts.length; i++) {
      for (let j = i + 1; j < excepts.length; j++) {
        if (compareTimes(excepts[i], excepts[j])) {
          ans.foundConvergence = true;
          if (excepts[i]?.ID) {
            ans.exceptsIds.push(excepts[i].ID as number);
          }
          if (excepts[j]?.ID) {
            ans.exceptsIds.push(excepts[j].ID as number);
          }
        }
      }
    }
    return ans;
  };

  const handleDayExceptsInsertion = (dayExcepts: {[date: string]: {[year: string]: DayExcept[]}}, dateDM: string, except: ExceptionInfo) => {
    if (except.REPEAT_YEARLY === '1') {
      if (!dayExcepts[dateDM]?.YEARLY) {
        dayExcepts[dateDM].YEARLY = [{ BEGIN_TIME: except.BEGIN_TIME, END_TIME: except.END_TIME, ID: except.ID }];
      } else {
        dayExcepts[dateDM].YEARLY.push({ BEGIN_TIME: except.BEGIN_TIME, END_TIME: except.END_TIME, ID: except.ID });
      }
    } else {
      const dateY = except.EXCEPTION_DATE.slice(6, 10);
      if (!dayExcepts[dateDM]?.[dateY]) {
        dayExcepts[dateDM][dateY] = [{ BEGIN_TIME: except.BEGIN_TIME, END_TIME: except.END_TIME, ID: except.ID }];
      } else {
        dayExcepts[dateDM][dateY].push({ BEGIN_TIME: except.BEGIN_TIME, END_TIME: except.END_TIME, ID: except.ID });
      }
    }
  };

  const getDayExcepts = (excepts: ExceptionInfo[]) => {
    const dayExcepts = {} as {[date: string]: {[year: string]: DayExcept[]}};
    for (const except of excepts) {
      if (except.ACTIVE === '0') continue;
      const dateDM = except.EXCEPTION_DATE.slice(0, 5);
      if (!dayExcepts[dateDM]) dayExcepts[dateDM] = {};

      handleDayExceptsInsertion(dayExcepts, dateDM, except);
    }

    return dayExcepts;
  };

  const checkNotYearlyExcept = (dayExcepts: {[date: string]: {[year: string]: DayExcept[]}}, date: string, yearlyExcepts: DayExcept[], ans: { hasConflict: boolean, exceptsIdToDelete: number[] }) => {
    for (const year of Object.keys(dayExcepts[date])) {
      if (year === 'YEARLY') continue;
      const excepts = dayExcepts[date][year].concat(yearlyExcepts);
      const checkExceptsConvergence = hasHoursConflicts(excepts);
      if (checkExceptsConvergence.foundConvergence) {
        ans.hasConflict = true;
        if (checkExceptsConvergence.exceptsIds.length) {
          ans.exceptsIdToDelete = ans.exceptsIdToDelete.concat(checkExceptsConvergence.exceptsIds);
        }
      }
    }
  };

  const checkDalCardsExceptsConflicts = (newExceptions: ExceptionInfo[], persisted: ExceptionInfo[]) => {
    const ans = {
      hasConflict: false,
      exceptsIdToDelete: [] as number[],
    };

    const deleted = newExceptions.filter((except) => except.ID && except.DELETE);
    const deletedIds = deleted.map((sched) => sched.ID);

    const inserted = newExceptions.filter((except) => except.INSERT && !except.DELETE);

    const edited = newExceptions.filter((except) => except.EDIT && !except.DELETE);
    const editedIds = edited.map((except) => except.ID);

    let exceptsToValidate: ExceptionInfo[] = [];
    if (persisted?.length === 0 || (persisted?.length && persisted?.length >= 0)) {
      const persistedWithoutEditeds = persisted.filter((except) => (!deletedIds.includes(except.ID) && !editedIds.includes(except.ID)));
      exceptsToValidate = inserted.concat(edited).concat(persistedWithoutEditeds);
    } else {
      exceptsToValidate = newExceptions;
    }

    const dayExcepts = getDayExcepts(exceptsToValidate);

    for (const date of Object.keys(dayExcepts)) {
      const yearlyExcepts = dayExcepts[date]?.YEARLY || [];
      const checkExceptsConvergence = hasHoursConflicts(yearlyExcepts);
      if (checkExceptsConvergence.foundConvergence) {
        ans.hasConflict = true;
        if (checkExceptsConvergence.exceptsIds.length) {
          ans.exceptsIdToDelete = ans.exceptsIdToDelete.concat(checkExceptsConvergence.exceptsIds);
        }
      }
      checkNotYearlyExcept(dayExcepts, date, yearlyExcepts, ans);
    }
    ans.exceptsIdToDelete = ans.exceptsIdToDelete.filter((e) => e !== undefined);
    return ans;
  };

  const validateDalScheds = async (DEVICE_CODE: string, ILLUMINATION_ID: number, newScheds: ScheduleInfo[], newExceptions: ExceptionInfo[]) => {
    try {
      const { scheds, exceptions } = await apiCall('/dal/get-dal-scheds', { DAL_CODE: DEVICE_CODE, ILLUMINATION_ID });

      // validar novos + persisitidos
      const dalSchedValidation = checkDalSchedsCardsConflicts(newScheds, scheds);
      if (dalSchedValidation.hasConflict) {
        if (dalSchedValidation.schedsIdToEdit.length) {
          if (!state.dalSchedsToEdit[DEVICE_CODE]) state.dalSchedsToEdit[DEVICE_CODE] = {};
          state.dalSchedsToEdit[DEVICE_CODE][ILLUMINATION_ID] = dalSchedValidation.schedsIdToEdit;
        }
        render();
      }

      // validar novos + persisitidos
      const dalExceptsValidation = checkDalCardsExceptsConflicts(newExceptions, exceptions);
      if (dalExceptsValidation.hasConflict) {
        if (dalExceptsValidation.exceptsIdToDelete.length) {
          if (!state.dalExceptsToDelete[DEVICE_CODE]) state.dalExceptsToDelete[DEVICE_CODE] = {};
          state.dalExceptsToDelete[DEVICE_CODE][ILLUMINATION_ID] = [...new Set(dalExceptsValidation.exceptsIdToDelete)];
          render();
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const validateScheds = async () => {
    setState({
      isLoading: true,
      dalExceptsToDelete: {},
      dalSchedsToEdit: {},
      illumsWithConflict: [],
      illumWithConflict: false,
    });
    render();

    let foundConflict = false;
    const scheds = state.dalScheds;
    const exceptions = state.dalExceptions;

    try {
      // validar só persistidos/editados
      // @ts-ignore
      const checkJustPersistedAndEditedCards = checkDalSchedsCardsConflicts(scheds.filter((sched) => !sched.DELETE && !sched.INSERT));
      if (checkJustPersistedAndEditedCards.hasConflict) throw new Error('');
    } catch (err) {
      foundConflict = true;
      if (!state.illumWithConflict) {
        state.illumWithConflict = true;
        render();
      }
      console.log(err);
      toast.error(`Não será possível salvar as programações ${illumName}. Alguns conflitos foram encontrados entre as programações já existentes e as programações já existentes que foram editadas.`);
    }

    try {
      // validar só novos
      // @ts-ignore
      const checkJustNewCards = checkDalSchedsCardsConflicts(scheds.filter((sched) => sched.INSERT && !sched.DELETE));
      if (checkJustNewCards.hasConflict) throw new Error('');
    } catch (err) {
      foundConflict = true;
      if (!state.illumWithConflict) {
        state.illumWithConflict = true;
        render();
      }
      console.log(err);
      toast.error(`Não será possível salvar as programações ${illumName}. Alguns conflitos foram encontrados entre as programações novas inseridas.`);
    }

    try {
      // validar só persistidos/editados
      // @ts-ignore
      const checkJustPersistedAndEditedCards = checkDalCardsExceptsConflicts(exceptions.filter((except) => !except.DELETE && !except.INSERT));
      if (checkJustPersistedAndEditedCards.hasConflict) throw new Error('');
    } catch (err) {
      foundConflict = true;
      if (!state.illumWithConflict) {
        state.illumWithConflict = true;
        render();
      }
      console.log(err);
      toast.error(`Não será possível salvar as exceções ${illumName}. Alguns conflitos foram encontrados entre as exceções já existentes e as exceções já existentes que foram editadas.`);
    }

    try {
      // validar só novos
      // @ts-ignore
      const checkJustNewCards = checkDalCardsExceptsConflicts(exceptions.filter((except) => except.INSERT && !except.DELETE));
      if (checkJustNewCards.hasConflict) throw new Error('');
    } catch (err) {
      foundConflict = true;
      if (!state.illumWithConflict) {
        state.illumWithConflict = true;
        render();
      }
      console.log(err);
      toast.error(`Não será possível salvar as exceções ${illumName}. Alguns conflitos foram encontrados entre as exceções novas inseridas.`);
    }

    // verificar o retorno

    // validate and save
    if (!state.illumWithConflict) {
      try {
        await validateDalScheds(deviceCode, Number(illumId), scheds || [], exceptions || []);
      } catch (err) {
        console.log(err);
        toast.error(`Não será possível salvar programações/exceções ${illumName || ''}.`);
      }
      render();
    }

    if (foundConflict && state.illumWithConflict) {
      setState({
        loading: false,
      });
      render();
      return false;
    }
    // setState({
    //   isLoading: false,
    // });
    return true;
  };

  const saveUtilitySched = async () => {
    const valid = await validateScheds();

    if (valid) {
      state.openModal = 'saving-confirmation';
      render();
    }
  };

  const sendToServer = async () => {
    let success = true;
    state.openModal = null;
    render();
    try {
      // Atualiza as programações necessárias
      if (state.illumWithConflict) {
        toast.error(`Como avisado previamente, não será possível salvar as programações/exceções do ${illumName}. O utilitário foi ignorado, atenção aos conflitos de programação/exceção.`);
        return;
      }

      const schedsToEdit = state.dalSchedsToEdit?.[deviceCode]?.[illumId];
      const schedsToSend = [] as {
        DAL_CODE: string;
        ILLUMINATION_ID: number;
        SCHED_ID?: number;
        TITLE?: string;
        ACTIVE?: string;
        BEGIN_TIME?: string;
        END_TIME?: string;
        DAYS?: string;
        STATUS?: string;
        INSERT?: boolean;
        EDIT?: boolean;
        DELETE?: boolean
      }[];
      for (const sched of state?.dalScheds || []) {
        const editInfo = schedsToEdit?.find((s) => s.schedId === sched.ID);
        if ((editInfo?.delete || sched.DELETE) && !sched.ID) continue;

        schedsToSend.push({
          DAL_CODE: deviceCode,
          ILLUMINATION_ID: Number(illumId),
          SCHED_ID: sched.ID,
          TITLE: sched.TITLE,
          ACTIVE: sched.ACTIVE,
          BEGIN_TIME: sched.BEGIN_TIME,
          END_TIME: sched.END_TIME,
          DAYS: editInfo?.days || sched.DAYS,
          STATUS: sched.STATUS,
          INSERT: (editInfo?.delete || sched.DELETE) ? false : sched.INSERT,
          EDIT: (editInfo?.delete || sched.DELETE || sched.INSERT) ? false : (!!editInfo || sched.EDIT),
          DELETE: editInfo?.delete ? true : sched.DELETE, // ajustar
        });
      }

      const exceptsToDelete = state.dalExceptsToDelete?.[deviceCode]?.[illumId];
      const exceptsToSend = [] as {
          EXCEPTION_ID?: number;
          DAL_CODE: string;
          ILLUMINATION_ID: number;
          TITLE?: string;
          ACTIVE?: string;
          BEGIN_TIME?: string;
          END_TIME?: string;
          EXCEPTION_DATE?: string;
          REPEAT_YEARLY?: string;
          STATUS?: string;
          INSERT?: boolean;
          DELETE?: boolean
          EDIT?: boolean;
        }[];

      for (const except of state?.dalExceptions || []) {
        const hasToDelete = !!exceptsToDelete?.find((e) => e === except.ID);
        exceptsToSend.push({
          EXCEPTION_ID: except.ID,
          DAL_CODE: deviceCode,
          ILLUMINATION_ID: Number(illumId),
          TITLE: except.TITLE,
          ACTIVE: except.ACTIVE,
          BEGIN_TIME: except.BEGIN_TIME,
          END_TIME: except.END_TIME,
          EXCEPTION_DATE: formatStringToDate(except.EXCEPTION_DATE),
          REPEAT_YEARLY: except.REPEAT_YEARLY,
          STATUS: except.STATUS,
          INSERT: (hasToDelete || except.DELETE) ? false : except.INSERT,
          DELETE: hasToDelete ? true : except.DELETE,
          EDIT: (hasToDelete || except.DELETE || except.INSERT) ? false : except.EDIT,
        });
      }

      try {
        await apiCall('/dal/handle-multiple-illumination-sched', {
          ILLUMINATION_ID: illumId, DAL_CODE: deviceCode, SCHEDS: schedsToSend, EXCEPTIONS: exceptsToSend,
        });
      } catch (err) {
        success = false;
        console.log(err);
        toast.error(`Não foi possível salvar programações ${illumName || ''}`);
      }

      if (success) {
        history.push(`${state.linkBase}/analise/utilitario/iluminacao/${illumId}/informacoes`);
        toast.success(t('sucessoSalvar'));
      }
      setState({ loading: false, illumWithConflict: false });
    } catch (err) {
      console.log(err);
      toast.error(t('erroSalvarInfo'));
      setState({ loading: false, illumWithConflict: false });
    }

    setState({ loading: false, illumWithConflict: false });
  };

  function styledIcon() {
    if (props.styledIcon && props.onlyIcon) {
      return (
        <div
          style={{
            boxShadow: '2px 2px 5px 3px #D7D7D769',
            borderRadius: 5,
            padding: 10,
            position: 'relative',
          }}
          onClick={() => { showScheds(); }}
        >
          {state.dalScheds?.filter((sched) => !sched.DELETE) && state.dalScheds?.filter((sched) => !sched.DELETE).length > 0 ? <NotyNumStyle style={{ right: '-8px' }}>{state.dalScheds?.filter((sched) => !sched.DELETE).length}</NotyNumStyle> : null}
          {state.loadingSchedule
            ? <Loader size="small" />
            : <ProgIcon cursor="pointer" />}
        </div>
      );
    }
    return (
      <div onClick={() => { showScheds(); }}>
        {state.dalScheds?.filter((sched) => !sched.DELETE) && state.dalScheds?.filter((sched) => !sched.DELETE).length > 0 ? <NotyNumStyle style={{ right: '-8px' }}>{state.dalScheds?.filter((sched) => !sched.DELETE).length}</NotyNumStyle> : null}
        {state.loadingSchedule
          ? <Loader size="small" />
          : <ProgIcon cursor="pointer" color={(state.dalScheds?.filter((sched) => !sched.DELETE) && state.dalScheds?.filter((sched) => !sched.DELETE).length > 0) || (state.dalExceptions?.filter((sched) => !sched.DELETE) && state.dalExceptions?.filter((sched) => !sched.DELETE).length > 0) ? '#363BC4' : '#F0F0F0'} />}
      </div>
    );
  }

  return (
    <Flex flexWrap="wrap" flexDirection="row" fontSize="13px">
      {props.isModal ? (
        <>
          {props.onlyIcon ? (styledIcon()
          ) : (
            <NotyIconStyle>
              {state.dalScheds?.filter((sched) => !sched.DELETE) && state.dalScheds?.filter((sched) => !sched.DELETE).length > 0 ? <NotyNumStyle style={{ right: '-30px' }}>{state.dalScheds?.filter((sched) => !sched.DELETE).length}</NotyNumStyle> : null}

              <ControlButton
                style={{ width: '200px', justifyContent: 'center' }}
                onClick={() => { showScheds(); }}
              >
                {state.loadingSchedule
                  ? <Loader />
                  : <ControlButtonIcon style={{ width: '15px' }} alt={t('programacao')} src={img_schedule} />}
                <span style={{
                  fontWeight: 'bold',
                  color: colors.Blue300,
                  fontSize: '12px',
                  marginLeft: '5px',
                }}
                >
                  {`${t('ver')} ${t('programacoes')}`}
                </span>
              </ControlButton>
            </NotyIconStyle>
          )}

          {(state.showScheds) && (
          <div style={{ zIndex: 3 }}>
            <ModalWindow
              style={{
                padding: '0px',
                width: '600px',
                marginBottom: 'auto',
                maxWidth: '900px',
              }}
              borderTop
              onClickOutside={() => {
                if (!state.modalEditSchedule && !state.modalEditException) {
                  setState({ showScheds: false });
                }
              }}
            >
              <DALScheduleContent
                showExceptions={state.showExceptions}
                changeShowExceptions={changeShowExceptions}
                dalScheds={state.dalScheds}
                dalExceptions={state.dalExceptions}
                canEdit={props.canEdit}
                editAddProgramming={editAddProgramming}
                editAddSched={editAddSched}
                editAddException={editAddException}
                deleteSchedule={deleteSchedule}
                deleteException={deleteException}
                editDefaultMode={changeDefaultMode}
                defaultMode={props.defaultMode}
                handleHasEdited={changeHasEdited}
                isEditDAL={props.isEditDAL}
                isEditUtility={props.isEditUtility}
                illuminationId={illumId}
                larguraPage={state.larguraPage}
                saveUtilitySched={saveUtilitySched}
                deviceCode={deviceCode}
                getScheds={props.getScheds}
                exceededExceptionLimit={props.exceededExceptionLimit}
                setExceededExceptionLimit={props.setExceededExceptionLimit}
              />
            </ModalWindow>
          </div>
          )}
        </>
      ) : (
        <DALScheduleContent
          showExceptions={state.showExceptions}
          changeShowExceptions={changeShowExceptions}
          dalScheds={state.dalScheds}
          dalExceptions={state.dalExceptions}
          canEdit={props.canEdit}
          editAddProgramming={editAddProgramming}
          editAddSched={editAddSched}
          editAddException={editAddException}
          deleteSchedule={deleteSchedule}
          deleteException={deleteException}
          editDefaultMode={changeDefaultMode}
          defaultMode={props.defaultMode}
          handleHasEdited={changeHasEdited}
          isEditDAL={props.isEditDAL}
          isEditUtility={props.isEditUtility}
          illuminationId={illumId}
          larguraPage={state.larguraPage}
          saveUtilitySched={saveUtilitySched}
          deviceCode={deviceCode}
          getScheds={props.getScheds}
          exceededExceptionLimit={props.exceededExceptionLimit}
          setExceededExceptionLimit={props.setExceededExceptionLimit}
        />
      )}
      {(state.openModal === 'saving-confirmation') && (
      <ModalWindow style={{ padding: '0', overflowX: 'hidden', width: state.openModal === 'saving-confirmation' ? '550px' : '455px' }} borderTop onClickOutside={() => setState({ openModal: null, isLoading: false })}>
        {state.openModal === 'saving-confirmation'
          && (
            <Flex flexDirection="column" justifyContent="center" alignItems="center" padding="40px">
              <Box width="100%">
                <Flex>
                  <SmallWarningIcon />
                  <h4 style={{ fontWeight: 'bold', marginLeft: '10px' }}>{t('desejaSalvar')}</h4>
                </Flex>
                <ul style={{ color: '#8b8b8b', hyphens: 'auto' }}>
                  {Object.keys(state.dalSchedsToEdit).length !== 0 && <li>{t('alertaSubstituicaoSchedDal')}</li>}
                  {Object.keys(state.dalExceptsToDelete).length !== 0 && <li>{t('alertaSubstituicaoExceptDal')}</li>}
                </ul>
                <Flex marginTop="40px" alignItems="center" justifyContent="space-between">
                  <Button
                    style={{ width: '200px' }}
                    variant="primary"
                    onClick={sendToServer}
                  >
                    {t('prosseguir')}
                  </Button>
                  <UnderlineBtn onClick={() => setState({ openModal: null, isLoading: false })}>
                    {t('cancelar')}
                  </UnderlineBtn>
                </Flex>
              </Box>
            </Flex>
          )}
      </ModalWindow>
      )}
      {(state.modalEditSchedule) && (
      <div style={{ zIndex: 3 }}>
        <ModalWindow style={{ padding: '18px', width: '400px' }} borderTop onClickOutside={() => { setState({ modalEditSchedule: null }); }}>
          <DalSchedForm
            modalEditSchedule={state.modalEditSchedule}
            isException={false}
            loadingSet={state.loadingSet}
            onConfirm={saveEditNewSched}
            onCancel={() => { setState({ modalEditSchedule: null }); }}
            larguraPage={state.larguraPage}
          />
        </ModalWindow>
      </div>
      )}
      {(state.modalEditException) && (
      <div style={{ zIndex: 3 }}>
        <ModalWindow style={{ padding: '16px', width: '400px' }} borderTop onClickOutside={() => { setState({ modalEditException: null }); }}>
          <DalExceptionForm
            modalEditException={state.modalEditException}
            isException
            onConfirm={saveEditNewException}
            onCancel={() => { setState({ modalEditException: null }); }}
          />
        </ModalWindow>
      </div>
      )}
    </Flex>

  );
};

export function DALScheduleContent(props: {
  showExceptions: boolean,
  changeShowExceptions: (value: boolean) => void,
  dalScheds: null | ScheduleInfo[],
  dalExceptions: null | ExceptionInfo[],
  canEdit: boolean,
  editAddProgramming: (index: number) => void,
  editAddSched: (index: number, item?: ScheduleInfo) => void,
  deleteSchedule: (sched: ScheduleInfo, index: number) => void,
  editAddException: (index: number, item?: ExceptionInfo) => void,
  deleteException: (sched: ExceptionInfo, index: number) => void,
  editDefaultMode: (defaultMode: string, illuminationId: number) => void,
  defaultMode?: string,
  isEditDAL?: boolean,
  isEditUtility?: boolean,
  handleHasEdited: () => void,
  saveUtilitySched: () => void,
  getScheds?: (scheds, exceptions) => void,
  illuminationId: number,
  larguraPage: number,
  deviceCode: string,
  exceededExceptionLimit?: boolean
  setExceededExceptionLimit?: (value) => void,
}): JSX.Element {
  const match = useRouteMatch();
  const history = useHistory();
  const [state, render, setState] = useStateVar({
    defaultModeOpts: [
      { name: t('ligadoMinusculo'), value: '1' },
      { name: t('desligadoMinusculo'), value: '0' },
    ],
    linkBase: match.url.split('/analise')[0],
  });

  function handleDefaultMode(defaultMode:string, illuminationId: number) {
    props.editDefaultMode(defaultMode, illuminationId);
    render();
  }
  function hasEdited() {
    props.handleHasEdited();
    render();
  }

  function verifyExceptionLimit(exceptionList: null | ExceptionInfo[]) {
    if (exceptionList?.filter((sched) => !sched.DELETE).length === 8 && !props.exceededExceptionLimit && props.setExceededExceptionLimit) {
      props.setExceededExceptionLimit(true);
    }

    return !!props.exceededExceptionLimit;
  }

  return (
    <div style={{ minWidth: '20%', maxWidth: '900px' }}>
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
        {props.isEditDAL && (
          <Flex marginLeft="20px" flexDirection="column">
            <Select
              label={t('statusPadrao')}
              style={{ width: '200px', marginTop: '40px' }}
              options={state.defaultModeOpts}
              propLabel="name"
              value={state.defaultModeOpts.find((opt) => opt.value === props.defaultMode)}
              onSelect={(item) => {
                handleDefaultMode(item.value, props.illuminationId);
                hasEdited();
                render();
              }}
              hideSelected
            />
            <span style={{ marginTop: '10px', width: '300px', color: '#6D6D6D' }}>
              {t('selecioneStatusDefault')}
            </span>
          </Flex>
        )}

        {!props.isEditDAL && !props.isEditUtility && props.dalScheds && (
        <DefaultModeContainer>
          <Label>{t('statusPadrao')}</Label>
          <span>{props.dalScheds[0]?.DEFAULT_MODE === '1' ? t('ligadoMinusculo') : t('desligadoMinusculo')}</span>
        </DefaultModeContainer>

        )}

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
              backgroundColor: props.showExceptions ? '#f4f4f4' : 'transparent',
            }}
          />
          <span />
          <span
            style={{
              border: '1px solid lightgrey',
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0',
              backgroundColor: props.showExceptions ? 'transparent' : '#f4f4f4',
            }}
          />
          <span />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 6px 150px auto' }}>
          <span
            style={{
              borderRight: '1px solid lightgrey',
              borderLeft: '1px solid lightgrey',
              textAlign: 'center',
              fontSize: '90%',
              borderBottom: props.showExceptions ? '1px solid lightgrey' : 'none',
              backgroundColor: props.showExceptions ? '#f4f4f4' : 'transparent',
              cursor: props.showExceptions ? 'pointer' : undefined,
              fontWeight: props.showExceptions ? 'normal' : 'bold',
              padding: '4px 1px',
            }}
            onClick={() => {
              if (props.showExceptions) {
                props.changeShowExceptions(!props.showExceptions);
              }
            }}
          >
            {t('programacoes')}
          </span>
          <span
            style={{
              borderBottom: '1px solid lightgrey',
            }}
          />
          <span
            style={{
              borderLeft: '1px solid lightgrey',
              borderRight: '1px solid lightgrey',
              textAlign: 'center',
              fontSize: '90%',
              borderBottom: props.showExceptions ? 'none' : '1px solid lightgrey',
              backgroundColor: props.showExceptions ? 'transparent' : '#f4f4f4',
              cursor: (!props.showExceptions) ? 'pointer' : undefined,
              fontWeight: !props.showExceptions ? 'normal' : 'bold',
              padding: '4px 1px',
            }}
            onClick={() => {
              if (!props.showExceptions) {
                props.changeShowExceptions(!props.showExceptions);
              }
            }}
          >
            {t('excecoes')}
          </span>
          <span
            style={{
              borderBottom: '1px solid lightgrey',
            }}
          />
        </div>
      </Flex>
      <div style={{ border: '1px solid lightgrey', borderTop: 'none' }}>
        <div style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        >
          <span style={{ fontSize: '18px' }}>{`Total: ${(!props.showExceptions ? props.dalScheds?.filter((sched) => !sched.DELETE).length : props.dalExceptions?.filter((sched) => !sched.DELETE).length) || 0}`}</span>
          {props.canEdit && (
            <Button
              variant={props.showExceptions && verifyExceptionLimit(props.dalExceptions) ? 'disabled' : 'primary'}
              style={{ width: 'fit-content', padding: '6px 15px' }}
              onClick={() => props.editAddProgramming(0)}
            >
              {AddToltipIfDisabled(!!props.exceededExceptionLimit, props.showExceptions, t('botaoAdicionarProgramacaoExcecao', { value: !props.showExceptions ? t('Programação') : t('excecao') }))}
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
          {!props.showExceptions && props.dalScheds?.map((sched, index) => (
            sched.DELETE ? null : <SchedCard key={sched.ID} canEdit={props.canEdit} sched={sched} onEdit={() => props.editAddSched(index, sched)} onDelete={() => props.deleteSchedule(sched, index)} larguraPage={props.larguraPage} />
          ))}
          {props.showExceptions && props.dalExceptions && (
          <>
            <Flex
              flexDirection="row"
              style={{
                marginLeft: '10px',
                wordBreak: 'normal',
                width: '100%',
                marginRight: '10%',
                gap: '5px',
              }}
              justifyContent="space-between"
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  width: '167px',
                }}
              >
                {t('titulo')}
              </div>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '13px',
                  width: '76px',
                }}
              >
                {t('Data')}
              </div>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '13px',
                  width: '75px',
                }}
              >
                {t('repetirTodoAno')}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  width: '65px',
                }}
              >
                {t('inicio')}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  width: '70px',
                }}
              >
                {t('fim')}
              </div>
            </Flex>
            {props.dalExceptions?.map((exception, index) => (
              exception.DELETE ? null : (
                <Flex
                  key={exception.ID}
                  width="100%"
                  style={{
                    marginTop: '5px',
                  }}
                  flexDirection="column"
                >
                  <ExceptionSchedCard deviceCode={props.deviceCode} sched={exception} canEdit={props.canEdit} onEdit={() => props.editAddException(index, exception)} onDelete={() => props.deleteException(exception, index)} />
                </Flex>
              )
            ))}
          </>
          )}
        </div>
        <div style={{
          padding: '0px 20px 25px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        >
          {props.canEdit && !props.getScheds && (
            <>
              <Button
                variant="primary"
                style={{ width: 'fit-content', padding: '6px 15px', backgroundColor: '#363BC4' }}
                onClick={props.saveUtilitySched}
              >
                Salvar
              </Button>
              <BtnClean onClick={() => history.push(`${state.linkBase}/analise/utilitario/iluminacao/${props.illuminationId}/informacoes`)}>{t('cancelar')}</BtnClean>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function DalSchedForm(props: {
  modalEditSchedule: {
    addEdit: 'Add' | 'Edit'
    title: string
    active: boolean
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
    status: boolean
    index: number
  },
  loadingSet: boolean,
  onConfirm: (index) => void
  onCancel: () => void
  larguraPage: number
}): JSX.Element {
  const [state, render] = useStateVar({
    entireDay: (props.modalEditSchedule.start_time === '00:00' && props.modalEditSchedule.end_time === '23:59'),
  });

  const isEdit = props.modalEditSchedule.addEdit === 'Edit';

  function selectDay(day: string) {
    if (props.modalEditSchedule.selectedDays?.[day] !== undefined) {
      props.modalEditSchedule.selectedDays[day] = !props.modalEditSchedule.selectedDays[day];
      render();
    }
  }

  function renderButtons() {
    return (
      <>
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
          <Button variant={`${!props.loadingSet ? 'primary' : 'disabled'}`} style={{ width: '150px', backgroundColor: colors.BlueSecondary }} onClick={() => props.onConfirm(props.modalEditSchedule.index)}>
            {isEdit ? t('botaoSalvar') : t('botaoAdicionar')}
          </Button>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <span style={{ cursor: 'pointer', textDecoration: 'underline', color: colors.BlueSecondary }} onClick={props.onCancel}>{t('botaoCancelar')}</span>
        </div>
      </>
    );
  }

  function getName() {
    return t('editarAdicionarProgramacao', { value: isEdit ? t('editar') : t('botaoAdicionar') });
  }

  return (
    <div style={{ wordBreak: 'normal' }}>
      <div style={{ fontWeight: 'bold', fontSize: '120%' }}>{getName()}</div>
      <div style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
      >
        <div>
          <div style={{ fontWeight: 'bold' }}>{t('titulo')}</div>
          <Input
            style={{ minHeight: '0', width: '200px', padding: '8px' }}
            value={props.modalEditSchedule.title}
            placeholder={t('digiteUmTitulo')}
            onChange={(e) => { props.modalEditSchedule.title = e.target.value; render(); }}
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
        margin: '30px 0px 30px 0px',
        backgroundColor: colors.LightGrey_v3,
        borderRadius: '10px',
      }}
      />

      <div style={{ marginTop: '10px' }}>
        <div style={{ fontWeight: 'bold' }}>{t('selecioneDias')}</div>
        <div style={{
          display: 'flex', paddingTop: '10px', fontSize: '90%', flexWrap: 'wrap',
        }}
        >
          <WeekDayButton checked={props.modalEditSchedule.selectedDays?.sun || false} onClick={() => selectDay('sun')}>DOM</WeekDayButton>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays?.mon || false} onClick={() => selectDay('mon')}>SEG</WeekDayButton>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays?.tue || false} onClick={() => selectDay('tue')}>TER</WeekDayButton>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays?.wed || false} onClick={() => selectDay('wed')}>QUA</WeekDayButton>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays?.thu || false} onClick={() => selectDay('thu')}>QUI</WeekDayButton>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays?.fri || false} onClick={() => selectDay('fri')}>SEX</WeekDayButton>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays?.sat || false} onClick={() => selectDay('sat')}>SAB</WeekDayButton>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          marginTop: '10px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div>{t('horarioInicio')}</div>
          <Input
            style={{ width: '100px', padding: '5px', minHeight: '0' }}
            value={props.modalEditSchedule.start_time}
            error={props.modalEditSchedule.start_time_error}
            mask={[/[0-2]/, /\d/, ':', /[0-5]/, /\d/]}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { props.modalEditSchedule!.start_time = e.target.value; render(); }}
          />
        </div>
        <div>
          <div>{t('horarioTermino')}</div>
          <Input
            style={{ minHeight: '0', width: '100px', padding: '5px' }}
            value={props.modalEditSchedule.end_time}
            error={props.modalEditSchedule.end_time_error}
            mask={[/[0-2]/, /\d/, ':', /[0-5]/, /\d/]}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { props.modalEditSchedule!.end_time = e.target.value; render(); }}
          />
        </div>
        <Checkbox
          label={t('diaInteiro')}
          style={{ marginTop: '20px', justifyContent: 'flex-start' }}
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
        <div style={{ fontWeight: 'bold' }}>{t('status')}</div>
        <Flex justifyContent="space-between" style={{ marginTop: '10px' }}>
          <RadioButton label={t('iluminacaoLigada')} checked={props.modalEditSchedule.status === true} onClick={() => { props.modalEditSchedule.status = true; render(); }} checkedColor="blue" />
          <RadioButton label={t('iluminacaoDesligada')} checked={props.modalEditSchedule.status === false} onClick={() => { props.modalEditSchedule.status = false; render(); }} checkedColor="blue" />
        </Flex>
      </div>

      {renderButtons()}
    </div>
  );
}

export function DalExceptionForm(props: {
  modalEditException: {
    addEdit: 'Add' | 'Edit'
    title: string
    active: boolean
    start_time: string
    start_time_error: string
    end_time: string
    end_time_error: string
    exceptionDate: string;
    repeatYearly: boolean;
    status: boolean
    index: number
  },
  isException: boolean
  onConfirm: (index) => void
  onCancel: () => void
}): JSX.Element {
  const [state, render] = useStateVar({
    entireDay: (props.modalEditException.start_time === '00:00' && props.modalEditException.end_time === '23:59'),
    isLoading: false,
  });

  const isEdit = props.modalEditException.addEdit === 'Edit';

  function renderButtons() {
    return (
      <>
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
          <Button variant="primary" style={{ width: '150px', backgroundColor: colors.BlueSecondary }} onClick={() => props.onConfirm(props.modalEditException.index)}>
            {isEdit ? t('botaoSalvar') : t('botaoAdicionar')}
          </Button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <span style={{ cursor: 'pointer', textDecoration: 'underline', color: colors.BlueSecondary }} onClick={props.onCancel}>{t('botaoCancelar')}</span>
        </div>
      </>
    );
  }

  function getName() {
    return t('editarAdicionarExcecao', { value: isEdit ? t('editar') : t('botaoAdicionar') });
  }

  return (
    <div style={{ wordBreak: 'normal' }}>
      <div style={{ fontWeight: 'bold', fontSize: '120%' }}>{getName()}</div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '10px',
        flexWrap: 'wrap',
      }}
      >
        <div>
          <div style={{ fontWeight: 'bold' }}>{t('titulo')}</div>
          <Input
            style={{ width: '200px', padding: '8px', minHeight: '0' }}
            value={props.modalEditException.title}
            placeholder={t('digiteUmTitulo')}
            onChange={(e) => { props.modalEditException.title = e.target.value; render(); }}
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontWeight: 'bold' }}>{t('Programação')}</div>
          <div style={{ display: 'flex' }}>
            {props.modalEditException.active ? t('habilitada') : t('desabilitada')}
            <ToggleSwitchMini onOff checked={!props.modalEditException.active} style={{ marginLeft: '12px' }} onClick={() => { props.modalEditException.active = !props.modalEditException.active; render(); }} />
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
        <Flex
          flexDirection="column"
          style={{
            marginTop: '7px',
          }}
        >
          <Flex
            flexWrap="wrap"
            flexDirection="row"
            style={{ gap: 20 }}
          >
            <TextLine style={{ width: '199px' }}>
              <Input
                style={{ width: '199px' }}
                value={props.modalEditException.exceptionDate ?? ''}
                label=""
                mask={[/[0-3]/, /\d/, '/', /[0-1]/, /\d/, '/', /[2]/, /[0]/, /\d/, /\d/]}
                onChange={(e) => { props.modalEditException.exceptionDate = e.target.value; render(); }}
              />
            </TextLine>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <label
                onClick={() => {
                  props.modalEditException.repeatYearly = !props.modalEditException.repeatYearly;
                  render();
                }}
              >
                <Checkbox checked={props.modalEditException.repeatYearly}>
                  {props.modalEditException.repeatYearly ? <CheckboxIcon /> : null}
                </Checkbox>
              </label>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                {t('repetirTodoOAno')}
              </div>
            </div>
          </Flex>
          <p style={{
            fontStyle: 'italic', fontSize: 'small', marginTop: '20px', maxWidth: '370px', color: colors.Grey300,
          }}
          >
            {t('iluminacaoPermaneceraDesligadaIntervalosHorariosNaoDefinidos')}
          </p>
        </Flex>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          marginTop: '10px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div>{t('horarioInicio')}</div>
          <Input
            style={{ width: '100px', padding: '5px', minHeight: '0' }}
            value={props.modalEditException.start_time}
            error={props.modalEditException.start_time_error}
            mask={[/[0-2]/, /\d/, ':', /[0-5]/, /\d/]}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { props.modalEditException!.start_time = e.target.value; render(); }}
          />
        </div>
        <div>
          <div>{t('horarioTermino')}</div>
          <Input
            style={{ width: '100px', padding: '5px', minHeight: '0' }}
            value={props.modalEditException.end_time}
            error={props.modalEditException.end_time_error}
            mask={[/[0-2]/, /\d/, ':', /[0-5]/, /\d/]}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { props.modalEditException!.end_time = e.target.value; render(); }}
          />
        </div>
        <Checkbox
          label={t('diaInteiro')}
          style={{ justifyContent: 'flex-start', marginTop: '20px' }}
          checked={state.entireDay}
          onClick={() => {
            state.entireDay = !state.entireDay;
            if (state.entireDay) {
              props.modalEditException.start_time = '00:00';
              props.modalEditException.end_time = '23:59';
            } else {
              props.modalEditException.start_time = '';
              props.modalEditException.end_time = '';
            }
            render();
          }}
        />
      </div>

      <div style={{ marginTop: '10px' }}>
        <div style={{ fontWeight: 'bold' }}>{t('status')}</div>
        <Flex justifyContent="space-between" style={{ marginTop: '10px' }}>
          <RadioButton label={t('iluminacaoLigada')} checked={props.modalEditException.status === true} onClick={() => { props.modalEditException.status = true; render(); }} checkedColor="blue" />
          <RadioButton label={t('iluminacaoDesligada')} checked={props.modalEditException.status === false} onClick={() => { props.modalEditException.status = false; render(); }} checkedColor="blue" />
        </Flex>
      </div>

      {renderButtons()}
    </div>
  );
}

export function SchedCard(props: {
  sched: ScheduleInfo
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
  larguraPage: number
}): JSX.Element {
  const {
    sched, canEdit, onEdit, onDelete,
  } = props;
  const days = JSON.parse(sched.DAYS);

  function renderDivisionBorder() {
    return (
      <div style={{
        width: '100%',
        height: '1px',
        backgroundColor: colors.LightGrey_v3,
        borderRadius: '10px',
        margin: '20px 0px 10px 0px',
      }}
      />
    );
  }

  function formatDays(day) {
    if (props.larguraPage > 490) {
      return day;
    }
    return day[0];
  }

  function renderWeekDaysButtons(days) {
    return (
      <div style={{ display: 'flex', paddingTop: '10px', fontSize: '90%' }}>
        <WeekDayButton checked={days.sun} status={props.sched.ACTIVE}>{formatDays('DOM')}</WeekDayButton>
        <WeekDayButton checked={days.mon} status={props.sched.ACTIVE}>{formatDays('SEG')}</WeekDayButton>
        <WeekDayButton checked={days.tue} status={props.sched.ACTIVE}>{formatDays('TER')}</WeekDayButton>
        <WeekDayButton checked={days.wed} status={props.sched.ACTIVE}>{formatDays('QUA')}</WeekDayButton>
        <WeekDayButton checked={days.thu} status={props.sched.ACTIVE}>{formatDays('QUI')}</WeekDayButton>
        <WeekDayButton checked={days.fri} status={props.sched.ACTIVE}>{formatDays('SEX')}</WeekDayButton>
        <WeekDayButton checked={days.sat} status={props.sched.ACTIVE}>{formatDays('SAB')}</WeekDayButton>
      </div>
    );
  }

  function renderSchedStatus() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 'bold' }}>{t('programacao')}</div>
        <span>{sched.STATUS === '1' ? t('iluminacaoLigada') : t('iluminacaoDesligada')}</span>
      </div>
    );
  }

  function renderSchedTimes() {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            <span style={{ fontWeight: 'bold' }}>
              {t('inicio')}
              :&nbsp;
            </span>
            <span>
              {sched.BEGIN_TIME}
            </span>
          </div>
          <div>
            <span style={{ fontWeight: 'bold' }}>
              {t('fim')}
              :&nbsp;
            </span>
            <span>
              {sched.END_TIME}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SchedCardContainer>
      <Sidebar active={props.sched.ACTIVE} />
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '65%',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{sched.TITLE}</span>
            {canEdit && renderEditButtons(onEdit, onDelete)}
          </div>

          <div>
            <div style={{ fontWeight: 'bold' }}>{t('Programação')}</div>
            <div style={{ display: 'flex', color: props.sched.ACTIVE === '1' ? '#000' : '#B5B5B5' }}>
              {sched.ACTIVE === '1' ? t('habilitada') : t('desabilitada')}
            </div>
          </div>
        </div>

        {renderDivisionBorder()}

        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', color: props.sched.ACTIVE === '1' ? '#000' : '#B5B5B5',
        }}
        >
          <span disabled style={{ fontWeight: 'bold', fontSize: '14px' }}>{t('status')}</span>
          <div style={{
            display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '6px',
          }}
          >
            {renderSchedStatus()}
            {renderSchedTimes()}
          </div>
        </div>
        <div style={{ marginTop: '10px' }}>
          {days && renderWeekDaysButtons(days)}
        </div>
      </div>
    </SchedCardContainer>
  );
}

export const ExceptionSchedCard = (props: {
  sched: ExceptionInfo
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
  deviceCode?: string
}): JSX.Element => {
  const {
    sched, canEdit, onEdit, onDelete, deviceCode,
  } = props;

  return (
    <Flex
      flexWrap="nowrap"
      flexDirection="row"
      height="32px"
      width="100%"
      style={{
        borderTop: '1px solid #D7D7D7',
        borderRight: '1px solid #D7D7D7',
        borderBottom: '1px solid #D7D7D7',
        borderLeft: `10px solid ${sched.ACTIVE === '1' ? '#363BC4' : colors.Grey200}`,
        borderRadius: '5px',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 10px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          width: '151px',
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          direction: 'ltr',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{sched.TITLE}</span>
      </div>
      <div
        style={{
          marginTop: '5px',
          fontSize: '12px',
          width: '70px',
          wordWrap: 'unset',
        }}
      >
        {sched.EXCEPTION_DATE.substring(0, sched.REPEAT_YEARLY === '1' ? 5 : 10)}
      </div>
      <div
        style={{
          marginTop: '5px',
          fontSize: '12px',
          width: '70px',
        }}
      >
        {`${sched.REPEAT_YEARLY === '1' && (!deviceCode || deviceCode.startsWith('DAL')) ? t('sim') : t('nao')}`}
      </div>
      <div
        style={{
          marginTop: '5px',
          fontSize: '12px',
          width: '52px',
        }}
      >
        {sched.BEGIN_TIME}
      </div>
      <div
        style={{
          marginTop: '5px',
          fontSize: '12px',
          width: '52px',
        }}
      >
        {sched.END_TIME}
      </div>
      {canEdit && renderEditButtons(onEdit, onDelete)}
    </Flex>
  );
};

function renderEditButtons(onEdit: () => void, onDelete: () => void) {
  return (
    <div style={{ display: 'flex' }}>
      <Button
        style={{
          width: 'fit-content',
          marginRight: '5px',
          padding: '0px',
          border: '0px',
          backgroundColor: 'white',
        }}
        onClick={onEdit}
      >
        <EditIcon color={colors.Blue300} />
      </Button>
      <Button
        style={{
          width: 'fit-content',
          padding: '0px',
          border: '0px',
          backgroundColor: 'white',
        }}
        onClick={onDelete}
      >
        <SmallTrashIcon color="red" />
      </Button>
    </div>
  );
}

export function AddToltipIfDisabled(disabled: boolean, isException: boolean, text): JSX.Element {
  const warnMessage = t('limiteCadastroExcecoesAtingido');
  return (
    <>
      { disabled && isException ? (
        <div data-tip={warnMessage} data-for={`tooltip-${text}`}>
          {text}
          <ReactTooltip
            id={`tooltip-${text}`}
            place="top"
            effect="solid"
            delayHide={100}
            textColor="#000000"
            border
            backgroundColor="rgba(256, 256, 256, 1)"
          />
        </div>

      ) : (
        text
      )}
    </>
  );
}
