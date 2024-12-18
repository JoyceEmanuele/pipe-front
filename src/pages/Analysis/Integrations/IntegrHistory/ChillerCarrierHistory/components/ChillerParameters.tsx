import { t } from 'i18next';
import {
  Button,
  Card, Checkbox,
  Loader,
  SelectMultiple,
} from '~/components';
import {
  BorderSubItem,
  ContainerNotSelectedParams,
  ContainerParameters, HorizontalLineSelectParameters, InfoSelected, InputStyledSelected, SearchInputStyled, SelectOptionStyled, SelectedContent,
} from './styles';
import { Box } from 'reflexbox';
import { useStateVar } from '~/helpers/useStateVar';
import * as echarts from 'echarts/core';
import { ToggleSwitchMini } from '~/components/ToggleSwitch';
import { AlertTextParameters, ButtonClear, SearchInput } from '~/pages/Analysis/styles';
import { useEffect } from 'react';
import { ComparativeIcon, InfoIcon, WarnIcon } from '~/icons';
import { toast } from 'react-toastify';
import { apiCall } from '~/providers';
import {
  agruparPorData, getDate, gerarNumerosAteMaximoDataXChangedParams, getListDays, returnXAxis, separarValoresPorPropriedade,
  getDataToGraphsAndSetMaxValues,
  createRecordStatusObject,
  processData,
  darkenColor,
} from '~/helpers/chillerParametersHelpers';
import { GenerateGraphSample } from './ChillerGraphParametersGrouped';
import { GenerateGraphGeralAlarmMaintaince } from './ChillerGraphParametersChanged';
import SemParametros from '../../../../../../assets/img/sem_parametros.svg';
import ReactTooltip from 'react-tooltip';
import { HoverExportList } from '~/pages/Analysis/Utilities/UtilityFilter/styles';

const listStatusNames = [t('desligadoMinusculo'), t('emFuncionamento'), t('emParada'), t('emPartida'), t('desarmado'), t('pronto'), t('forcado'), t('emDescongelamento'), t('emTesteCarga '), `${t('emTeste')}                         `];
const listMaintenceNames = [t('emDia'), t('emAlerta'), `${t('atrasada')}                         `];
const listGeneralNames = [t('desligadoMinusculo'), `${t('emFuncionamento')}           `];
const listCompStatusNames = [t('desligadoMinusculo'), `${t('ligadoMinusculo')}                              `];
const listAlarmNames = [t('semAlarmes'), t('emAlerta'), `${t('emAlarme')}                     `];

interface OptionParameter {
  value: string;
  name: string;
  color: string;
  data: number[] | (number | null)[][];
  unidMed?: string;
  type?: string;
}

const createOptionParameter = (value: string, name: string, color: string, index: number, unidMed?: string, type?: string): OptionParameter => ({
  value,
  name: t(name),
  color,
  data: [] as number[] | (number | null)[][],
  unidMed,
  type,
  checked: false,
  index,
});

const FIXED_RED = 80;
const percentArray = ['CAP_T', 'DEM_LIM', 'LAG_LIM', 'EXV_B', 'EXV_A', 'CAPB_T', 'CAPA_T', 'SLT_A', 'SLT_B'];
const arrayDefault = ['alarme', 'manutencao', 'geral', 'status', 'CP_B1', 'CP_B2', 'CP_A1', 'CP_A2'];
const arrayCompStatus = ['CP_B1', 'CP_B2', 'CP_A2', 'CP_A1'];
type TSelectParameters = { value: string; name: string; color: string; unidMed?: string; type?: string; data: number[], checked: boolean, index: number }
const applicationType = {
  'chiller-carrier-30hxe': 'HX',
  'chiller-carrier-20gxe': 'HX',
  'chiller-carrier-30hxf': 'HX',
  'chiller-carrier-30xab': 'XA',
  'chiller-carrier-30xab-hvar': 'XA_HVAR',
} as {
  [type: string]: string,
};

export function ChillerParameters(props: Readonly<{
  driId?: string, startDate: moment.Moment | null, endDate: moment.Moment | null, isFlexivel?: boolean, model: string, chillerModel?: string,
}>): JSX.Element {
  const chillerModel = applicationType[props.model];
  const handleOptionsParameters = () => {
    if (chillerModel === 'XA') return handleOptionsParametersXA();
    if (chillerModel === 'XA_HVAR') return handleOptionsParametersXAHvar();
    return handleOptionsParametersHX();
  };

  const getYAxisNames = () => {
    if (chillerModel === 'XA') return [...listStatusNames, '', ...listMaintenceNames, '', ...listGeneralNames];
    return [...listStatusNames, '', ...listAlarmNames, '', ...listGeneralNames, '', ...listCompStatusNames, '', ...listMaintenceNames];
  };

  const handleOptionsParametersHX = () => [
    createOptionParameter('geral', 'geral', '#363BC4', 0),
    createOptionParameter('alarme', 'alarme', '#e1c61b', 1),
    // createOptionParameter('manutencao', 'manutencao', '#5733FF'),
    createOptionParameter('status', 'status', '#fd9401', 2),

    createOptionParameter('CAP_T', 'descricao_CAP_T', '#33A6FF', 3, 'P'),
    createOptionParameter('DEM_LIM', 'descricao_DEM_LIM', '#3c3d68', 4, 'P'),
    createOptionParameter('LAG_LIM', 'descricao_LAG_LIM', '#5d4aba', 5, 'P'),
    createOptionParameter('CTRL_PNT', 'descricao_CTRL_PNT', '#2C5932', 6, 'C'),
    createOptionParameter('COND_SP', 'descricao_COND_SP', '#3F8347', 7, 'C'),
    createOptionParameter('COND_LWT', 'descricao_COND_LWT', '#F5000F', 8, 'C'),
    createOptionParameter('COND_EWT', 'descricao_COND_EWT', '#FF656E', 9, 'C'),
    createOptionParameter('COOL_LWT', 'descricao_COOL_LWT', '#0085FF', 10, 'C'),
    createOptionParameter('COOL_EWT', 'descricao_COOL_EWT', '#6FBAFF', 11, 'C'),
    createOptionParameter('SP', 'descricao_SP', '#3BA448', 12, 'C'),

    createOptionParameter('ACircuit', 'circuitoA', '#DC3C45', 13),
    createOptionParameter('DP_A', 'descricao_DP_A', '#DC3C45', 14, 'kPa', 'A'),
    createOptionParameter('SP_A', 'descricao_SP_A', '#0066FF', 15, 'kPa', 'A'),
    createOptionParameter('CPA1_OP', 'descricao_CPA1_OP', '#FF7144', 16, 'kPa', 'A'),
    createOptionParameter('CPA2_OP', 'descricao_CPA2_OP', '#882C40', 17, 'kPa', 'A'),
    createOptionParameter('DOP_A1', 'descricao_DOP_A1', '#3b113e', 18, 'kPa', 'A'),
    createOptionParameter('DOP_A2', 'descricao_DOP_A2', '#a77b16', 19, 'kPa', 'A'),
    createOptionParameter('SCT_A', 'descricao_SCT_A', '#B63030', 20, 'C', 'A'),
    createOptionParameter('SST_A', 'descricao_SST_A', '#0042A5', 21, 'C', 'A'),
    createOptionParameter('CPA1_DGT', 'descricao_CPA1_DGT', '#CE6268', 22, 'C', 'A'),
    createOptionParameter('CPA2_DGT', 'descricao_CPA2_DGT', '#FB3E49', 23, 'C', 'A'),
    createOptionParameter('CPA1_TMP', 'descricao_CPA1_TMP', '#213a59', 24, 'C', 'A'),
    createOptionParameter('CPA2_TMP', 'descricao_CPA2_TMP', '#702e83', 25, 'C', 'A'),
    createOptionParameter('HR_CP_A1', 'descricao_HR_CP_A1', '#296A36', 26, 'H', 'A'),
    createOptionParameter('HR_CP_A2', 'descricao_HR_CP_A2', '#FF3357', 27, 'H', 'A'),
    createOptionParameter('CPA1_CUR', 'descricao_CPA1_CUR', '#296A36', 28, 'A', 'A'),
    createOptionParameter('CPA2_CUR', 'descricao_CPA2_CUR', '#11215c', 29, 'A', 'A'),
    createOptionParameter('EXV_A', 'descricao_EXV_A', '#D933FF', 30, 'P', 'A'),
    createOptionParameter('CAPA_T', 'descricao_CAPA_T', '#7b2683', 31, 'P', 'A'),
    createOptionParameter('CP_A1', 'descricao_CP_A1', '#2870d5', 32, 'P', 'A'),
    createOptionParameter('CP_A2', 'descricao_CP_A2', '#265aa3', 33, 'P', 'A'),

    createOptionParameter('BCircuit', 'circuitoB', '#B4A947', 34),
    createOptionParameter('DP_B', 'descricao_DP_B', '#EA8A8F', 35, 'kPa', 'B'),
    createOptionParameter('SP_B', 'descricao_SP_B', '#5C7AA9', 36, 'kPa', 'B'),
    createOptionParameter('CPB1_OP', 'descricao_CPB1_OP', '#296A36', 37, 'kPa', 'B'),
    createOptionParameter('CPB2_OP', 'descricao_CPB2_OP', '#5c054f', 38, 'kPa', 'B'),
    createOptionParameter('DOP_B1', 'descricao_DOP_B1', '#34522d', 39, 'kPa', 'B'),
    createOptionParameter('DOP_B2', 'descricao_DOP_B2', '#2b2998', 40, 'kPa', 'B'),
    createOptionParameter('SCT_B', 'descricao_SCT_B', '#D38383', 41, 'C', 'B'),
    createOptionParameter('SST_B', 'descricao_SST_B', '#668EC9', 42, 'C', 'B'),
    createOptionParameter('CPB1_DGT', 'descricao_CPB1_DGT', '#E2A1A4', 43, 'C', 'B'),
    createOptionParameter('CPB2_DGT', 'descricao_CPB2_DGT', '#FD8B92', 44, 'C', 'B'),
    createOptionParameter('CPB1_TMP', 'descricao_CPB1_TMP', '#3e33be', 45, 'C', 'B'),
    createOptionParameter('CPB2_TMP', 'descricao_CPB2_TMP', '#84169b', 46, 'C', 'B'),
    createOptionParameter('HR_CP_B1', 'descricao_HR_CP_B1', '#296A36', 47, 'H', 'B'),
    createOptionParameter('HR_CP_B2', 'descricao_HR_CP_B2', '#3e7432', 48, 'H', 'B'),
    createOptionParameter('CPB1_CUR', 'descricao_CPB1_CUR', '#296A36', 49, 'A', 'B'),
    createOptionParameter('CPB2_CUR', 'descricao_CPB2_CUR', '#A633FF', 50, 'A', 'B'),
    createOptionParameter('EXV_B', 'descricao_EXV_B', '#7b402b', 51, 'P', 'B'),
    createOptionParameter('CAPB_T', 'descricao_CAPB_T', '#712c80', 52, 'P', 'B'),
    createOptionParameter('CP_B1', 'descricao_CP_B1', '#042759', 53, 'P', 'B'),
    createOptionParameter('CP_B2', 'descricao_CP_B2', '#303c4e', 54, 'P', 'B'),
  ];

  const handleOptionsParametersXA = () => [
    createOptionParameter('geral', 'geral', '#363BC4', 0),
    createOptionParameter('status', 'status', '#fd9401', 1),

    createOptionParameter('CAP_T', 'descricao_CAP_T', '#33A6FF', 2, 'P'),
    createOptionParameter('CTRL_PNT', 'descricao_CTRL_PNT', '#2C5932', 3, 'C'),
    createOptionParameter('COND_LWT', 'descricao_COND_LWT', '#F5000F', 4, 'C'),
    createOptionParameter('COND_EWT', 'descricao_COND_EWT', '#FF656E', 5, 'C'),
    createOptionParameter('COOL_LWT', 'descricao_COOL_LWT', '#0085FF', 6, 'C'),
    createOptionParameter('COOL_EWT', 'descricao_COOL_EWT', '#6FBAFF', 7, 'C'),
    createOptionParameter('SP', 'descricao_SP', '#3BA448', 8, 'C'),
    createOptionParameter('OAT', 'descricao_OAT', '#303c4e', 9, 'C'),
    createOptionParameter('HR_MACH', 'descricao_HR_MACH', '#303c4e', 10, 'H'),
    createOptionParameter('HR_MACH_B', 'descricao_HR_MACH_B', '#303c4e', 11, 'H'),

    createOptionParameter('ACircuit', 'circuitoA', '#DC3C45', 12),
    createOptionParameter('DP_A', 'descricao_DP_A', '#DC3C45', 13, 'kPa', 'A'),
    createOptionParameter('SP_A', 'descricao_SP_A', '#0066FF', 14, 'kPa', 'A'),
    createOptionParameter('SCT_A', 'descricao_SCT_A', '#B63030', 15, 'C', 'A'),
    createOptionParameter('SST_A', 'descricao_SST_A', '#0042A5', 16, 'C', 'A'),
    createOptionParameter('OP_A', 'descricao_OP_A', '#303c4e', 17, 'C', 'A'),
    createOptionParameter('SLT_A', 'descricao_SLT_A', '#303c4e', 18, 'P', 'A'),
    createOptionParameter('HR_CP_A', 'descricao_HR_CP_A', '#303c4e', 19, 'H', 'A'),

    createOptionParameter('BCircuit', 'circuitoB', '#B4A947', 20),
    createOptionParameter('DP_B', 'descricao_DP_B', '#EA8A8F', 21, 'kPa', 'B'),
    createOptionParameter('SP_B', 'descricao_SP_B', '#5C7AA9', 22, 'kPa', 'B'),
    createOptionParameter('SCT_B', 'descricao_SCT_B', '#D38383', 23, 'C', 'B'),
    createOptionParameter('SST_B', 'descricao_SST_B', '#668EC9', 24, 'C', 'B'),
    createOptionParameter('OP_B', 'descricao_OP_B', '#303c4e', 25, 'C', 'B'),
    createOptionParameter('SLT_B', 'descricao_SLT_B', '#303c4e', 26, 'P', 'B'),
    createOptionParameter('HR_CP_B', 'descricao_HR_CP_B', '#303c4e', 27, 'H', 'B'),
  ];

  const handleOptionsParametersXAHvar = () => {
    const options = [
      createOptionParameter('geral', 'geral', '#363BC4', 0),
      createOptionParameter('alarme', 'alarme', '#e1c61b', 1),
      createOptionParameter('status', 'status', '#fd9401', 2),

      createOptionParameter('GENUNIT_UI', 'descricao_GENUNIT_UI', '#fdc601', 3, 's'),
      createOptionParameter('CAP_T', 'descricao_CAP_T', '#33A6FF', 4, 'P'),
      createOptionParameter('CTRL_PNT', 'descricao_CTRL_PNT', '#2C5932', 5, 'C'),
      createOptionParameter('OAT', 'descricao_OAT', '#303c4e', 6, 'C'),
      createOptionParameter('TOT_CURR', 'descricao_TOT_CURR', '#33A6FF', 7, 'A'),
      createOptionParameter('COOL_EWT', 'descricao_COOL_EWT', '#6FBAFF', 8, 'C'),
      createOptionParameter('COOL_LWT', 'descricao_COOL_LWT', '#0085FF', 9, 'C'),

      createOptionParameter('ACircuit', 'circuitoA', '', 10),
      createOptionParameter('DP_A', 'descricao_DP_A', '#DC3C45', 11, 'kPa', 'A'),
      createOptionParameter('CIRCA_AN_UI', 'descricao_CIRCA_AN_UI', '#19598a', 12, 's', 'A'),
      createOptionParameter('CAPA_T', 'descricao_CAPA_T', '#7b2683', 13, 'P', 'A'),
      createOptionParameter('SP_A', 'descricao_SP_A', '#0066FF', 14, 'kPa', 'A'),
      createOptionParameter('ECON_P_A', 'descricao_ECON_P_A', '#7dba8b', 15, 'kPa', 'A'),
      createOptionParameter('OP_A', 'descricao_OP_A', '#303c4e', 16, 'kPa', 'A'),
      createOptionParameter('DOP_A', 'descricao_DOP_A', '#5a914d', 17, 'kPa', 'A'),
      createOptionParameter('CURREN_A', 'descricao_CURREN_A', '#629acc', 18, 'A', 'A'),
      createOptionParameter('CP_TMP_A', 'descricao_CP_TMP_A', '#cfcf32', 19, 'C', 'A'),
      createOptionParameter('DGT_A', 'descricao_DGT_A', '#CE6268', 20, 'C', 'A'),
      createOptionParameter('ECO_TP_A', 'descricao_ECO_TP_A', '#c2304e', 21, 'C', 'A'),
      createOptionParameter('SCT_A', 'descricao_SCT_A', '#B63030', 22, 'C', 'A'),
      createOptionParameter('SST_A', 'descricao_SST_A', '#0042A5', 23, 'C', 'A'),
      createOptionParameter('SUCT_T_A', 'descricao_SUCT_T_A', '#732fc2', 24, 'C', 'A'),
      createOptionParameter('EXV_A', 'descricao_EXV_A', '#27c490', 25, 'P', 'A'),

      createOptionParameter('BCircuit', 'circuitoB', '', 26),
      createOptionParameter('DP_B', 'descricao_DP_B', '#EA8A8F', 27, 'kPa', 'B'),
      createOptionParameter('CIRCB_AN_UI', 'descricao_CIRCB_AN_UI', '#044475', 28, 's', 'B'),
      createOptionParameter('CAPB_T', 'descricao_CAPB_T', '#712c80', 29, 'P', 'B'),
      createOptionParameter('SP_B', 'descricao_SP_B', '#5C7AA9', 30, 'kPa', 'B'),
      createOptionParameter('ECON_P_B', 'descricao_ECON_P_B', '#549463', 31, 'kPa', 'B'),
      createOptionParameter('OP_B', 'descricao_OP_B', '#303c4e', 32, 'kPa', 'B'),
      createOptionParameter('DOP_B', 'descricao_DOP_B', '#476e3d', 33, 'kPa', 'B'),
      createOptionParameter('CURREN_B', 'descricao_CURREN_B', '#3971a3', 34, 'A', 'B'),
      createOptionParameter('CP_TMP_B', 'descricao_CP_TMP_B', '#b0b035', 35, 'C', 'B'),
      createOptionParameter('DGT_B', 'descricao_DGT_B', '#E2A1A4', 36, 'C', 'B'),
      createOptionParameter('ECO_TP_B', 'descricao_ECO_TP_B', '#a13d52', 37, 'C', 'B'),
      createOptionParameter('SCT_B', 'descricao_SCT_B', '#D38383', 38, 'C', 'B'),
      createOptionParameter('SST_B', 'descricao_SST_B', '#668EC9', 39, 'C', 'B'),
      createOptionParameter('SUCT_T_B', 'descricao_SUCT_T_B', '#5f299e', 40, 'C', 'B'),
      createOptionParameter('EXV_B', 'descricao_EXV_B', '#27a37a', 41, 'P', 'B'),
    ];

    if (verifyShowCircuitC(props.chillerModel)) {
      options.push(
        createOptionParameter('CCircuit', 'circuitoC', '', 42),
        createOptionParameter('DP_C', 'descricao_DP_C', '#FF788A', 43, 'kPa', 'C'),
        createOptionParameter('CIRCC_AN_UI', 'descricao_CIRCC_AN_UI', '#19598a', 44, 's', 'C'),
        createOptionParameter('CAPC_T', 'descricao_CAPC_T', '#642c70', 45, 'P', 'C'),
        createOptionParameter('SP_C', 'descricao_SP_C', '#00CCFF', 46, 'kPa', 'C'),
        createOptionParameter('ECON_P_C', 'descricao_ECON_P_C', '#2c6639', 47, 'kPa', 'C'),
        createOptionParameter('OP_C', 'descricao_OP_C', '#2e3745', 48, 'kPa', 'C'),
        createOptionParameter('DOP_C', 'descricao_DOP_C', '#3c5c33', 49, 'kPa', 'C'),
        createOptionParameter('CURREN_C', 'descricao_CURREN_C', '#2a5b87', 50, 'A', 'C'),
        createOptionParameter('CP_TMP_C', 'descricao_CP_TMP_C', '#8c8c31', 51, 'C', 'C'),
        createOptionParameter('DGT_C', 'descricao_DGT_C', '#FFC4D0', 52, 'C', 'C'),
        createOptionParameter('ECO_TP_C', 'descricao_ECO_TP_C', '##944354', 53, 'C', 'C'),
        createOptionParameter('SCT_C', 'descricao_SCT_C', '#FF6060', 54, 'C', 'C'),
        createOptionParameter('SST_C', 'descricao_SST_C', '#11A2CF', 55, 'C', 'C'),
        createOptionParameter('SUCT_T_C', 'descricao_SUCT_T_C', '#4b2775', 56, 'C', 'C'),
        createOptionParameter('EXV_C', 'descricao_EXV_C', '#248c6a', 57, 'P', 'C'),
      );
    }

    return options;
  };

  function verifyShowCircuitC(model?: string) {
    if (!model?.length) return false;

    const numberAux = model.slice(4, 7);

    return Number(numberAux) >= 400;
  }

  const OptionsParameters = handleOptionsParameters();

  const [state, render, setState] = useStateVar({
    groupGraph: false,
    isLoading: false,
    record_dates: [] as string[],
    optionsParameters: OptionsParameters as TSelectParameters[],
    selectedParameters: [] as any,
    sendToGraphDefault: [] as TSelectParameters[],
    sendToGraphPercent: [] as TSelectParameters[],
    sendToCompStatus: [] as TSelectParameters[],
    sendGraphDefaultGrouped: [] as TSelectParameters[],
    selectedAlarm: false,
    selectedGeneral: false,
    selectedStatus: false,
    selectedMaintence: false,
    selectedCompStatusA1: false,
    selectedCompStatusA2: false,
    selectedCompStatusB1: false,
    selectedCompStatusB2: false,
    listDays: [] as Date[],
    objectData: {} as {[key:string]: {}},
    dataX: [] as number[],
    dataXChangedParams: [] as number[],
    numPoints: 0,
    interval: 0,
    hourGraph: false,
    groupGraphValues: [] as {
      value: string;
      name: string;
      color: string;
      unidMed?: string;
      type?: string;
      data: number[]
    }[],
    countValuesUniMed: {
      C: 0,
      kPa: 0,
      A: 0,
      H: 0,
      P: 0,
      s: 0,
    },
    maxValue: {
      C: 0,
      kPa: 0,
      A: 0,
      H: 0,
      s: 0,
    },
    haveData: true,
    changeData: false,
    searchData: false,
    dataPeriodOut: false,
    textAlertParameters: 0,
  });
  const limitParameters = 21;

  function changeDataOptionsParameters(item: {
    value: string;
    name: string;
    color: string;
    unidMed?: string;
    type?: string;
    data: number[];
  }, arrayStatus: number[], valoresPorPropriedade, arrayGeral: number[], arrayAlarm: number[], arrayCpb1: number[], arrayCpb2: number[], arrayCpa1: number[], arrayCpa2: number[]) {
    if (item.value === 'status') {
      item.data = arrayStatus;
    }
    else if (item.value === 'geral') {
      item.data = arrayGeral;
    }
    // else if (item.value === 'manutencao') {
    //   item.data = arrayMaintence;
    // }
    else if (item.value === 'alarme') {
      item.data = arrayAlarm;
    }
    else if (item.value === 'CP_B1') {
      item.data = arrayCpb1;
    }
    else if (item.value === 'CP_B2') {
      item.data = arrayCpb2;
    }
    else if (item.value === 'CP_A1') {
      item.data = arrayCpa1;
    }
    else if (item.value === 'CP_A2') {
      item.data = arrayCpa2;
    }
    else {
      item.data = valoresPorPropriedade[item.value.toLowerCase()];
    }
  }

  async function handleGetParamsHistory() {
    if (state.selectedParameters.length === 0) {
      setState({ textAlertParameters: state.textAlertParameters + 1 });
      return;
    }
    try {
      setState({ isLoading: true });
      if (props.startDate && props.endDate && state.changeData) {
        const response = await apiCall('/dri/get-chiller-parameters-hist', {
          DEVICE_CODE: props.driId!, START_DATE: props.startDate.format('YYYY-MM-DD'), END_DATE: props.endDate.format('YYYY-MM-DD'), MODEL: chillerModel, HOUR_GRAPHIC: state.hourGraph,
        });
        if (response?.paramsLists?.paramsChanged?.length === 0 && response?.paramsLists?.paramsGrouped?.length === 0) {
          setState({ haveData: false, isLoading: false });
          return;
        }
        setState({ haveData: true, changeData: false, searchData: true });
        const record_dates = response.paramsLists.paramsGrouped.map((item) => item.record_date);
        // createRecordStatusObject cria um objeto de dias selecionado e conta quantos registros de pontos tem no dia;
        const objectDays = createRecordStatusObject(record_dates, state.listDays);
        // processData é para adicionar o valor null nos pontos se não tiver a quantidade de pontos ideal por dia. 24 pontos caso sejam mais de 5 dias selecionado; 144 pontos caso seja menos.
        const dataProcessed = processData(objectDays, response.paramsLists.paramsGrouped, state.numPoints, chillerModel);
        const valoresPorPropriedade: any = separarValoresPorPropriedade(dataProcessed);
        // agruparPorData funciona como um agrupador de parametros changed para separar e repetir o valor anterior caso tenha.
        const statusValues = agruparPorData(response.paramsLists?.paramsChanged?.filter((item) => item.parameter_name === 'STATUS'), state.listDays);
        const compStatusValuesB1 = agruparPorData(response.paramsLists?.paramsChanged?.filter((item) => item.parameter_name === 'CP_B1'), state.listDays);
        const compStatusValuesB2 = agruparPorData(response.paramsLists?.paramsChanged?.filter((item) => item.parameter_name === 'CP_B2'), state.listDays);
        const compStatusValuesA1 = agruparPorData(response.paramsLists?.paramsChanged?.filter((item) => item.parameter_name === 'CP_A1'), state.listDays);
        const compStatusValuesA2 = agruparPorData(response.paramsLists?.paramsChanged?.filter((item) => item.parameter_name === 'CP_A2'), state.listDays);
        const geralValues = agruparPorData(response.paramsLists?.paramsChanged?.filter((item) => item.parameter_name === 'CHIL_S_S'), state.listDays);
        const alarmValues = agruparPorData(response.paramsLists?.paramsChanged?.filter((item) => item.parameter_name === 'ALM'), state.listDays);
        setState({
          record_dates: valoresPorPropriedade.record_date,
        });
        // changeDataOptionParameters adicona em cada propriedade o valor dos dados ja processados e editados conforme a quantidade de pontos.
        state.optionsParameters.forEach((item) => changeDataOptionsParameters(item, statusValues, valoresPorPropriedade, geralValues, alarmValues, compStatusValuesB1, compStatusValuesB2, compStatusValuesA1, compStatusValuesA2));
        render();
      }
      if (state.searchData) {
        transformDataFunction();
      }
      setState({ searchData: true });
    } catch (err) {
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false, textAlertParameters: 0 });
  }

  useEffect(() => {
    if (!getListDays(props, setState, state)) {
      setState({
        changeData: true, searchData: false,
      });
      gerarNumerosAteMaximoDataXChangedParams(state.listDays.length, setState, state);
    }
  }, [props.startDate, props.endDate]);

  function getObjectsFiltered(objectData: { [key: string]: {} }, arrayFiltered: string[]): any[] {
    const valoresExcluidos = new Set(arrayFiltered);
    return Object.keys(objectData)
      .filter((chave) => !valoresExcluidos.has(chave))
      .map((chave) => objectData[chave]);
  }

  function transformDataFunction() {
    setState({ isLoading: true });
    render();
    const objectData = {} as {[key:string]: TSelectParameters};
    const all = state.optionsParameters.filter((item) => item.checked);
    all.forEach((item) => {
      objectData[item.value] = { ...item };
    });
    setState({
      ...state,
      objectData,
      selectedGeneral: !!objectData.geral,
      selectedStatus: !!objectData.status,
      selectedMaintence: !!objectData.manutencao,
      selectedAlarm: !!objectData.alarme,
      selectedCompStatusA1: !!objectData.CP_A1,
      selectedCompStatusA2: !!objectData.CP_A2,
      selectedCompStatusB1: !!objectData.CP_B1,
      selectedCompStatusB2: !!objectData.CP_B2,
    });
    const allWithoutDefault = getObjectsFiltered(objectData, arrayDefault);
    getDataToGraphsAndSetMaxValues(allWithoutDefault, percentArray, setState, state);
    const sendToCompGraph = [] as TSelectParameters[];
    arrayCompStatus.forEach((item) => { if (objectData[item]) { sendToCompGraph.push(objectData[item]); } });
    setState({ sendToCompStatus: sendToCompGraph, sendGraphDefaultGrouped: state.sendToGraphDefault.concat(state.sendToGraphPercent) });
    if (state.groupGraph) {
      const arrayValues: {
        value: string;
        name: string;
        color: string;
        unidMed?: string;
        type?: string;
        data: number[];
      }[] = [];
      state.optionsParameters.forEach((item) => {
        if (
          (item.value === 'geral' && state.selectedGeneral)
          || (item.value === 'manutencao' && state.selectedMaintence)
          || (item.value === 'alarme' && state.selectedAlarm)
          || (item.value === 'status' && state.selectedStatus)
          || (item.value === 'CP_B1' && state.selectedCompStatusB1)
          || (item.value === 'CP_B2' && state.selectedCompStatusB2)
          || (item.value === 'CP_A2' && state.selectedCompStatusA1)
          || (item.value === 'CP_A1' && state.selectedCompStatusA2)
        ) {
          arrayValues.push(item);
        }
      });
      setState({ groupGraphValues: arrayValues, searchData: true });
    }
    setState({ isLoading: false });
    render();
  }

  function setColor(e, index) {
    const selectedColor = e.target.value;
    const darkenedColor = darkenColor(selectedColor, 40);
    state.optionsParameters[index].color = darkenedColor;
  }

  const handleBlur = () => {
    render();
  };
  const handleColorInputClick = (event) => {
    event.stopPropagation();
  };
  const renderOption = (option) => (
    <SelectOptionStyled className={option.value} disabled={limitParameters === state.selectedParameters && !option.checked}>
      { (option.value === 'DP_A' || option.value === 'DP_B' || option.value === 'DP_C') && <BorderSubItem model={chillerModel} /> }
      <SelectedContent>
        <InfoSelected>
          { (option.type === 'A' || option.type === 'B' || option.type === 'C') && <HorizontalLineSelectParameters /> }
          <Checkbox checked={option.checked} size={18} />
          <InputStyledSelected type="checkbox" checked={option.checked} isLeft={(option.type === 'A' || option.type === 'B' || option.type === 'C')} />
          <span style={{ marginLeft: '10px' }}>
            {
              option.value === 'ACircuit' || option.value === 'BCircuit' || option.value === 'CCircuit' ? (
                <strong>
                  {option.name}
                </strong>
              )
                : option.name
            }
          </span>
        </InfoSelected>
        { !(option.value === 'ACircuit' || option.value === 'BCircuit' || option.value === 'CCircuit') && <input type="color" id={option.value} onBlur={handleBlur} onMouseOutCapture={handleBlur} value={state.optionsParameters[option.index]?.color} onChange={(e) => setColor(e, option.index)} onClick={handleColorInputClick} />}
      </SelectedContent>
    </SelectOptionStyled>
  );

  function addValuesParametersCircuit(value, stringName, arrayValues) {
    if (value.value === stringName) {
      if (!value.checked) {
        arrayValues.forEach((option) => state.optionsParameters.forEach((item) => { if (item.value === option || item.value === value.value) { item.checked = false; } }));
      } else {
        state.selectedParameters = state.optionsParameters.forEach((item) => { if (item.value !== value.value) { item.checked = false; } });
        arrayValues.forEach((option) => state.optionsParameters.forEach((item) => { if (item.value === option || item.value === value.value) { item.checked = true; } }));
      }
      state.selectedParameters = state.optionsParameters.filter((item) => item.checked);
      render();
      return true;
    }
    return false;
  }

  function filterValuesParametersCircuit(value, circuitName, stringName, arrayValues) {
    if (value.type === stringName) {
      const filterValues = arrayValues.filter((item) => !state.optionsParameters.some((op) => op.checked && item === op.value));
      if (filterValues.length > 0) {
        state.optionsParameters.forEach((item) => { if (item.value === circuitName) { item.checked = false; } });
      } else {
        state.optionsParameters.forEach((item) => { if (item.value === circuitName) { item.checked = true; } });
      }
      state.selectedParameters = state.optionsParameters.filter((item) => item.checked);
      render();
      return true;
    }
    return false;
  }

  function selectedParameter(value) {
    if (limitParameters === state.selectedParameters.length && !state.selectedParameters.find((item) => item.value === value.value)) {
      return;
    }
    state.optionsParameters[value.index].checked = !state.optionsParameters[value.index].checked;
    const AValues = ['CIRCA_AN_UI', 'CAPA_T', 'DP_A', 'SP_A', 'ECON_P_A', 'OP_A', 'DOP_A', 'CURREN_A', 'CP_TMP_A', 'CP_TMP_A', 'DGT_A', 'ECO_TP_A', 'SCT_A', 'SST_A', 'SUCT_T_A', 'EXV_A', 'CPA1_OP', 'CPA2_OP', 'HR_CP_A1', 'HR_CP_A2', 'CPA1_CUR', 'CPA2_CUR', 'DOP_A1', 'DOP_A2', 'CPA1_DGT', 'CPA2_DGT', 'CPA1_TMP', 'CPA2_TMP', 'CP_A1', 'CP_A2', 'SLT_A', 'HR_CP_A'];
    const BValues = ['CIRCB_AN_UI', 'CAPB_T', 'DP_B', 'SP_B', 'ECON_P_B', 'OP_B', 'DOP_B', 'CURREN_B', 'CP_TMP_B', 'DGT_B', 'ECO_TP_B', 'SCT_B', 'SST_B', 'SUCT_T_B', 'EXV_B', 'CPB1_OP', 'CPB2_OP', 'HR_CP_B1', 'HR_CP_B2', 'CPB1_CUR', 'CPB2_DGT', 'CPB1_TMP', 'CPB2_TMP', 'CP_B1', 'CP_B2', 'SLT_B', 'HR_CP_B', 'CPB2_CUR', 'DOP_B1', 'DOP_B2', 'CPB1_DGT', 'CPB2_DGT'];
    const CValues = ['CIRCC_AN_UI', 'CAPC_T', 'DP_C', 'SP_C', 'ECON_P_C', 'OP_C', 'DOP_C', 'CURREN_C', 'CP_TMP_C', 'DGT_C', 'ECO_TP_C', 'SCT_C', 'SST_C', 'SUCT_T_C', 'EXV_C'];

    if (addValuesParametersCircuit(value, 'ACircuit', AValues) || addValuesParametersCircuit(value, 'BCircuit', BValues) || addValuesParametersCircuit(value, 'CCircuit', CValues)) {
      return;
    }
    if (filterValuesParametersCircuit(value, 'ACircuit', 'A', AValues) || filterValuesParametersCircuit(value, 'BCircuit', 'B', BValues) || filterValuesParametersCircuit(value, 'CCircuit', 'C', CValues)) {
      return;
    }
    state.selectedParameters = state.optionsParameters.filter((item) => item.checked);
    render();
  }

  if (state.isLoading) {
    return (
      <ContainerNotSelectedParams>
        <span style={{ fontSize: 12, marginTop: 5 }}><Loader /></span>
        <span style={{ fontSize: 10, fontWeight: 500 }}>
          {t('carregandoGraficosDeParametros')}
        </span>
      </ContainerNotSelectedParams>
    );
  }

  function decideGraphs() {
    if (!state.groupGraph) {
      return (
        <div
          style={{
            width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column',
          }}
        >
          <GenerateGraphSample
            arrayData={state.sendToGraphDefault}
            xAxis={returnXAxis(state)}
            name="chiller-geral-initial-parameters"
            title={t('geral')}
            haveTitle={false}
            driId={props.driId}
            getDate={(item) => getDate(state, item, state.record_dates)}
            groupGraph={state.groupGraph}
            right="4.5%"
            isLoading={state.isLoading}
            countUniMed={state.countValuesUniMed}
            maxValue={state.maxValue}
            toolbox
          />
          <GenerateGraphSample
            arrayData={state.sendToGraphPercent}
            xAxis={returnXAxis(state)}
            name="chiller-percent-parameters"
            title={t('porcentagens')}
            haveTitle
            driId={props.driId}
            getDate={(item) => getDate(state, item, state.record_dates)}
            groupGraph={state.groupGraph}
            right="4.5%"
            isLoading={state.isLoading}
            countUniMed={state.countValuesUniMed}
            maxValue={state.maxValue}
            toolbox
          />
          <GenerateGraphGeralAlarmMaintaince
            arrayData={state.selectedGeneral ? [state.optionsParameters.find((item) => item.value === 'geral')] : []}
            yAxisNames={listGeneralNames}
            name="chiller-geral-parameters"
            title={t('geral')}
            height={180}
            getDate={(index) => getDate(state, index, [], true)}
            xAxis={returnXAxis(state, true)}
            driId={props.driId}
            groupGraph={state.groupGraph}
            toolbox
          />
          <GenerateGraphGeralAlarmMaintaince
            arrayData={state.selectedStatus ? [state.optionsParameters.find((item) => item.value === 'status')] : []}
            yAxisNames={listStatusNames}
            name="chiller-status-parameters"
            title={t('status')}
            height={400}
            getDate={(index) => getDate(state, index, [], true)}
            xAxis={returnXAxis(state, true)}
            driId={props.driId}
            groupGraph={state.groupGraph}
            toolbox
          />
          {/* <GenerateGraphGeralAlarmMaintaince
            arrayData={state.selectedMaintence ? [state.optionsParameters.find((item) => item.value === 'manutencao')] : []}
            yAxisNames={listMaintenceNames}
            name="chiller-maintence-parameters"
            title={t('manutencao')}
            height={200}
            getDate={(index) => getDate(index, true)}
            xAxis={returnXAxis(state, true)}
            driId={props.driId}
            groupGraph={state.groupGraph}
            toolbox
          /> */}
          <GenerateGraphGeralAlarmMaintaince
            arrayData={state.selectedAlarm ? [state.optionsParameters.find((item) => item.value === 'alarme')] : []}
            yAxisNames={listAlarmNames}
            name="chiller-alarm-parameters"
            title={t('alarme')}
            height={220}
            getDate={(index) => getDate(state, index, [], true)}
            xAxis={returnXAxis(state, true)}
            driId={props.driId}
            groupGraph={state.groupGraph}
            toolbox
          />
          <GenerateGraphGeralAlarmMaintaince
            arrayData={state.sendToCompStatus}
            yAxisNames={listCompStatusNames}
            name="chiller-comp_status-parameters"
            title={t('status_compressores')}
            height={180}
            getDate={(index) => getDate(state, index, [], true)}
            xAxis={returnXAxis(state, true)}
            driId={props.driId}
            groupGraph={state.groupGraph}
            toolbox
          />
        </div>
      );
    }
    return (
      <div style={{ width: '100%' }}>
        <GenerateGraphSample
          arrayData={state.sendGraphDefaultGrouped}
          xAxis={returnXAxis(state)}
          name="chiller-geral-initial-parameters"
          title="Initial"
          haveTitle={false}
          driId={props.driId}
          getDate={(item) => getDate(state, item, state.record_dates)}
          groupGraph={state.groupGraph}
          right={state.groupGraph ? '120px' : '10%'}
          isLoading={state.isLoading}
          countUniMed={state.countValuesUniMed}
          maxValue={state.maxValue}
          toolbox
        />
        <GenerateGraphGeralAlarmMaintaince
          arrayData={state.groupGraphValues}
          yAxisNames={getYAxisNames()}
          name="chiller-geral-total-parameters"
          height={600}
          getDate={(index) => getDate(state, index, [], true)}
          xAxis={returnXAxis(state, true)}
          driId={props.driId}
          groupGraph={state.groupGraph}
          toolbox
          lengthArraySample={state.sendToGraphPercent.length + state.sendToGraphDefault.length}
        />
      </div>
    );
  }

  function returnGraphs() {
    if (state.searchData && state.haveData) {
      return (
        <>
          {decideGraphs()}
        </>
      );
    }
    return (
      <ContainerNotSelectedParams>
        <ComparativeIcon color="#7D7D7D" />
        <span style={{ fontSize: 12, marginTop: 5 }}><strong>{t('historicoParametros')}</strong></span>
        <span style={{ fontSize: 10, fontWeight: 500 }}>
          {t('selecioneDataParametros')}
          <br />
          {t('continuacaoParametrosVazio')}
        </span>
      </ContainerNotSelectedParams>
    );
  }

  function clearSelected() {
    if (state.selectedParameters.length > 0) {
      state.optionsParameters.forEach((item) => item.checked = false);
      state.selectedParameters = [];
      render();
    }
  }

  return (
    <Card
      style={{
        marginTop: '10px', marginBottom: '10px', padding: '60px', minHeigth: '400px',
      }}
    >
      <ContainerParameters>
        <h3><strong>{t('parametros')}</strong></h3>
        <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SearchInput style={{ width: 400, marginLeft: '0' }}>
              <SearchInputStyled>
                <SelectMultiple
                  options={state.optionsParameters}
                  values={state.selectedParameters}
                  multiple
                  search
                  haveFuzzySearch
                  propLabel="name"
                  placeholder={t('parametros')}
                  onSelect={(value) => { selectedParameter(value); }}
                  customElements={renderOption}
                  disabled={!props.startDate || state.isLoading || state.dataPeriodOut}
                  styleBox={{ border: 'none', width: '100%' }}
                  haveCountSelect={false}
                  limitSelect={limitParameters}
                />
              </SearchInputStyled>
            </SearchInput>
            <div
              style={{
                width: '100%', display: 'flex', gap: 10, padding: '5px 0px 0px 0px', justifyContent: 'space-between',
              }}
            >
              <AlertMessage value={state.textAlertParameters} arrayLength={state.selectedParameters.length} onAnimationEnd={() => setState({ textAlertParameters: 0 })} />
              <ButtonClear type="button" onClick={() => clearSelected()}>
                <span style={{ textAlign: 'end', color: state.isLoading ? '#5B5B5B' : '#363BC4' }}>{t('limpar')}</span>
              </ButtonClear>
            </div>
          </div>
          <Button
            data-tip
            data-for="chiller_pesquisar"
            variant="blue"
            disabled={state.dataPeriodOut}
            style={{
              maxWidth: 120, borderRadius: 15, height: '50px', backgroundColor: state.selectedParameters.length === 0 || state.dataPeriodOut ? '#363bc4c2' : '', borderColor: state.selectedParameters.length === 0 || state.dataPeriodOut ? '#363bc4c2' : '',
            }}
            onClick={() => handleGetParamsHistory()}
          >
            {t('analisar')}
          </Button>
          {
            state.selectedParameters.length === 0 && (
            <ReactTooltip
              id="chiller_pesquisar"
              place="top"
              effect="solid"
            >
              <div style={{ display: 'flex', gap: 10 }}>
                <InfoIcon />
                <HoverExportList>
                  {t('pesquiseChiller')}
                </HoverExportList>
              </div>
            </ReactTooltip>
            )
          }
          {
            state.haveData && (
              <Box style={{ cursor: state.isLoading ? 'not-allowed' : 'default' }}>
                <b style={{ fontSize: '14px' }}>{t('visualizacao')}</b>
                <Box minWidth="280px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]}>
                  <span style={{ fontSize: '1rem' }}>{t('desagrupar')}</span>
                  <ToggleSwitchMini
                    checked={state.groupGraph}
                    onClick={() => { state.groupGraph = !state.groupGraph; transformDataFunction(); render(); }}
                    style={{ marginLeft: '10px', marginRight: '10px' }}
                  />
                  <span style={{ fontSize: '1rem' }}>{t('agrupar')}</span>
                </Box>
              </Box>
            )
          }
        </div>
      </ContainerParameters>
      {
        state.haveData ? (
          <>
            {returnGraphs()}
          </>
        ) : (
          <ContainerNotSelectedParams>
            <img src={SemParametros} alt="sem-parâmetros" />
            <span style={{ fontSize: 12, marginTop: 5 }}><strong>{t('semParametros')}</strong></span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>
              {t('naoHouveramRegistrosParametros')}
              <br />
              {t('paraOperidoSelecionado')}
            </span>
          </ContainerNotSelectedParams>
        )
      }
    </Card>
  );
}

export function haveToolbox(toolbox, isGraphGeral?: boolean) {
  function yAxisIndex() {
    if (!isGraphGeral) {
      return {
        yAxisIndex: '',
      };
    }
  }
  if (toolbox) {
    return {
      toolbox: {
        feature: {
          dataZoom: {
            xAxisIndex: [0],
            ...yAxisIndex(),
            title: {
              zoom: t('Zoom'),
              back: t('voltarAmpliacao'),
            },
            filterMode: 'filter',
          },
          restore: {
            title: t('restaurarZoom'),
          },
          saveAsImage: {
            title: t('salvarComoImagem'),
          },
        },
        top: isGraphGeral ? 2 : '4.5%',
      },
    };
  }
}

export function zoomTooltipOff(chartInstance, name) {
  let isZooming = false;
  const handleZoom = () => {
    if (!isZooming) {
      isZooming = true;
      echarts.connect(name);
      chartInstance.setOption({
        tooltip: {
          show: false,
        },
      });
    }
  };

  const handleRestore = () => {
    if (isZooming) {
      isZooming = false;
      echarts.disconnect(name);
      chartInstance.setOption({
        tooltip: {
          show: true,
        },
      });
    }
  };

  chartInstance.on('dataZoom', handleZoom);
  chartInstance.on('restore', handleRestore);
  chartInstance.on('finished', () => {
    if (isZooming) {
      isZooming = false;
      echarts.disconnect(name);
      chartInstance.setOption({
        tooltip: {
          show: true,
        },
      });
    }
  });
}

function AlertMessage({ value, arrayLength, onAnimationEnd }) {
  const valueInitial = 0;

  return (
    <>
      {
        valueInitial !== value && arrayLength === 0 ? (
          <AlertTextParameters onAnimationEnd={onAnimationEnd}>
            <WarnIcon color="rgba(160, 160, 160, 1)" />
            <span>{t('selecioneParametosDeseja')}</span>
          </AlertTextParameters>
        ) : (
          <div />
        )
      }
    </>
  );
}
