import { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { Link, useHistory } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { Flex, Box } from 'reflexbox';
import { toast } from 'react-toastify';
import { SingleDatePicker } from 'react-dates';
import i18n from '~/i18n';
import {
  ModalTitle, ModalTitleContainer, ModalSection, MobileWrapper, Container, ModalDesktop, SeeAssociationGroups, SimpleButton, SectionContainer, IconWrapper2,
  Text,
  ContentDate,
  Label,
  StyledCalendarIcon,
  BtnExport,
  ExportWorksheet,
  ContentTab,
  StyledList,
  StyledItem,
  StyledName,
  StyledLink,
} from './styles';
import {
  Loader,
  ModalWindow,
  NewTable,
  ActionButton,
  Checkbox,
  LayerBackgroundModal,
  Card,
  Select,
} from 'components';
import { AccordionV2 } from 'components/Accordion';
import { getDaySched } from 'helpers/scheduleData';
import { getUserProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';
import {
  EditIcon, CloseIcon, OpenEyeIcon, DeleteOutlineIcon,
} from 'icons';
import { apiCall, ApiParams, ApiResps } from 'providers';
import { FullProg_v4 } from 'providers/types';
import { colors } from 'styles/colors';
import { FormAssociateDevs } from './FormAssociateDevs';
import { FormEditClass } from './FormEditClass';
import { FormEditDut } from './FormEditDut';
import { FormEditGroup } from './FormEditGroup';
import { FormEditRoomType } from './FormEditRoomType';
import { FormEditUnit } from './FormEditUnit';
import { FormEditModel } from './FormEditModel';
import { FormEditAssociation } from './FormEditAssociation';
import { TableClasses } from './Tables/TableClasses';
import { RateCicleType, RateModels, TableModels } from './Tables/TableModels';
import { TableDuts } from './Tables/TableDuts';
import { TableFreeDevices } from './Tables/TableFreeDevices';
import { TableRoomTypes } from './Tables/TableRoomTypes';
import { TableUnits } from './Tables/TableUnits';
import { FormEditMachine } from './FormEditMachine';
import { FormEditCreateCicle } from './FormEditCreateCicle';
import { FormEditCicle } from './FormEditCicle';
import { FormEditHeatExchanger } from './FormEditHeatExchanger';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import { FormEditUtility } from './FormEditUtility';
import { StyledLine } from '../Analysis/Header/styles';
import { ViewUtility } from './ViewUtility';
import { getDatesRange } from 'helpers/formatTime';
import { ClientPanelLayout } from './ClientPanelLayout';
import { withTransaction } from '@elastic/apm-rum-react';

const CSVheader = [
  { label: 'Cliente', key: 'cliente' },
  { label: 'Unidade', key: 'unidade' },
  { label: 'ID da Unidade', key: 'id' },
  { label: 'Disponibilidade Online (%)', key: 'disponibilidade' },
  { label: 'Dia', key: 'dia' },
];

const modalOptions = ['create-cicle', 'edit-model', 'edit-cicle', 'edit-machine', 'view-utility', 'edit-create-utility', 'edit-create-heat-exchanger'];

const daysOfTheWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const modalWidthByType = {
  'edit-alert': '950px',
  'edit-room-type': '600px',
  'edit-association': '700px',
  'edit-create-heat-exchanger': '600px',
  'edit-create-utility': '650px',
  'view-utility': '600px',
};

const modalPaddingByType = {
  'edit-alert': '20px',
  'edit-room-type': '20px',
  'edit-association': '0px',
};

export type CicleType = {
  modelId: number,
  subGroupName: string,
  groupName: string,
  rateModalityName: string,
}
interface DevsExtraInfo {
  UNIT_ID: number
  DEV_ID?: string
  DAC_ID?: string
  DAM_ID?: string
  DUT_ID?: string
  type?: 'DAC' | 'DUT' | 'DAM'
  MACHINE_ID?: number
}
interface DamsExtraInfo extends DevsExtraInfo {
  DAM_ID: string
  units?: {}[]
  groups?: {}[]
}
type DacsExtraInfo = DevsExtraInfo
type DutsExtraInfo = DevsExtraInfo
interface FreeDevExtraInfo extends DevsExtraInfo {
  freeDevChecked?: boolean
}

type IluminationListItem = ApiResps['/dal/get-dal-illumination-list'][number] & { checked?: boolean };
type NobreakListItem = ApiResps['/dmt/get-dmt-nobreak-list'][number] & { checked?: boolean };

type EnvironmentList = {
  DEV_ID: string,
  UNIT_ID: number,
  UNIT_NAME: string,
  ENVIRONMENT_ID: number,
  ROOM_NAME: string,
  ENVIRONMENTS_ROOM_TYPES_ID: number,
  PLACEMENT: string,
  ISVISIBLE: number,
  temprtAlert: null,
  status: string,
  CITY_ID: string,
  CITY_NAME: string,
  STATE_ID: string,
  STATE_NAME: string,
  COUNTRY_NAME: string,
  LAT: string,
  LON: string,
  CLIENT_NAME: string,
  CLIENT_ID: number,
  RTYPE_ID: number,
  RTYPE_NAME: string,
  DUT_ID?: string,
  type?: string,
}

export const ClientPanelPage = (): JSX.Element => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar({
    isLoading: true,
    clients: [] as {}[],
    selectedClient: null as null | { CLIENT_ID: number },
    async fetchServerData() {
      try {
        if (profile.viewMultipleClients) {
          setState({ isLoading: true });
          const { list } = await apiCall('/clients/get-clients-list', {});
          state.clients = list;
        }
      } catch (err) { console.log(err); toast.error('Houve erro'); }
      setState({ isLoading: false });
    },
  });

  let clientId = (state.selectedClient && state.selectedClient.CLIENT_ID);
  if ((!clientId) && profile.singleClientViewId) {
    clientId = profile.singleClientViewId;
  }

  useEffect(() => {
    state.fetchServerData();
  }, []);

  if (state.isLoading) return <Loader />;

  return (
    <div>
      {profile.viewMultipleClients && (
        <Select
          options={state.clients}
          propLabel="NAME"
          value={state.selectedClient}
          placeholder="Cliente"
          onSelect={(item) => { setState({ selectedClient: item }); }}
          style={{ width: '300px' }}
        />
      )}
      {(clientId)
        ? <ClientPanel clientId={clientId} clientInfo={state.selectedClient} />
        : <div style={{ marginTop: '20px' }}>Nenhum cliente selecionado</div>}
    </div>
  );
};

export type RateModelsType = {
  modelName: string,
  modelId: number,
  distributorId: number,
  hide: boolean,
  subGroupId: number,
  subGroupName: string,
  rateGroupId: number,
  groupName: string,
  rateModalityId: number,
  rateModalityName: string,
  distributorTag: string,
  distributorLabel: string,
  rateCicles: {
    CICLE_ID: number
    MODEL_ID: number
    START_CICLE_DATE: string
    END_CICLE_DATE: string
    VIGENCYCICLE: boolean
    PIS: number
    COFINS: number
    ICMS: number
    CONVENTIONALRATE_PARAMETERS?: {
      RATE: string
      CONVENTIONALRATE_ID: number,
    }
    WHITERATE_PARAMETERS?: {
      WHITERATE_ID: number,
      RATE_PONTA: string,
      RATE_OUTPONTA: string,
      START_PONTA: string,
      END_PONTA: string,
      FIRST_MID_RATE: string,
      START_FIRST_MID_RATE: string,
      END_FIRST_MID_RATE: string,
      LAST_MID_RATE?: string,
      START_LAST_MID_RATE: string,
      END_LAST_MID_RATE: string,
    },
  }[]
}

const deviceLink = (props, PROP) => (
  <div>
    {props[PROP] ? (
      <StyledLink to={`/analise/dispositivo/${props[PROP]}/informacoes`}>
        {props[PROP]}
      </StyledLink>
    ) : '-'}
  </div>
);

export const ClientPanel = ({ clientId, clientInfo }): JSX.Element => {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const csvLinkEl = useRef();
  const history = useHistory();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      selectedClient: null as null | { NAME: string },
      clientId: null as null | number,
      openModal: null as null | string,
      cicleToEdit: {} as CicleType || null,
      selectedModelId: null as number | null,
      rateModels: [] as RateModelsType[],
      isLoadingDuts: false,
      roomTypes: [] as (ApiResps['/clients/get-roomtypes-list']['rtypes'] & ({
        DUTS_COUNT?: number
        DRIS_COUNT?: number
        schedCol?: string
      })[]),
      units: [] as (ApiResps['/clients/get-units-list'] & ({
        groups?: {}[]
        duts?: {}[]
        DACS_COUNT?: number
        DUTS_COUNT?: number
        DAMS_COUNT?: number
        DRIS_COUNT?: number
        disp?: number
      })[]),
      energyMetersList: [] as (ApiResps['/energy/get-energy-list']['list']),
      timezonesList: [] as { value: number, label: string }[],
      statesList: [] as { STATE_NAME: string, STATE_ID: string, COUNTRY_ID: number }[],
      citiesList: [] as { CITY_NAME: string, CITY_ID: string, STATE_ID: string }[],
      countriesList: [] as { COUNTRY_NAME: string, COUNTRY_ID: number }[],
      accessPointsList: [] as {
        name: string,
        cnpjs: string[],
        access_points: string[]
      }[],
      damsListFull: [] as (ApiResps['/dam/get-dams-list']['list'] & (DamsExtraInfo[])),
      damsListDac: [] as (ApiResps['/dam/get-dams-list']['list'] & (DamsExtraInfo[])),
      damsList: [] as (ApiResps['/dam/get-dams-list']['list'] & (DamsExtraInfo[])),
      dacsList: [] as (ApiResps['/dac/get-dacs-list']['list'] & (DacsExtraInfo[])),
      environmentList: [] as EnvironmentList[],
      dutsList: [] as (ApiResps['/dut/get-duts-list']['list'] & (DutsExtraInfo[])),
      drisList: [] as (ApiResps['/dri/get-dris-list']['list']),
      modelsChillerList: [] as (ApiResps['/dri/get-chiller-models-list']['list']),
      vavsList: [] as (ApiResps['/dri/get-dri-vavs-list']['list']),
      waterList: [] as (ApiResps['/get-integrations-list/water']['list']),
      groupsList: [] as (ApiResps['/clients/get-groups-list'] & ({
        DEVS_COUNT?: number
        dacs?: { DAC_ID: string }[]
        checked?: boolean
      }[])),
      machinesWithAssetsList: [] as (ApiResps['/clients/get-machines-list']&({
        DEVS_QUANTITY?: number
        dacs?: { DAC_ID: string }[]
        checked?: boolean
      }[])),
      associationsList: [] as (ApiResps['/clients/get-associations-list']['list'] & ({
        checked?: boolean
        UNIT_NAME?: string
        GROUPS_COUNT?: string
      }[])),
      classesList: [] as { CLASS_ID: number, CLASS_TYPE: string, CLASS_NAME: string }[],
      distributorsList: [] as { value: number, name: string, tag: string }[],
      unitsOpt: [] as { value: number, name: string }[],
      comboOpts: {} as {
        fluids: { value: number, name: string, id: string, }[],
        types: { value: number, name: string, id: string, }[],
        brands: { value: number, name: string, id: string, }[],
        applics: { value: number, name: string, id: string, }[],
        roles: { value: number, name: string }[],
        chillerModels: { value: number, name: string }[],
        chillerLines: { value: number, name: string }[],
      },
      freeDevs: [] as FreeDevExtraInfo[],
      showDAMs: false,
      showDUTs: false,
      selectedUnit: null as null|{ UNIT_ID: number; UNIT_NAME: string; },
      selectedGroup: null as null|{ GROUP_ID: number, GROUP_NAME: string, UNIT_ID: number, DEV_AUT: string, DUT_ID: string, DAM_ID: string },
      selectedMachine: null as null|(ApiResps['/clients/get-machines-list'][0]),
      isViewMachine: false as boolean,
      selectedAssociation: null as null|ApiResps['/clients/get-associations-list']['list'],
      selectedDut: null as null|{},
      selectedRoomType: null as null|{
        RTYPE_ID: number;
        RTYPE_NAME: string;
        TUSEMIN: number;
        TUSEMAX: number;
        fullProg: FullProg_v4;
        CO2MAX: number;
        HUMIMAX: number;
        HUMIMIN: number;
      },
      selectedAlert: null as null | {},
      selectedClass: null as null | { CLASS_ID: number, CLASS_TYPE: string, CLASS_NAME: string },
      selectedRateModel: null as null | RateModels,
      selectedRateCicle: null as null | RateCicleType,
      selectedHeatExchanger: null as null | {},
      unitsDisp: {} as {
        [unitId: number]: {
          clientId: number;
          clientName: string;
          unitId: number;
          unitName: string;
          avgDisp: number;
          dispList: {
            disponibility: number;
            YMD: string;
          }[];
        };
      },
      unitsDispLoading: false,
      csvData: [] as {}[],
      // openModal: false,
      lastDate: moment().subtract(1, 'days'),
      selectedDate: moment().subtract(1, 'days'),
      datesRange: getDatesRange(moment().subtract(1, 'days'), 7) as {
        mdate: moment.Moment,
        YMD: string,
        DMY: string,
      }[],
      focusedInput: null,
      focused: false,
      gettingCsv: false,

      associationsColumns: [
        {
          name: 'name',
          value: 'Nome',
          width: 200,
          render: (props) => (
            <div onClick={() => showGroups(props)}>
              <SeeAssociationGroups>{props.ASSOC_NAME}</SeeAssociationGroups>
            </div>
          ),
        },
        {
          name: 'unit',
          value: 'Unidade',
          accessor: 'UNIT_NAME',
          width: 120,
          textAlign: 'center',
        },
        {
          name: 'groups',
          value: 'Máquinas',
          accessor: 'GROUPS_COUNT',
          width: 120,
          textAlign: 'center',
        },
        profile.manageAllClients && {
          name: 'edit',
          value: 'Editar',
          sortable: false,
          textAlign: 'center',
          width: 120,
          render: (props) => (
            <ActionButton onClick={() => openCreateEditAssociation(props)} variant="blue-inv">
              <EditIcon color={colors.LightBlue} />
            </ActionButton>
          ),
        },
        profile.permissions.isAdminSistema && {
          name: 'delete',
          value: 'Excluir',
          sortable: false,
          textAlign: 'center',
          width: 80,
          render: (props) => (
            <Checkbox
              key={props.ASSOC_ID}
              checked={props.checked}
              onClick={(event) => {
                props.checked = !props.checked;
                render();
              }}
            />
          ),
        },
      ].filter((x) => !!x),

      groupColumns: [
        {
          name: 'name',
          value: 'Nome',
          accessor: 'GROUP_NAME',
        },
        {
          name: 'unit',
          value: 'Unidade',
          accessor: 'UNIT_NAME',
        },
        {
          name: 'city',
          value: 'Cidade',
          accessor: 'CITY_NAME',
        },
        {
          name: 'state',
          value: 'Estado',
          accessor: 'STATE_ID',
          textAlign: 'center',
        },
        {
          name: 'devices',
          value: 'Dispositivos',
          accessor: 'DEVS_COUNT',
          width: 120,
          textAlign: 'center',
        },
        profile.manageAllClients && {
          name: 'edit',
          value: 'Editar',
          sortable: false,
          textAlign: 'center',
          width: 120,
          render: (props) => (
            <ActionButton onClick={() => openCreateEditGroup(props.unit, props)} variant="blue-inv">
              <EditIcon color={colors.LightBlue} />
            </ActionButton>
          ),
        },
        profile.permissions.isAdminSistema && {
          name: 'delete',
          value: 'Excluir',
          sortable: false,
          textAlign: 'center',
          width: 80,
          render: (props) => (
            <Checkbox
              key={props.GROUP_ID}
              checked={props.checked}
              onClick={(event) => {
                props.checked = !props.checked;
                render();
              }}
            />
          ),
        },
      ],

      machineColumns: [
        {
          name: 'group_id',
          value: 'Id',
          accessor: 'GROUP_ID',
        },
        {
          name: 'name',
          value: 'Máquina',
          accessor: 'GROUP_NAME',
        },
        {
          name: 'unit',
          value: 'Unidade',
          accessor: 'UNIT_NAME',
        },
        {
          name: 'assets',
          value: 'Ativos',
          accessor: 'ASSETS_COUNT',
          width: 120,
          textAlign: 'center',
        },
        {
          name: 'devices',
          value: 'Dispositivos',
          accessor: 'DEVS_QUANTITY',
          width: 120,
          textAlign: 'center',
        },
        profile.manageAllClients && {
          name: 'actions',
          value: 'Ações',
          sortable: false,
          textAlign: 'center',
          width: 120,
          render: (props) => (
            <div>
              <ActionButton onClick={() => openCreateEditMachine(props.unit, props, true)}>
                <OpenEyeIcon color="#363BC4" />
              </ActionButton>
              <ActionButton onClick={() => openCreateEditMachine(props.unit, props, false)}>
                <EditIcon variant="note" color="#363BC4" />
              </ActionButton>
            </div>
          ),
        },
        profile.permissions.isAdminSistema && {
          name: 'delete',
          value: 'Excluir',
          sortable: false,
          textAlign: 'center',
          width: 80,
          render: (props) => (
            <Checkbox
              key={props.GROUP_ID}
              checked={props.checked}
              onClick={() => {
                props.checked = !props.checked;
                render();
              }}
            />
          ),
        },
      ],
      heatExchangerColumns: [
        {
          name: 'name',
          value: 'Nome',
          accessor: 'NAME',
        },
        {
          name: 't_min',
          value: 'T-min (Saída)',
          accessor: 'T_MIN',
        },
        {
          name: 't_max',
          value: 'T-max (Saída)',
          accessor: 'T_MAX',
        },
        {
          name: 'deltaT_min',
          value: 'ΔT-min',
          accessor: 'DELTA_T_MIN',
        },
        {
          name: 'deltaT_max',
          value: 'ΔT-max',
          accessor: 'DELTA_T_MAX',
        },
        profile.manageAllClients && {
          name: 'actions',
          value: '',
          sortable: false,
          textAlign: 'center',
          width: 120,
          render: (props) => (
            <div>
              <ActionButton
                onClick={() => deleteHeatExchanger(props.ID)}
                variant="red-inv"
              >
                <DeleteOutlineIcon colors={colors.Red} />
              </ActionButton>
              <ActionButton onClick={() => openCreateEditHeatExchangere(props)} variant="blue-inv">
                <EditIcon color={colors.LightBlue} />
              </ActionButton>
            </div>
          ),
        },
      ],
      heatExchangersList: [] as (ApiResps['/heat-exchanger/get-list-v2']),
      nobreaksColumns: [
        {
          name: 'id',
          value: 'Id',
          accessor: 'ID',
        },
        {
          name: 'unit',
          value: t('unidade'),
          accessor: 'UNIT_NAME',
          render: (props) => (
            <div>
              {props.UNIT_NAME || '-'}
            </div>
          ),
        },
        {
          name: 'utility',
          value: t('utilitario'),
          accessor: 'NAME',
          render: (props) => (
            <StyledLink to={`/analise/utilitario/nobreak/${props.ID}/informacoes`}>
              {props.NAME || '-'}
            </StyledLink>
          ),
        },
        {
          name: 'manufacturer',
          value: t('fabricante'),
          accessor: 'MANUFACTURER',
          render: (props) => (
            <div>
              {props.MANUFACTURER || '-'}
            </div>
          ),
        },
        {
          name: 'model',
          value: t('modelo'),
          accessor: 'MODEL',
          render: (props) => (
            <div>
              {props.MODEL || '-'}
            </div>
          ),
        },
        {
          name: 'battery',
          value: t('bateria'),
          accessor: 'NOMINAL_BATTERY_LIFE',
          render: (props) => (
            <div>
              {props.NOMINAL_BATTERY_LIFE ? `${props.NOMINAL_BATTERY_LIFE} min` : '-'}
            </div>
          ),
        },
        {
          name: 'monitoring',
          value: t('monitoramento'),
          accessor: 'DMT_CODE',
          render: (props) => deviceLink(props, 'DMT_CODE'),
        },
        {
          name: 'feedback',
          value: t('feedback'),
          accessor: 'PORT',
          render: (props) => (
            <div>
              {props.PORT ? `F${props.PORT}` : '-'}
            </div>
          ),
        },
        ...getUtilityActionColumns(),
      ],
      illuminationColumns: [
        {
          name: 'id',
          value: 'Id',
          accessor: 'ID',
        },
        {
          name: 'unit',
          value: t('unidade'),
          accessor: 'UNIT_NAME',
        },
        {
          name: 'utility',
          value: t('utilitario'),
          accessor: 'NAME',
          render: (props) => (
            <StyledLink to={`/analise/utilitario/iluminacao/${props.ID}/informacoes`}>
              {props.NAME}
            </StyledLink>
          ),
        },
        {
          name: 'device',
          value: t('dispositivo'),
          accessor: 'DEVICE_CODE',
          render: (props) => deviceLink(props, 'DEVICE_CODE'),
        },
        {
          name: 'PORT',
          value: t('porta'),
          accessor: 'PORT',
          render: (props) => (
            <div>
              {props.PORT || '-'}
            </div>
          ),
        },
        {
          name: 'FEEDBACK',
          value: t('feedback'),
          accessor: 'FEEDBACK',
          render: (props) => (
            <div>
              {props.FEEDBACK ? 'F'.concat(props.FEEDBACK) : '-'}
            </div>
          ),
        },
        ...getUtilityActionColumns(),
      ],
      selectedUtilityItem: null as null | {},
      selectedUtility: t('nobreak') as string,
      iluminationList: [] as IluminationListItem[],
      nobreakList: [] as NobreakListItem[],
    };
    state.groupColumns = state.groupColumns.filter((x) => !!x);

    state.machineColumns = state.machineColumns.filter((x) => !!x);

    state.heatExchangerColumns = state.heatExchangerColumns.filter((x) => !!x);

    return state;
  });

  function getUtilityActionColumns() {
    const actionColumns = [] as any;
    if (profile.manageAllClients) {
      actionColumns.push({
        name: 'actions',
        value: t('acoes'),
        sortable: false,
        textAlign: 'center',
        width: 120,
        render: (props) => (
          <div>
            <ActionButton onClick={() => openViewUtility(props)}>
              <OpenEyeIcon color="#363BC4" />
            </ActionButton>
            <ActionButton onClick={() => openCreateEditUtility(props)}>
              <EditIcon variant="note" color="#363BC4" />
            </ActionButton>
          </div>
        ),
      });
    }
    if (profile.permissions.isAdminSistema) {
      actionColumns.push({
        name: 'delete',
        value: t('excluir'),
        sortable: false,
        textAlign: 'center',
        width: 80,
        render: (props) => (
          <Checkbox
            key={props.ID}
            checked={props.checked}
            onClick={() => {
              props.checked = !props.checked;
              render();
            }}
          />
        ),
      });
    }
    return actionColumns;
  }

  const deleteHeatExchanger = async (ID) => {
    try {
      await apiCall('/heat-exchanger/delete-info', { CLIENT_ID: clientId, ID });
      toast.success('Trocador de calor deletado com sucesso');
      await fetchServerData();
    } catch (err) {
      console.log(err);
      toast.error('Houve erro ao deletar trocador de calor. Possivelmente o tipo está sendo utilizado em algum DAC.');
    }
  };

  function onDateChange(date, dateEnd) {
    state.selectedDate = date;
    state.datesRange = getDatesRange(date, 7);
    render();
  }

  function clearServerData() {
    state.roomTypes = [];
    state.units = [];
    state.timezonesList = [];
    state.statesList = [];
    state.citiesList = [];
    state.damsListDac = [];
    state.damsListFull = [];
    state.damsList = [];
    state.dacsList = [];
    state.dutsList = [];
    state.drisList = [];
    state.modelsChillerList = [];
    state.vavsList = [];
    state.groupsList = [];
    state.classesList = [];
    state.associationsList = [];
    state.machinesWithAssetsList = [];
    state.unitsOpt = [];
  }

  function clearProcessedData() {
    state.damsListDac = [];
    state.damsList = [];
    state.freeDevs = [];
    state.showDAMs = false;
    state.showDUTs = false;
    state.selectedUnit = null;
    state.selectedGroup = null;
    state.selectedDut = null;
    state.selectedRoomType = null;
    state.selectedAlert = null;
    state.selectedClass = null;
    state.selectedAssociation = null;
  }

  function resetParamsUrl() {
    const linkBase = history.location.pathname;
    history.push(linkBase);
  }

  function setEnvironmentList(environments) {
    const newListEnvFiltered = [] as EnvironmentList[];
    const listIds = [] as number[];
    environments.forEach((item) => {
      if (listIds.includes(item.ENVIRONMENT_ID)) {
        return;
      }
      newListEnvFiltered.push({
        DEV_ID: item.DUT_CODE || '-',
        UNIT_ID: item.UNIT_ID,
        UNIT_NAME: item.UNIT_NAME,
        ENVIRONMENT_ID: item.ENVIRONMENT_ID,
        ROOM_NAME: item.ENVIRONMENT_NAME,
        ENVIRONMENTS_ROOM_TYPES_ID: item.ENVIRONMENTS_ROOM_TYPES_ID,
        PLACEMENT: 'AMB',
        ISVISIBLE: 1,
        temprtAlert: null,
        status: '',
        CITY_ID: item.CITY_ID,
        CITY_NAME: item.CITY_NAME,
        STATE_ID: item.STATE_ID,
        STATE_NAME: item.STATE_NAME,
        COUNTRY_NAME: item.COUNTRY_NAME,
        LAT: item.LAT,
        LON: item.LON,
        CLIENT_NAME: item.CLIENT_NAME,
        CLIENT_ID: item.CLIENT_ID,
        RTYPE_ID: item.RTYPE_ID,
        RTYPE_NAME: item.RTYPE_NAME,
        checked: false,
      });
      listIds.push(item.ENVIRONMENT_ID);
    });
    state.dutsList.forEach((item) => {
      if (!item.ENVIRONMENT_ID && item.DEV_ID) {
        newListEnvFiltered.push({
          DEV_ID: item.DEV_ID || '-',
          UNIT_ID: item.UNIT_ID,
          UNIT_NAME: item.UNIT_NAME,
          ENVIRONMENT_ID: item.ENVIRONMENT_ID,
          ROOM_NAME: item.ROOM_NAME,
          ENVIRONMENTS_ROOM_TYPES_ID: item.ENVIRONMENTS_ROOM_TYPES_ID,
          PLACEMENT: 'AMB',
          ISVISIBLE: 1,
          temprtAlert: null,
          status: '',
          CITY_ID: item.CITY_ID,
          CITY_NAME: item.CITY_NAME,
          STATE_ID: item.STATE_ID,
          STATE_NAME: item.STATE_NAME,
          COUNTRY_NAME: item.COUNTRY_NAME,
          LAT: item.LAT,
          LON: item.LON,
          CLIENT_NAME: item.CLIENT_NAME,
          CLIENT_ID: item.CLIENT_ID,
          RTYPE_ID: item.RTYPE_ID,
          RTYPE_NAME: item.RTYPE_NAME,
          checked: false,
        });
      }
    });
    state.environmentList = newListEnvFiltered;
  }

  async function fetchServerData(clientId?: null|number) {
    try {
      state.isLoading = true; render();

      if (clientId) state.clientId = clientId;
      clientId = state.clientId;

      clearServerData();

      if (!clientId) {
        state.isLoading = false; render();
        return;
      }

      await Promise.all([
        apiCall('/dmt/get-dmt-nobreak-list', { clientIds: [clientId], INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients }).then((data) => { state.nobreakList = data.map((nobreak) => ({ ...nobreak, checked: false })); }),
        apiCall('/dal/get-dal-illumination-list', { clientIds: [clientId], INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients }).then((data) => { state.iluminationList = data.map((illum) => ({ ...illum, checked: false })); }),
        apiCall('/heat-exchanger/get-list-v2', { CLIENT_ID: clientId }).then((data) => { state.heatExchangersList = data; }),
        apiCall('/dam/get-dams-list', { clientId, includeDacs: true }).then(({ list }) => { state.damsListFull = list; }),
        apiCall('/dac/get-dacs-list', { clientId }).then(({ list }) => { state.dacsList = list; }),
        apiCall('/dut/get-duts-list', { clientId, INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients }).then(({ list }) => { state.dutsList = list.map((item) => ({ ...item, checked: false })); }),
        apiCall('/dri/get-dris-list', { clientIds: [clientId] }).then(({ list }) => { state.drisList = list; }),
        apiCall('/dri/get-dri-vavs-list', { clientId }).then(({ list }) => { state.vavsList = list.map((item) => ({ ...item, checked: false })); }),
        apiCall('/dri/get-chiller-models-list', {}).then(({ list }) => { state.modelsChillerList = list; }),
        apiCall('/clients/get-units-list', { CLIENT_ID: clientId, INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients }).then((list) => { list.forEach((unit) => Object.assign(unit, { LATLON: (unit.LAT && unit.LON) ? `${unit.LAT}, ${unit.LON}` : '-' })); state.units = list; list.forEach((unit) => state.unitsOpt.push({ value: unit.UNIT_ID, name: unit.UNIT_NAME })); }),
        apiCall('/clients/get-groups-list', { clientIds: [clientId] }).then((list) => { state.groupsList = list; }),
        apiCall('/clients/get-machines-list', { clientIds: [clientId], INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients }).then((list) => { state.machinesWithAssetsList = list; }),
        apiCall('/clients/get-roomtypes-list', { CLIENT_ID: clientId }).then(({ rtypes }) => { state.roomTypes = rtypes; }),
        apiCall('/get-timezones-list-with-offset', {}).then(({ list }) => {
          state.timezonesList = list.map((item) => ({ label: `${item.area} (${item.offset})`, value: item.id }));
        }),
        apiCall('/dac/get-states-list', { full: true }).then(({ list }) => {
          state.statesList = list.map((item) => ({ STATE_NAME: item.fullName, STATE_ID: item.fullName, COUNTRY_ID: item.countryId }));
        }),
        (async function () {
          if (profile.manageAllClients) {
            const { list } = await apiCall('/four-docs/get-login-data');
            state.accessPointsList = list.providers;
          }
        }()),
        apiCall('/dac/get-cities-list', {}).then((responseData) => {
          state.citiesList = responseData.list.map((item) => ({ CITY_NAME: item.name, CITY_ID: item.id, STATE_ID: item.stateFullName }));
        }),
        apiCall('/dac/get-countries-list', { full: true }).then((responseData) => {
          state.countriesList = responseData.list.map((item) => ({ COUNTRY_NAME: item.name, COUNTRY_ID: item.id }));
        }),
        apiCall('/clients/get-client-classes', { CLIENT_ID: clientId }).then(({ list }) => state.classesList = list),
        apiCall('/clients/get-associations-list', { CLIENT_ID: clientId }).then(({ list }) => state.associationsList = list),
        apiCall('/clients/get-distributors', { CLIENT_ID: clientId }).then(({ distributors }) => distributors.map((item) => state.distributorsList.push({ value: item.id, name: item.label, tag: item.tag }))),
        apiCall('/energy/get-energy-list', { clientId }).then(({ list }) => state.energyMetersList = list),
        apiCall('/dev/dev-info-combo-options', {
          CLIENT_ID: clientId,
          fluids: true,
          types: true,
          brands: true,
          roles: true,
          applics: true,
          chillerModels: true,
          chillerLines: true,
        }).then(({
          types,
          brands,
          fluids,
          roles,
          applics,
          chillerModels,
          chillerLines,
        }) => {
          state.comboOpts.brands = [];
          state.comboOpts.fluids = [];
          state.comboOpts.roles = [];
          state.comboOpts.types = [];
          state.comboOpts.applics = [];
          state.comboOpts.chillerModels = [];
          state.comboOpts.chillerLines = [];
          types?.forEach((type, index) => { state.comboOpts.types.push({ value: index + 1, name: type.label, id: type.value }); });
          brands?.forEach((brand, index) => state.comboOpts.brands.push({ value: index + 1, name: brand.label, id: brand.value }));
          fluids?.forEach((fluid, index) => state.comboOpts.fluids.push({ value: index + 1, name: fluid.label, id: fluid.value }));
          applics?.forEach((applic, index) => { if (applic.value !== 'iluminacao') state.comboOpts.applics.push({ value: index + 1, name: applic.label, id: applic.value }); });
          roles?.forEach((role) => state.comboOpts.roles.push({ value: Number(role.value), name: role.label }));
          chillerModels?.forEach((model) => { state.comboOpts.chillerModels.push({ value: Number(model.value), name: model.label }); });
          chillerLines?.forEach((line) => { state.comboOpts.chillerLines.push({ value: Number(line.value), name: line.label }); });
        }),
        apiCall('/environments/get-environment-list', { CLIENT_ID: clientId, INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients }).then(({ environments }) => {
          setEnvironmentList(environments);
        }),
      ]);
      processReceivedServerData();
      apiCall('/get-integrations-list/water', { clientIds: [clientId] }).then(({ list }) => { state.waterList = list; });
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.isLoading = false; render();
  }

  async function calculateClientUnitsDisp(clientId) {
    try {
      setState({ unitsDispLoading: true });

      const endDate = moment(state.lastDate).format('YYYY-MM-DD');
      const startDate = moment(state.lastDate).subtract(6, 'days').format('YYYY-MM-DD');
      state.unitsDisp = {};
      for (const unit of state.units) {
        const unitDisp = await apiCall('/clients/get-client-units-disp', {
          CLIENT_ID: clientId,
          UNIT_ID: unit.UNIT_ID,
          startDate,
          endDate,
        });
        state.unitsDisp = { ...state.unitsDisp, ...unitDisp };
      }
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível calcular a disponibilidade dos dispositivos');
    }
    setState({ unitsDispLoading: false });
  }

  async function getDispCsvData() {
    state.gettingCsv = true; render();
    const formattedCSV = [] as any;

    let data = [] as {
      clientId: number;
      clientName: string;
      unitId: number;
      unitName: string;
      avgDisp: number;
      dispList: {
        disponibility: number;
        YMD: string;
      }[];
    }[];

    try {
      if (moment(state.selectedDate).format('YYYY-MM-DD') === moment(state.lastDate).format('YYYY-MM-DD')) {
        if (Object.values(state.unitsDisp).length > 0) {
          data = Object.values(state.unitsDisp);
        } else {
          toast.info('Não há dados de disponibilidade para exportar!'); state.isLoading = false;
        }
      } else {
        let dispList = {};
        for (const unit of state.units) {
          const unitDisp = await apiCall('/clients/get-client-units-disp', {
            UNIT_ID: unit.UNIT_ID,
            CLIENT_ID: clientId,
            startDate: state.datesRange[state.datesRange.length - 1].YMD,
            endDate: state.datesRange[0].YMD,
          });
          dispList = { ...dispList, ...unitDisp };
        }
        if (Object.values(dispList).length > 0) {
          data = Object.values(dispList);
        } else {
          toast.info('Não há dados de disponibilidade para exportar!'); state.isLoading = false;
        }
      }

      data.forEach((item) => {
        item.dispList.forEach((disp) => {
          const day = daysOfTheWeek[moment(disp.YMD).day()];
          formattedCSV.push({
            cliente: item.clientName,
            unidade: item.unitName,
            id: item.unitId,
            disponibilidade: disp.disponibility?.toFixed(1).replace('.', ','),
            dia: ` ${day}, ${moment(disp.YMD).format('DD-MM-YYYY')}`,
          });
        });
      });

      formattedCSV.sort((a, b) => {
        const [d1, m1, y1] = a.dia.split(', ')[1].split('-');
        const [d2, m2, y2] = b.dia.split(', ')[1].split('-');
        return moment(`${y1}-${m1}-${d1}`).diff(moment(`${y2}-${m2}-${d2}`));
      });

      state.csvData = formattedCSV;
      render();
      setTimeout(() => {
        (csvLinkEl as any).current.link.click();
      }, 1000);

      state.gettingCsv = false; render();
    } catch (err) { console.log(err); toast.error('Houve erro'); state.gettingCsv = false; render(); }
  }

  function processReceivedServerData() {
    clearProcessedData();

    state.showDAMs = !!(state.damsListFull.length);
    state.showDUTs = !!(state.dutsList.length || state.roomTypes.length || state.vavsList.length);

    const units = {};
    for (const unit of state.units) {
      units[unit.UNIT_ID] = unit;
      unit.groups = [];
      unit.duts = [];
      unit.DACS_COUNT = 0;
      unit.DUTS_COUNT = 0;
      unit.DAMS_COUNT = 0;
      unit.DRIS_COUNT = 0;
    }

    const roomTypes = {};
    for (const rType of state.roomTypes) {
      roomTypes[rType.RTYPE_ID] = rType;
      rType.DUTS_COUNT = 0;
      rType.DRIS_COUNT = 0;
    }

    // const dams = {}
    for (const dam of state.damsListFull) {
      dam.DEV_ID = dam.DEV_ID || dam.DAM_ID || dam.DAC_ID;
      if (dam.isDac) {
        state.damsListDac.push(dam);
      } else {
        state.damsList.push(dam);
      }
      // dams[dam.DAM_ID] = dam
      dam.groups = [];
      dam.units = [];
    }

    const groups = {};
    for (const group of state.groupsList) {
      groups[group.GROUP_ID] = group;
      group.dacs = [];
      // group.unit = units[group.UNIT_ID]
      // group.unit.groups.push(group)
      // if (group.DAM_ID) {
      //   group.dam = dams[group.DAM_ID];
      //   if (group.dam) {
      //     group.dam.groups.push(group);
      //     group.dam.units.push(units[group.UNIT_ID]);
      //   }
      // }
    }
    for (const machine of state.machinesWithAssetsList) {
      groups[machine.GROUP_ID] = machine;
      machine.dacs = [];
      for (const dac of state.dacsList) {
        if (dac.GROUP_ID === machine.GROUP_ID) {
          machine.dacs?.push(dac);
        }
      }
    }

    for (const dut of state.dutsList) {
      // dut.alerts = []
      if (dut.UNIT_ID) {
        // dut.unit = units[dut.UNIT_ID]
        units[dut.UNIT_ID].duts.push(dut);
      }
    }

    for (const machine of state.machinesWithAssetsList) {
      let DEVS_QUANTITY = machine.dacs!.length;
      if (machine.DEV_AUT) DEVS_QUANTITY++;
      machine.assets.forEach((asset) => {
        if (asset.DEV_ID) DEVS_QUANTITY++;
      });
      machine.DEVS_QUANTITY = DEVS_QUANTITY;
    }

    for (const association of state.associationsList) {
      const unit = state.units.find((unit) => unit.UNIT_ID === association.UNIT_ID);
      const GROUPS_COUNT = association.GROUPS.length;
      association.GROUPS_COUNT = `${GROUPS_COUNT} Máquinas`;
      association.UNIT_NAME = unit?.UNIT_NAME;
    }

    for (const dac of state.dacsList) {
      dac.DEV_ID = dac.DEV_ID || dac.DAC_ID;
      dac.type = 'DAC';
      if (!dac.GROUP_ID) { state.freeDevs.push(dac); }
      if (dac.UNIT_ID) units[dac.UNIT_ID].DACS_COUNT++;
    }
    for (const dut of state.dutsList) {
      dut.DEV_ID = (dut.DEV_ID || dut.DUT_ID)!;
      dut.type = 'DUT';
      if (dut.UNIT_ID) units[dut.UNIT_ID].DUTS_COUNT++;
      if (dut.RTYPE_ID) roomTypes[dut.RTYPE_ID].DUTS_COUNT++;
    }
    for (const dam of state.damsList) {
      dam.DEV_ID = dam.DEV_ID || dam.DAM_ID;
      dam.type = 'DAM';
      if (!dam.groups!.length) { state.freeDevs.push(dam); }
      if (dam.UNIT_ID && units[dam.UNIT_ID]) units[dam.UNIT_ID].DAMS_COUNT++;
    }
    for (const dri of state.drisList) {
      if (dri.UNIT_ID) units[dri.UNIT_ID].DRIS_COUNT++;
    }
    for (const vav of state.vavsList) {
      if (vav.RTYPE_ID && roomTypes[vav.RTYPE_ID]) roomTypes[vav.RTYPE_ID].DRIS_COUNT++;
    }

    for (const roomType of state.roomTypes) {
      const pData = getDaySched(roomType.workPeriods, roomType.workPeriodExceptions);
      roomType.schedCol = (pData && pData.desc) || '-';
    }

    // for (const alertInfo of state.alerts) {
    //   // alertInfo.filterDesc = 'Caixas'
    //   // alertInfo.timeDesc = 'entre 8:00 e 17:00'
    //   // alertInfo.condDesc = 'temperatura maior que 26°C ou menor que 18°C'
    //   let relatedRooms = []
    //   if (alertInfo.FILT_TYPE === 'UNIT') {
    //     for (const unitId of alertInfo.FILT_IDS) {
    //       relatedRooms = relatedRooms.concat(units[unitId].rooms)
    //     }
    //   }
    //   if (alertInfo.FILT_TYPE === 'ROOM') {
    //     relatedRooms = relatedRooms.concat(alertInfo.FILT_IDS.map(roomId => rooms[roomId]))
    //   }
    //   for (const room of relatedRooms) {
    //     room.alerts.push(alertInfo)
    //   }
    // }

    render();
  }

  function showGroups(association) {
    state.selectedAssociation = association;
    state.openModal = 'show-association-groups'; render();
  }

  function openCreateEditModel(itemToEdit?: RateModels) {
    state.selectedRateModel = itemToEdit || null;
    state.openModal = 'edit-model'; render();
  }

  function openCreateCicle(ModelRate: CicleType, itemToEdit?: RateCicleType) {
    state.cicleToEdit = ModelRate;
    state.selectedRateCicle = itemToEdit || null;
    state.openModal = 'edit-cicle'; render();
  }

  function openCreateEditCicle(itemToEdit?: { UNIT_ID: number; UNIT_NAME: string; }) {
    state.selectedUnit = itemToEdit || null;
    state.openModal = 'create-cicle'; render();
  }

  function openCreateEditUnit(itemToEdit?: { UNIT_ID: number; UNIT_NAME: string; }) {
    state.selectedUnit = itemToEdit || null;
    state.openModal = 'edit-unit'; render();
  }
  function openCreateEditGroup(unit?: { UNIT_ID: number; UNIT_NAME: string; }, itemToEdit?: { GROUP_ID: number }) {
    state.selectedUnit = unit || null;
    // @ts-ignore
    state.selectedGroup = itemToEdit || null;
    state.openModal = 'edit-group'; render();
  }

  function openCreateEditMachine(unit?: { UNIT_ID: number; UNIT_NAME: string; }, itemToEdit?: { GROUP_ID: number }, isView?: boolean) {
    state.selectedUnit = unit || null;
    // @ts-ignore
    state.selectedGroup = itemToEdit || null;
    state.isViewMachine = isView || false;
    state.selectedMachine = state.machinesWithAssetsList.find((item) => item.GROUP_ID === itemToEdit?.GROUP_ID) || null;
    state.openModal = 'edit-machine'; render();
  }

  function openCreateEditAssociation(itemToEdit?: ApiResps['/clients/get-associations-list']['list']) {
    state.selectedAssociation = itemToEdit || null;
    state.openModal = 'edit-association'; render();
  }
  function openEditDut(unit, itemToEdit) {
    state.selectedUnit = unit;
    state.selectedDut = itemToEdit || null;
    state.openModal = 'edit-dut'; render();
  }
  function openCreateEditRoomType(itemToEdit?: {}) {
    // @ts-ignore
    state.selectedRoomType = itemToEdit || null;
    state.openModal = 'edit-room-type'; render();
  }
  function openAssociateDevs() {
    state.openModal = 'associate-devs'; render();
  }
  function openCreateEditClass(itemToEdit?: { CLASS_ID: number, CLASS_TYPE: string, CLASS_NAME: string }) {
    state.selectedClass = itemToEdit || null;
    state.openModal = 'edit-class'; render();
  }

  function openCreateEditHeatExchangere(itemToEdit?: {}) {
    // @ts-ignore
    state.selectedHeatExchanger = itemToEdit || null;
    state.openModal = 'edit-create-heat-exchanger'; render();
  }

  function openCreateEditUtility(itemToEdit?: {}) {
    // @ts-ignore
    state.selectedUtilityItem = itemToEdit || null;
    state.openModal = 'edit-create-utility'; render();
  }

  function openViewUtility(itemToEdit?: {}) {
    // @ts-ignore
    state.selectedUtilityItem = itemToEdit || null;
    state.openModal = 'view-utility'; render();
  }

  async function deleteUnit(item) {
    try {
      if (window.confirm(`Deseja excluir a unidade ${item.UNIT_NAME}?`)) {
        await apiCall('/clients/remove-unit', { UNIT_ID: item.UNIT_ID, CLIENT_ID: state.clientId || undefined });
        toast.success('Sucesso');
        await fetchServerData(); // server might have deleted and/or updated other items
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  async function deleteClass(item) {
    try {
      if (window.confirm(`Deseja excluir a classe de unidades ${item.CLASS_TYPE} ${item.CLASS_NAME}?`)) {
        await apiCall('/clients/remove-client-class', { CLASS_ID: item.CLASS_ID, CLIENT_ID: clientId });
        toast.success('Sucesso');
        await fetchServerData(); // server might have deleted and/or updated other items
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  async function deleteCicle({ CICLE_ID, CICLE_NAME }: { CICLE_ID: number, CICLE_NAME: string }) {
    try {
      if (window.confirm(`Deseja excluir este o ${CICLE_NAME} ?`)) {
        await apiCall('/delete-rate-cicle', { CICLE_ID });
        toast.success('Sucesso');
        await fetchServerData(); // server might have deleted and/or updated other items
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  async function deleteModel({ MODEL_ID, MODEL_NAME }: { MODEL_ID: number, MODEL_NAME: string }) {
    try {
      if (window.confirm(`Deseja excluir o modelo de tarifa ${MODEL_NAME} ?`)) {
        await apiCall('/delete-model-rate', { MODEL_ID });
        toast.success('Sucesso');
        await fetchServerData(); // server might have deleted and/or updated other items
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  async function deleteGroup() {
    try {
      if (window.confirm('Deseja excluir os grupos selecionados?')) {
        for (const item of state.machinesWithAssetsList) {
          if (item.checked) {
            await apiCall('/clients/remove-group', { GROUP_ID: item.GROUP_ID, isChiller: (item.MCHN_APPL === 'chiller' && item.BRAND === 'carrier') });
          }
        }
        toast.success('Sucesso');
        await fetchServerData(); // server might have deleted and/or updated other items
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  async function deleteAssociation() {
    try {
      if (window.confirm('Deseja excluir as associações selecionados?')) {
        for (const item of state.associationsList) {
          if (item.checked) {
            await apiCall('/clients/remove-association', { ASSOC_ID: item.ASSOC_ID });
          }
        }
        toast.success('Sucesso');
        await fetchServerData(); // server might have deleted and/or updated other items
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  async function deleteNobreaks() {
    for (const item of state.nobreakList) {
      if (item.checked && item.APPLICATION === 'Nobreak') {
        await apiCall('/dmt/delete-dmt-nobreak', { NOBREAK_ID: item.ID });
      }
    }
  }

  async function deleteIlluminations() {
    for (const item of state.iluminationList) {
      if (item.checked && item.APPLICATION === 'Iluminação') {
        await apiCall('/dal/delete-dal-illumination', { ILLUMINATION_ID: item.ID });
      }
    }
  }

  async function deleteUtility() {
    try {
      if (window.confirm('Deseja excluir as associações selecionados?')) {
        if (state.selectedUtility === t('nobreak')) {
          await deleteNobreaks();
        }
        if (state.selectedUtility === t('iluminacao')) {
          await deleteIlluminations();
        }
        toast.success('Sucesso');
        await fetchServerData(); // server might have deleted and/or updated other items
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  async function deleteRoomType(item) {
    try {
      if (window.confirm(`Deseja excluir o tipo ${item.RTYPE_NAME}?`)) {
        await apiCall('/clients/remove-roomtype', { RTYPE_ID: item.RTYPE_ID });
        state.roomTypes = state.roomTypes.filter((rtype) => rtype.RTYPE_ID !== item.RTYPE_ID);
        processReceivedServerData();
        render();
        toast.success('Sucesso');
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  async function deleteEnvironment(item) {
    try {
      if (window.confirm(`Deseja excluir o ambiente ${item.ROOM_NAME}?`)) {
        await apiCall('/environments/delete-environment', { ENVIRONMENT_ID: item.ENVIRONMENT_ID, CLIENT_ID: item.CLIENT_ID, UNIT_ID: item.UNIT_ID });
        state.dutsList = state.dutsList.filter((env) => env.ENVIRONMENT_ID !== item.ENVIRONMENT_ID);
        processReceivedServerData();
        render();
        toast.success('Sucesso');
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  async function afterCreateEditUnit({ item: responseData, action }) {
    try {
      state.openModal = null; render();
      // if (action === 'new') { state.units.push(responseData); processReceivedServerData(); } else if (action === 'edit') {
      //   const found = state.units.find((item) => item.UNIT_ID === responseData.UNIT_ID);
      //   if (found) { Object.assign(found, responseData); processReceivedServerData(); } else { await fetchServerData(); }
      // } else { await fetchServerData(); }
      await fetchServerData();

      action === 'edit' ? toast.success('Sucesso ao editar a unidade') : toast.success('Sucesso ao criar a unidade');

      // TODO: check if responseAccessDistributor is null
      if (responseData.responseAccessDistributor && responseData.responseAccessDistributor.STATUS === 'Erro no envio') {
        toast.error('Não foi possível enviar as informações para a Four Docs. ');
      }

      resetParamsUrl();
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }
  async function afterCreateEditGroup({ item: responseData, action, changedAssociation }) {
    try {
      state.openModal = null; render();
      // if (changedAssociation) { await state.fetchServerData() }
      // else if (action === 'new') { state.groupsList.push(responseData); state.processReceivedServerData() }
      // else if (action === 'edit') {
      //   const found = state.groupsList.find(item => item.GROUP_ID === responseData.GROUP_ID)
      //   if (found) { Object.assign(found, responseData); state.processReceivedServerData() }
      //   else { await state.fetchServerData() }
      // }
      // else { await state.fetchServerData() }
      await fetchServerData();
      toast.success('Sucesso');
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }
  async function afterCreateEditMachine({ action }) {
    try {
      state.openModal = null; render();
      await fetchServerData();
      action === 'edit' ? toast.success('Sucesso ao editar a máquina') : toast.success('Sucesso ao criar a máquina');
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }
  async function afterEditDut({ item: responseData }) {
    try {
      state.openModal = null; render();
      const found = state.dutsList.find((item) => item.DEV_ID === responseData?.DEV_ID);
      if (found) { Object.assign(found, responseData); processReceivedServerData(); } else { await fetchServerData(); }
      toast.success('Sucesso');
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }
  async function afterCreateEditRoomType({ item: responseData, action }) {
    try {
      state.openModal = null; render();
      if (action === 'new') { state.roomTypes.push(responseData); processReceivedServerData(); } else if (action === 'edit') {
        const found = state.roomTypes.find((item) => item.RTYPE_ID === responseData.RTYPE_ID);
        if (found) { Object.assign(found, responseData); processReceivedServerData(); } else { await fetchServerData(); }
      } else { await fetchServerData(); }
      toast.success('Sucesso');
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }
  async function afterAssociateDevs() {
    try {
      state.openModal = null; render();
      await fetchServerData();
      toast.success('Sucesso');
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }
  async function afterCreateEditClass() {
    try {
      state.openModal = null; render();
      await fetchServerData();
      toast.success('Sucesso');
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }
  async function afterCreateEditAssociation() {
    try {
      state.openModal = null; render();
      await fetchServerData();
      toast.success('Sucesso');
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }
  async function afterCreateEditHeatExchanger({ action }) {
    try {
      state.openModal = null; render();
      await fetchServerData();
      toast.success(`Sucesso ao ${action === 'new' ? 'criar' : 'editar'} tipo de trocador de calor`);
    } catch (err) { console.log(err); toast.error(`Houve erro ao ${action === 'new' ? 'criar' : 'editar'} tipo de trocador de calor`); }
  }

  async function afterCreateEditUtility({ action }) {
    try {
      state.openModal = null; render();
      await fetchServerData();
      if (action === 'new') {
        toast.success(t('sucessoCriarUtilitario'));
      } else {
        toast.success(t('sucessoEditarUtilitario'));
      }
    } catch (err) { console.log(err);
      if (action === 'new') {
        toast.error(t('erroCriarUtilitario'));
      } else {
        toast.error(t('erroEditarUtilitario'));
      }
    }
  }

  async function toggleUnitReport(item) {
    try {
      item.submitting = true; render();
      const reqParams: ApiParams['/clients/edit-unit'] = {
        UNIT_ID: item.UNIT_ID,
        DISABREP: (item.DISABREP ? 0 : 1),
      };
      const responseData = await apiCall('/clients/edit-unit', reqParams);
      Object.assign(item, responseData); processReceivedServerData();
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    item.submitting = false; render();
  }

  async function getModels() {
    await apiCall('/get-model-rates', { CLIENT_ID: clientId }).then((models) => {
      state.rateModels = models.map((model) => Object.assign(model, {
        hide: false,
      }));
    });
  }

  useEffect(() => {
    fetchServerData(clientId);
    getModels();
  }, [clientId]);
  function utilityButtons() {
    const disabled = !state.nobreakList.some((item) => item.checked) && !state.iluminationList.some((item) => item.checked);
    return [(
      <div style={{ float: 'right', marginBottom: '20px' }}>
        {(profile.manageAllClients) && <SimpleButton variant="primary" onClick={openCreateEditUtility}>{t('novoUtilitario').toUpperCase()}</SimpleButton>}
        {(profile.permissions.isAdminSistema) && <SimpleButton variant="primary" disabled={disabled} onClick={deleteUtility}>{t('excluirUtilitarios')}</SimpleButton>}
      </div>
    )];
  }

  async function getDuts() {
    try {
      state.isLoadingDuts = true;
      await Promise.all([
        apiCall('/clients/get-units-list', { CLIENT_ID: clientId, INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients }).then((list) => { list.forEach((unit) => Object.assign(unit, { LATLON: (unit.LAT && unit.LON) ? `${unit.LAT}, ${unit.LON}` : '-' })); state.units = list; list.forEach((unit) => state.unitsOpt.push({ value: unit.UNIT_ID, name: unit.UNIT_NAME })); }),
      ]);
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    // processReceivedServerData();
    state.isLoadingDuts = false;
    render();
  }

  async function getEnvironments() {
    try {
      await Promise.all([
        apiCall('/dut/get-duts-list', { clientId, INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients }).then(({ list }) => { state.dutsList = list.map((item) => ({ ...item, checked: false })); }),
        apiCall('/dri/get-dri-vavs-list', { clientId }).then(({ list }) => { state.vavsList = list.map((item) => ({ ...item, checked: false })); }),
      ]);
      await apiCall('/environments/get-environment-list', { CLIENT_ID: clientId, INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients }).then(({ environments }) => {
        setEnvironmentList(environments);
      });
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    render();
  }
  if (state.isLoading) return <Loader />;

  const freeDacsDuts = state.freeDevs.filter((dev) => (dev.type === 'DAC' || dev.type === 'DUT'));
  const checkedDevs = freeDacsDuts.filter((dev) => dev.freeDevChecked);
  const queryPars = queryString.parse(history.location.search);

  const profilePerms = () => (profile.manageAllClients || profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === clientId));

  function tableDuts() {
    if (state.dutsList.length === 0 && state.vavsList.length === 0) {
      return <div>(nenhum)</div>;
    }

    if (state.isLoadingDuts) {
      return <Loader />;
    }

    return (
      <TableDuts
        list={state.environmentList}
        vavsList={state.vavsList}
        onEditClick={openEditDut}
        onDeleteClick={deleteEnvironment}
        roomTypes={state.roomTypes.map((item) => ({ value: item.RTYPE_ID, name: item.RTYPE_NAME }))}
        render={() => { getEnvironments(); }}
        pageSize={20}
        setIsLoad={(bool) => setState({ isLoadingDuts: bool })}
      />
    );
  }

  const modalContent = () => {
    if (state.openModal && !modalOptions.includes(state.openModal)) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: state.focused ? '400px' : 'auto',
        }}
        >
          <ContentDate>
            <Label>Data final da semana</Label>
            <SingleDatePicker
              date={state.selectedDate}
                  // eslint-disable-next-line react/jsx-no-bind
              onDateChange={onDateChange}
              focused={state.focused}
              onFocusChange={({ focused }) => { state.focused = focused; render(); }}
              id="datepicker"
              numberOfMonths={1}
              isOutsideRange={(d) => !d.isBefore(state.lastDate)}
            />
            <StyledCalendarIcon color="#202370" />
          </ContentDate>
          <BtnExport style={{ alignSelf: 'center', marginTop: '20px' }} variant={state.isLoading ? 'disabled' : 'primary'} onClick={getDispCsvData}>
            <div>
              <ExportWorksheet />
              <Text style={{ paddingLeft: '5px' }}>
                Exportar Planilha
              </Text>
            </div>
          </BtnExport>
          <CSVLink
            headers={CSVheader}
            data={state.csvData}
            filename={`Disponibilidade_${clientInfo.NAME}_Periodo_${state.datesRange[state.datesRange.length - 1].DMY.replaceAll('/', '-')}_${state.datesRange[0].DMY.replaceAll('/', '-')}.csv`}
            separator=";"
            asyncOnClick
            enclosingCharacter={'"'}
            ref={csvLinkEl}
          />
        </div>
      );
    }
    return (
      <></>
    );
  };

  return (
    <div>
      <ClientPanelLayout />
      <SectionContainer>
        { profilePerms()
          && (
            <Link to={`/painel/programacao-multipla/devs?idcliente=${clientId}`}>
              <SimpleButton variant="primary">{t('programacaoEmMassa')}</SimpleButton>
            </Link>
          )}
        { profile.manageAllClients
          && (
            <AccordionV2 title="Cadastros" opened style={{ fontSize: '125%', paddingTop: '20px' }}>
              <div>
                <Link to={`/painel/adicionar-lote/tipos-ambiente?idcliente=${clientId}`}>
                  <SimpleButton variant="primary">Tipos de Ambientes</SimpleButton>
                </Link>
                <Link to={`/painel/adicionar-lote/responsaveis?idcliente=${clientId}`}>
                  <SimpleButton variant="primary">Atribuição Automática de Responsáveis</SimpleButton>
                </Link>
                <Link to={`/painel/adicionar-lote/faturas?idcliente=${clientId}`}>
                  <SimpleButton variant="primary">Faturas</SimpleButton>
                </Link>
                <Link to={`/painel/adicionar-lote/unificada?idcliente=${clientId}`}>
                  <SimpleButton variant="primary">{t('unificado')}</SimpleButton>
                </Link>
              </div>
            </AccordionV2>
          )}
      </SectionContainer>

      {(profile.manageAllClients) && (state.freeDevs.length > 0)
        && (
          <SectionContainer>
            <AccordionV2
              style={{ fontSize: '125%' }}
              title="Dispositivos não associados"
              opened={false}
              openedExtraHeader={(
                <SimpleButton
                  style={{ fontSize: '80%' }}
                  variant={checkedDevs.length ? 'primary' : 'disabled'}
                  onClick={() => (checkedDevs.length ? openAssociateDevs() : null)}
                >
                  Associar
                </SimpleButton>
              )}
            >
              <TableFreeDevices freeDevs={state.freeDevs} selectionChanged={() => render()} />
            </AccordionV2>
          </SectionContainer>
        )}

      <SectionContainer>
        <AccordionV2
          style={{ fontSize: '125%' }}
          title="Unidades"
          opened
          openedExtraHeader={(
            <div>
              {(profile.manageAllClients)
                && (
                  <div>
                    <SimpleButton style={{ fontSize: '80%' }} variant="primary" onClick={() => openCreateEditUnit()}>Adicionar Unidade</SimpleButton>
                    {state.units.length !== 0
                      && (
                      <>
                        <SimpleButton style={{ fontSize: '80%' }} variant="primary" onClick={() => setState({ openModal: 'disponibility-export' })}>Exportar Disponibilidade</SimpleButton>
                        <SimpleButton style={{ fontSize: '80%' }} variant="primary" onClick={() => calculateClientUnitsDisp(clientId)}>Calcular Disponibilidade nos últimos 7 dias</SimpleButton>
                      </>
                      )}
                  </div>
                )}
            </div>
          )}
        >
          {(state.units.length === 0) ? (
            <div>(nenhuma)</div>
          ) : (
            <TableUnits
              list={state.units}
              energyMeters={state.energyMetersList}
              waterList={state.waterList}
              unitsDisp={state.unitsDisp}
              unitsDispLoading={state.unitsDispLoading}
              onDeleteClick={deleteUnit}
              onEditClick={openCreateEditUnit}
              onToggleReportClick={toggleUnitReport}
              renderUnits={() => { getDuts(); }}
              isLoading={state.isLoadingDuts}
            />
          )}
        </AccordionV2>
      </SectionContainer>

      <SectionContainer>
        <AccordionV2
          style={{ fontSize: '125%' }}
          title="Classes de Unidades"
          opened
          openedExtraHeader={(profile.manageAllClients) && <SimpleButton style={{ fontSize: '80%' }} variant="primary" onClick={() => openCreateEditClass()}>Adicionar Classe de Unidades</SimpleButton>}
        >
          {(state.classesList.length === 0) ? (
            <div>(nenhum)</div>
          ) : (
            <TableClasses
              list={state.classesList}
              clientId={clientId}
              onDeleteClick={deleteClass}
              onEditClick={openCreateEditClass}
            />
          )}
        </AccordionV2>
      </SectionContainer>

      <SectionContainer>
        <AccordionV2
          style={{ fontSize: '125%' }}
          title="Modelos de tarifa de energia"
          opened
          openedExtraHeader={(profile.manageAllClients) && <SimpleButton style={{ fontSize: '80%' }} variant="primary" onClick={() => openCreateEditModel()}>CRIAR NOVO MODELO</SimpleButton>}
        >
          { state.rateModels.length === 0 ? (<div>Nenhum modelo</div>) : (
            <TableModels
              openEditCicle={openCreateCicle}
              rateModels={state.rateModels}
              clientId={clientId}
              onDeleteModelClick={deleteModel}
              onDeleteCicleClick={deleteCicle}
              onEditClick={openCreateEditClass}
              openCreateEditModel={openCreateEditModel}
            />
          ) }
        </AccordionV2>
      </SectionContainer>

      <SectionContainer>
        <AccordionV2
          style={{ fontSize: '125%' }}
          title="Máquinas"
          opened
        >
          <div style={{ float: 'right' }}>
            {(profile.manageAllClients) && <SimpleButton variant="primary" onClick={() => openCreateEditMachine()}>Nova Máquina</SimpleButton>}
            {(profile.permissions.isAdminSistema) && <SimpleButton variant="primary" onClick={() => deleteGroup()}>Excluir Máquinas</SimpleButton>}
          </div>
          {(state.machinesWithAssetsList.length === 0) ? (
            <div>(nenhuma)</div>
          ) : (
            <NewTable
              data={state.machinesWithAssetsList}
              columns={state.machineColumns}
              pageSize={20}
              keySearch="searchMachine"
            />
          )}
        </AccordionV2>
      </SectionContainer>

      <SectionContainer>
        <AccordionV2
          style={{ fontSize: '125%' }}
          title="Agrupar Máquinas"
          opened
        >
          <div style={{ float: 'right' }}>
            {(profile.permissions.isAdminSistema) && <SimpleButton variant="primary" onClick={() => deleteAssociation()}>Excluir Grupos</SimpleButton>}
            {(profile.manageAllClients) && <SimpleButton variant="primary" onClick={() => openCreateEditAssociation()}>Adicionar Grupo</SimpleButton>}
          </div>
          {(state.associationsList.length === 0) ? (
            <div>(nenhuma)</div>
          ) : (
            <NewTable
              data={state.associationsList}
              columns={state.associationsColumns}
              pageSize={20}
              keySearch="serchGroupMachine"
            />
          )}
        </AccordionV2>
      </SectionContainer>

      <SectionContainer>
        <AccordionV2
          style={{ fontSize: '125%', marginBottom: 20 }}
          title="Ambientes"
          opened
        >
          {tableDuts()}
        </AccordionV2>
      </SectionContainer>
      <SectionContainer>
        <AccordionV2
          style={{ fontSize: '125%' }}
          title="Tipos de Ambientes"
          opened
          openedExtraHeader={(profile.manageAllClients) && <SimpleButton style={{ fontSize: '80%' }} variant="primary" onClick={() => openCreateEditRoomType()}>Adicionar Tipo de Ambiente</SimpleButton>}
        >
          {(state.roomTypes.length === 0) ? (
            <div>(nenhum)</div>
          ) : (
            <TableRoomTypes
              roomTypes={state.roomTypes}
              onDeleteClick={deleteRoomType}
              onEditClick={openCreateEditRoomType}
            />
          )}
        </AccordionV2>
      </SectionContainer>

      <SectionContainer>
        <AccordionV2
          style={{ fontSize: '125%' }}
          title={t('tiposDeTrocadorDeCalor')}
          opened
        >
          <div style={{ float: 'right' }}>
            {(profile.manageAllClients) && <SimpleButton variant="primary" onClick={() => openCreateEditHeatExchangere()}>{t('adicionarTipoTrocadorDeCalor')}</SimpleButton>}
          </div>
          {(false) ? (
            <div>(nenhuma)</div>
          ) : (
            <NewTable
              data={state.heatExchangersList}
              columns={state.heatExchangerColumns}
              pageSize={20}
              keySearch="searchHeatExchangers"
            />
          )}
        </AccordionV2>
      </SectionContainer>

      <SectionContainer>
        <AccordionV2
          style={{ fontSize: '125%' }}
          title={t('utilitarios')}
          opened
        >

          <ContentTab>
            <StyledList>
              <StyledItem onClick={() => { state.selectedUtility = t('nobreak'); render(); }} key="nobreak">
                <StyledName isActive={state.selectedUtility === t('nobreak')}>{t('nobreak')}</StyledName>
                <StyledLine isActive={state.selectedUtility === t('nobreak')} />
              </StyledItem>
              <StyledItem onClick={() => { state.selectedUtility = t('iluminacao'); render(); }} key="iluminacao">
                <StyledName isActive={state.selectedUtility === t('iluminacao')}>{t('iluminacao')}</StyledName>
                <StyledLine isActive={state.selectedUtility === t('iluminacao')} />
              </StyledItem>
            </StyledList>
          </ContentTab>
          <>
            {state.selectedUtility === t('nobreak') && (
            <>
              <NewTable
                data={state.nobreakList}
                columns={state.nobreaksColumns}
                pageSize={20}
                extraBtns={utilityButtons()}
                hideEmptyTable
                keySearch="searchNobreak"
              />
            </>
            )}
            {state.selectedUtility === t('iluminacao') && (
            <>
              <NewTable
                data={state.iluminationList}
                columns={state.illuminationColumns}
                pageSize={20}
                extraBtns={utilityButtons()}
                hideEmptyTable
                keySearch="searchIllumination"
              />
            </>
            )}
          </>
        </AccordionV2>
      </SectionContainer>

      {state.openModal != null && (
        <ModalWindow
          style={{
            width: (modalWidthByType[state.openModal] || undefined), padding: (modalPaddingByType[state.openModal] || undefined), borderTop: '12px solid #363BC4', position: 'relative', bottom: '40px',
          }}
          onClickOutside={() => { resetParamsUrl(); !state.gettingCsv && setState({ openModal: null }); }}
        >
          {state.openModal === 'edit-unit' && (
            <FormEditUnit
              // @ts-ignore
              unitInfo={state.selectedUnit!}
              energyMeters={state.energyMetersList}
              waterMeters={state.waterList}
              accessPoints={state.accessPointsList}
              clientId={clientId}
              selectedModelId={state.selectedModelId}
              states={state.statesList}
              cities={state.citiesList}
              timezones={state.timezonesList}
              countries={state.countriesList}
              distributors={state.distributorsList}
              rateModels={state.rateModels}
              onCancel={() => { state.openModal = null; resetParamsUrl(); render(); }}
              onSuccess={afterCreateEditUnit}
            />
          )}
          {state.openModal === 'edit-group' && (
            <FormEditGroup
              groupInfo={state.selectedGroup || undefined}
              unitInfo={state.selectedUnit || undefined}
              unitsList={((!state.selectedGroup) && (!state.selectedUnit) && state.units) || undefined}
              clientId={clientId}
              dutsList={state.dutsList}
              damsList={state.damsListFull.filter((dam: DamsExtraInfo) => (dam.units!.length === 0 || dam.units!.includes(state.selectedUnit!)))}
              dacsList={state.dacsList.filter((dac) => (dac.GROUP_ID != null && (state.selectedGroup && (dac.GROUP_ID === state.selectedGroup.GROUP_ID))))}
              onCancel={() => { state.openModal = null; render(); }}
              onSuccess={afterCreateEditGroup}
            />
          )}
          {state.openModal === 'edit-machine' && (
            <Flex flexWrap="wrap" flexDirection="column" alignItems="center" width="650px" height="auto">
              <FormEditMachine
                // @ts-ignore
                unitInfo={state.selectedUnit!}
                clientId={clientId}
                comboOpts={state.comboOpts}
                unitsList={state.unitsOpt}
                modelsChillerList={state.modelsChillerList}
                machineWithAsset={state.selectedMachine || undefined}
                dacsList={state.dacsList.filter((dac) => (dac.GROUP_ID != null && (state.selectedGroup && (dac.GROUP_ID === state.selectedGroup.GROUP_ID))))}
                onCancel={() => { state.openModal = null; resetParamsUrl(); render(); }}
                onSuccess={afterCreateEditMachine}
                isViewMachine={state.isViewMachine}
              />
            </Flex>
          )}
          {state.openModal === 'edit-association' && (
            <FormEditAssociation
              clientId={clientId}
              associationInfo={state.selectedAssociation}
              unitsList={state.units}
              associationsList={state.associationsList}
              onSuccess={afterCreateEditAssociation}
              onCancel={() => { state.openModal = null; render(); }}
            />
          )}
          {state.openModal === 'edit-dut' && (
            <FormEditDut
              dutInfo={state.selectedDut}
              unitInfo={state.selectedUnit}
              unitsList={state.units}
              roomTypes={state.roomTypes}
              onCancel={() => { state.openModal = null; render(); }}
              onSuccess={afterEditDut}
            />
          )}
          {state.openModal === 'edit-room-type' && (
            <FormEditRoomType
              roomTypeInfo={state.selectedRoomType!}
              clientId={clientId}
              onCancel={() => { state.openModal = null; render(); }}
              onSuccess={afterCreateEditRoomType}
            />
          )}
          {state.openModal === 'associate-devs' && (
            <FormAssociateDevs
              clientId={clientId}
              devsList={state.freeDevs.filter((dev) => dev.freeDevChecked)}
              unitsList={state.units}
              groupsList={state.groupsList}
              onCancel={() => { state.openModal = null; render(); }}
              onSuccess={afterAssociateDevs}
            />
          )}
          {state.openModal === 'edit-model' && (
          <FormEditModel
            clientId={clientId}
            onCancel={() => { state.openModal = null; state.selectedRateModel = null; render(); }}
            itemToEdit={state.selectedRateModel}
          />
          )}
          {state.openModal === 'edit-cicle' && (
          <FormEditCicle
            openCreateEditCicle={openCreateEditCicle}
            cicleInfo={state.cicleToEdit}
            itemToEdit={state.selectedRateCicle}
            clientId={clientId}
            onCancel={() => { state.openModal = null; state.selectedRateCicle = null; render(); }}
          />
          )}
          {state.openModal === 'create-cicle' && (
          <FormEditCreateCicle
            clientId={clientId}
            cicleBaseInfo={state.cicleToEdit}
            itemToEdit={state.selectedRateCicle}
            onSuccess={afterCreateEditClass}
            onCancel={() => { state.openModal = null; render(); }}
          />
          )}
          {state.openModal === 'edit-class' && (
            <FormEditClass
              clientId={clientId}
              classInfo={state.selectedClass}
              unitsList={state.units}
              onSuccess={afterCreateEditClass}
              onCancel={() => { state.openModal = null; render(); }}
            />
          )}
          {state.openModal === 'show-association-groups' && (
            <ShowAssociationGroups
              associationInfo={state.selectedAssociation}
              onCancel={() => { state.openModal = null; render(); }}
            />
          )}
          {state.openModal === 'edit-create-heat-exchanger' && (
          <FormEditHeatExchanger
            clientId={clientId}
            onSuccess={afterCreateEditHeatExchanger}
            heatExchangerInfo={state.selectedHeatExchanger}
            onCancel={() => { state.openModal = null; render(); }}
          />
          )}
          {state.openModal === 'edit-create-utility' && (
          <FormEditUtility
            clientId={clientId}
            onSuccess={afterCreateEditUtility}
            utilityInfo={state.selectedUtilityItem}
            utilityType={state.selectedUtility}
            onCancel={() => { state.openModal = null; render(); }}
          />
          )}

          {state.openModal === 'view-utility' && (
          <ViewUtility
            utilityType={state.selectedUtility}
            onClickEdit={openCreateEditUtility}
            utilityInfo={state.selectedUtilityItem}
            onCancel={() => { state.openModal = null; render(); }}
          />
          )}

          { queryPars.aba === undefined ? state.openModal === 'disponibility-export'
          && state.gettingCsv
            ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Text style={{ padding: '20px' }}>Calculando e gerando planilha...</Text>
                <Loader />
              </div>
            )
            : modalContent() : null}
        </ModalWindow>
      )}
    </div>
  );
};

const ShowAssociationGroups = ({
  associationInfo, onCancel,
}): JSX.Element => {
  function CloseModal() {
    return (
      <IconWrapper2
        onClick={() => onCancel()}
      >
        <CloseIcon color={colors.White} />
      </IconWrapper2>
    );
  }

  associationInfo.GROUPS.sort((a, b) => a.POSITION - b.POSITION);

  function ModalMobile(props: {
    title: string
    children: JSX.Element
    closeModal: () => void
  }) {
    const { title, children, closeModal } = props;
    return (
      <MobileWrapper>
        <Flex mb={32}>
          <Box width={1}>
            <ModalSection>
              <ModalTitleContainer>
                <ModalTitle>{title}</ModalTitle>
                <CloseIcon
                  size="12px"
                  onClick={closeModal}
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

  return (
    <Container>
      <Flex>
        <Box width={1} justifyContent="center" alignItems="center">
          <ModalDesktop>
            <LayerBackgroundModal>
              <Flex width={1} justifyContent="center" alignItems="center">
                <Box width={[1, 1, 1, 2 / 3, '600px']} maxHeight="100vh" pt={24}>
                  <Card title={associationInfo.ASSOC_NAME} IconsContainer={CloseModal}>
                    <div style={{ padding: '20px 20px' }}>
                      <h3>Máquinas do Grupo</h3>
                      {associationInfo.GROUPS.map((group) => (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }} key={group.GROUP_NAME}>
                          <span>{`${group.GROUP_NAME} `}</span>
                          <span>{`#${group.POSITION}`}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Box>
              </Flex>
            </LayerBackgroundModal>
          </ModalDesktop>
          <ModalMobile
            title={associationInfo.ASSOC_NAME}
            closeModal={() => { onCancel(); }}
          >
            <div style={{ padding: '20px 20px' }}>
              <h3>Máquinas do Grupo</h3>
              {associationInfo.GROUPS.map((group) => (
                <div style={{ display: 'flex', justifyContent: 'space-between' }} key={group.GROUP_NAME}>
                  <span>{`${group.GROUP_NAME} `}</span>
                  <span>{`#${group.POSITION}`}</span>
                </div>
              ))}
            </div>
          </ModalMobile>
        </Box>
      </Flex>
    </Container>
  );
};

export default withTransaction('ClientPanelPage', 'component')(ClientPanelPage);
