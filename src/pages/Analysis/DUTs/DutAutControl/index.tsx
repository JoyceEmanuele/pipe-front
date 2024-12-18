import { toast } from 'react-toastify';

import EcoModeIcon from 'assets/img/icons/eco.svg';
import { Loader, RadioButton } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';
import { colors } from 'styles/colors';

import {
  Row,
  Text,
} from './styles';
import i18n from '~/i18n';

const t = i18n.t.bind(i18n);

const ecoModeCfgs: { [k: string]: string } = {
  '0_NO_CONTROL': t('desabilitado'),
  '1_CONTROL': t('modoEco'),
  '2_SOB_DEMANDA': t('modoSobDemanda'),
  '3_BACKUP': t('modoBackup'),
  '4_BLOCKED': t('modoBloqueio'),
  '5_BACKUP_CONTROL': t('modoBackupEco'),
  '6_BACKUP_CONTROL_V2': t('modoEco2'),
  '7_FORCED': t('modoForcado'),
};

export const DutAutControl = (props: {
  DUT_ID: string,
  telemetry: {
    State: null|string,
    Mode: null|string,
    ecoModeActing: null|boolean,
    // progState: string,
    // Temperature: number,
    // status: string,
  },
  ecoModeCfg: '0_NO_CONTROL'|'1_CONTROL'|'2_SOB_DEMANDA'|'3_BACKUP'|'4_BLOCKED'|'5_BACKUP_CONTROL'|'6_BACKUP_CONTROL_V2'|'7_FORCED'|'8_ECO_2'|null,
}): JSX.Element => {
  const { DUT_ID, telemetry, ecoModeCfg } = props;
  const [state, render, setState] = useStateVar({
    transmittingCommand: false,
    safeWaitMode: false,
    safeWaitRelay: false,
  });

  async function sendDutMode(newMode: 'manual'|'auto') {
    if (state.safeWaitMode) return;
    state.safeWaitMode = true;
    setTimeout(() => {
      // @ts-ignore
      delete state.safeWaitMode;
    }, 2500);
    try {
      const data = {
        dut_id: DUT_ID,
        mode: newMode, // 'manual', 'auto'
      };
      setState({ transmittingCommand: true });
      const newState = await apiCall('/dut/set-dut-aut-operation', data);
      // onStateUpdate(newState);
      toast.success(t('sucessoEnviar'));
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    setState({ transmittingCommand: false });
  }

  async function emmitDutCommand(CMD_TYPE: 'AC_OFF'|'AC_COOL'|'AC_FAN') {
    if (state.safeWaitRelay) return;
    state.safeWaitRelay = true;
    setTimeout(() => {
      // @ts-ignore
      delete state.safeWaitRelay;
    }, 2500);
    try {
      setState({ transmittingCommand: true });
      const result = await apiCall('/send-dut-aut-command', {
        devId: DUT_ID,
        CMD_TYPE,
      });
      toast.success(t('sucessoTransmitido'));
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    setState({ transmittingCommand: false });
  }

  const manualCommandsEnabled = (telemetry.Mode === 'Manual');

  return (
    <div style={{ position: 'relative' }}>
      <Row justifyContent="space-between">
        <Text isBold style={{ marginTop: '0' }}>{t('automacao')}</Text>
      </Row>
      <Row>
        <RadioButton
          label={t('automatico')}
          checked={telemetry.Mode === 'Auto'}
          onClick={undefined}
          style={{ width: '170px' }}
        />
        <RadioButton
          label={t('manual')}
          checked={telemetry.Mode === 'Manual'}
          onClick={undefined}
          style={{ width: '170px' }}
        />
      </Row>
      <Row>
        <Text isBold>{t('statusAutomacao')}</Text>
      </Row>
      <Row style={{ flexWrap: 'wrap', paddingBottom: '1.3em', color: (manualCommandsEnabled ? colors.Blue400 : colors.Grey200) }}>
        <div style={{ display: 'inline-flex', width: '170px' }}>
          <RadioButton
            label={t('ventilar')}
            checked={telemetry.State === 'onlyfan'}
            checkedColor={manualCommandsEnabled ? colors.Blue300 : colors.Grey200}
            uncheckedColor={manualCommandsEnabled ? colors.Grey400 : colors.Grey200}
            onClick={manualCommandsEnabled ? (() => emmitDutCommand('AC_FAN')) : null}
          />
          {/* <span> &nbsp; &nbsp; </span>
          <FanIcon width='1.3em' color={manualCommandsEnabled ? colors.Blue400 : colors.Grey200} /> */}
        </div>

        <div style={{ display: 'inline-flex', width: '170px' }}>
          <RadioButton
            label={(telemetry.State === 'enabling') ? `${t('habilitando')}...` : (telemetry.State === 'eco') ? t('refrigerarEco') : t('refrigerar')}
            checked={telemetry.State === 'allow'}
            checkedColor={manualCommandsEnabled ? colors.Blue300 : colors.Grey200}
            uncheckedColor={manualCommandsEnabled ? colors.Grey400 : colors.Grey200}
            onClick={manualCommandsEnabled ? (() => emmitDutCommand('AC_COOL')) : null}
          />
          {/* <span> &nbsp; &nbsp; </span>
          <WindIcon width='1.3em' color={manualCommandsEnabled ? colors.Blue400 : colors.Grey200} /> */}
        </div>

        <div style={{ display: 'inline-flex', width: '170px' }}>
          <RadioButton
            label={telemetry.State === 'disabling' ? `${t('bloqueando')}...` : t('bloquear')}
            checked={telemetry.State === 'forbid'}
            checkedColor={manualCommandsEnabled ? colors.Blue300 : colors.Grey200}
            uncheckedColor={manualCommandsEnabled ? colors.Grey400 : colors.Grey200}
            onClick={manualCommandsEnabled ? (() => emmitDutCommand('AC_OFF')) : null}
          />
          {/* <span> &nbsp; &nbsp; </span>
          <BlockedIcon width='1.3em' color={dut.Mode === 'Manual' ? colors.Blue400 : colors.Grey200} /> */}
        </div>
      </Row>

      <div style={{ paddingTop: '5px', display: 'flex', alignItems: 'center' }}>
        <Text>
          <b>
            {`${t('modoEco')}:`}
            &nbsp;
          </b>
          {ecoModeCfg ? (ecoModeCfgs[ecoModeCfg] || ecoModeCfg || `(${t('nenhuma')})`) : t('desabilitado')}
        </Text>
        {(telemetry.ecoModeActing)
          && (
          <img
            style={{
              width: '24px', marginBottom: '8px', objectFit: 'contain', marginLeft: '8px',
            }}
            src={EcoModeIcon}
            alt="active"
          />
          )}
      </div>

      {state.transmittingCommand && (
        <div style={{
          position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 1)', left: '0', top: '0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        >
          <Loader />
        </div>
      )}
    </div>
  );
};
