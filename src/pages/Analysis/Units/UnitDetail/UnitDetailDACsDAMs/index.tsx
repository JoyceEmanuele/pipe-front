import { Flex } from 'reflexbox';
import { Card, ModalWindow } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { useWebSocket } from 'helpers/wsConnection';
import { DamItem, GroupItem } from 'pages/Analysis/Units/UnitDetail';
import { MosaicListItem } from './components/MosaicListItem';
import { MachineTable } from './components/MachineTable';
import { IMachineTableItem } from './constants';
import { MosaicMachineList, TableList, StyledSpan } from './styles';
import { CardContainer, VarsCardTitle } from '../styles';
import { useEffect } from 'react';
import { apiCall } from '~/providers';
import { t } from 'i18next';
import { Trans } from 'react-i18next';

interface AssociationItem {
  ASSOC_ID: number;
  ASSOC_NAME: string;
  CLIENT_ID: number;
  UNIT_ID: number;
  GROUPS: GroupItem[];
}

function describeUsage({ DAT_REPORT, DAY_HOURS_ON }) {
  DAY_HOURS_ON = Math.round(DAY_HOURS_ON * 60) / 60 || 0;
  const hours = String(Math.trunc(DAY_HOURS_ON)).padStart(2, '0');
  const minutes = String(Math.round((DAY_HOURS_ON % 1) * 60)).padStart(2, '0');
  return `${hours}:${minutes} ${t('noDia')} ${DAT_REPORT.substr(
    8,
    2,
  )}/${DAT_REPORT.substr(5, 2)}`;
}

const automationOptions = [{
  label: t('automatico'),
  value: 'auto',
}, {
  label: t('manual'),
  value: 'manual',
}];
const statusOptions = [{
  label: t('refrigerar'),
  value: 'allow',
}, {
  label: t('ventilar'),
  value: 'onlyfan',
}, {
  label: t('bloquear'),
  value: 'forbid',
}];

export const UnitDetailDACsDAMs = (props: {
  unitId: number;
  groups: GroupItem[];
  associations: AssociationItem[];
  orderedAssociations: AssociationItem[];
  machineTableItems: IMachineTableItem;
  healthIndexes: {};
  openScheduleDialogFor: (devId: string) => void;
  openScheduleDialogForDutAut: (devId: string, clientId: number, unitId: number) => void;
  openConfirmStatusChange: (devId: string, command: { label: string, value: string, dam: DamItem }) => void;
  isMachineMosaicView: boolean;
  orderedAssociationGroups?: GroupItem[];
  orderedGroups?: GroupItem[];
  associationsAndGroups: GroupItem[];
}): JSX.Element => {
  const {
    unitId,
    openScheduleDialogFor,
    openScheduleDialogForDutAut,
    openConfirmStatusChange,
    associations,
    orderedAssociations,
    isMachineMosaicView,
    orderedAssociationGroups,
    orderedGroups,
    associationsAndGroups,
    machineTableItems,
  } = props;
  const [state, render] = useStateVar({
    unitId: null as null | number,
    dams: [],
    duts: [],
    dats: [],
    usageHistoryDetailsModal: null as
      | { DAY_HOURS_ON: number; DAT_REPORT: string }[]
      | null
      | undefined,
    onTelmTimer: null as null|NodeJS.Timeout,
    hasNewTelm: false,
    automationOption: {},
    statusOption: {},
    manualCommandsEnabled: {},
    devsAutData: {},
    dutsCommands: {},
  });

  state.hasNewTelm = false;
  state.unitId = unitId;

  function setDamOptions(dam) {
    const automation = automationOptions.find((option) => option.value === dam.Mode?.toLowerCase());
    let status = statusOptions.find((option) => option.value === dam.State?.toLowerCase());

    if (dam.State === 'enabling') status = { label: 'Habilitando...', value: 'enabling' };

    if (dam.State === 'disabling') status = { label: 'Bloqueando...', value: 'disabling' };

    if (dam.State === 'eco') status = { label: 'Refrigerar(eco)', value: 'eco' };

    if (automation && status) {
      state.automationOption[dam.DAM_ID] = automation.label;
      state.statusOption[dam.DAM_ID] = status.label;
      render();
    }
  }
  function setIsManualCommandsEnabled(dam) {
    const isManualCommandsEnabled = (dam.Mode === t('manual')) && (!['enabling', 'disabling'].includes(dam.State));

    state.manualCommandsEnabled[dam.DAM_ID] = isManualCommandsEnabled;
    render();
  }

  function updateDamStatus(message, devsList, statusOnly) {
    const dev = devsList.find((row) => row.dam?.DAM_ID === message.dev_id)?.dam;

    if (dev) {
      dev.status = message.status;
      if (!statusOnly) {
        dev.Mode = message.Mode;
        dev.State = message.State;
      }
      if (dev.status !== 'ONLINE') {
        dev.Mode = null;
        dev.State = null;
      }
      setDamOptions(dev);
      setIsManualCommandsEnabled(dev);

      return true;
    }
    return false;
  }

  function updateDacStatus(message, groupsList, statusOnly) {
    for (const group of groupsList) {
      const dev = group.dacs.find((row) => row.DAC_ID === message.dac_id);
      if (dev) {
        dev.status = message.status;
        if (message.RSSI !== undefined) {
          dev.RSSI = message.RSSI;
        }
        if (!statusOnly) {
          dev.Lcmp = message.Lcmp;
        }
        if (dev.status !== 'ONLINE') {
          dev.Lcmp = null;
        }
        return true;
      }
    }
    return false;
  }

  function updateDutStatus(message, groupList) {
    for (const group of groupList) {
      const dev = group.dutsDuo.find((row) => row.DUT_DUO_ID === message.dev_id) || group.duts.find((row) => row.DEV_ID === message.dev_id);
      if (dev) {
        dev.status = message.status;
        dev.Temperature = message.Temperature;
        dev.Temperature_1 = message.Temperature_1;
        if (dev.Temperature == null) dev.Temperature = '-';
        if (dev.Temperature_1 == null) dev.Temperature_1 = '-';
        dev.RSSI = message.RSSI;
        return true;
      }
    }
    return false;
  }

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);
  function onWsOpen(wsConn) {
    wsConn.send({
      type: 'subscribeStatus',
      data: { unit_id: Number(state.unitId) },
    });
  }
  function onWsMessage(payload) {
    if (payload.type === 'dutTelemetry') {
      if (updateDutStatus(payload.data, associationsAndGroups)) {
        if (state.onTelmTimer) clearTimeout(state.onTelmTimer);
        state.hasNewTelm = true;
        state.onTelmTimer = setTimeout(() => state.hasNewTelm && render(), 100);
      }
    }
    if (payload.type === 'damStatus') {
      if (updateDamStatus(payload.data, associationsAndGroups, false)) {
        if (state.onTelmTimer) clearTimeout(state.onTelmTimer);
        state.hasNewTelm = true;
        state.onTelmTimer = setTimeout(() => state.hasNewTelm && render(), 100);
      }
    }
    if ((payload.type === 'dacOnlineStatus') || (payload.type === 'dacTelemetry')) {
      if (updateDacStatus(payload.data, associationsAndGroups, false)) {
        if (state.onTelmTimer) clearTimeout(state.onTelmTimer);
        state.hasNewTelm = true;
        state.onTelmTimer = setTimeout(() => state.hasNewTelm && render(), 100);
      }
    }
    if (payload.type === 'devOnlineStatus') {
      if (updateDamStatus(payload.data, associationsAndGroups, true)) {
        if (state.onTelmTimer) clearTimeout(state.onTelmTimer);
        state.hasNewTelm = true;
        state.onTelmTimer = setTimeout(() => state.hasNewTelm && render(), 100);
      }
      if (updateDacStatus(payload.data, associationsAndGroups, true)) {
        if (state.onTelmTimer) clearTimeout(state.onTelmTimer);
        state.hasNewTelm = true;
        state.onTelmTimer = setTimeout(() => state.hasNewTelm && render(), 100);
      }
    }
    if (payload.type === 'driTelemetry') {
      const driMachine = machineTableItems.find((machine) => machine.DAC_ID === payload.data?.dev_id);
      if (driMachine) {
        driMachine.Lcmp = payload.data.ValveOn;
        driMachine.RSSI = payload.data.RSSI;
      }
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'unsubscribeStatus' });
  }

  function hasDacsOrDatsOrDri() {
    if (orderedGroups) {
      const filterGroups = associationsAndGroups.filter((group) => (group.dats.length || group.dacs.length || group.dri));
      return filterGroups.length;
    }
    return false;
  }

  const getDevAutsDataAndDutsCommands = async (devsList: string[]) => {
    const devAuts = await apiCall('/get-devs-full-info', { DEV_IDs: devsList });
    state.devsAutData = devAuts;

    const duts = devsList.filter((dev) => dev.startsWith('DUT'));
    const dutsCommands = await apiCall('/get-duts-ircodes-list', { devIds: duts });
    state.dutsCommands = dutsCommands;

    render();
  };

  function calculateSize(group) {
    if (group.DEV_AUT) {
      if (group.dutsDuo) {
        return group.dacs.length + 1 + group.dutsDuo.length + group.dats.filter((dat) => dat.DEV_ID === null).length;
      }
      return group.dacs.length + 1 + group.dats.filter((dat) => dat.DEV_ID === null).length;
    }
    if (group.dutsDuo) {
      return group.dacs.length + group.dats.filter((dat) => dat.DEV_ID === null).length + group.dutsDuo.length;
    }
    return group.dacs.length + group.dats.filter((dat) => dat.DEV_ID === null).length;
  }

  useEffect(() => {
    const devsList: string[] = [];
    orderedAssociationGroups?.forEach((group) => { if (group.DEV_AUT) devsList.push(group.DEV_AUT); });
    orderedGroups?.forEach((group) => { if (group.DEV_AUT) devsList.push(group.DEV_AUT); });
    try {
      if (Object.keys(state.devsAutData).length === 0) {
        getDevAutsDataAndDutsCommands(devsList);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);
  return (
    <>
      {hasDacsOrDatsOrDri() ? (
        <>
          {isMachineMosaicView ? (
            <div
              style={{ display: 'flex', flexFlow: 'row wrap', width: '100%' }}
            >
              {orderedAssociations.map((association) => (
                <CardContainer
                  style={{ paddingBottom: '20px', width: '100%', margin: 0 }}
                  key={association.ASSOC_ID}
                >
                  <Card key={association.ASSOC_ID}>
                    <>
                      <VarsCardTitle>
                        {association.ASSOC_NAME}
                      </VarsCardTitle>
                      {association.GROUPS
                        && association.GROUPS.filter((group) => (group.dats.length || group.dacs.length)).length > 0 && (
                          <MosaicMachineList>
                            {association.GROUPS.filter((group) => (group.dats.length || group.dacs.length)).map((group, key) => (
                              <MosaicListItem
                                key={key}
                                size={(group.DEV_AUT) ? (group.dacs.length + 1 + (group.dats.filter((dat) => dat.DEV_ID === null)).length) : (group.dacs.length + (group.dats.filter((dat) => dat.DEV_ID === null)).length)}
                                title={group.name}
                                dam={group.dam}
                                dacs={group.dacs}
                                dats={group.dats}
                                dutsDuo={group.dutsDuo}
                                group={group}
                                devsAutData={state.devsAutData}
                                dutsCommands={state.dutsCommands}
                                openConfirmStatusChange={openConfirmStatusChange}
                                openScheduleDialogFor={openScheduleDialogFor}
                                openScheduleDialogForDutAut={openScheduleDialogFor}
                                manualCommandsEnabled={state.manualCommandsEnabled}
                                automationOption={state.automationOption}
                                statusOption={state.statusOption}
                                automationOptions={automationOptions}
                                statusOptions={statusOptions}
                              />
                            ))}
                          </MosaicMachineList>
                      )}
                    </>
                  </Card>
                </CardContainer>
              ))}
              {(orderedGroups && orderedGroups.filter((group) => (group.dats.length || group.dacs.length || group.dams.length || group.dri || group.dutsDuo?.length)).length > 0) && (
                <MosaicMachineList>
                  {orderedGroups.filter((group) => (group.dats.length || group.dacs.length || group.application === 'iluminacao' || group.dri || group.dutsDuo?.length)).map((group, key) => (
                    <MosaicListItem
                      key={key}
                      size={calculateSize(group)}
                      title={group.name}
                      dam={group.dam}
                      dri={group.dri}
                      dacs={group.dacs}
                      dutsDuo={group.dutsDuo}
                      dats={group.dats}
                      group={group}
                      devsAutData={state.devsAutData}
                      dutsCommands={state.dutsCommands}
                      openScheduleDialogFor={openScheduleDialogFor}
                      openScheduleDialogForDutAut={openScheduleDialogForDutAut}
                      openConfirmStatusChange={openConfirmStatusChange}
                      manualCommandsEnabled={state.manualCommandsEnabled}
                      automationOption={state.automationOption}
                      statusOption={state.statusOption}
                      automationOptions={automationOptions}
                      statusOptions={statusOptions}
                    />
                  ))}
                </MosaicMachineList>
              )}
            </div>
          ) : (
            <TableList>
              <Card noPadding>
                <Flex
                  flexWrap="wrap"
                  width={1}
                  mt="8px"
                  style={{
                    overflow: 'auto',
                    maxHeight: 515,
                  }}
                >
                  <MachineTable machineItems={machineTableItems} />
                </Flex>
              </Card>
            </TableList>
          )}
          <Flex flexWrap="wrap">
            {hasDacsOrDatsOrDri() ? (
              <>
                {state.usageHistoryDetailsModal && (
                  <ModalWindow
                    onClickOutside={() => {
                      state.usageHistoryDetailsModal = null;
                      render();
                    }}
                  >
                    <div>
                      {state.usageHistoryDetailsModal.map((line) => (
                        <div key={line.DAT_REPORT}>{describeUsage(line)}</div>
                      ))}
                    </div>
                  </ModalWindow>
                )}
              </>
            ) : (
              <> </>
            )}
          </Flex>
        </>
      ) : (
        <></>
      )}
    </>
  );
};
