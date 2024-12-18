import {
  ChangeEvent, useEffect, useLayoutEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import { BsFillGridFill, BsList } from 'react-icons/bs';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { SingleDatePicker } from 'react-dates';

import {
  Loader,
  Accordion,
  InputSearch,
  InputSearchDesktopWrapper,
  Select,
  Button,
  Card,
  ModalWindow,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { TUnitInfo, UnitLayout } from 'pages/Analysis/Units/UnitLayout';
import { apiCall, apiCallDownload } from 'providers';
import { t } from 'i18next';
import { Schedules } from './Schedules';
import { UnitDetailDACsDAMs } from './UnitDetailDACsDAMs';
import { UnitDetailDUTs } from './UnitDetailDUTs';
import { UnitDetailUtilities } from './UnitDetailUtilities';
import moment from 'moment';

import {
  CancelButton,
  ContainerDate,
  ContentDate,
  DividerDate,
  HoverExportReport,
  Label,
  Link,
  MachineHeaderContainer,
  OptionExportReport,
  SearchInput,
  StyledCalendarIcon,
  ViewModeButton,
  DateLabel,
  VisualizationMode,
  AreaCheck,
  ContainerCheckbox,
  ContainerCheckboxWithRadio,
  AreaRadio,
} from './styles';
import { IMachineTableItem } from './UnitDetailDACsDAMs/constants';
import { ConfirmStatusChange } from './ConfirmStatusChange';
import {
  BadSignalIcon, CalendarSimpleIcon, FoldedSheet, GoodSignalIcon, GreatSignalIcon, InfoIcon, NoSignalIcon, RegularSignalIcon,
} from '~/icons';
import { ToolIcon } from '~/icons/Tool';
import { QuickSelection } from '~/components/QuickSelection';
import { getEndTime } from '~/helpers';
import ReactTooltip from 'react-tooltip';
import { DutSchedulesList } from '../../SchedulesModals/DUT_SchedulesList';
import { ExceptionDut, ScheduleDut } from '~/providers/types/api-private';
import {
  ContainerModal, SubtitleModal, TitleModal,
} from '../../Utilities/UtilityFilter/styles';

import { withTransaction } from '@elastic/apm-rum-react';
import { UnitMapApiResponseData } from '~/metadata/UnitMap.model';
import { useHistory } from 'react-router-dom';
import { generateNameFormatted } from '~/helpers/titleHelper';

export interface DacItem {
  DAC_ID: string;
  GROUP_ID: number;
  GROUP_NAME: string;
  UNIT_ID: number;
  DAC_NAME: string;
  H_INDEX: number;
  status: string;
  Lcmp: number;
  lastCommTs: string;
  capacityKW?: number;
  MEAN_USE?: string;
  usageHistory?: {
    DAY_HOURS_ON: number;
    DAT_REPORT: string;
  }[];
  DAC_KW?: number;
  insufDut?: DutItem;
  dutDuo?: DutItem;
  DAC_APPL?: string;
  DAC_TYPE?: string;
  CLIENT_ID: number;
  HEAT_EXCHANGER_ID: number;
  RSSI?: number;
}
export interface DamItem {
  DAM_ID: string;
  UNIT_ID: number;
  State: string;
  Mode: string;
  switchProgOn?: boolean;
  emptyProg?: boolean;
  status: string;
  safeWaitRelay?: boolean;
  safeWaitMode?: boolean;
}

type TempAlert = 'low' | 'high' | 'good' | null;

export interface DutItem {
  DEV_ID: string;
  UNIT_ID: number;
  ROOM_NAME: string;
  PLACEMENT: 'AMB' | 'INS' | 'DUO';
  ISVISIBLE: number,
  Temperature?: number | string;
  Temperature_1?: number | string;
  temprtAlert: TempAlert
  status: string;
  RSSI?: number;
  TEMPERATURE?: number
  TEMPERATURE_1?: number
  STATUS?: 'ONLINE' | 'OFFLINE' | 'LATE'
}
export interface DriItem {
  DEV_ID: string
  ROOM_NAME: string
  UNIT_ID: number
  RTYPE_ID: number
  RTYPE_NAME: string
  ISVISIBLE: number,
  status: string
  lastCommTs: string
  Temperature?: number
  Mode?: string|number
  ValveState?: number
  TUSEMIN?: number
  TUSEMAX?: number
  temprtAlert: TempAlert
  tpstats?: { med: number, max: number, min: number }
}

export interface DutDuoItem {
  DUT_DUO_ID: string
  CITY_NAME: string
  STATE_ID: string
  GROUP_ID: number
  GROUP_NAME: string
  UNIT_ID: number
  UNIT_NAME: string
  H_INDEX: number
  CLIENT_NAME: string
  CLIENT_ID: number
  H_DESC: string
  DAT_ID: string
  AST_DESC: string
  ASSET_ID: number
  TIMEZONE_ID: number
  TIMEZONE_AREA: string
  TIMEZONE_OFFSET: number
  Temperature?: number | string
  Temperature_1?: number | string
  temprtAlert?: TempAlert
  status?: string
  RSSI?: number
}

export interface DatItem {
  DAT_ID: string;
  UNIT_ID: number;
  GROUP_NAME: string;
  GROUP_ID: number;
  DEV_ID: string;
  AST_DESC: string;
  ASSET_ID: number;
}
interface AssociationItem {
  ASSOC_ID: number;
  ASSOC_NAME: string;
  CLIENT_ID: number;
  UNIT_ID: number;
  GROUPS: GroupItem[];
}
export interface GroupItem {
  application: string;
  DEV_AUT: string;
  name: string;
  groupId: number;
  dacs: DacItem[];
  dams: DamItem[];
  dam?: DamItem;
  dri?: DriItem;
  dats: DatItem[];
  duts?: DutItem[];
  dutsDuo?: DutDuoItem[];
}

export function rssiDesc(RSSI: number|undefined, status: string) {
  if (RSSI != null && RSSI < 0 && status === 'ONLINE') {
    if (RSSI > -50) return t('excelente');
    if (RSSI > -60) return t('bom');
    if (RSSI > -70) return t('regular');
    return t('ruim');
  }
  return '-';
}

export function formatRssiIcon(rssi: string) {
  switch (rssi) {
    case t('excelente'): return <GreatSignalIcon />;
    case t('bom'): return <GoodSignalIcon />;
    case t('regular'): return <RegularSignalIcon />;
    case t('ruim'): return <BadSignalIcon />;
    default: return <NoSignalIcon />;
  }
}

export const UnitDetail = (): JSX.Element => {
  const { t } = useTranslation();
  const routeParams = useParams<{ unitId: string }>();
  const history = useHistory();
  const [state, render, setState] = useStateVar({
    unitId: Number(routeParams.unitId),
    isMounted: true,
    isLoading: true,
    healthIndexes: {},
    groups: [] as GroupItem[],
    associationsAndGroups: [] as GroupItem[],
    groupsFull: [] as GroupItem[],
    dutsFilt: [] as DutItem[],
    dams: [] as DamItem[],
    duts: [] as DutItem[],
    dutsDuo: [] as DutDuoItem[],
    associations: [] as AssociationItem[],
    associationsFull: [] as AssociationItem[],
    isScheduleModalOpen: true,
    isConfirmStatusChangeOpen: false,
    statusChangeCommand: {
      label: '',
      value: '',
      dam: {} as DamItem,
    },
    selectedDamId: '',
    selectedDutId: '',
    DUTS_SCHEDULES: [] as ScheduleDut[],
    DUTS_EXCEPTIONS: [] as ExceptionDut[],
    switchProgOn: false,
    search: '',
    unitInfo: null as null | TUnitInfo,
    showExportReport: false,
    reportMode: '' as string,
    dateStart: getEndTime(),
    dateEnd: getEndTime(),
    startDate: moment().format('YYYY-MM-DD') as string,
    endDate: moment().format('YYYY-MM-DD') as string,
    focusedStart: false,
    focusedEnd: false,
    tomorrow: moment(moment().add(1, 'days').format('YYYY-MM-DD')),
    modeView: '',
    selectedExportsRealTime: [] as string[],
    filteredEnvironments: [] as DutItem[],
    unitMaps: [] as UnitMapApiResponseData[],
  });
  const [isMachineMosaicView, setIsMachineMosaicView] = useState(true);
  const [machineVisualizationOrder, setMachineVisualizationOrder] = useState(t('ordemAlfabetica'));
  const [machineTableItems, setMachineTableItems] = useState<IMachineTableItem>([]);
  const [orderedData, setOrderedData] = useState<GroupItem[]>();
  const [orderedAssociations, setOrderedAssociations] = useState<AssociationItem[]>([]);
  const [filter, setFilter] = useState<string[]>([]);
  const [orderedGroup, setOrderedGroup] = useState<GroupItem[]>();
  const [orderedAssociationGroup, setOrderedAssociationGroup] = useState<GroupItem[]>();
  function createAssociationsAndGroups() {
    const associations: GroupItem[] = [];

    state.associations.forEach((association) => {
      association.GROUPS.forEach((group) => associations.push(group));
    });

    state.associationsAndGroups = [...associations, ...state.groups]; render();
  }

  async function handleClickExport() {
    if (state.reportMode === 'weekly') {
      await handleExport();
    }
    else if (state.reportMode === 'preventive') {
      await handleExportPreventiveReport();
    }
    else if (state.reportMode === 'realTime') {
      await handleExportRealTimeReport();
    }
  }

  function sortAlphabeticalOrder(a, b) {
    const x = a.name.toLowerCase();
    const y = b.name.toLowerCase();

    return x < y ? -1 : x > y ? 1 : 0;
  }

  function sortHealth(a, b) {
    const x = a.dacs[0]?.H_INDEX ? a.dacs[0].H_INDEX : 0;
    const y = b.dacs[0]?.H_INDEX ? b.dacs[0].H_INDEX : 0;

    if (machineVisualizationOrder === t('pioresSaudes')) {
      return x - y;
    }
    return y - x;
  }

  function sortPower(a, b) {
    const x = a.dacs[0]?.capacityKW ? a.dacs[0].capacityKW : 0;
    const y = b.dacs[0]?.capacityKW ? b.dacs[0].capacityKW : 0;

    if (machineVisualizationOrder === t('menorPotencia')) {
      return x - y;
    }
    return y - x;
  }

  function sortConsuption(a, b) {
    const x = a.dacs[0]?.DAC_KW ? a.dacs[0].DAC_KW : 0;
    const y = b.dacs[0]?.DAC_KW ? b.dacs[0].DAC_KW : 0;

    if (machineVisualizationOrder === t('menorConsumo')) {
      return x - y;
    }
    return y - x;
  }

  function sortUsage(a, b) {
    const arrayTempoA = a.dacs[0]?.MEAN_USE ? a.dacs[0].MEAN_USE.split(':') : [];
    const arrayTempoB = b.dacs[0]?.MEAN_USE ? b.dacs[0].MEAN_USE.split(':') : [];
    if (arrayTempoA.length > 0 && arrayTempoB.length > 0) {
      if (arrayTempoA[0] === arrayTempoB[0] && arrayTempoA[1] && arrayTempoB[1]) {
        if (machineVisualizationOrder === t('menorUso')) {
          return Number(arrayTempoA[1]) - Number(arrayTempoB[1]);
        }
        return Number(arrayTempoB[1]) - Number(arrayTempoA[1]);
      }
      if (machineVisualizationOrder === t('menorUso')) {
        return Number(arrayTempoA[0]) - Number(arrayTempoB[0]);
      }
      return Number(arrayTempoB[0]) - Number(arrayTempoA[0]);
    }
    return 0;
  }

  function filterVisualizationOrder(unorderedGroups, orderedGroups) {
    let orderedGropsList = orderedGroups;
    if (machineVisualizationOrder === t('ordemAlfabetica')) {
      orderedGropsList = unorderedGroups.sort((a, b) => sortAlphabeticalOrder(a, b));
    } else if (machineVisualizationOrder === t('pioresSaudes')) {
      orderedGropsList = unorderedGroups.sort((a, b) => sortHealth(a, b));
    } else if (machineVisualizationOrder === t('melhoresSaudes')) {
      orderedGropsList = unorderedGroups.sort((a, b) => sortHealth(a, b));
    } else if (machineVisualizationOrder === t('menorPotencia')) {
      orderedGropsList = unorderedGroups.sort((a, b) => sortPower(a, b));
    } else if (machineVisualizationOrder === t('maiorPotencia')) {
      orderedGropsList = unorderedGroups.sort((a, b) => sortPower(a, b));
    } else if (machineVisualizationOrder === t('menorConsumo')) {
      orderedGropsList = unorderedGroups.sort((a, b) => sortConsuption(a, b));
    } else if (machineVisualizationOrder === t('maiorConsumo')) {
      orderedGropsList = unorderedGroups.sort((a, b) => sortConsuption(a, b));
    } else if (machineVisualizationOrder === t('menorUso')) {
      orderedGropsList = unorderedGroups.sort((a, b) => sortUsage(a, b));
    } else if (machineVisualizationOrder === t('maiorUso')) {
      orderedGropsList = unorderedGroups.sort((a, b) => sortUsage(a, b));
    }
    return orderedGropsList;
  }

  function formatGroupDacs(group, localMachineTableItems) {
    if (group.dacs.length) {
      (group.dacs || []).forEach((dac, index) => {
        localMachineTableItems.push(Object.assign(dac, {
          DAT_ID: (group.dats.find((item) => item.DEV_ID === dac.DAC_ID)?.DAT_ID || ''),
          hide: index !== 0,
          isExpandable: (index === 0) && (group.dacs.length > 1 || (group.dats.filter((dat) => dat.DEV_ID === null).length > 0)),
        }));
      });
    }
  }

  function formatGroupDats(group, localMachineTableItems) {
    if (group.dats.length) {
      (group.dats.filter((dat) => dat.DEV_ID !== null) || []).forEach((dat, index) => {
        localMachineTableItems.push({
          GROUP_ID: group.groupId,
          GROUP_NAME: group.name,
          DAC_ID: '',
          DAC_NAME: '',
          DAT_ID: dat.DAT_ID,
          H_INDEX: 0,
          status: 'OFFLINE',
          Lcmp: 0,
          lastCommTs: '',
          hide: group.dacs.length > 0 || (group.dacs.length <= 0 && index !== 0),
          isExpandable: !(group.dacs.length > 0) && (index === 0) && (group.dats.filter((dat) => dat.DEV_ID === null).length > 1),
        });
      });
    }
  }

  function formatGroupDris(group, localMachineTableItems) {
    if (group.dri) {
      localMachineTableItems.push({
        GROUP_ID: group.groupId,
        GROUP_NAME: group.name,
        DAC_ID: group.DEV_AUT,
        DAC_NAME: '',
        DAT_ID: (group.dats.find((item) => item.DEV_ID === group.DEV_AUT)?.DAT_ID || ''),
        H_INDEX: 0,
        status: group.dri.status,
        Lcmp: group.dri.ValveState || 0,
        lastCommTs: group.dri.lastCommTs,
        hide: false,
        isExpandable: (group.dacs.length > 1 || (group.dats.filter((dat) => dat.DEV_ID === null).length > 0)),
        isVAV: true,
      });
    }
  }

  function formatOrderedGroups(localMachineTableItems, orderedGroups) {
    orderedGroups.forEach((group) => {
      formatGroupDacs(group, localMachineTableItems);
      formatGroupDats(group, localMachineTableItems);
      formatGroupDris(group, localMachineTableItems);
    });
  }

  function filterData() {
    const localMachineTableItems: IMachineTableItem = [];
    let unorderedGroups = state.associationsAndGroups;
    let orderedGroups = unorderedGroups;
    if (filter.length > 0) {
      unorderedGroups = unorderedGroups.filter((group) => filter.includes(group.name));
      orderedGroups = unorderedGroups;
    }

    orderedGroups = filterVisualizationOrder(unorderedGroups, orderedGroups);

    formatOrderedGroups(localMachineTableItems, orderedGroups);

    setOrderedData(orderedGroups);
    setMachineTableItems(localMachineTableItems);

    const orderedGroupData = getOrderedGroup(orderedGroups);
    const orderedAssociationData = getAssociationOrderedGroup(orderedGroups);

    setOrderedGroup(orderedGroupData);
    setOrderedAssociationGroup(orderedAssociationData);
  }

  function formatData() {
    if (state.associations.length) {
      const arrayOrdered: AssociationItem[] = [];
      for (const item of state.associations) {
        let unorderedGroups = item.GROUPS;
        let ordered;
        if (filter.length > 0) {
          unorderedGroups = item.GROUPS.filter((group) => filter.includes(group.name));
          ordered = unorderedGroups;
        }
        ordered = filterVisualizationOrder(unorderedGroups, ordered);
        arrayOrdered.push({ ...item, GROUPS: ordered });
      }
      filterData();
      setOrderedAssociations(arrayOrdered);
    } else if (state.associationsAndGroups.length) {
      filterData();
    }
  }

  async function handleGetUnitInfo() {
    try {
      const [
        { list: _dacsList },
        { list: _damsList },
        { list: _dutsList },
        { list: _vavsList },
        { list: _dutDuosList },
        { list: associationsList },
        { healthIndexes },
        groupsList,
        unitInfo,
        { list: _assetsList },
      ] = await Promise.all([
        apiCall('/dac/get-dacs-list', {
          includeHealthDesc: true,
          unitId: state.unitId,
          includeCapacityKW: true /* includeConsumption: true, */,
        }),
        apiCall('/dam/get-dams-list', {
          includeDacs: true,
          unitIds: [state.unitId],
          includeCapacityKW: true,
          includeConsumption: true,
        }),
        apiCall('/dut/get-duts-list', {
          unitId: state.unitId,
          includeMeanTemperature: true,
        }),
        apiCall('/dri/get-dri-vavs-list', {
          unitId: state.unitId, includeMeanTemperature: true,
        }),
        apiCall('/dut/get-dut-duo-list', {
          unitId: state.unitId,
          includeMeanTemperature: true,
        }),
        apiCall('/clients/get-associations-list', { UNIT_ID: state.unitId }),
        apiCall('/faults/get-fault-codes', {}),
        apiCall('/clients/get-groups-list', { unitIds: [state.unitId] }),
        apiCall('/clients/get-unit-info', { unitId: state.unitId }),
        apiCall('/clients/get-assets-list',
          { unitIds: [state.unitId] }),
      ]);
      state.unitInfo = unitInfo;
      const { environments } = await apiCall('/environments/get-environment-list', { CLIENT_ID: state.unitInfo.CLIENT_ID, UNIT_ID: state.unitId });
      if (unitInfo.hasChiller) {
        history.push(`/analise/unidades/cag/${unitInfo.UNIT_ID}`);
      }
      const dacsList: DacItem[] = _dacsList;
      const damsList: DamItem[] = _damsList;
      const dutsList: DutItem[] = _dutsList;
      const vavsList: DriItem[] = _vavsList;
      const assetsList: DatItem[] = _assetsList;
      const dutDuosList: DutDuoItem[] = _dutDuosList;

      environments.forEach((item) => {
        if (!dutsList.find((dut) => dut.ROOM_NAME === item.ENVIRONMENT_NAME)) {
          dutsList.push({
            DEV_ID: '-',
            UNIT_ID: state.unitId,
            ROOM_NAME: item.ENVIRONMENT_NAME,
            PLACEMENT: 'AMB',
            ISVISIBLE: item.IS_VISIBLE,
            temprtAlert: null,
            status: '',
            ENVIRONMENT_ID: item.ENVIRONMENT_ID,
          });
        }
      });

      Promise.resolve()
        .then(async () => {
          for (const dac of dacsList) {
            const { info } = await apiCall('/dac/get-dac-usage', {
              DAC_ID: dac.DAC_ID,
            });
            const { MEAN_USE, usageHistory } = info;
            if (!state.isMounted) return;
            dac.MEAN_USE = MEAN_USE;
            dac.usageHistory = usageHistory;
            render();
          }
        })
        .catch(console.log);
      state.healthIndexes = healthIndexes || {};

      const filteredByGroupName: {
        [groupId: string]: GroupItem;
      } = {};

      for (const group of groupsList) {
        if (group.GROUP_ID) {
          filteredByGroupName[group.GROUP_ID] = {
            name: group.GROUP_NAME,
            groupId: group.GROUP_ID,
            dacs: [],
            dams: [],
            dats: [],
            duts: [],
            dutsDuo: [],
            DEV_AUT: group.DEV_AUT,
            application: group.MCHN_APPL || '',
          };

          for (const dac of dacsList) {
            if (dac.UNIT_ID !== state.unitId) continue;
            if (!dac.GROUP_NAME) continue;
            if (dac.GROUP_ID === group.GROUP_ID) {
              filteredByGroupName[group.GROUP_ID].dacs.push(dac);
            }
          }

          for (const dat of assetsList) {
            const groupId = group.GROUP_ID;
            if (dat.GROUP_ID === groupId) {
              filteredByGroupName[groupId].dats?.push(dat);
            }
          }

          for (const vav of vavsList) {
            if (group.DEV_AUT === vav.DEV_ID) {
              filteredByGroupName[group.GROUP_ID].dri = vav;
            }
          }

          dutDuosList.forEach((dutDuo) => {
            if (dutDuo.GROUP_ID === group.GROUP_ID) {
              filteredByGroupName[group.GROUP_ID].dutsDuo?.push(dutDuo);
            }
          });
        }
      }
      state.groups = Object.values(filteredByGroupName);

      state.dams = [];
      const damsObj = {} as { [damId: string]: DamItem };
      for (const dam of damsList) {
        if (dam.UNIT_ID !== state.unitId) continue;
        dam.switchProgOn = false;
        if (!dam.Mode) dam.Mode = t('desconhecido');
        if (!dam.State) dam.State = t('desconhecido');
        state.dams.push(dam);
        damsObj[dam.DAM_ID] = dam;
        // TODO: check if DAM programming is empty and set: dam.emptyProg = true
      }

      for (const group of state.groups) {
        if (group.DEV_AUT?.startsWith('DAM') || group.DEV_AUT?.startsWith('DAC')) {
          group.dam = damsObj[group.DEV_AUT];
        }
      }

      const associations = [] as AssociationItem[];
      for (const association of associationsList) {
        const associationGroups = [] as GroupItem[];
        association.GROUPS.sort((a, b) => a.POSITION - b.POSITION);
        for (const associationGroup of association.GROUPS) {
          const group = state.groups.find(
            (group) => group.groupId === associationGroup.GROUP_ID,
          );
          if (group) {
            associationGroups.push(group);
          }
        }
        state.groups = state.groups.filter(
          (group) => !associationGroups.includes(group),
        );
        associations.push({ ...association, GROUPS: associationGroups });
      }
      state.associations = associations;

      state.duts = [];
      for (const dut of dutsList) {
        if (dut.UNIT_ID !== state.unitId) continue;
        if (!dut.ROOM_NAME) continue;
        if (dut.Temperature == null || dut.status === 'OFFLINE') { dut.Temperature = '-'; }
        if (dut.Temperature_1 == null || dut.status === 'OFFLINE') { dut.Temperature_1 = '-'; }
        if (dut.PLACEMENT === 'INS') {
          const machine = groupsList.find(
            (machine) => machine.DUT_ID === dut.DEV_ID,
          );
          if (machine) {
            const dac = dacsList.find(
              (dac) => dac.GROUP_ID === machine.GROUP_ID,
            );
            if (dac) {
              dac.insufDut = dut;
              continue;
            }
          }
        }
        if (dut.PLACEMENT === 'DUO') {
          const machine = groupsList.find((machine) => machine.DUT_ID === dut.DEV_ID || machine.DEV_AUT === dut.DEV_ID);
          if (machine) state.groups.find((group) => group.groupId === machine.GROUP_ID)?.duts?.push(dut);
        }
        state.duts.push(dut);
      }

      dutDuosList.forEach((dut) => {
        if (dut.UNIT_ID !== state.unitId) return;
        if (dut.Temperature == null || dut.status === 'OFFLINE') {
          dut.Temperature = '-';
        }
        if (dut.Temperature_1 == null || dut.status === 'OFFLINE') {
          dut.Temperature_1 = '-';
        }
        state.dutsDuo.push(dut);
      });

      for (const vav of vavsList) {
        if (vav.UNIT_ID !== state.unitId) continue;
        if (!vav.ROOM_NAME) continue;
        const obj: DutItem = {
          DEV_ID: vav.DEV_ID,
          UNIT_ID: vav.UNIT_ID,
          ROOM_NAME: vav.ROOM_NAME,
          ISVISIBLE: vav.ISVISIBLE,
          PLACEMENT: 'AMB',
          Temperature: vav.Temperature,
          TUSEMIN: vav.TUSEMIN,
          TUSEMAX: vav.TUSEMAX,
          temprtAlert: vav.temprtAlert,
          tpstats: vav.tpstats,
          status: vav.status,
        };
        if (vav.Temperature == null || vav.status === 'OFFLINE') { obj.Temperature = '-'; }
        state.duts.push(obj);
      }

      state.dutsFilt = state.duts;
      state.groupsFull = state.groups;
      state.associationsFull = state.associations;
      createAssociationsAndGroups();
      formatData();
    } catch (err) {
      console.log(err);
      toast.error(t('erroInformacaoUnidade'));
    }
  }
  useEffect(() => {
    Promise.resolve().then(async () => {
      try {
        state.isLoading = true;
        render();
        await handleGetUnitInfo();
        await handleGetUnitMaps();
      } catch (err) {
        console.log(err);
      }
      state.isLoading = false;
      render();
    });
    return () => {
      state.isMounted = false;
    };
  }, []);

  async function handleExport(debugTemplate?: string) {
    try {
      state.isLoading = true;
      render();
      const exportResponse = await apiCallDownload('/dac/export-unit-report', {
        unitId: state.unitId,
        clientId: state.unitInfo!.CLIENT_ID,
        debugTemplate,
      });
      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || `UnitReport - ${state.unitId}.pdf`;
      link.click();
      toast.success(t('sucessoGerarRelatorio'));
    } catch (err) {
      console.log(err);
      toast.error(t('erroGerarRelatorio'));
    } finally {
      state.isLoading = false;
      render();
    }
  }
  function downloadLink(exportResponse, name) {
    const link: any = document.getElementById('downloadLink');
    if (link.href !== '#') window.URL.revokeObjectURL(link.href);
    link.href = window.URL.createObjectURL(exportResponse.data);
    link.download = exportResponse.headers.filename || name;
    link.click();
    toast.success(t('sucessoGerarRelatorio'));
  }

  async function exportMachineMosaic() {
    if (state.selectedExportsRealTime.includes('machine') && state.modeView === 'mosaic') {
      try {
        const exportResponse = await apiCallDownload('/unit/export-real-time', {
          UNIT_ID: state.unitId,
          DATA_MACHINE: (orderedGroup || []).filter((group) => (group.dats.length || group.dacs.length || group.application === 'iluminacao' || group.dri)),
          DATA_SISTEM_MACHINE: orderedAssociations,
          EXPORTATION: 'machine',
          MODE: state.modeView,
        });
        downloadLink(exportResponse, `RealTimeReportMachine-${state.unitId}.pdf`);
      } catch (err) {
        console.log(err);
        toast.error(t('erroGerarRelatorio'));
      }
    }
  }
  async function exportEnvironmentMosaic() {
    if (state.selectedExportsRealTime.includes('environments') && state.modeView === 'mosaic') {
      try {
        const exportResponse = await apiCallDownload('/unit/export-real-time', {
          UNIT_ID: state.unitId,
          DATA_ENVIRONMENTS: state.filteredEnvironments,
          EXPORTATION: 'environments',
          MODE: state.modeView,
        });
        downloadLink(exportResponse, `RealTimeReportEnvironment-${state.unitId}.pdf`);
      } catch (err) {
        console.log(err);
        toast.error(t('erroGerarRelatorio'));
      }
    }
  }

  async function handleExportRealTimeReport() {
    try {
      setState({ isLoading: true });
      if (!state.modeView && state.selectedExportsRealTime.length === 0) {
        state.isLoading = false;
        render();
        return;
      }
      await exportEnvironmentMosaic();
      await exportMachineMosaic();
    } catch (err) {
      console.log(err);
      toast.error(t('erroGerarRelatorio'));
    } finally {
      state.isLoading = false;
      render();
    }
  }
  async function handleExportPreventiveReport() {
    try {
      state.isLoading = true;
      render();
      const exportResponse = await apiCallDownload('/dac/export-preventive-report', {
        unitId: state.unitId,
        clientId: state.unitInfo!.CLIENT_ID,
        startDate: state.startDate,
        endDate: state.endDate,
      });
      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || 'UnitReport.pdf';
      link.click();
      toast.success(t('sucessoGerarRelatorio'));
    } catch (err) {
      console.log(err);
      toast.error(t('erroGerarRelatorio'));
    } finally {
      state.isLoading = false;
      render();
    }
  }

  function closeScheduleModal() {
    state.isScheduleModalOpen = false;
    state.selectedDamId = '';
    state.selectedDutId = '';
    render();
  }

  function openScheduleDialogFor(damId: string) {
    state.selectedDamId = damId;
    render();
    state.isScheduleModalOpen = !!damId;
    render();
  }

  async function openScheduleDialogForDutAut(dutId: string, clientId: number, unitId: number) {
    try {
      await apiCall('/dut/get-dut-schedules', { DUT_ID: dutId, CLIENT_ID: clientId, UNIT_ID: unitId })
        .then((response) => {
          state.DUTS_SCHEDULES = response.schedules;
          render();
        });
      await apiCall('/dut/get-dut-exceptions', { DUT_ID: dutId, CLIENT_ID: clientId, UNIT_ID: unitId })
        .then((response) => {
          state.DUTS_EXCEPTIONS = response.exceptions;
          render();
        });
    } catch (err) {
      toast.error(t('erroDadosDispositivo'));
      console.log(err);
    }
    state.selectedDutId = dutId;
    render();
    state.isScheduleModalOpen = !!dutId;
    render();
  }

  function openConfirmStatusChange(damId: string, status: { label: string, value: string, dam: DamItem }) {
    state.selectedDamId = damId;
    state.statusChangeCommand = status;
    state.isConfirmStatusChangeOpen = true;
    render();
  }

  function closeConfirmStatusChange() {
    state.isConfirmStatusChangeOpen = false;
    render();
  }

  function setSearchState(value: string) {
    state.search = value;
    if (value) {
      state.dutsFilt = state.duts.filter(
        (item) => item.ROOM_NAME?.toLowerCase().includes(value.toLowerCase()),
      );
      state.groups = state.groupsFull.filter((item) => item.name.toLowerCase().includes(value.toLowerCase()));
      state.associations = state.associationsFull.filter(
        (item) => item.ASSOC_NAME.toLowerCase().includes(value.toLowerCase())
          || item.GROUPS.map(({ name }) => name).some((name) => name.toLowerCase().includes(value.toLowerCase())),
      );
    } else {
      state.dutsFilt = state.duts;
      state.groups = state.groupsFull;
      state.associations = state.associationsFull;
    }

    render();
  }

  function onDebugTemplateFile(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      handleExport(event.target!.result as string);
    };
    reader.onerror = function (error) {
      console.log(error);
      toast.error(t('erroLendoArquivo'));
    };
    reader.readAsText(file); // you could also read images and other binaries
  }

  useEffect(() => {
    formatData();
  }, [machineVisualizationOrder, filter]);

  function getOrderedGroup(orderedGroups: GroupItem[] | undefined) {
    const orderedGroupData: GroupItem[] = [];

    if (orderedGroups && orderedGroups.length > 0) {
      for (const group of orderedGroups) {
        state.groups.forEach((g) => {
          if (g.groupId === group.groupId) {
            orderedGroupData.push(g);
          }
        });
      }
    }

    return orderedGroupData;
  }

  function getAssociationOrderedGroup(orderedGroups: GroupItem[] | undefined) {
    const orderedGroupData: GroupItem[] = [];

    if (orderedGroups && orderedGroups.length > 0) {
      for (const group of orderedGroups) {
        const association = state.groups.find((g) => g.groupId === group.groupId);
        if (!association) orderedGroupData.push(group);
      }
    }

    return orderedGroupData;
  }

  useLayoutEffect(() => {
    if (state.associationsAndGroups.length >= 10) setIsMachineMosaicView(false);
  }, [state.associationsAndGroups]);

  function showExportReport() {
    try {
      state.showExportReport = true;
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }
  function isReportWeekly() {
    try {
      state.reportMode = 'weekly';
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }
  function isReportRealTime() {
    try {
      state.reportMode = 'realTime';
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }
  function isReportPreventive() {
    try {
      state.reportMode = 'preventive';
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }
  function closeExportReport() {
    try {
      state.showExportReport = false;
      state.reportMode = '';
      state.selectedExportsRealTime = [];
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  function quickHandleChangeData(startDate, endDate) {
    state.startDate = startDate.format('YYYY-MM-DD');
    state.endDate = endDate.format('YYYY-MM-DD');

    setState({ ...state });
  }

  function hasDacsOrDatsOrDri() {
    if (orderedGroup) {
      const filterGroups = state.associationsAndGroups.filter((group) => (group.dats.length || group.dacs.length || group.dri));
      return filterGroups.length;
    }
    return false;
  }

  async function handleGetUnitMaps() {
    try {
      const response = await apiCall('/unit/get-ground-plans', {
        UNIT_ID: Number(routeParams.unitId),
        PARAMS: '',
      });
      const formattedUnitMaps = response.map((map) => ({ name: map.NAME_GP, value: map.GROUNDPLAN_ID, ...map }));
      state.unitMaps = formattedUnitMaps;
      render();
    } catch (e) {
      toast.error(t('erroBuscarMapasUnidade'));
    }
  }

  useEffect(() => {
    state.startDate = state.dateStart.format('YYYY-MM-DD') as string;
    state.endDate = state.dateEnd.format('YYYY-MM-DD') as string;
    render();
  }, [state.dateStart, state.dateEnd]);

  useEffect(() => {
    state.dateStart = moment(state.startDate);
    state.dateEnd = moment(state.endDate);
    render();
  }, [state.startDate, state.endDate]);

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.unitInfo?.UNIT_NAME, t('tempoRealMaiusculo'))}</title>
      </Helmet>
      {state.selectedDamId && state.isScheduleModalOpen && (
      <Schedules
        closeScheduleModal={closeScheduleModal}
        damId={state.selectedDamId}
        unitInfo={state.unitInfo}
      />
      )}
      {state.selectedDutId && state.isScheduleModalOpen && (
      <ModalWindow style={{ padding: '0px', overflowX: 'hidden' }} onClickOutside={closeScheduleModal}>
        <DutSchedulesList schedules={state.DUTS_SCHEDULES} exceptions={state.DUTS_EXCEPTIONS} />
      </ModalWindow>
      )}
      { state.selectedDamId && state.isConfirmStatusChangeOpen && <ConfirmStatusChange devId={state.selectedDamId} command={state.statusChangeCommand} closeConfirmStatusChange={closeConfirmStatusChange} /> }
      <UnitLayout unitInfo={state.unitInfo} />
      <br />
      <Flex
        flexWrap="wrap"
        width={1}
        pt={10}
        mb={[32, 32, 32, 32, 0, 0]}
        justifyContent="space-between"
        alignItems="center"
      >
        <Box mb={[25, 25, 25, 25, 0, 0]}>
          <InputSearchDesktopWrapper>
            <InputSearch
              id="search"
              name="search"
              placeholder={t('pesquisar')}
              value={state.search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchState(e.target.value)}
            />
          </InputSearchDesktopWrapper>
        </Box>
        <a id="downloadLink" href="#" />
        <Box
          width={[1, 1, 1, 1, 1 / 5, 1 / 5]}
          minWidth={280}
          pl="30px"
        >
          <Button variant={state.isLoading ? 'disabled' : 'primary'} onClick={() => showExportReport()}>
            {t('exportarRelatorioMin')}
          </Button>
          {state.showExportReport && (
          <div style={{ zIndex: 3, position: 'sticky' }}>
            <ModalWindow
              style={{
                padding: '0px',
                marginBottom: 'auto',
                marginTop: '3%',
                minWidth: '633px',
                zIndex: 5,
              }}
              topBorder
              onClickOutside={() => closeExportReport()}
            >
              <Card noPadding>
                <ContainerModal>
                  <TitleModal>
                    {t('exportarRelatorioMinusculo')}
                  </TitleModal>
                  <SubtitleModal>
                    {t('selecioneOpcaoDesejada')}
                  </SubtitleModal>

                  <Flex
                    style={{
                      gap: '13px',
                      marginBottom: '23px',
                    }}
                  >

                    {/* Weekly */}
                    <OptionExportReport
                      style={{
                        backgroundColor: state.reportMode === 'weekly' ? '#363BC4' : ' white',
                        color: state.reportMode === 'weekly' ? 'white' : ' black',
                      }}
                      onClick={() => { isReportWeekly(); }}
                    >
                      <CalendarSimpleIcon color={state.reportMode === 'weekly' ? 'white' : 'black'} />
                      <span>
                        {t('relatorioSemanalMin')}
                        <InfoIcon width="13px" data-tip data-for="weekly" color="#BDBDBD" />
                        <ReactTooltip
                          id="weekly"
                          place="top"
                          effect="solid"
                        >
                          <HoverExportReport>
                            <strong>{t('relatorioSemanalMin')}</strong>
                            <span>
                              {t('relatorioPdfContendoDadosMaquinas')}
                            </span>
                          </HoverExportReport>
                        </ReactTooltip>
                      </span>
                    </OptionExportReport>

                    {/* Preventive */}
                    <OptionExportReport
                      style={{
                        opacity: 0.2,
                        backgroundColor: state.reportMode === 'preventive' ? '#363BC4' : ' white',
                        color: state.reportMode === 'preventive' ? 'white' : ' black',
                      }}
                      // onClick={() => { isReportPreventive(); }}
                      disabled
                      data-tip
                      data-for="alert"
                    >
                      <ToolIcon color={state.reportMode === 'preventive' ? 'white' : 'black'} />

                      <div>
                        {t('relatorioManutencaoMin')}
                        <span>
                          {t('preventiva')}
                          <InfoIcon width="13" data-tip data-for="preventive" color="#BDBDBD" />
                        </span>
                      </div>

                      {/* <ReactTooltip
                        id="preventive"
                        place="top"
                        effect="solid"
                      >

                        <HoverExportReport>
                          <strong>Relatório de Manutenção Preventiva</strong>
                          <span>
                            Relatório .PDF contendo dados de máquinas de um determinado período selecionado pelo usuário para avaliação e manutenção. Contém dados mais sensíveis que o Relatório Semanal.
                          </span>
                        </HoverExportReport>

                      </ReactTooltip> */}

                    </OptionExportReport>

                    <ReactTooltip
                      id="alert"
                      place="top"
                      effect="solid"
                    >

                      <HoverExportReport>
                        <strong>{t('relatorioManutencaoPreventiva')}</strong>
                        <span>
                          {t('estaOpcaoAindaEstaConstrucaoDisponivelBreve')}
                        </span>
                      </HoverExportReport>

                    </ReactTooltip>
                    {/* Tempo Real */}
                    <OptionExportReport
                      style={{
                        backgroundColor: state.reportMode === 'realTime' ? '#363BC4' : ' white',
                        color: state.reportMode === 'realTime' ? 'white' : ' black',
                      }}
                      onClick={() => { isReportRealTime(); }}
                    >
                      <FoldedSheet color={state.reportMode === 'realTime' ? 'white' : 'black'} width="30px" />
                      <span
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {t('relatorioEmTempoRealUnidade')}
                        <InfoIcon width="20px" data-tip data-for="realTime" color="#BDBDBD" />
                        <ReactTooltip
                          id="realTime"
                          place="top"
                          effect="solid"
                        >
                          <HoverExportReport>
                            <strong>{t('relatorioEmTempoRealUnidade')}</strong>
                            <span>
                              {t('relatorioPdfContendoDadosDaTelaDeTempoReal')}
                            </span>
                          </HoverExportReport>
                        </ReactTooltip>
                      </span>
                    </OptionExportReport>
                  </Flex>
                  {state.reportMode === 'preventive' && (
                    <Box marginBottom="40px">
                      <ContainerDate>
                        <Flex alignItems="center">
                          <ContentDate>
                            <DateLabel>{t('inicio')}</DateLabel>
                            <SingleDatePicker
                              readOnly
                              disabled={state.isLoading}
                              date={state.dateStart}
                              onDateChange={(value) => {
                                setState({
                                  dateStart: value,
                                });
                                render();
                              }}
                              focused={state.focusedStart}
                              onFocusChange={({ focused }) => setState({ focusedStart: focused })}
                              id="datepicker"
                              numberOfMonths={1}
                              isOutsideRange={(d) => !d.isBefore(state.tomorrow)}
                              placeholder={t('selecioneUmaData')}
                              openDirection="OPEN_UP"
                            />
                          </ContentDate>
                          <StyledCalendarIcon />
                        </Flex>
                        <DividerDate />
                        <Flex alignItems="center">
                          <ContentDate>
                            <DateLabel>{t('fim')}</DateLabel>
                            <SingleDatePicker
                              readOnly
                              disabled={state.isLoading}
                              date={state.dateEnd}
                              onDateChange={(value) => {
                                setState({
                                  dateEnd: value,
                                });
                                render();
                              }}
                              focused={state.focusedEnd}
                              onFocusChange={({ focused }) => setState({ focusedEnd: focused })}
                              id="datepicker"
                              numberOfMonths={1}
                              isOutsideRange={(d) => !d.isBefore(state.tomorrow)}
                              placeholder={t('selecioneUmaData')}
                              openDirection="OPEN_UP"

                            />
                          </ContentDate>
                          <StyledCalendarIcon />
                        </Flex>
                      </ContainerDate>

                      <QuickSelection setDate={quickHandleChangeData} />
                    </Box>
                  )}
                  {state.reportMode === 'realTime' && (
                    <ModalRealTimeReport setState={setState} state={state} render={render} />
                  )}
                  <Button
                    variant={(state.isLoading || state.reportMode === '') ? 'disabled' : 'primary'}
                    onClick={() => {
                      handleClickExport();
                    }}
                  >
                    {t('exportar')}
                  </Button>

                </ContainerModal>
                <CancelButton
                  onClick={() => closeExportReport()}
                >
                  {t('cancelar')}
                </CancelButton>

              </Card>
            </ModalWindow>
          </div>
          )}
        </Box>
      </Flex>
      <br />
      {state.isLoading ? (
        <Accordion title={t('ambientes')} opened>
          <Flex flexWrap="wrap" mb="24px">
            <Loader />
          </Flex>
        </Accordion>
      ) : (
        <UnitDetailDUTs duts={state.dutsFilt} unitId={state.unitId} stateUnitDetail={state} unitMaps={state.unitMaps} />
      )}
      <Flex>
        <Box width="100%">
          {state.isLoading && (
            <Accordion
              title={t('maquinas')}
              style={{ fontSize: '1.25em' }}
              opened
            >
              <Flex alignItems="center" justifyContent="center">
                <Box width={1} alignItems="center" justifyContent="center">
                  <Loader />
                </Box>
              </Flex>
            </Accordion>
          )}

          {hasDacsOrDatsOrDri() ? (
            <Accordion
              title={t('maquinas')}
              style={{ fontSize: '1.25em' }}
              opened
            >
              <>
                <MachineHeaderContainer>
                  <Flex>
                    <ViewModeButton
                      isActive={isMachineMosaicView}
                      onClick={() => setIsMachineMosaicView(true)}
                    >
                      <span style={{ width: 'max-content' }}>{t('mosaico')}</span>
                      <BsFillGridFill style={{ width: '16px', height: '16px' }} />
                    </ViewModeButton>
                    <ViewModeButton
                      isActive={!isMachineMosaicView}
                      onClick={() => setIsMachineMosaicView(false)}
                    >
                      <span style={{ width: 'max-content' }}>{t('lista')}</span>
                      <BsList style={{ width: '16px', height: '16px' }} />
                    </ViewModeButton>
                  </Flex>
                  <Flex style={{ width: '600px' }} flexWrap="wrap">
                    <div style={{
                      display: 'flex', flexDirection: 'column', height: 'auto', marginRight: '20px', width: '220px',
                    }}
                    >
                      <SearchInput>
                        <div>
                          <Label>{t('buscar')}</Label>
                          <SelectSearch
                            options={state.associationsAndGroups.filter((item) => item.dats.length !== 0).map((group) => ({
                              value: group.name,
                              name: group.name.length < 45 ? group.name : `${group.name.substring(0, 45)}...`,
                            }))}
                            value={filter}
                            placeholder={t('selecioneMaquinas')}
                            multiple
                            closeOnSelect={false}
                            printOptions="on-focus"
                            search
                            filterOptions={fuzzySearch}
                            // @ts-ignore
                            onChange={(newFilter) => setFilter(newFilter)}
                          />
                        </div>
                      </SearchInput>
                      <Link onClick={() => setFilter([])}>{t('limparCampo')}</Link>
                    </div>
                    <div style={{ width: '60%' }}>
                      <Select
                        placeholder={t('ordenarPor')}
                        value={machineVisualizationOrder}
                        onSelect={(value) => {
                          setMachineVisualizationOrder(value);
                        }}
                        options={[
                          t('maiorPotencia'),
                          t('menorPotencia'),
                          t('maiorConsumo'),
                          t('menorConsumo'),
                          t('maiorUso'),
                          t('menorUso'),
                          t('melhoresSaudes'),
                          t('pioresSaudes'),
                          t('ordemAlfabetica'),
                        ]}
                        hideSelected
                      />
                    </div>
                  </Flex>
                </MachineHeaderContainer>
                <div style={{ width: '100%', paddingTop: '25px' }}>
                  <UnitDetailDACsDAMs
                    associations={state.associations}
                    orderedAssociations={orderedAssociations}
                    associationsAndGroups={state.associationsAndGroups}
                    groups={state.groups}
                    unitId={state.unitId}
                    healthIndexes={state.healthIndexes}
                    openScheduleDialogFor={openScheduleDialogFor}
                    openScheduleDialogForDutAut={openScheduleDialogForDutAut}
                    openConfirmStatusChange={openConfirmStatusChange}
                    isMachineMosaicView={isMachineMosaicView}
                    orderedAssociationGroups={orderedAssociationGroup}
                    orderedGroups={orderedGroup}
                    orderedData={orderedData}
                    machineTableItems={machineTableItems}
                  />
                </div>
              </>
            </Accordion>
          ) : <></> }
        </Box>
      </Flex>

      {state.isLoading ? (
        <Accordion title={t('utilitarios')} opened>
          <Flex flexWrap="wrap" mb="24px">
            <Loader />
          </Flex>
        </Accordion>
      ) : (
        <UnitDetailUtilities openScheduleDialogFor={openScheduleDialogFor} />
      )}
    </>
  );
};

function ModalRealTimeReport({ setState, state, render }) {
  function setValue(value) {
    if (state.selectedExportsRealTime.includes(value)) {
      setState({ selectedExportsRealTime: state.selectedExportsRealTime.filter((item) => item !== value) });
    } else {
      setState({ selectedExportsRealTime: [...state.selectedExportsRealTime, value] });
    }
    render();
  }
  return (
    <Box>
      <VisualizationMode>
        <h4>{t('modoVisualizacao')}</h4>
        <ContainerCheckbox>
          <AreaCheck>
            <input type="radio" className="radio-input" name="visualization" id="MosaicoMode" onClick={() => setState({ modeView: 'mosaic' })} />
            <p>
              {t('mosaico')}
            </p>
          </AreaCheck>
        </ContainerCheckbox>
        <h4>{t('conteudoSerExportado')}</h4>
        <AreaExportContent array={[t('ambientes'), t('maquinas'), t('utilitarios')]} setValue={setValue} />
      </VisualizationMode>
    </Box>
  );
}

function AreaExportContent({ array, setValue }) {
  return (
    <ContainerCheckboxWithRadio>
      <AreaRadio onClick={() => setValue('environments')}>
        <input type="checkbox" />
        <p>{array[0]}</p>
      </AreaRadio>
      <AreaRadio onClick={() => setValue('machine')}>
        <input type="checkbox" />
        <p>{array[1]}</p>
      </AreaRadio>
    </ContainerCheckboxWithRadio>
  );
}

export default withTransaction('UnitDetail', 'component')(UnitDetail);
