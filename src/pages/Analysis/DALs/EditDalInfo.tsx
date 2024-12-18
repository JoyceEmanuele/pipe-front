import { useEffect } from 'react';
import { Box, Flex } from 'reflexbox';
import { useHistory, useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AssetStatus } from '~/components/AssetStatus';
import {
  Button, Loader, ModalWindow,
} from '~/components';
import {
  Title,
  InfoItem,
  BtnClean,
  CustomInput,
  Label,
  ButtonAddAssociationsDal,
} from './styles';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { useTranslation, Trans } from 'react-i18next';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from '~/providers';
import {
  UtilityIcon,
} from 'icons';
import { SelectDMTport } from 'components/SelectDmtPort';
import { SmallTrashIcon } from '~/icons/Trash';
import { DALSchedule, ExceptionInfo, ScheduleInfo } from '../SchedulesModals/DAL_Schedule';
import { RouterEditDal } from './RouterEditDal';
import { SmallWarningIcon } from '~/icons/WarningIcon';
import { UnderlineBtn } from '../Units/UnitProfile/styles';

export const EditDalInfo = ({ dalInfo }): JSX.Element => {
  const match = useRouteMatch<{ devId: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    devId: dalInfo.DEV_ID,
    larguraPage: window.innerWidth,
    dalInfo,
    linkBase: match.url.split(`/${match.params.devId}`)[0],
    illuminationList: dalInfo.dal.illuminationList,
    ports: [] as {
      label: string,
      associated: boolean,
      port: number,
      illuminationId?: number,
    }[],
    feedbacks: [] as {
      label: string,
      associated: boolean,
      port: number,
      illuminationId?: number,
    }[],
    openModal: null as null | string,
    clientsOpts: [] as { name: string, value: number|string }[],
    selectedClient: dalInfo.CLIENT_ID || null as any,
    unitsOpts: [] as { name: string, value: number|string }[],
    selectedUnit: dalInfo.UNIT_ID || null as any,
    utilitiesOpts: [] as { name: string, value: number|string }[],
    selectedUtility: null as any,
    selectedPort: null as null|{ port: number, associated: boolean, illuminationId?: number },
    selectedFeedback: null as null|{ port: number, associated: boolean, illuminationId?: number },
    replaceIllum: null as any,
    clientChanged: false,
    unitChanged: false,
    isLoading: false,
    deletionList: [] as { ILLUMINATION_ID: number, NAME: string, UNIT_ID: number }[],
    illuminationScheds: {} as {[illumId: number]: { scheds: ScheduleInfo[], exceptions: ExceptionInfo[] }},
    hasEdited: false as boolean,
    dalSchedsToEdit: { } as {[key: string]: {[key: string]: {schedId: number, delete: boolean, days: string}[]}},
    dalExceptsToDelete: { } as {[key: string]: {[key: string]: number[]}},
    illumsWithConflict: [] as string[],
  });

  const fetchClientData = async () => {
    try {
      setState({ isLoading: true });
      if (!state.clientsOpts.length) {
        const { list: clients } = await apiCall('/clients/get-clients-list', {});
        state.clientsOpts = clients.map((client) => ({ name: client.NAME, value: client.CLIENT_ID }));
      }
      if ((state.selectedClient && !state.unitsOpts.length) || state.clientChanged) {
        const { list: units } = await apiCall('/clients/get-units-list-basic', { CLIENT_ID: state.selectedClient });
        state.unitsOpts = units.map((units) => ({ name: units.UNIT_NAME, value: units.UNIT_ID }));
        state.clientChanged = false;
      }
      if ((state.selectedUnit && !state.utilitiesOpts.length) || state.unitChanged) {
        const illuminations = await apiCall('/dal/get-dal-illumination-list', { clientIds: [state.selectedClient] });
        const nonAssociatedIllums = illuminations.filter((illum) => illum.UNIT_ID === state.selectedUnit && !illum.DAL_CODE);
        state.utilitiesOpts = nonAssociatedIllums.map((item) => ({ ...item, name: item.NAME, value: item.ID }));
        state.unitChanged = false;
      }
      render();
    } catch (err) {
      console.log(err);
      toast.error('Houve erro');
    }
    setState({ isLoading: false });
  };

  function isOverLimit() {
    return state.illuminationList.length > 3;
  }

  async function getDalPortsInfo() {
    const clientId = dalInfo.CLIENT_ID || state.selectedClient;
    if (clientId) {
      const portsInfo = await apiCall('/dal/get-dal-ports-info', { DAL_CODE: state.devId, CLIENT_ID: dalInfo.CLIENT_ID || state.selectedClient });
      const feedbackPorts = portsInfo.feedbacks.map((x) => ({ ...x, label: 'F'.concat(x.label) }));
      const illuminationList = state.illuminationList.map((illum) => ({
        ...illum,
        PORT: portsInfo.ports.find((x) => x.port === illum.PORT),
        FEEDBACK: feedbackPorts.find((x) => x.port === illum.FEEDBACK),
      }));
      setState({
        ...state,
        ports: portsInfo.ports,
        feedbacks: feedbackPorts,
        illuminationList,
      });
    }
  }

  useEffect(() => {
    fetchClientData();
  }, [state.selectedClient, state.selectedUnit]);

  document.body.onresize = function () {
    setState({ larguraPage: document.body.clientWidth });
  };

  useEffect(() => {
    getDalPortsInfo();
  }, [state.selectedClient]);

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
    });
    render();

    let foundConflict = false;

    for (const [illumId, { scheds, exceptions }] of Object.entries(state.illuminationScheds)) {
      const illum = state.illuminationList.find((illum) => illum.ILLUMINATION_ID === Number(illumId));
      try {
        // validar só persistidos/editados
        // @ts-ignore
        const checkJustPersistedAndEditedCards = checkDalSchedsCardsConflicts(scheds.filter((sched) => !sched.DELETE && !sched.INSERT));
        if (checkJustPersistedAndEditedCards.hasConflict) throw new Error('');
      } catch (err) {
        foundConflict = true;
        if (!state.illumsWithConflict.includes(illumId)) {
          state.illumsWithConflict.push(illumId);
          render();
        }
        console.log(err);
        toast.error(`Não será possível salvar as programações ${illum.NAME}. Alguns conflitos foram encontrados entre as programações já existentes e as programações já existentes que foram editadas.`);
      }

      try {
        // validar só novos
        // @ts-ignore
        const checkJustNewCards = checkDalSchedsCardsConflicts(scheds.filter((sched) => sched.INSERT && !sched.DELETE));
        if (checkJustNewCards.hasConflict) throw new Error('');
      } catch (err) {
        foundConflict = true;
        if (!state.illumsWithConflict.includes(illumId)) {
          state.illumsWithConflict.push(illumId);
          render();
        }
        console.log(err);
        toast.error(`Não será possível salvar as programações ${illum.NAME}. Alguns conflitos foram encontrados entre as programações novas inseridas.`);
      }

      try {
        // validar só persistidos/editados
        // @ts-ignore
        const checkJustPersistedAndEditedCards = checkDalCardsExceptsConflicts(exceptions.filter((except) => !except.DELETE && !except.INSERT));
        if (checkJustPersistedAndEditedCards.hasConflict) throw new Error('');
      } catch (err) {
        foundConflict = true;
        if (!state.illumsWithConflict.includes(illumId)) {
          state.illumsWithConflict.push(illumId);
          render();
        }
        console.log(err);
        toast.error(`Não será possível salvar as exceções ${illum.NAME}. Alguns conflitos foram encontrados entre as exceções já existentes e as exceções já existentes que foram editadas.`);
      }

      try {
        // validar só novos
        // @ts-ignore
        const checkJustNewCards = checkDalCardsExceptsConflicts(exceptions.filter((except) => except.INSERT && !except.DELETE));
        if (checkJustNewCards.hasConflict) throw new Error('');
      } catch (err) {
        foundConflict = true;
        if (!state.illumsWithConflict.includes(illumId)) {
          state.illumsWithConflict.push(illumId);
          render();
        }
        console.log(err);
        toast.error(`Não será possível salvar as exceções ${illum.NAME}. Alguns conflitos foram encontrados entre as exceções novas inseridas.`);
      }
    }

    // verificar o retorno

    // validate and save
    for (const [illumId, { scheds, exceptions }] of Object.entries(state.illuminationScheds)) {
      const illum = state.illuminationList.find((illum) => illum.ILLUMINATION_ID === Number(illumId));
      if (state.illumsWithConflict.includes(illumId)) continue;
      try {
        await validateDalScheds(state.devId, Number(illumId), scheds, exceptions);
      } catch (err) {
        console.log(err);
        toast.error(`Não será possível salvar programações/exceções ${illum.NAME || ''}.`);
      }
    }
    render();

    if (foundConflict && state.illuminationList.length === state.illumsWithConflict.length) {
      setState({
        isLoading: false,
      });
      render();
      return false;
    }
    // setState({
    //   isLoading: false,
    // });
    return true;
  };

  const formatStringToDate = (str: string) => (`${str.substring(6, 10)}-${str.substring(3, 5)}-${str.substring(0, 2)}`);

  async function saveDalInfo() {
    let success = true;
    state.openModal = null;
    render();
    const illumErrors: number[] = [];
    try {
      // Desassocia iluminações que já estavam associadas
      for (const removed of state.deletionList) {
        try {
          await apiCall('/dal/set-dal-illumination', {
            ID: removed.ILLUMINATION_ID,
            NAME: removed.NAME,
            PORT: null,
            FEEDBACK: null,
            UNIT_ID: removed.UNIT_ID,
          });
        } catch (err) {
          success = false;
          console.log(err);
          toast.error(t('naoFoiPossivelDesassociarDevice', { device: removed.NAME }));
        }
      }

      // Edita associações de iluminações ou adiciona
      for (const ilumn of state.illuminationList) {
        try {
          const currIllumInfo = await apiCall('/dal/get-illumination-info', { ILLUMINATION_ID: ilumn.ILLUMINATION_ID });
          if (currIllumInfo.NAME !== ilumn.NAME
            || currIllumInfo.UNIT_ID !== ilumn.UNIT_ID
            || currIllumInfo.PORT !== ilumn.PORT?.port
            || currIllumInfo.FEEDBACK !== ilumn.FEEDBACK?.port
            || currIllumInfo.DEFAULT_MODE !== ilumn.DEFAULT_MODE
            || currIllumInfo.DAL_CODE !== state.devId
          ) {
            await apiCall('/dal/set-dal-illumination', {
              ID: ilumn.ILLUMINATION_ID,
              DAL_CODE: state.devId,
              NAME: ilumn.NAME,
              UNIT_ID: ilumn.UNIT_ID,
              PORT: ilumn.PORT?.port || null,
              FEEDBACK: ilumn.FEEDBACK?.port || null,
              DEFAULT_MODE: ilumn.DEFAULT_MODE || null,
            });
          }
        } catch (err) {
          illumErrors.push(ilumn.ILLUMINATION_ID);
          success = false;
          console.log(err);
          toast.error(t('naoFoiPossivelSalvarInfoDevice', { device: ilumn.NAME }));
        }
      }

      // Atualiza as programações necessárias
      for (const [illumId, { scheds, exceptions }] of Object.entries(state.illuminationScheds)) {
        if (illumErrors.includes(Number(illumId))) {
          continue;
        }

        const illum = state.illuminationList.find((illum) => illum.ILLUMINATION_ID === Number(illumId));
        const defaultIllum = dalInfo.dal.illuminationList.find((illumination) => illumination.ILLUMINATION_ID === Number(illumId));

        if (state.illumsWithConflict.includes(illumId)) {
          toast.error(`Como avisado previamente, não será possível salvar as programações/exceções do ${illum.NAME}. O utilitário foi ignorado, atenção aos conflitos de programação/exceção.`);
          continue;
        }

        const schedsToEdit = state.dalSchedsToEdit?.[state.devId]?.[illumId];
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
        for (const sched of scheds) {
          const editInfo = schedsToEdit?.find((s) => s.schedId === sched.ID);
          if ((editInfo?.delete || sched.DELETE) && !sched.ID) continue;

          schedsToSend.push({
            DAL_CODE: state.devId,
            ILLUMINATION_ID: Number(illumId),
            SCHED_ID: sched.ID,
            TITLE: sched.TITLE,
            ACTIVE: sched.ACTIVE,
            BEGIN_TIME: sched.BEGIN_TIME,
            END_TIME: sched.END_TIME,
            DAYS: editInfo?.days || sched.DAYS,
            STATUS: sched.STATUS,
            INSERT: (editInfo?.delete || sched.DELETE) ? false : sched.INSERT,
            EDIT: (editInfo?.delete || sched.DELETE || sched.INSERT) ? false : (!!editInfo || sched.EDIT || illum.DEFAULT_MODE !== defaultIllum?.DEFAULT_MODE),
            DELETE: editInfo?.delete ? true : sched.DELETE, // ajustar
          });
        }

        const exceptsToDelete = state.dalExceptsToDelete?.[state.devId]?.[illumId];
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

        for (const except of exceptions) {
          const hasToDelete = !!exceptsToDelete?.find((e) => e === except.ID);
          exceptsToSend.push({
            EXCEPTION_ID: except.ID,
            DAL_CODE: state.devId,
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
            EDIT: (hasToDelete || except.DELETE || except.INSERT) ? false : (except.EDIT || illum.DEFAULT_MODE !== defaultIllum?.DEFAULT_MODE),
          });
        }

        try {
          await apiCall('/dal/handle-multiple-illumination-sched', {
            ILLUMINATION_ID: illum.ILLUMINATION_ID, DAL_CODE: illum.DAL_CODE, SCHEDS: schedsToSend, EXCEPTIONS: exceptsToSend,
          });
        } catch (err) {
          success = false;
          console.log(err);
          toast.error(`Não foi possível salvar programações ${illum.NAME || ''}`);
        }
      }

      if (success) {
        history.push(`${state.linkBase}/${state.devId}/informacoes`);
        toast.success(t('sucessoSalvar'));
      }
      setState({ isLoading: false, illumsWithConflict: [] });
    } catch (err) {
      console.log(err);
      toast.error(t('erroSalvarInfo'));
      setState({ isLoading: false, illumsWithConflict: [] });
    }
    state.hasEdited = false;
    setState({ isLoading: false, illumsWithConflict: [] });
  }

  function clearForm() {
    state.selectedUtility = null;
    state.selectedPort = null;
    state.selectedFeedback = null;
    // handleHasEdited();
  }

  async function associateNewIllumination() {
    if (state.replaceIllum) handleRemoveIllum(state.replaceIllum.ILLUMINATION_ID);
    const utilIndex = state.utilitiesOpts.findIndex((opt) => opt.value === state.selectedUtility);
    const selectedUtility = utilIndex > -1 ? state.utilitiesOpts.splice(utilIndex, 1)[0] : null;
    if (selectedUtility) {
      state.illuminationList.push({
        ...selectedUtility,
        ILLUMINATION_ID: selectedUtility.value,
        DAL_CODE: state.devId,
        PORT: state.selectedPort ?? null,
        FEEDBACK: state.selectedFeedback ?? null,
        UNIT_ID: state.selectedUnit,
        isNew: true,
      });
      if (state.selectedPort) {
        state.selectedPort.associated = true;
        state.selectedPort.illuminationId = Number(selectedUtility.value);
      }
      if (state.selectedFeedback) {
        state.selectedFeedback.associated = true;
        state.selectedFeedback.illuminationId = Number(selectedUtility.value);
      }
      state.deletionList = state.deletionList.filter((x) => x.ILLUMINATION_ID !== selectedUtility.value);
    }
    openModal(null);
    handleHasEdited();
  }

  function openModal(shouldOpen: string | null, illum?) {
    if (illum) {
      state.replaceIllum = illum;
      state.selectedUtility = illum.ILLUMINATION_ID;
      state.selectedPort = illum.PORT;
      state.selectedFeedback = illum.FEEDBACK;
    } else {
      state.replaceIllum = null;
      clearForm();
    }
    state.openModal = shouldOpen ? 'edit-utilities' : null;
    render();
  }
  function handlePortChange(illumId, type, oldPort, selectedPort) {
    const old = state[type]?.find((port) => port.port === oldPort);
    if (old) {
      old.associated = false;
      old.illuminationId = undefined;
    }
    const selected = state[type]?.find((port) => port.port === selectedPort);
    if (selected) {
      selected.associated = true;
      selected.illuminationId = illumId;
    }
    handleHasEdited();
    render();
  }

  function handleRemoveIllum(illumId) {
    const illumIndex = state.illuminationList.findIndex((x) => x.ILLUMINATION_ID === illumId);
    const removedIllum = illumIndex > -1 ? state.illuminationList.splice(illumIndex, 1)[0] : null;
    if (removedIllum) {
      delete state.illuminationScheds[removedIllum.ILLUMINATION_ID];
      state.utilitiesOpts.push({ ...removedIllum, name: removedIllum.NAME, value: removedIllum.ILLUMINATION_ID });
      if (dalInfo.dal.illuminationList.find((illum) => illum.ILLUMINATION_ID === removedIllum.ILLUMINATION_ID)) {
        state.deletionList.push(removedIllum);
      }
    }
    handleHasEdited();
    render();
  }

  function handleSchedChanges(illumId, scheds, exceptions) {
    state.illuminationScheds[illumId] = {
      scheds,
      exceptions,
    };
    render();
  }

  function editDefaultMode(defaultMode, illuminationId) {
    state.illuminationList.map((illum) => {
      if (illum.ILLUMINATION_ID === illuminationId) {
        illum.DEFAULT_MODE = defaultMode;
      }
    });
    render();
  }

  function handleHasEdited() {
    state.hasEdited = true;
    render();
  }

  const handleSaveSched = async () => {
    try {
      const valid = await validateScheds();
      render();
      if (valid) {
        state.openModal = 'saving-confirmation';
        render();
      }
    } catch (err) {
      console.log(err);
      setState({ isLoading: false });
    }
  };

  return (
    <>
      <Flex flexDirection="row" width="100%" marginTop="10px" flexWrap="wrap" justifyContent="space-between" fontSize="13px" padding="20px">
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
                        onClick={saveDalInfo}
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
        {state.openModal === 'edit-utilities' && (
          <ModalWindow borderTop onClickOutside={() => openModal(null)} style={{ width: '600px', padding: 20 }}>
            <Flex flexDirection="column">
              <span style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>{`${state.replaceIllum ? t('substituir') : t('adicionar')} ${t('utilitario')}`}</span>
              <CustomInput style={{ width: '100%', marginBottom: '20px' }}>
                <div style={{ width: '100%', paddingTop: 3, zIndex: 3 }}>
                  <Label>{t('cliente')}</Label>
                  <SelectSearch
                    options={state.clientsOpts}
                    value={state.selectedClient}
                    onChange={(item) => { state.selectedClient = item; state.clientChanged = true; render(); }}
                    search
                    filterOptions={fuzzySearch}
                    placeholder={t('selecioneCliente')}
                    closeOnSelect
                    disabled={!!state.selectedClient && state.illuminationList.length}
                  />
                </div>
              </CustomInput>
              <CustomInput style={{ width: '100%', marginBottom: '20px' }}>
                <div style={{ width: '100%', paddingTop: 3, zIndex: 2 }}>
                  <Label>{t('unidade')}</Label>
                  <SelectSearch
                    options={state.unitsOpts}
                    value={state.selectedUnit}
                    onChange={(item) => { state.selectedUnit = item; state.unitChanged = true; render(); }}
                    search
                    filterOptions={fuzzySearch}
                    placeholder={t('selecioneUnidade')}
                    closeOnSelect
                    disabled={!!state.selectedUnit && state.illuminationList.length}
                  />
                </div>
              </CustomInput>

              <Flex mb={20} justifyContent="space-between" flexWrap="wrap" style={{ gap: 10 }}>
                <CustomInput style={{ minWidth: '200px' }}>
                  <div style={{ width: '100%', paddingTop: 3, zIndex: 1 }}>
                    <Label>{t('utilitario')}</Label>
                    <SelectSearch
                      options={state.utilitiesOpts}
                      value={state.selectedUtility}
                      onChange={(item) => { state.selectedUtility = item; render(); }}
                      search
                      filterOptions={fuzzySearch}
                      placeholder={t('selecionar')}
                      closeOnSelect
                    />
                  </div>
                </CustomInput>

                <div style={{ minWidth: '45%' }}>
                  <SelectDMTport
                    label={t('portaDoDal')}
                    placeholder={t('selecionar')}
                    options={state.ports}
                    propLabel="label"
                    value={state.selectedPort ?? ''}
                    hideSelected
                    disabled={state.replaceIllum}
                    onSelect={(item) => {
                      state.selectedPort = item;
                      render();
                    }}
                    style={{
                      width: '100%',
                    }}
                  />
                </div>

                <div style={{ minWidth: '45%' }}>
                  <SelectDMTport
                    label={t('feedbackDoDal')}
                    placeholder={t('selecionar')}
                    options={state.feedbacks}
                    propLabel="label"
                    value={state.selectedFeedback ?? ''}
                    hideSelected
                    disabled={state.replaceIllum}
                    onSelect={(item) => {
                      state.selectedFeedback = item;
                      render();
                    }}
                  />
                </div>
              </Flex>

              <Flex justifyContent="space-between" alignItems="center">
                <BtnClean onClick={() => openModal(null)}>{t('botaoFechar')}</BtnClean>

                <Button
                  style={{ maxWidth: '100px' }}
                  onClick={associateNewIllumination}
                  variant="primary"
                >
                  {`${t('adicionar')}`}
                </Button>
              </Flex>
            </Flex>
          </ModalWindow>
        )}
        {state.isLoading && <Loader />}
        {!state.isLoading && (

          <Flex width="100%" flexDirection="column" flex="wrap">
            <Flex flexWrap="wrap" style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
              <Flex flexDirection="column">
                <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: '14px' }}>{t('dispositivo')}</span>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>{state.devId}</span>
              </Flex>
              <AssetStatus
                key={state.devId}
                DUT_ID={null}
                DEV_AUT={state.devId}
                DEV_ID={state.devId}
                isAutomation
                withoutMarginTop
                onlyIcon={state.larguraPage <= 767}
              />
            </Flex>

            <Flex justifyContent="space-between">
              <Flex flexDirection="column" flexWrap="wrap" mb="10px" mt="20px">
                <Title>{t('informacoes')}</Title>
                <Flex flexWrap="wrap" style={{ gap: 10 }}>
                  <InfoItem>
                    <b>{t('estado')}</b>
                    <br />
                    {state.dalInfo.STATE_ID || '-'}
                  </InfoItem>

                  <InfoItem>
                    <b>{t('cidade')}</b>
                    <br />
                    {state.dalInfo.CITY_NAME || '-'}
                  </InfoItem>

                  <InfoItem>
                    <b>{t('cliente')}</b>
                    <br />
                    {state.dalInfo.CLIENT_NAME || '-'}
                  </InfoItem>

                  <InfoItem>
                    <b>{t('unidade')}</b>
                    <br />
                    {state.dalInfo.UNIT_NAME || '-'}
                  </InfoItem>
                </Flex>
              </Flex>
            </Flex>

            <div style={{ border: '1px solid #DEDEDE' }} />

            <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Flex flexDirection="column" flexWrap="wrap" mb="10px" mt="20px">
                <Title>{t('associacoes')}</Title>
                <Flex flexWrap="wrap">
                  <InfoItem style={{ width: 'fit-content' }}>
                    <b>{t('utilitariosAssociados')}</b>
                    <br />
                    {state.illuminationList.length === 1 && `${state.illuminationList.length} ${t('utilitario')}`}
                    {state.illuminationList.length > 1 && `${state.illuminationList.length} ${t('utilitarios')}`}
                    {!state.illuminationList.length && t('nenhumUtilitarioAssociado')}
                  </InfoItem>
                </Flex>
              </Flex>

              <ButtonAddAssociationsDal>
                <Button
                  onClick={() => openModal('edit-utilities')}
                  variant={isOverLimit() ? 'disabled' : 'primary'}
                  disabled={isOverLimit()}
                >
                  {`${t('adicionar')}`}
                </Button>

                {isOverLimit() && (
                  <InfoItem style={{ width: '100%', textAlign: 'center' }}>
                    <Trans
                      i18nKey="limiteMaximoUtilitariosDal"
                    >
                      <b>Limite máximo</b>
                      de 4 utilitários por DAL já atingido
                    </Trans>
                  </InfoItem>
                )}
              </ButtonAddAssociationsDal>
            </Flex>

            {!state.illuminationList.length && (
              <Flex
                justifyContent="center"
                alignItems="center"
                style={{
                  width: '100%', border: '1px solid #0000000F', borderRadius: '10px', height: '145px',
                }}
              >
                <div style={{ width: '15%', textAlign: 'center' }}>{t('nenhumUtilitarioAssociadoDal')}</div>
              </Flex>
            )}

            {state.illuminationList?.map((illum) => (
              <IllumItem
                dalCode={state.devId}
                key={illum.ID}
                illumInfo={illum}
                portsList={state.ports}
                handlePortChange={handlePortChange}
                feedbacksList={state.feedbacks}
                schedChanges={handleSchedChanges}
                handleRemoveIllum={handleRemoveIllum}
                replace={openModal}
                handleDefaultMode={editDefaultMode}
                handleHasEdited={handleHasEdited}
                larguraPage={state.larguraPage}
              />
            ))}

            <Flex mt={20} justifyContent="space-between" alignItems="center">
              <Button
                style={{ width: '150px' }}
                onClick={handleSaveSched}
                variant="primary"
              >
                {`${t('salvar')}`}
              </Button>

              <BtnClean style={{ fontSize: '14px' }} onClick={() => history.push(`${state.linkBase}/${state.devId}/informacoes`)}>{t('cancelar')}</BtnClean>
            </Flex>
          </Flex>
        )}
        <RouterEditDal
          when={state.hasEdited}
          onSave={async () => { await saveDalInfo(); state.hasEdited = false; return true; }}
          onQuit={() => { state.hasEdited = false; render(); return true; }}
        />
      </Flex>
    </>
  );
};

const IllumItem = ({
  dalCode, illumInfo, portsList, handlePortChange, feedbacksList, handleRemoveIllum, schedChanges, replace, handleDefaultMode, handleHasEdited, larguraPage,
}): JSX.Element => {
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    loading: false,
    portsList,
    feedbacksList,
    exceededExceptionLimit: false,
  });

  function filterIllumPortOpts(illumId) {
    const opts = state.portsList.map((port) => ({
      ...port,
      associated: port.illuminationId === illumId ? false : port.associated,
    }));
    return opts;
  }

  function filterIllumFeedbackOpts(illumId) {
    const opts = state.feedbacksList.map((port) => ({
      ...port,
      associated: port.illuminationId === illumId ? false : port.associated,
    }));
    return opts;
  }

  async function clearPort() {
    handlePortChange(illumInfo.ILLUMINATION_ID, 'ports', illumInfo.PORT?.port);
    handlePortChange(illumInfo.ILLUMINATION_ID, 'feedbacks', illumInfo.FEEDBACK?.port);
    illumInfo.PORT = null;
    illumInfo.FEEDBACK = null;
  }

  async function removeIllumAssociation() {
    clearPort();
    handleRemoveIllum(illumInfo.ILLUMINATION_ID);
  }

  function handleSchedChanges(scheds, exceptions) {
    schedChanges(illumInfo.ILLUMINATION_ID, scheds, exceptions);
  }

  function editDefaultMode(defaultMode, illuminationId) {
    handleDefaultMode(defaultMode, illuminationId);
  }

  function changeHasEdited() {
    handleHasEdited();
  }

  return (
    <Flex flexDirection="column">
      <Flex justifyContent="space-between" flexDirection={larguraPage > 767 ? 'row' : 'column'}>
        <Flex width={larguraPage > 767 ? '70%' : '100%'} style={{ position: 'relative' }}>
          <UtilityIcon />
          <Flex flexDirection="column" ml={10} marginBottom={10}>
            <Link
              style={{ color: 'black', fontWeight: 'bold', textDecoration: 'underline' }}
              to={`/analise/utilitario/iluminacao/${illumInfo.ILLUMINATION_ID}/informacoes`}
            >
              {illumInfo.NAME}
            </Link>
            <BtnClean style={{ marginTop: '2px', marginBottom: '7px' }} onClick={() => replace(true, illumInfo)}>{t('substituir')}</BtnClean>
          </Flex>
          {
            larguraPage <= 767 && (
              <div
                style={{
                  position: 'absolute', top: 0, right: 0,
                }}
              >
                <SmallTrashIcon style={{ alignSelf: 'initial', cursor: 'pointer', margingTop: 5 }} onClick={removeIllumAssociation} color="red" disabled={state.loading} />
              </div>
            )
          }
        </Flex>
        <Flex width="100%" justifyContent={larguraPage > 767 ? 'flex-end' : 'space-between'} style={{ gap: 20, paddingRight: 10, marginRight: 20 }} flexWrap="wrap">
          <Flex flexDirection="column" minWidth="38px" marginRight={20}>
            {illumInfo.PORT && (
              <DALSchedule deviceCode={dalCode} illumName={illumInfo.NAME} illumId={illumInfo.ILLUMINATION_ID} canEdit isModal getScheds={handleSchedChanges} editDefaultMode={editDefaultMode} defaultMode={illumInfo.DEFAULT_MODE} handleHasEdited={changeHasEdited} isEditDAL onlyIcon={larguraPage <= 767} styledIcon={larguraPage <= 767} exceededExceptionLimit={state.exceededExceptionLimit} setExceededExceptionLimit={(value: boolean) => { setState({ exceededExceptionLimit: value }); render(); }} />
            )}
          </Flex>
          <Flex alignSelf="flex-end" style={{ gap: 10, width: larguraPage > 437 ? 'auto' : '100%' }}>
            <Flex flexDirection="column" style={{ minWidth: '100px', width: larguraPage > 437 ? '150px' : '100%' }}>
              <SelectDMTport
                label={larguraPage > 437 ? t('portaDoDal') : t('porta')}
                placeholder={t('selecionar')}
                options={filterIllumPortOpts(illumInfo.ILLUMINATION_ID)}
                propLabel="label"
                value={illumInfo.PORT || ''}
                hideSelected
                onSelect={(item) => {
                  handlePortChange(illumInfo.ILLUMINATION_ID, 'ports', illumInfo.PORT?.port, item.port);
                  illumInfo.PORT = item;
                  render();
                }}
                disabled={state.loading}
              />
              <BtnClean disabled={state.loading} onClick={clearPort}>{t('limpar')}</BtnClean>
            </Flex>

            <div style={{ minWidth: '100px', width: larguraPage > 437 ? '150px' : '100%' }}>
              <SelectDMTport
                label={larguraPage > 437 ? t('feedbackDoDal') : t('feedback')}
                placeholder={t('selecionar')}
                options={filterIllumFeedbackOpts(illumInfo.ILLUMINATION_ID)}
                propLabel="label"
                value={illumInfo.FEEDBACK || ''}
                hideSelected
                onSelect={(item) => {
                  handlePortChange(illumInfo.ILLUMINATION_ID, 'feedbacks', illumInfo.FEEDBACK?.port, item.port);
                  illumInfo.FEEDBACK = item;
                  render();
                }}
                disabled={state.loading}
              />
            </div>
          </Flex>
        </Flex>
        {
          larguraPage > 767 && (
            <SmallTrashIcon
              style={{
                alignSelf: 'center', cursor: 'pointer', width: 26, marginBottom: 15,
              }}
              onClick={removeIllumAssociation}
              color="red"
              disabled={state.loading}
            />
          )
        }
      </Flex>
      <div style={{ border: '1px solid #DEDEDE', marginTop: '10px', marginBottom: '20px' }} />
    </Flex>
  );
};
