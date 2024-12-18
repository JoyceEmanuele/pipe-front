import { Flex } from 'reflexbox';
import { Card, Loader } from '../../../../../components';
import StatusCard from './components/StatusCard';
import MonitoringCard from './components/MonitoringCard';
import ChillerCard from './components/ChillerCard';
import { useStateVar } from '~/helpers/useStateVar';
import { useWebSocket } from '~/helpers/wsConnection';
import { apiCall } from '~/providers';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { t } from 'i18next';
import { getCachedDevInfo, getCachedDevInfoSync } from '~/helpers/cachedStorage';
import i18n from 'i18n';
import moment from 'moment';
import ChillerParameters from './components/ChillerParameters';
import ChillerAlarms from './components/ChillerAlarms';
import {
  driChillerCarrier30HXParams, driChillerCarrier30XAParams, driChillerCarrierAlarmParams, driChillerCarrierGeneral30HXParams, driChillerCarrierGeneral30XAParams, driChillerCarrierGeneral30XAHvarParams,
  driChillerCarrier30XAHvarParams,
} from '~/helpers/driConfigOptions';
import { checkProtocolValue } from 'helpers/driConfig';

export default function DriChillerCarrierRealTime(props: { devId: string, varsList: any, chillerModel: string }): JSX.Element {
  const { devId } = props;
  const [state, render, setState] = useStateVar({
    driInterval: null as null | number,
    loading: true,
    devInfo: getCachedDevInfoSync(devId),
    timezoneOffset: 0,
    lastTelemetry: null as string | null,
    oldDate: false as boolean,
    status: null as string | null,
    width: window.innerWidth,
    tablet: window.innerWidth < 1145,
    mobile: window.innerWidth < 740,
    alarm: null as number | null,
    RSSI: null as number | null,
    model: null as string | null,
    chillerCarrier30HX: driChillerCarrier30HXParams,
    chillerCarrier30XA: driChillerCarrier30XAParams,
    chillerCarrier30XAHvar: driChillerCarrier30XAHvarParams,
    generalParams30HX: driChillerCarrierGeneral30HXParams,
    generalParams30XA: driChillerCarrierGeneral30XAParams,
    generalParams30XAHvar: driChillerCarrierGeneral30XAHvarParams,
    alarmParams: driChillerCarrierAlarmParams,
  });

  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');

  const updateDimensions = () => {
    state.width = window.innerWidth;
    if (window.innerWidth < 1145) {
      state.tablet = true;
    } else {
      state.tablet = false;
    }
    if (window.innerWidth < 580) {
      state.mobile = true;
    } else {
      state.mobile = false;
    }
    render();
  };

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    Promise.resolve().then(async () => {
      try {
        setState({ loading: true });
        // @ts-ignore
        const devInfo = (await getCachedDevInfo(devId, { forceFresh: true }))!;
        updateInfoParams();

        await apiCall('/get-timezone-offset-by-devId', { devId }).then((tzOffset) => {
          if (tzOffset != null) state.timezoneOffset = tzOffset;
        });

        if (devInfo.lastMessageTS) state.lastTelemetry = devInfo.lastMessageTS;
        state.devInfo = devInfo;
        render();
        state.driInterval = devInfo.dri.varsCfg.driConfigs.find((cfg) => checkProtocolValue(cfg, 'interval'))?.value;
        state.model = devInfo.dri.varsCfg?.application;
        render();
        if (state.driInterval) updateTimeReceiveTelemetries(devId, 10);
      } catch (err) {
        toast.error(t('erro')); console.error(err);
        setState({ loading: false });
      }
    });
  }, []);

  function updateInfoParams() {
    props?.varsList?.forEach((param) => {
      if (state.chillerCarrier30HX.circuitAParams[param.inputRow.Alias]) {
        state.chillerCarrier30HX.circuitAParams[param.inputRow.Alias].unitMeasurement = param.inputRow.Unidade;
      } else if (state.chillerCarrier30HX.circuitBParams[param.inputRow.Alias]) {
        state.chillerCarrier30HX.circuitBParams[param.inputRow.Alias].unitMeasurement = param.inputRow.Unidade;
      } else if (state.generalParams30HX[param.inputRow.Alias]) {
        state.generalParams30HX[param.inputRow.Alias].unitMeasurement = param.inputRow.Unidade;
      }

      if (state.chillerCarrier30XA.circuitAParams[param.inputRow.Alias]) {
        state.chillerCarrier30XA.circuitAParams[param.inputRow.Alias].unitMeasurement = param.inputRow.Unidade;
      } else if (state.chillerCarrier30XA.circuitBParams[param.inputRow.Alias]) {
        state.chillerCarrier30XA.circuitBParams[param.inputRow.Alias].unitMeasurement = param.inputRow.Unidade;
      } else if (state.generalParams30XA[param.inputRow.Alias]) {
        state.generalParams30XA[param.inputRow.Alias].unitMeasurement = param.inputRow.Unidade;
      }

      if (state.chillerCarrier30XAHvar.circuitAParams[param.inputRow.Alias]) {
        state.chillerCarrier30XAHvar.circuitAParams[param.inputRow.Alias].unitMeasurement = param.inputRow.Unidade;
      } else if (state.chillerCarrier30XAHvar.circuitBParams[param.inputRow.Alias]) {
        state.chillerCarrier30XAHvar.circuitBParams[param.inputRow.Alias].unitMeasurement = param.inputRow.Unidade;
      } else if (state.chillerCarrier30XAHvar.circuitCParams[param.inputRow.Alias]) {
        state.chillerCarrier30XAHvar.circuitCParams[param.inputRow.Alias].unitMeasurement = param.inputRow.Unidade;
      } else if (state.generalParams30XAHvar[param.inputRow.Alias]) {
        state.generalParams30XAHvar[param.inputRow.Alias].unitMeasurement = param.inputRow.Unidade;
      }
    });
  }

  function checkLastTelemetry(lastTelemetry: string | null) {
    if (lastTelemetry) {
      const dateLastTelemetry = new Date(lastTelemetry);
      const dateCurrent = new Date();
      const dateDifference = dateCurrent.getTime() - dateLastTelemetry.getTime();

      if (dateDifference > 60000) {
        state.oldDate = true;
      } else {
        state.oldDate = false;
      }
    }
  }

  const verifyAndUpdateDataStatus = (payload) => {
    if (payload.data.status) state.status = payload.data.status;
    if (payload.data.timestamp || payload.data.deviceTimestamp) {
      const timestamp = payload.data.timestamp || payload.data.deviceTimestamp;
      const data = moment(timestamp);
      const dateWithOffset = data.utcOffset(state.timezoneOffset);
      payload.data.timestamp = dateWithOffset.format('YYYY-MM-DDTHH:mm:ss');
      state.lastTelemetry = payload.data.timestamp;
      state.RSSI = payload.data.RSSI;
      checkLastTelemetry(state.lastTelemetry);
    }
  };

  const roundOnePlace = (value) => (value || value === 0 ? Math.round(value * 10) / 10 : null);

  const updateChillerCarrierTelemetry30HX = (payload) => {
    if (state.status === 'ONLINE' && !state.oldDate) {
      // Os parâmetros de alarme são em ordem crescente de chegada, o alarm_1 é o mais recente, o alarm_5 é o mais antigo
      state.alarm = roundOnePlace(payload.data.ALM);
      state.alarmParams.alarm_1 = roundOnePlace(payload.data.alarm_1);
      state.alarmParams.alarm_2 = roundOnePlace(payload.data.alarm_2);
      state.alarmParams.alarm_3 = roundOnePlace(payload.data.alarm_3);
      state.alarmParams.alarm_4 = roundOnePlace(payload.data.alarm_4);
      state.alarmParams.alarm_5 = roundOnePlace(payload.data.alarm_5);

      state.chillerCarrier30HX.circuitAParams.CP_A1.value = roundOnePlace(payload.data.CP_A1);
      state.chillerCarrier30HX.circuitAParams.CP_A2.value = roundOnePlace(payload.data.CP_A2);
      state.chillerCarrier30HX.circuitAParams.CAPA_T.value = roundOnePlace(payload.data.CAPA_T);
      state.chillerCarrier30HX.circuitAParams.DP_A.value = roundOnePlace(payload.data.DP_A);
      state.chillerCarrier30HX.circuitAParams.SP_A.value = roundOnePlace(payload.data.SP_A);
      state.chillerCarrier30HX.circuitAParams.SCT_A.value = roundOnePlace(payload.data.SCT_A);
      state.chillerCarrier30HX.circuitAParams.SST_A.value = roundOnePlace(payload.data.SST_A);
      state.chillerCarrier30HX.circuitAParams.CPA1_OP.value = roundOnePlace(payload.data.CPA1_OP);
      state.chillerCarrier30HX.circuitAParams.CPA2_OP.value = roundOnePlace(payload.data.CPA2_OP);
      state.chillerCarrier30HX.circuitAParams.DOP_A1.value = roundOnePlace(payload.data.DOP_A1);
      state.chillerCarrier30HX.circuitAParams.DOP_A2.value = roundOnePlace(payload.data.DOP_A2);
      state.chillerCarrier30HX.circuitAParams.CPA1_DGT.value = roundOnePlace(payload.data.CPA1_DGT);
      state.chillerCarrier30HX.circuitAParams.CPA2_DGT.value = roundOnePlace(payload.data.CPA2_DGT);
      state.chillerCarrier30HX.circuitAParams.EXV_A.value = roundOnePlace(payload.data.EXV_A);
      state.chillerCarrier30HX.circuitAParams.HR_CP_A1.value = roundOnePlace(payload.data.HR_CP_A1);
      state.chillerCarrier30HX.circuitAParams.HR_CP_A2.value = roundOnePlace(payload.data.HR_CP_A2);
      state.chillerCarrier30HX.circuitAParams.CPA1_TMP.value = roundOnePlace(payload.data.CPA1_TMP);
      state.chillerCarrier30HX.circuitAParams.CPA2_TMP.value = roundOnePlace(payload.data.CPA2_TMP);
      state.chillerCarrier30HX.circuitAParams.CPA1_CUR.value = roundOnePlace(payload.data.CPA1_CUR);
      state.chillerCarrier30HX.circuitAParams.CPA2_CUR.value = roundOnePlace(payload.data.CPA2_CUR);

      state.chillerCarrier30HX.circuitBParams.CP_B1.value = roundOnePlace(payload.data.CP_B1);
      state.chillerCarrier30HX.circuitBParams.CP_B2.value = roundOnePlace(payload.data.CP_B2);
      state.chillerCarrier30HX.circuitBParams.CAPB_T.value = roundOnePlace(payload.data.CAPB_T);
      state.chillerCarrier30HX.circuitBParams.DP_B.value = roundOnePlace(payload.data.DP_B);
      state.chillerCarrier30HX.circuitBParams.SP_B.value = roundOnePlace(payload.data.SP_B);
      state.chillerCarrier30HX.circuitBParams.SCT_B.value = roundOnePlace(payload.data.SCT_B);
      state.chillerCarrier30HX.circuitBParams.SST_B.value = roundOnePlace(payload.data.SST_B);
      state.chillerCarrier30HX.circuitBParams.CPB1_OP.value = roundOnePlace(payload.data.CPB1_OP);
      state.chillerCarrier30HX.circuitBParams.CPB2_OP.value = roundOnePlace(payload.data.CPB2_OP);
      state.chillerCarrier30HX.circuitBParams.DOP_B1.value = roundOnePlace(payload.data.DOP_B1);
      state.chillerCarrier30HX.circuitBParams.DOP_B2.value = roundOnePlace(payload.data.DOP_B2);
      state.chillerCarrier30HX.circuitBParams.CPB1_DGT.value = roundOnePlace(payload.data.CPB1_DGT);
      state.chillerCarrier30HX.circuitBParams.CPB2_DGT.value = roundOnePlace(payload.data.CPB2_DGT);
      state.chillerCarrier30HX.circuitBParams.EXV_B.value = roundOnePlace(payload.data.EXV_B);
      state.chillerCarrier30HX.circuitBParams.HR_CP_B1.value = roundOnePlace(payload.data.HR_CP_B1);
      state.chillerCarrier30HX.circuitBParams.HR_CP_B2.value = roundOnePlace(payload.data.HR_CP_B2);
      state.chillerCarrier30HX.circuitBParams.CPB1_TMP.value = roundOnePlace(payload.data.CPB1_TMP);
      state.chillerCarrier30HX.circuitBParams.CPB2_TMP.value = roundOnePlace(payload.data.CPB2_TMP);
      state.chillerCarrier30HX.circuitBParams.CPB1_CUR.value = roundOnePlace(payload.data.CPB1_CUR);
      state.chillerCarrier30HX.circuitBParams.CPB2_CUR.value = roundOnePlace(payload.data.CPB2_CUR);

      state.generalParams30HX.CHIL_S_S.value = roundOnePlace(payload.data.CHIL_S_S);
      state.generalParams30HX.CHIL_S_S.value = roundOnePlace(payload.data.CHIL_S_S);
      state.generalParams30HX.CAP_T.value = roundOnePlace(payload.data.CAP_T);
      state.generalParams30HX.DEM_LIM.value = roundOnePlace(payload.data.DEM_LIM);
      state.generalParams30HX.LAG_LIM.value = roundOnePlace(payload.data.LAG_LIM);
      state.generalParams30HX.SP.value = roundOnePlace(payload.data.SP);
      state.generalParams30HX.CTRL_PNT.value = roundOnePlace(payload.data.CTRL_PNT);
      state.generalParams30HX.EMSTOP.value = roundOnePlace(payload.data.EMSTOP);
      state.generalParams30HX.COND_LWT.value = roundOnePlace(payload.data.COND_LWT);
      state.generalParams30HX.COND_EWT.value = roundOnePlace(payload.data.COND_EWT);
      state.generalParams30HX.COOL_LWT.value = roundOnePlace(payload.data.COOL_LWT);
      state.generalParams30HX.COOL_EWT.value = roundOnePlace(payload.data.COOL_EWT);
      state.generalParams30HX.COND_SP.value = roundOnePlace(payload.data.COND_SP);
      state.generalParams30HX.CHIL_OCC.value = roundOnePlace(payload.data.CHIL_OCC);
      state.generalParams30HX.STATUS.value = roundOnePlace(payload.data.STATUS);
    }
  };

  const updateChillerCarrierTelemetry30XA = (payload) => {
    if (state.status === 'ONLINE') {
      // Os parâmetros de alarme são em ordem crescente de chegada, o alarm_1 é o mais recente, o alarm_5 é o mais antigo
      state.alarm = roundOnePlace(payload.data.ALM);

      state.chillerCarrier30XA.circuitAParams.DP_A.value = roundOnePlace(payload.data.DP_A);
      state.chillerCarrier30XA.circuitAParams.SP_A.value = roundOnePlace(payload.data.SP_A);
      state.chillerCarrier30XA.circuitAParams.SCT_A.value = roundOnePlace(payload.data.SCT_A);
      state.chillerCarrier30XA.circuitAParams.SST_A.value = roundOnePlace(payload.data.SST_A);
      state.chillerCarrier30XA.circuitAParams.OP_A.value = roundOnePlace(payload.data.OP_A);
      state.chillerCarrier30XA.circuitAParams.SLT_A.value = roundOnePlace(payload.data.SLT_A);
      state.chillerCarrier30XA.circuitAParams.HR_CP_A.value = roundOnePlace(payload.data.HR_CP_A);

      state.chillerCarrier30XA.circuitBParams.DP_B.value = roundOnePlace(payload.data.DP_B);
      state.chillerCarrier30XA.circuitBParams.SP_B.value = roundOnePlace(payload.data.SP_B);
      state.chillerCarrier30XA.circuitBParams.SCT_B.value = roundOnePlace(payload.data.SCT_B);
      state.chillerCarrier30XA.circuitBParams.SST_B.value = roundOnePlace(payload.data.SST_B);
      state.chillerCarrier30XA.circuitBParams.OP_B.value = roundOnePlace(payload.data.OP_B);
      state.chillerCarrier30XA.circuitBParams.SLT_B.value = roundOnePlace(payload.data.SLT_B);
      state.chillerCarrier30XA.circuitBParams.HR_CP_B.value = roundOnePlace(payload.data.HR_CP_B);

      state.generalParams30XA.STATUS.value = roundOnePlace(payload.data.STATUS);
      state.generalParams30XA.CHIL_S_S.value = roundOnePlace(payload.data.CHIL_S_S);
      state.generalParams30XA.CHIL_OCC.value = roundOnePlace(payload.data.CHIL_OCC);
      state.generalParams30XA.CTRL_TYP.value = roundOnePlace(payload.data.CTRL_TYP);
      state.generalParams30XA.SLC_HM.value = roundOnePlace(payload.data.SLC_HM);
      state.generalParams30XA.CAP_T.value = roundOnePlace(payload.data.CAP_T);
      state.generalParams30XA.DEM_LIM.value = roundOnePlace(payload.data.DEM_LIM);
      state.generalParams30XA.SP.value = roundOnePlace(payload.data.SP);
      state.generalParams30XA.SP_OCC.value = roundOnePlace(payload.data.SP_OCC);
      state.generalParams30XA.CTRL_PNT.value = roundOnePlace(payload.data.CTRL_PNT);
      state.generalParams30XA.OAT.value = roundOnePlace(payload.data.OAT);
      state.generalParams30XA.EMSTOP.value = roundOnePlace(payload.data.EMSTOP);
      state.generalParams30XA.HR_MACH.value = roundOnePlace(payload.data.HR_MACH);
      state.generalParams30XA.COOL_EWT.value = roundOnePlace(payload.data.COOL_EWT);
      state.generalParams30XA.COOL_LWT.value = roundOnePlace(payload.data.COOL_LWT);
      state.generalParams30XA.COND_EWT.value = roundOnePlace(payload.data.COND_EWT);
      state.generalParams30XA.COND_LWT.value = roundOnePlace(payload.data.COND_LWT);
      state.generalParams30XA.HR_MACH_B.value = roundOnePlace(payload.data.HR_MACH_B);
    }

    render();
  };

  const updateChillerCarrierTelemetry30XAHvar = (payload) => {
    if (state.status === 'ONLINE') {
      state.alarm = roundOnePlace(payload.data.ALM);

      state.chillerCarrier30XAHvar.circuitAParams.CAPA_T.value = roundOnePlace(payload.data.CAPA_T);
      state.chillerCarrier30XAHvar.circuitAParams.CIRCA_AN_UI.value = roundOnePlace(payload.data.CIRCA_AN_UI);
      state.chillerCarrier30XAHvar.circuitAParams.CP_TMP_A.value = roundOnePlace(payload.data.CP_TMP_A);
      state.chillerCarrier30XAHvar.circuitAParams.CURREN_A.value = roundOnePlace(payload.data.CURREN_A);
      state.chillerCarrier30XAHvar.circuitAParams.DGT_A.value = roundOnePlace(payload.data.DGT_A);
      state.chillerCarrier30XAHvar.circuitAParams.DOP_A.value = roundOnePlace(payload.data.DOP_A);
      state.chillerCarrier30XAHvar.circuitAParams.DP_A.value = roundOnePlace(payload.data.DP_A);
      state.chillerCarrier30XAHvar.circuitAParams.ECON_P_A.value = roundOnePlace(payload.data.ECON_P_A);
      state.chillerCarrier30XAHvar.circuitAParams.ECO_TP_A.value = roundOnePlace(payload.data.ECO_TP_A);
      state.chillerCarrier30XAHvar.circuitAParams.EXV_A.value = roundOnePlace(payload.data.EXV_A);
      state.chillerCarrier30XAHvar.circuitAParams.OP_A.value = roundOnePlace(payload.data.OP_A);
      state.chillerCarrier30XAHvar.circuitAParams.SCT_A.value = roundOnePlace(payload.data.SCT_A);
      state.chillerCarrier30XAHvar.circuitAParams.SP_A.value = roundOnePlace(payload.data.SP_A);
      state.chillerCarrier30XAHvar.circuitAParams.SST_A.value = roundOnePlace(payload.data.SST_A);
      state.chillerCarrier30XAHvar.circuitAParams.SUCT_T_A.value = roundOnePlace(payload.data.SUCT_T_A);

      state.chillerCarrier30XAHvar.circuitBParams.CIRCB_AN_UI.value = roundOnePlace(payload.data.CIRCB_AN_UI);
      state.chillerCarrier30XAHvar.circuitBParams.CAPB_T.value = roundOnePlace(payload.data.CAPB_T);
      state.chillerCarrier30XAHvar.circuitBParams.DP_B.value = roundOnePlace(payload.data.DP_B);
      state.chillerCarrier30XAHvar.circuitBParams.SP_B.value = roundOnePlace(payload.data.SP_B);
      state.chillerCarrier30XAHvar.circuitBParams.ECON_P_B.value = roundOnePlace(payload.data.ECON_P_B);
      state.chillerCarrier30XAHvar.circuitBParams.OP_B.value = roundOnePlace(payload.data.OP_B);
      state.chillerCarrier30XAHvar.circuitBParams.DOP_B.value = roundOnePlace(payload.data.DOP_B);
      state.chillerCarrier30XAHvar.circuitBParams.CURREN_B.value = roundOnePlace(payload.data.CURREN_B);
      state.chillerCarrier30XAHvar.circuitBParams.CP_TMP_B.value = roundOnePlace(payload.data.CP_TMP_B);
      state.chillerCarrier30XAHvar.circuitBParams.DGT_B.value = roundOnePlace(payload.data.DGT_B);
      state.chillerCarrier30XAHvar.circuitBParams.ECO_TP_B.value = roundOnePlace(payload.data.ECO_TP_B);
      state.chillerCarrier30XAHvar.circuitBParams.SCT_B.value = roundOnePlace(payload.data.SCT_B);
      state.chillerCarrier30XAHvar.circuitBParams.SST_B.value = roundOnePlace(payload.data.SST_B);
      state.chillerCarrier30XAHvar.circuitBParams.SUCT_T_B.value = roundOnePlace(payload.data.SUCT_T_B);
      state.chillerCarrier30XAHvar.circuitBParams.EXV_B.value = roundOnePlace(payload.data.EXV_B);

      state.chillerCarrier30XAHvar.circuitCParams.CIRCC_AN_UI.value = roundOnePlace(payload.data.CIRCC_AN_UI);
      state.chillerCarrier30XAHvar.circuitCParams.CAPC_T.value = roundOnePlace(payload.data.CAPC_T);
      state.chillerCarrier30XAHvar.circuitCParams.DP_C.value = roundOnePlace(payload.data.DP_C);
      state.chillerCarrier30XAHvar.circuitCParams.SP_C.value = roundOnePlace(payload.data.SP_C);
      state.chillerCarrier30XAHvar.circuitCParams.ECON_P_C.value = roundOnePlace(payload.data.ECON_P_C);
      state.chillerCarrier30XAHvar.circuitCParams.OP_C.value = roundOnePlace(payload.data.OP_C);
      state.chillerCarrier30XAHvar.circuitCParams.DOP_C.value = roundOnePlace(payload.data.DOP_C);
      state.chillerCarrier30XAHvar.circuitCParams.CURREN_C.value = roundOnePlace(payload.data.CURREN_C);
      state.chillerCarrier30XAHvar.circuitCParams.CP_TMP_C.value = roundOnePlace(payload.data.CP_TMP_C);
      state.chillerCarrier30XAHvar.circuitCParams.DGT_C.value = roundOnePlace(payload.data.DGT_C);
      state.chillerCarrier30XAHvar.circuitCParams.ECO_TP_C.value = roundOnePlace(payload.data.ECO_TP_C);
      state.chillerCarrier30XAHvar.circuitCParams.SCT_C.value = roundOnePlace(payload.data.SCT_C);
      state.chillerCarrier30XAHvar.circuitCParams.SST_C.value = roundOnePlace(payload.data.SST_C);
      state.chillerCarrier30XAHvar.circuitCParams.SUCT_T_C.value = roundOnePlace(payload.data.SUCT_T_C);
      state.chillerCarrier30XAHvar.circuitCParams.EXV_C.value = roundOnePlace(payload.data.EXV_C);

      state.generalParams30XAHvar.CTRL_TYP.value = roundOnePlace(payload.data.CTRL_TYP);
      state.generalParams30XAHvar.STATUS.value = roundOnePlace(payload.data.STATUS);
      state.generalParams30XAHvar.GENUNIT_UI.value = roundOnePlace(payload.data.GENUNIT_UI);
      state.generalParams30XAHvar.SP_OCC.value = roundOnePlace(payload.data.SP_OCC);
      state.generalParams30XAHvar.CHIL_S_S.value = roundOnePlace(payload.data.CHIL_S_S);
      state.generalParams30XAHvar.CHIL_OCC.value = roundOnePlace(payload.data.CHIL_OCC);
      state.generalParams30XAHvar.DEM_LIM.value = roundOnePlace(payload.data.DEM_LIM);
      state.generalParams30XAHvar.EMSTOP.value = roundOnePlace(payload.data.EMSTOP);
      state.generalParams30XAHvar.CAP_T.value = roundOnePlace(payload.data.CAP_T);
      state.generalParams30XAHvar.TOT_CURR.value = roundOnePlace(payload.data.TOT_CURR);
      state.generalParams30XAHvar.CTRL_PNT.value = roundOnePlace(payload.data.CTRL_PNT);
      state.generalParams30XAHvar.OAT.value = roundOnePlace(payload.data.OAT);
      state.generalParams30XAHvar.COOL_EWT.value = roundOnePlace(payload.data.COOL_EWT);
      state.generalParams30XAHvar.COOL_LWT.value = roundOnePlace(payload.data.COOL_LWT);
    }

    render();
  };

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);

  function onWsOpen(wsConn) {
    wsConn.send({ type: 'driSubscribeRealTime', data: { DRI_ID: devId } });
  }

  function onWsMessage(response) {
    if (response && response.type === 'driTelemetry' && response.data.dev_id === devId) {
      verifyAndUpdateDataStatus(response);
      if (!state.model || state.model.startsWith('chiller-carrier-30hx')) updateChillerCarrierTelemetry30HX(response);
      else if (!state.model || state.model === 'chiller-carrier-30xab-hvar') updateChillerCarrierTelemetry30XAHvar(response);
      else if (!state.model || state.model.startsWith('chiller-carrier-30xa')) updateChillerCarrierTelemetry30XA(response);
      render();
    }
  }

  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'driUnsubscribeRealTime' });
    if (state.driInterval) updateTimeReceiveTelemetries(devId, state.driInterval);
  }

  function verifyShowCircuitC(model: string) {
    if (!model?.length) return false;

    const numberAux = model.match(/\d{3}/)?.[0];

    return Number(numberAux) >= 400;
  }

  async function updateTimeReceiveTelemetries(DRI_ID: string, interval: number) {
    try {
      await apiCall('/dri/update-time-send-config', {
        DRI_ID,
        VALUE: interval,
      });
    } catch (err) {
      console.log(err);
      toast.error(t('erroAtualizarTempoReceberTelemetrias'));
    }
  }

  if (state.model?.startsWith('chiller-carrier-30hx')) { return (
    <>
      <Card overflowHidden style={{ marginTop: '10px', marginBottom: '10px' }}>
        <Flex width="100%" flexDirection="column" justifyContent="center" alignItems="center">
          <Flex width="100%" flexWrap="wrap-reverse" flexDirection="row" alignItems="center" marginBottom="20px" justifyContent="center">
            <StatusCard
              totalCapacity={state.generalParams30HX.CAP_T.value ?? 0}
              geralStatus={state.generalParams30HX.STATUS.value}
              alarm={state.alarm}
              emergencyStop={state.generalParams30HX.EMSTOP.value}
              tablet={state.tablet}
              mobile={state.mobile}
              model={state.model}
            />
            {!state.tablet && <div style={{ width: '25px' }} />}
            {state.tablet && <div style={{ height: '15px', width: '100%' }} />}

            <MonitoringCard
              status={state.status}
              lastTelemetry={(state.lastTelemetry && moment(state.lastTelemetry).format('lll')) || t('semInformacao')}
              lteNetwork={state.devInfo?.LTE_NETWORK}
              lteRSRP={state.devInfo?.LTE_RSRP}
              RSSI={state.RSSI}
              tablet={state.tablet}
              mobile={state.mobile}
            />
          </Flex>
          <ChillerCard
            compressorA1={state.chillerCarrier30HX.circuitAParams.CP_A1.value}
            compressorA2={state.chillerCarrier30HX.circuitAParams.CP_A2.value}
            compressorB1={state.chillerCarrier30HX.circuitBParams.CP_B1.value}
            capacityCA={state.chillerCarrier30HX.circuitAParams.CAPA_T.value}
            capacityCB={state.chillerCarrier30HX.circuitBParams.CAPB_T.value}
            circuitSucA={state.chillerCarrier30HX.circuitAParams.SP_A.value}
            circuitSucB={state.chillerCarrier30HX.circuitBParams.SP_B.value}
            circuitDescB={state.chillerCarrier30HX.circuitBParams.DP_B.value}
            circuitDescA={state.chillerCarrier30HX.circuitAParams.DP_A.value}
            compressorOleoA1={state.chillerCarrier30HX.circuitAParams.CPA1_OP.value}
            compressorOleoA2={state.chillerCarrier30HX.circuitAParams.CPA2_OP.value}
            compressorOleoB1={state.chillerCarrier30HX.circuitBParams.CPB1_OP.value}
            evaporatorSP={state.generalParams30HX.SP.value}
            evaporatorInputTemp={state.generalParams30HX.COOL_EWT.value}
            evaporatorOutputTemp={state.generalParams30HX.COOL_LWT.value}
            condenserInputTemp={state.generalParams30HX.COND_EWT.value}
            condenserOutputTemp={state.generalParams30HX.COND_LWT.value}
            alarm={state.alarm}
            mobile={state.mobile}
            tablet={state.tablet}
            model={state.model}
          />
        </Flex>
      </Card>
      <ChillerParameters circuitAParams={state.chillerCarrier30HX.circuitAParams} circuitBParams={state.chillerCarrier30HX.circuitBParams} generalParams={state.generalParams30HX} model="30hx" />
      <ChillerAlarms alarmParams={state.alarmParams} driId={devId} />
    </>
  ); }

  if (state.model === 'chiller-carrier-30xab-hvar') { return (
    <>
      <Card overflowHidden style={{ marginTop: '10px', marginBottom: '10px' }}>
        <Flex width="100%" flexDirection="column" justifyContent="center" alignItems="center">
          <Flex width="100%" flexWrap="wrap-reverse" flexDirection="row" alignItems="center" marginBottom="20px" justifyContent="center">
            <StatusCard
              totalCapacity={state.generalParams30XAHvar.CAP_T.value ?? 0}
              geralStatus={state.generalParams30XAHvar.STATUS.value}
              alarm={state.alarm}
              emergencyStop={state.generalParams30XAHvar.EMSTOP.value}
              tablet={state.tablet}
              mobile={state.mobile}
              model={state.model}
            />
            {!state.tablet && <div style={{ width: '25px' }} />}
            {state.tablet && <div style={{ height: '15px', width: '100%' }} />}

            <MonitoringCard
              status={state.status}
              lastTelemetry={(state.lastTelemetry && moment(state.lastTelemetry).format('lll')) || t('semInformacao')}
              lteNetwork={state.devInfo?.LTE_NETWORK}
              lteRSRP={state.devInfo?.LTE_RSRP}
              RSSI={state.RSSI}
              tablet={state.tablet}
              mobile={state.mobile}
            />
          </Flex>
          <ChillerCard
            evaporatorSP={state.generalParams30XAHvar.CTRL_PNT.value}
            status={state.generalParams30XAHvar.STATUS.value}
            circuitSucA={state.chillerCarrier30XAHvar.circuitAParams.SP_A.value}
            circuitSucB={state.chillerCarrier30XAHvar.circuitBParams.SP_B.value}
            circuitSucC={state.chillerCarrier30XAHvar.circuitCParams.SP_C.value}
            circuitDescC={state.chillerCarrier30XAHvar.circuitCParams.DP_C.value}
            circuitDescB={state.chillerCarrier30XAHvar.circuitBParams.DP_B.value}
            circuitDescA={state.chillerCarrier30XAHvar.circuitAParams.DP_A.value}
            evaporatorInputTemp={state.generalParams30XAHvar.COOL_EWT.value}
            evaporatorOutputTemp={state.generalParams30XAHvar.COOL_LWT.value}
            alarm={state.alarm}
            mobile={state.mobile}
            tablet={state.tablet}
            model={state.model}
            showCircuitC={verifyShowCircuitC(props.chillerModel)}
            compressorOleoA={state.chillerCarrier30XAHvar.circuitAParams.OP_A.value}
            compressorOleoB={state.chillerCarrier30XAHvar.circuitBParams.OP_B.value}
            compressorOleoC={state.chillerCarrier30XAHvar.circuitCParams.OP_C.value}
            removeCondenser
          />
        </Flex>
      </Card>
      <ChillerParameters circuitAParams={state.chillerCarrier30XAHvar.circuitAParams} circuitBParams={state.chillerCarrier30XAHvar.circuitBParams} circuitCParams={state.chillerCarrier30XAHvar.circuitCParams} generalParams={state.generalParams30XAHvar} hasCircuitC={verifyShowCircuitC(props.chillerModel)} model="30xab" />
    </>
  ); }

  if (state.model?.startsWith('chiller-carrier-30xa')) { return (
    <>
      <Card overflowHidden style={{ marginTop: '10px', marginBottom: '10px' }}>
        <Flex width="100%" flexDirection="column" justifyContent="center" alignItems="center">
          <Flex width="100%" flexWrap="wrap-reverse" flexDirection="row" alignItems="center" marginBottom="20px" justifyContent="center">
            <StatusCard
              totalCapacity={state.generalParams30XA.CAP_T.value ?? 0}
              geralStatus={state.generalParams30XA.STATUS.value}
              alarm={state.alarm}
              emergencyStop={state.generalParams30XA.EMSTOP.value}
              tablet={state.tablet}
              mobile={state.mobile}
              model={state.model}
            />
            {!state.tablet && <div style={{ width: '25px' }} />}
            {state.tablet && <div style={{ height: '15px', width: '100%' }} />}

            <MonitoringCard
              status={state.status}
              lastTelemetry={(state.lastTelemetry && moment(state.lastTelemetry).format('lll')) || t('semInformacao')}
              lteNetwork={state.devInfo?.LTE_NETWORK}
              lteRSRP={state.devInfo?.LTE_RSRP}
              RSSI={state.RSSI}
              tablet={state.tablet}
              mobile={state.mobile}
            />
          </Flex>
          <ChillerCard
            status={state.generalParams30XA.STATUS.value}
            circuitSucA={state.chillerCarrier30XA.circuitAParams.SP_A.value}
            circuitSucB={state.chillerCarrier30XA.circuitBParams.SP_B.value}
            circuitDescB={state.chillerCarrier30XA.circuitBParams.DP_B.value}
            circuitDescA={state.chillerCarrier30XA.circuitAParams.DP_A.value}
            evaporatorSP={state.generalParams30XA.SP.value}
            evaporatorInputTemp={state.generalParams30XA.COOL_EWT.value}
            evaporatorOutputTemp={state.generalParams30XA.COOL_LWT.value}
            condenserInputTemp={state.generalParams30XA.COND_EWT.value}
            condenserOutputTemp={state.generalParams30XA.COND_LWT.value}
            alarm={state.alarm}
            mobile={state.mobile}
            tablet={state.tablet}
            model={state.model}
            compressorOleoA={state.chillerCarrier30XA.circuitAParams.OP_A.value}
            compressorOleoB={state.chillerCarrier30XA.circuitBParams.OP_B.value}
          />
        </Flex>
      </Card>
      <ChillerParameters circuitAParams={state.chillerCarrier30XA.circuitAParams} circuitBParams={state.chillerCarrier30XA.circuitBParams} generalParams={state.generalParams30XA} model="30xa" />
    </>
  ); }

  if (state.loading) return <Loader />;
  return <>{t('semInformacao')}</>;
}
