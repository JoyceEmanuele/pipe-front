import { apiCall } from '~/providers';
import { useEffect } from 'react';
import { useStateVar } from '~/helpers/useStateVar';
import { useWebSocket } from '~/helpers/wsConnection';
import { toast } from 'react-toastify';

import {
  Container,
  SelectedInput,
  Label,
  Temperature,
  Status,
  TransparentLink,
  IconWrapper,
  LabelDevice,
  Title,
} from './styles';
import { WatchIcon } from '~/icons';
import { colors } from '~/styles/colors';
import { Flex } from 'reflexbox';
import { identifyDutIrCommands } from '~/pages/Analysis/DUTs/EnvironmentRealTime';

type Props = {
  DEV_ID: string;
  devAutData: any;
  dutCommands: any;
  openScheduleDialogForDutAut: (devId: string, clientId: number, unitId: number) => void;
}

export const DutAutMachine = ({
  DEV_ID, devAutData, dutCommands, openScheduleDialogForDutAut,
}: Props): React.ReactElement => {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      dutIrCommands: null as null | {
        CMD_DESC: string;
        CMD_TYPE: string; IR_ID: string, cmdName: string,
}[],
      data: null as null | { status: string, Temperature: string | number, Humidity?: null | number, eCO2?: null | number },
      statusOptions: ['Desligar', 'Ventilar', 'Refrigerar'],
      placement: '',
      devInfo: devAutData,
      activeOperationMode: 'Selecionar',
      dutCommand: undefined as undefined | {
        CMD_DESC: string;
        CMD_TYPE: string; IR_ID: string, cmdName: string,
      },
      setPoint: 21,
    };
    return state;
  });

  const getDevInfoAndDutCommands = async () => {
    try {
      if (!devAutData || !dutCommands) return;
      state.devInfo = devAutData;
      state.placement = devAutData.dut.PLACEMENT;
      const { list: dutIrCodes } = dutCommands;
      state.dutIrCommands = identifyDutIrCommands(dutIrCodes);
      const tempDefault = devAutData.TSETPOINT || state.dutIrCommands?.filter((command) => {
        const cmdSetpoint = Number(command?.cmdName?.split(':')[1]) || null;
        if (cmdSetpoint != null) return command;
      })
        .map((command) => (
          {
            IR_ID: command.IR_ID,
            CMD_NAME: command?.cmdName,
            CMD_TYPE: command?.CMD_TYPE,
            TEMPER: Number(command?.cmdName?.split(':')[1]),
          }
        ))
        .find((item) => item.CMD_TYPE === 'AC_COOL')?.TEMPER;
      state.setPoint = tempDefault || 21;
    } catch (err) { toast.error('Houve erro'); console.error(err); }
  };

  useEffect(() => {
    getDevInfoAndDutCommands();
  });

  function onWsOpen(wsConn) {
    wsConn.send({ type: 'dutSubscribeRealTime', data: { DUT_ID: DEV_ID } });
  }
  function onWsMessage(response) {
    if (response && response.type === 'dutTelemetry' && response.data.dev_id === DEV_ID) {
      if (response.data.status === 'OFFLINE') {
        response.data.Temperature = '-';
        response.data.Humidity = null;
        response.data.eCO2 = null;
        response.data.TVOC = null;
        setState({ data: response.data });
      }
      if (response.data.status === 'ONLINE' && response.data.timestamp) {
        setState({ data: response.data });
        render();
      }
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'dutUnsubscribeRealTime' });
  }
  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);

  async function setOperationMode(operationMode: string, isSetpoint: boolean) {
    try {
      if (operationMode === 'Ventilar') {
        const command = state.dutIrCommands?.find((cmd) => cmd.cmdName === 'AC_FAN');
        if (command) {
          state.activeOperationMode = operationMode;
          await apiCall('/send-dut-aut-command', { devId: DEV_ID, IR_ID: command.IR_ID });
          toast.success('Comando enviado - Ventilar');
        } else {
          toast.info('Comando não encontrado');
        }
      }
      if (operationMode === 'Refrigerar') {
        let command = state.dutCommand;
        if (!isSetpoint) {
          command = state.dutIrCommands?.find((cmd) => cmd.CMD_TYPE === 'AC_COOL');
        } else {
          command = state.dutIrCommands?.find((cmd) => cmd.CMD_DESC === `ON_${state.setPoint}`);
        }
        if (command) {
          state.activeOperationMode = operationMode;
          await apiCall('/send-dut-aut-command', { devId: DEV_ID, IR_ID: command.IR_ID });
          toast.success('Comando enviado - Refrigerar');
        } else {
          toast.info('Comando não encontrado');
        }
      }
      if (operationMode === 'Desligar') {
        const command = state.dutIrCommands?.find((cmd) => cmd.cmdName === 'AC_OFF');
        if (command) {
          state.activeOperationMode = operationMode;
          await apiCall('/send-dut-aut-command', { devId: DEV_ID, IR_ID: command.IR_ID });
          toast.success('Comando enviado - Desligar');
        } else {
          toast.info('Comando não encontrado');
        }
      }
      render();
    } catch (err) { console.log(err); toast.error('Houve um erro'); }
  }

  return (
    <>
      <Container>
        <TransparentLink to={`/analise/dispositivo/${DEV_ID}/informacoes`}>
          <Title>Automação</Title>
          <LabelDevice>{ DEV_ID }</LabelDevice>
        </TransparentLink>
        { state.placement === 'INS' && (
          <Temperature>
            <b>Insuflamento</b>
            <p>{ `${state.data?.Temperature || '- -'} ºC` }</p>
          </Temperature>
        ) }
        <Flex flexDirection="row" style={{ opacity: state.data?.status === 'ONLINE' ? '1' : '0.3', alignItems: 'end' }}>
          <Status>
            <Label style={{ fontSize: '12px' }}>Status</Label>
            <SelectedInput
              value={state.activeOperationMode}
              onSelect={(e) => {
                setOperationMode(e, false);
                render();
              }}
              options={state.data?.status === 'ONLINE' ? state.statusOptions : []}
              defaultValue="Selecionar"
              hideSelected
              styles={{ border: '10px' }}
              disabled={state.data?.status !== 'ONLINE'}
            />
          </Status>
          <IconWrapper onClick={() => { if (DEV_ID) openScheduleDialogForDutAut(DEV_ID, devAutData.CLIENT_ID, devAutData.UNIT_ID); }}>
            <WatchIcon color={colors.BlueSecondary} />
          </IconWrapper>
        </Flex>
      </Container>
      {/* <MediumDiv /> */}
    </>

  );
};
