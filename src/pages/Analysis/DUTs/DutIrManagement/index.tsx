import { useEffect, useState } from 'react';

import * as levenshtein from 'fast-levenshtein';
import { Helmet } from 'react-helmet';
import { useParams, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';

import IrReadIcon from 'assets/img/icons/IR_symbol_paths.svg';
import IrReadFaintIcon from 'assets/img/icons/IR_symbol_paths_faint.svg';
import TransmitIcon from 'assets/img/icons/wifi_icon.svg';
import {
  Loader, ModalWindow, Select, Button, ActionButton, Input, Checkbox, RouterPrompt,
} from 'components';
import { getCachedDevInfo, getCachedDevInfoSync } from 'helpers/cachedStorage';
import { getUserProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';
import { useWebSocket } from 'helpers/wsConnection';
import {
  DeleteOutlineIcon,
  EditIcon,
} from 'icons';
import { DevLayout } from 'pages/Analysis/DEVs/DevLayout';
import { apiCall } from 'providers';
import { colors } from 'styles/colors';
import { AssetLayout } from 'pages/Analysis/Assets/AssetLayout';

import {
  Card,
  IrTable,
  IrTableCell,
  IrTableCell2,
  SelectContainer,
  CustomSelect,
  TextLine,
} from './styles';
import { useTranslation } from 'react-i18next';
import { MdArrowDropDown, MdArrowRight } from 'react-icons/md';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

function getDutDefaultTemps() {
  const temps = [] as { name: string, value: number }[];
  for (let index = 16; index <= 30; index += 1) {
    temps.push({ name: `${index}°C`, value: index });
  }
  return temps;
}

export const DutIrManagement = (): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const routeParams = useParams<{ devId: string }>();
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar(() => ({
    modify: false,
    haveError: false,
    devId: routeParams.devId,
    loading: true,
    savingCmdType: false,
    savingCmdsTable: false,
    savingFakeCmds: false,
    deletingSelectedCmds: false,
    transmittingCommand: false,
    selectedDutCommands: 0,
    selectPositionY: 0,
    assetLayout: false,
    selectPositionX: 0,
    devInfo: getCachedDevInfoSync(routeParams.devId),
    defaultIrList: [] as { IR_ID: string, CMD_TYPE: string, CMD_DESC: string, TEMPER: number }[],
    irList: [] as { IR_ID: string, CMD_TYPE: string, CMD_DESC: string, TEMPER: number }[],
    loadedIrList: [] as {
      IR_ID: string;
      CMD_TYPE: string;
      CMD_DESC: string;
      TEMPER: number;
    }[],
    dutCommandTypes: [{ name: t('refrigerar'), value: 'COOL' }, { name: t('desligar'), value: 'OFF' }, { name: t('ventilar'), value: 'FAN' }, { name: t('outro'), value: 'OTHER' }],
    dutDefaultTemps: getDutDefaultTemps(),
    dutCommandActions: [] as string[],
    probableIrCommands: null as null | {
      ircodes: {
        DUT_ID: string;
        IR_ID: string;
        CMD_TYPE: string;
        CMD_DESC: string;
        TEMPER: number;
      }[];
      dutCommandTypes: string[];
      model: string;
      DUT_ID: string;
      distance: number;
    }[],
    loadedIrModel: '',
    checkedAllCodes: false,
    lastIr: {
      id: null,
      ts: null,
      isOld: null,
      timer: null,
    },
    showModal: null,
    modalCmdType: {
      IR_ID: null,
      CMD_TYPE: null as null | { name: string, value: string },
      CMD_DESC: null as null | string,
      CMD_ACTION: null,
      TEMPER: null as null | { name: string, value: number },
    },
    wsConn: null,
    learnActive: false,
    rends: 0,
    comboOpts: {} as {
      units?: { label: string, value: number }[],
      groups?: { label: string, value: number, unit: number }[],
      fluids?: { label: string, value: string }[],
      applics?: { label: string, value: string }[],
      types?: { label: string, value: string }[],
      envs?: { label: string, value: string }[],
      brands?: { label: string, value: string }[],
      roles?: { label: string, value: string }[],
      psens?: { label: string, value: string }[],
      vavs?: { label: string, value: string }[],
      rtypes?: { RTYPE_NAME: string, RTYPE_ID: number }[],
      dutPlacement?: { label: string, value: string }[],
    },
    MCHN_BRAND_item: null as null|{ label: string, value: string },
    MCHN_MODEL: '',
    openEdit: false,
    savingModel: false,
    permissionGeral: false,
  }));

  useEffect(() => {
    verifyPermissions();
  }, [profile]);

  useEffect(() => {
    Promise.resolve().then(async () => {
      try {
        const [
          devInfo,
          { list, dutCommandTypes },
        ] = await Promise.all([
          getCachedDevInfo(state.devId, {}),
          apiCall('/get-dut-ircodes-list', { devId: state.devId }),
        ]);
        state.devInfo = devInfo;
        // @ts-ignore
        state.irList = list || [];
        state.defaultIrList = state.irList;
        state.loadedIrList = state.irList;
        // @ts-ignore
        if (!sessionStorage.getItem('savingOnDut')) {
          sessionStorage.setItem('savingOnDut', JSON.stringify(state.loadedIrList));
        }
        state.dutCommandActions = dutCommandTypes || [];
        if (state.permissionGeral) {
          const probableCommands = await fetchIRCommandSets(state.devId);
          setState({ probableIrCommands: probableCommands });
        }
      } catch (err) { toast.error(t('erro')); console.error(err); }
      state.loading = false;
      render();
    });
    if (profile.permissions.isInstaller) {
      const reqCombos = {
        fluids: true,
        applics: true,
        types: true,
        envs: true,
        brands: true,
        psens: true,
        ecoModeCfg: true,
        scheduleStartBehavior: true,
        dutScheduleStartBehavior: true,
        dutScheduleEndBehavior: true,
        dutForcedBehavior: true,
      };
      apiCall('/dev/dev-info-combo-options', reqCombos).then((response) => {
        state.comboOpts = response;
      });
    }
  }, [state.savingModel]);

  useEffect(() => {
    if (!state.wsConn) return;
    if (state.learnActive) {
      // @ts-ignore
      state.wsConn.send({
        type: 'dutSubscribeIrRead', data: { DUT_ID: state.devId },
      });
    } else {
      // @ts-ignore
      state.wsConn.send({
        type: 'dutUnsubscribeIrRead',
      });
    }
  }, [state.learnActive]);

  const linkBase = history.location.pathname;

  state.assetLayout = linkBase.includes('/ativo');
  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);
  function onWsOpen(wsConn) {
    state.wsConn = wsConn;
    if (state.learnActive) {
      wsConn.send({ type: 'dutSubscribeIrRead', data: { DUT_ID: state.devId } });
    }
  }
  function onWsMessage(payload) {
    const { type: msgType, data: msgData } = (payload || {});
    if (msgType === 'dutIrRead') {
      if (msgData.devId !== state.devId) return;
      if (!msgData.IR_ID) return;
      state.lastIr.id = msgData.IR_ID;
      // @ts-ignore
      state.lastIr.ts = Date.now();
      // @ts-ignore
      state.lastIr.isOld = false;
      // @ts-ignore
      clearTimeout(state.lastIr.timer);
      // @ts-ignore
      state.lastIr.timer = setTimeout(() => {
        // @ts-ignore
        state.lastIr.isOld = ((state.lastIr.ts + 1000) < Date.now());
        // @ts-ignore
        if (state.lastIr.isOld) render();
      }, 1500);
      // @ts-ignore
      if (!state.irList.some((x) => x.IR_ID === msgData.IR_ID)) {
        // @ts-ignore
        state.irList.push({
          // @ts-ignore
          IR_ID: msgData.IR_ID,
          // @ts-ignore
          CMD_TYPE: (msgData.CMD_TYPE || null),
          // @ts-ignore
          CMD_DESC: (msgData.CMD_DESC || null),
          // @ts-ignore
          TEMPER: (msgData.TEMPER == null) ? null : msgData.TEMPER,
        });
      }
      render();
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'dutUnsubscribeIrRead' });
  }

  const confirmSetCmdType = async () => {
    try {
      const { IR_ID } = state.modalCmdType;
      const CMD_TYPE = state.modalCmdType.CMD_ACTION || null;
      const CMD_DESC = state.modalCmdType.CMD_TYPE
        && state.modalCmdType.CMD_TYPE.value === 'COOL'
        ? (state.modalCmdType.TEMPER && `ON_${state.modalCmdType.TEMPER.value}`)
        : (state.modalCmdType.CMD_TYPE?.value === 'OTHER' ? state.modalCmdType.CMD_DESC : (state.modalCmdType.CMD_TYPE?.value));
      const TEMPER = ((CMD_TYPE === 'AC_COOL') && state.modalCmdType.TEMPER) ? state.modalCmdType.TEMPER.value : null;
      setState({ savingCmdType: true });
      await apiCall('/define-ircode-action', {
        devId: state.devId,
        // @ts-ignore
        IR_ID,
        // @ts-ignore
        CMD_TYPE,
        // @ts-ignore
        CMD_DESC,
        // @ts-ignore
        TEMPER,
      });
      for (const row of state.irList) {
        // @ts-ignore
        if (row.CMD_TYPE === CMD_TYPE) { row.CMD_TYPE = null; }
        // @ts-ignore
        if (row.IR_ID === IR_ID) {
          // @ts-ignore
          row.CMD_TYPE = CMD_TYPE;
          // @ts-ignore
          row.CMD_DESC = CMD_DESC;
          // @ts-ignore
          row.TEMPER = TEMPER;
        }
      }
      state.showModal = null;
    } catch (err) { console.log(err); toast.error(t('erro')); }
    setState({ savingCmdType: false });
  };

  const emmitDutCommand = async (item) => {
    try {
      setState({ transmittingCommand: true });
      await apiCall('/send-dut-aut-command', {
        devId: state.devId,
        IR_ID: item.IR_ID,
      });
      toast.success(t('sucessoTransmitido'));
    } catch (err) { console.log(err); toast.error(t('erro')); }
    setState({ transmittingCommand: false });
  };

  const sendCommandsTableToDut = async () => {
    try {
      setState({ savingCmdsTable: true });
      await apiCall('/resend-dut-ir-codes', {
        devId: state.devId,
      });
      sessionStorage.clear();
      sessionStorage.setItem('savingOnDut', JSON.stringify(state.defaultIrList));
      setState({ haveError: false });
      toast.success(t('sucessoTransmitido'));
    } catch (err) { console.log(err); toast.error(t('erro')); setState({ haveError: true }); }
    setState({ savingCmdsTable: false });
  };
  const deleteIrCode = async (item) => {
    if (!window.confirm(t('desejaExcluirCodigo'))) {
      return;
    }
    try {
      await apiCall('/delete-dut-ircode', {
        devId: state.devId,
        IR_ID: item.IR_ID,
      });
      setState({ modify: true });
      toast.success(t('sucessoExcluir'));
      // @ts-ignore
      state.irList = state.irList.filter((x) => x.IR_ID !== item.IR_ID);
      render();
    } catch (err) { console.log(err); toast.error(t('erro')); }
  };

  async function fetchIRCommandSets(dutId: string) {
    if (!state.devInfo) return null;
    if (!state.devInfo.dut_aut) return null;
    const probableCommands = (await apiCall('/get-dut-ircodes-by-model', { devId: dutId }).then((x) => x.list))
      .filter((x) => x.ircodes?.length > 0 && x.ircodes[0].DUT_ID !== state.devId && x.model)
      .map((command) => Object.assign(command, {
        distance: levenshtein.get(state.devInfo!.dut_aut!.MCHN_MODEL || '', command.model),
        dropdown_text: `${command.model} - ${command.ircodes[0].DUT_ID}`,
      }));

    probableCommands.sort((a, b) => a.distance - b.distance);
    return probableCommands;
  }

  async function saveTableCmds() {
    setState({ savingCmdsTable: true });
    setState({ modify: true });
    const commands = {
      configs: state.loadedIrList.map((x) => ({ IR_ID: x.IR_ID, CMD_TYPE: x.CMD_TYPE })),
      targetDutId: state.devId,
    };
    const response = await apiCall('/write-dut-command-by-ircode', commands);
    if (!response.success || response.success !== true) {
      toast.error(t('erro'));
      setState({ savingCmdsTable: false });
      return;
    }

    for (const config of state.loadedIrList) {
      const idx = state.irList.findIndex((x) => x.IR_ID === config.IR_ID);
      if (idx !== -1) {
        state.irList[idx] = config;
      }
      else {
        state.irList.push(config);
      }
    }

    for (const config of state.loadedIrList) {
      const idx = state.irList.findIndex((x) => x.IR_ID === config.IR_ID);
      if (idx !== -1) {
        state.irList[idx] = config;
      }
      else {
        state.irList.push(config);
      }

      for (const ir of state.irList) {
        if (config.CMD_TYPE === ir.CMD_TYPE && config.IR_ID !== ir.IR_ID) {
          // @ts-ignore
          ir.CMD_TYPE = null;
        }
      }
    }
    // let {list, dutCommandTypes} = await apiCall('/get-dut-ircodes-list', { devId: state.devId })
    // state.irList = list || state.irList
    // state.dutCommandTypes = dutCommandTypes || state.dutCommandTypes
    setState({ savingCmdsTable: false });
  }

  function getCommandType(cmdDesc) {
    if (cmdDesc?.includes('ON')) {
      return { name: t('refrigerar'), value: 'COOL' };
    }
    if (cmdDesc === 'FAN') return { name: t('ventilar'), value: 'FAN' };
    if (cmdDesc === 'OFF') return { name: t('desligar'), value: 'OFF' };
    if (cmdDesc) return { name: t('outro'), value: 'OTHER' };
    return null;
  }

  function getCommandTemp(temp, cmdDesc) {
    if (temp) return temp;
    if (cmdDesc?.includes('ON')) {
      const cmdDescTemp = Number(cmdDesc.split('_')[1]) || null;
      return (cmdDescTemp && { name: `${cmdDescTemp}°C`, value: cmdDescTemp });
    }
    return null;
  }

  function clearEditItemValues(item) {
    if (item.IR_ID) state.modalCmdType.IR_ID = item.IR_ID;
    state.modalCmdType.CMD_TYPE = getCommandType(item.CMD_DESC || '');
    if (item.CMD_DESC) state.modalCmdType.CMD_DESC = item.CMD_DESC;
    state.modalCmdType.CMD_ACTION = item.CMD_TYPE || '';
    state.modalCmdType.TEMPER = getCommandTemp(item.TEMPER, item.CMD_DESC);
  }

  function wantEditItem(item) {
    setState({ modify: true });
    clearEditItemValues(item);
    // @ts-ignore
    state.showModal = 'set-cmd-type';
    render();
  }

  function verifyParams() {
    if (!state.devInfo?.dut_aut || !state.devInfo?.CLIENT_ID || !state.devInfo?.UNIT_ID) {
      return true;
    }
    return false;
  }

  async function saveModel() {
    try {
      setState({ savingModel: true });
      if (verifyParams()) {
        toast.error(t('houveErro'));
        return;
      }
      await apiCall('/dut/set-dut-info', {
        DEV_ID: state.devId,
        MCHN_BRAND: state.MCHN_BRAND_item?.value,
        MCHN_MODEL: state.MCHN_MODEL,
        CLIENT_ID: state.devInfo?.CLIENT_ID,
        UNIT_ID: state.devInfo?.UNIT_ID,
        groups: state.devInfo?.dut_aut?.groups?.map((item) => item.GROUP_ID.toString()),
      });
      toast.success(t('salvoSucesso'));
      render();
    } catch (err) {
      toast.error(t('houveErro'));
    }
    setState({ savingModel: false });
    render();
  }

  const deleteAllSelectedCommands = async () => {
    try {
      setState({ deletingSelectedCmds: true });
      state.irList.forEach(async (ir) => {
        // @ts-ignore
        if (ir.checked) {
          await apiCall('/delete-dut-ircode', {
            // @ts-ignore
            devId: state.devId,
            // @ts-ignore
            IR_ID: ir.IR_ID,
          });
        }
      });
      // @ts-ignore
      setState({ irList: state.irList.filter((ir) => !ir.checked) });
      setState({ modify: true });
      render();
      toast.success(t('sucessoTransmitido'));
    } catch (err) { console.log(err); toast.error(t('erro')); }
    // @ts-ignore
    setState({ selectedDutCommands: state.irList.filter((x) => x.checked).length });
    setState({ deletingSelectedCmds: false });
  };

  function verifyPermissions() {
    if (profile.manageAllClients || profile.isUserManut || profile.permissions.isInstaller || (state.devInfo?.CLIENT_ID && profile.permissions.CLIENT_MANAGE.includes(state.devInfo.CLIENT_ID))) {
      setState({ permissionGeral: true });
    }
  }

  function buildScreenInfoParams(): Parameters<(typeof AssetLayout)>[0]['screenInfo'] {
    return {
      forceHideHealthTab: false,
      groupSelected: true,
      hasNonDutDeviceInAssets: false,
      dutAutomationInfo: {},
      isDuoSelected: state.devInfo?.dut?.PLACEMENT === 'DUO',
      assetRoleSelected: 0,
    };
  }

  return (
    <>
      <RouterPrompt
        when={state.modify}
        title=""
        cancelText={t('sair')}
        okText={t('botaoSalvar')}
        onOK={() => { setState({ modify: false }); return true; }}
        onCancel={async () => { await sendCommandsTableToDut(); if (!state.haveError) { setState({ modify: false }); return true; } return false; }}
      >
        <p>{t('comandosNaoForamSalvosDutDesejaContinuar')}</p>
      </RouterPrompt>
      <Helmet>
        <title>{generateNameFormatted(state.devInfo?.DEV_ID, t('controleRemoto'))}</title>
      </Helmet>
      {!state.assetLayout ? (<DevLayout devInfo={state.devInfo} />) : (<AssetLayout devInfo={state.devInfo} screenInfo={buildScreenInfoParams()} />)}
      {(state.loading) ? <Loader />
        : (
          <>
            <Card style={{ marginTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '30px' }}>
                <div>&nbsp;</div>
                <div>{(state.transmittingCommand) && <Loader />}</div>
                <div style={{
                  display: 'flex',
                  maxWidth: '360px',
                  width: '100%',
                }}
                >
                  {(state.permissionGeral) && (
                    <Button style={{ width: '360px' }} onClick={sendCommandsTableToDut} variant="primary" disabled={state.savingCmdsTable}>
                      {state.savingCmdsTable
                        ? <Loader size="small" />
                        : t('botaoSalvarComandosDut')}
                    </Button>
                  )}
                </div>
              </div>
              {(state.permissionGeral) && (
                <div style={{ display: 'flex', marginBottom: '15px' }}>
                  <Checkbox
                    checked={state.learnActive}
                    onClick={() => setState({ learnActive: !state.learnActive })}
                    color="primary"
                  />
                  <span>{t('habilitarAprendizagem')}</span>
                </div>
              )}
              {(state.permissionGeral) && (
                <div style={{ display: 'flex' }}>
                  <Flex flexWrap="wrap" width="750px" pt={24} mb={24} justifyContent="space-between">
                    {
                      profile.permissions.isInstaller && (
                        <>
                          <div style={{
                            padding: '5px',
                            width: '100%',
                            marginBottom: '10px',
                            borderRadius: '5px',
                            gap: '5px',
                            backgroundColor: '#dddddd46',
                          }}
                          >
                            <h3 onClick={() => setState({ openEdit: !state.openEdit })}>
                              <b>
                                { state.openEdit ? <MdArrowDropDown /> : <MdArrowRight /> }
                                {' '}
                                {t('editarAcrescentarModelo')}
                              </b>
                            </h3>
                            {
                              state.openEdit && (
                                <>
                                  <CustomSelect
                                    options={state.comboOpts.brands || []}
                                    value={state.MCHN_BRAND_item}
                                    placeholder={t('marca')}
                                    onSelect={(item) => { setState({ MCHN_BRAND_item: item }); render(); }}
                                  />
                                  <TextLine style={{ marginBottom: '10px' }}>
                                    <Input
                                      type="text"
                                      value={state.MCHN_MODEL}
                                      label={t('modelo')}
                                      onChange={(event) => { setState({ MCHN_MODEL: event.target.value }); }}
                                    />
                                  </TextLine>
                                  <Button style={{ width: '120px', marginBottom: '20px' }} onClick={saveModel} variant="primary" disabled={state.savingCmdsTable}>
                                    {state.savingModel
                                      ? <Loader size="small" />
                                      : t('botaoSalvar')}
                                  </Button>
                                </>
                              )
                            }
                          </div>
                        </>
                      )
                    }
                    <Box minWidth="250px" width={[3 / 5]} mb={[16]}>
                      {profile.permissions.isInstaller && (
                        <label>
                          Selecionar modelo:
                        </label>
                      )}
                      <Select
                        haveFuzzySearch
                        options={(state.probableIrCommands || []).sort((a, b) => a.distance - b.distance)}
                        placeholder={t('modelos')}
                        propLabel="dropdown_text"
                        value={state.loadedIrModel}
                        onSelect={(ir_command) => {
                          // let command = state.probableIrCommands.find((x) => x.model === ir_command);
                          if (ir_command === '') {
                            setState({ loadedIrList: state.defaultIrList, loadedIrModel: '' });
                            render();
                            return;
                          }

                          const clonedIrCodes = JSON.parse(JSON.stringify(ir_command.ircodes));

                          setState({ loadedIrList: clonedIrCodes, dutCommandTypes: ir_command.dutCommandTypes, loadedIrModel: ir_command.dropdown_text });
                          render();
                          // setState({irList : ir_command.ircodes, dutCommandTypes : ir_command.dutCommandTypes, loadedIrModel: ir_command.model})
                        }}
                      />
                    </Box>
                    <Box minWidth={[1 / 5]} mb={[16]}>
                      <Button style={{ width: '120px' }} onClick={saveTableCmds} variant="primary" disabled={state.savingCmdsTable}>
                        {state.savingCmdsTable
                          ? <Loader size="small" />
                          : t('botaoSalvarConfig')}
                      </Button>
                    </Box>
                  </Flex>
                </div>
              )}
              <div style={{ display: 'flex' }}>
                <IrTable style={{
                  gridTemplateColumns: (state.permissionGeral) ? 'auto auto auto auto' : 'auto auto',
                  width: '100%',
                }}
                >
                  {(state.permissionGeral) && (
                    <IrTableCell style={{ minWidth: '40%' }}>{t('codigo')}</IrTableCell>
                  )}
                  <IrTableCell style={{ minWidth: '40%' }}>{t('comentario')}</IrTableCell>
                  <IrTableCell style={{ minWidth: '20%' }}>
                    {t('acaoAutomocao')}
                  </IrTableCell>
                  {(state.permissionGeral) && (
                    <IrTableCell style={{ minWidth: '5%' }}>
                      <Checkbox
                        key="all_checked"
                        // @ts-ignore
                        checked={state.irList.every((item) => !!item.checked) && state.irList.length > 0}
                        onClick={(event) => {
                          // @ts-ignore
                          state.checkedAllCodes = !state.checkedAllCodes;
                          // @ts-ignore
                          state.irList.forEach((item) => { item.checked = state.checkedAllCodes; });
                          state.selectPositionX = event.clientX - 300;
                          state.selectPositionY = event.clientY;
                          // @ts-ignore
                          setState({ selectedDutCommands: state.irList.filter((x) => x.checked).length });
                          render();
                        }}
                      />
                    </IrTableCell>
                  )}
                  {(!state.savingCmdsTable) && state.irList.map((item) => (
                    // @ts-ignore
                    <>
                      {(state.permissionGeral) && (
                        <>
                          {/* @ts-ignore */}
                          <IrTableCell key={`c:${item.IR_ID}`}>
                            {/* @ts-ignore */}
                            {item.IR_ID}
                            {/* @ts-ignore */}
                            {(item.IR_ID === state.lastIr.id) ? <img style={{ width: '20px' }} src={state.lastIr.isOld ? IrReadFaintIcon : IrReadIcon} /> : ''}
                          </IrTableCell>
                        </>
                      )}
                      {/* @ts-ignore */}
                      <IrTableCell key={`d:${item.IR_ID}`}>
                        {/* @ts-ignore */}
                        {(item.TEMPER != null) && `[${item.TEMPER}] `}
                        {/* @ts-ignore */}
                        {item.CMD_DESC}
                      </IrTableCell>
                      {/* @ts-ignore */}
                      <IrTableCell2 key={`a:${item.IR_ID}`}>
                        {/* @ts-ignore */}
                        <span>{item.CMD_TYPE}</span>
                        <div>
                          {(state.permissionGeral) && (
                            <ActionButton onClick={() => wantEditItem(item)} variant="blue-inv">
                              <EditIcon color={colors.LightBlue} />
                            </ActionButton>
                          )}

                          <ActionButton onClick={() => emmitDutCommand(item)} variant="blue-inv">
                            <img style={{ width: '20px' }} src={TransmitIcon} />
                          </ActionButton>

                          {(state.permissionGeral) && (
                            <ActionButton onClick={() => deleteIrCode(item)} variant="red-inv">
                              <DeleteOutlineIcon colors={colors.Red} />
                            </ActionButton>
                          )}
                        </div>
                      </IrTableCell2>
                      {(state.permissionGeral) && (
                        <>
                          {/* @ts-ignore */}
                          <IrTableCell key={`ch:${item.IR_ID}`}>
                            <Checkbox
                              // @ts-ignore
                              key={`check:${item.IR_ID}`}
                              // @ts-ignore
                              checked={item.checked}
                              // @ts-ignore
                              onClick={(event) => {
                                // @ts-ignore
                                item.checked = !item.checked;
                                state.selectPositionX = event.clientX - 300;
                                state.selectPositionY = event.clientY;
                                // @ts-ignore
                                setState({ selectedDutCommands: state.irList.filter((x) => x.checked).length });
                                render();
                              }}
                            />
                          </IrTableCell>
                        </>
                      )}
                      {(state.selectedDutCommands > 0) && (
                        <SelectContainer style={{ width: '280px', top: state.selectPositionY, left: state.selectPositionX }}>
                          <Select
                            options={[{ label: t('apagar'), value: 'erase' }]}
                            value={null}
                            placeholder={`${state.selectedDutCommands} selecionada(s)`}
                            onSelect={async (opt) => {
                              if (opt.value === 'erase') {
                                await deleteAllSelectedCommands();
                              }
                            }}
                          />
                        </SelectContainer>
                      )}
                    </>
                  ))}
                </IrTable>
              </div>
            </Card>
          </>
        )}
      {
        (state.showModal === 'set-cmd-type')
        && (
          <ModalWindow onClickOutside={() => null}>
            <div style={{ marginBottom: '20px' }}>
              <Input
                type="text"
                // @ts-ignore
                value={state.modalCmdType.IR_ID}
                placeholder={t('idSinal')}
                onChange={() => null}
                disabled
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <Select
                options={state.dutCommandTypes}
                propLabel="name"
                value={state.modalCmdType.CMD_TYPE}
                placeholder={t('tipoComando')}
                onSelect={(item) => { clearEditItemValues({}); state.modalCmdType.CMD_TYPE = item; render(); }}
              />
            </div>
            {state.modalCmdType.CMD_TYPE?.value === 'COOL' && (
              <div style={{ marginBottom: '20px' }}>
                <Select
                  options={state.dutDefaultTemps}
                  propLabel="name"
                  value={state.modalCmdType.TEMPER}
                  placeholder={t('Temperatura')}
                  onSelect={(item) => { state.modalCmdType.TEMPER = item; render(); }}
                />
              </div>
            )}
            {state.modalCmdType.CMD_TYPE?.value === 'OTHER' && (
              <div style={{ marginBottom: '20px' }}>
                <Input
                  type="text"
                  // @ts-ignore
                  value={state.modalCmdType.CMD_DESC}
                  placeholder={t('comentario')}
                  onChange={(event) => { state.modalCmdType.CMD_DESC = event.target.value; render(); }}
                />
              </div>
            )}
            <div style={{ marginBottom: '20px' }}>
              <Select
                options={state.dutCommandActions}
                value={state.modalCmdType.CMD_ACTION}
                placeholder={t('acaoAutomocao')}
                onSelect={(item) => { state.modalCmdType.CMD_ACTION = item; render(); }}
              />
            </div>
            {/* {(state.modalCmdType.CMD_TYPE === 'AC_COOL')
              && (
                <div>
                  <Input
                    type="text"
                    // @ts-ignore
                    value={state.modalCmdType.TEMPER}
                    placeholder="Temperatura Set Point"
                    onChange={(event) => { state.modalCmdType.TEMPER = event.target.value; render(); }}
                  />
                </div>
              )} */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
            }}
            >
              <Button style={{ width: '120px' }} onClick={confirmSetCmdType} variant="primary" disabled={state.savingCmdType}>
                {state.savingCmdType
                  ? <Loader size="small" />
                  : t('botaoSalvar')}
              </Button>
              {/* @ts-ignore */}
              <Button style={{ width: '120px', margin: '0 20px' }} onClick={() => setState({ showModal: null })} variant="grey">
                {t('botaoCancelar')}
              </Button>
            </div>
          </ModalWindow>
        )
      }
    </>
  );
};

export default withTransaction('DutIrManagement', 'component')(DutIrManagement);
