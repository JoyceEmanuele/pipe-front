import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toast } from 'react-toastify';

import { RadioButton } from '../index';
import { apiCall } from '../../providers';
import { colors } from '../../styles/colors';

import { Row, Text } from './styles';

function updateDamStatus(message, dev) {
  dev.status = message.status;
  dev.Mode = message.Mode;
  dev.State = message.State;
}

export const DamControl = ({ dam, onStateChanged }): JSX.Element => {
  const { t } = useTranslation();
  const [, stateChanged] = useState({});
  const [state] = useState({
    changed() { stateChanged({}); if (onStateChanged) { onStateChanged(); } },
  });

  async function sendDamMode(dev, newMode) {
    if (dev.safeWaitMode) return;
    dev.safeWaitMode = true;
    setTimeout(() => {
      delete dev.safeWaitMode;
    }, 2500);
    try {
      dev.loading = true; state.changed();
      const telemetry = await apiCall('/dam/set-dam-operation', {
        dev_id: dev.DAM_ID,
        mode: newMode, // 'manual', 'auto'
      });
      updateDamStatus(telemetry, dev);
      state.changed();
      // toast.success('Enviado')
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    dev.loading = false; state.changed();
  }

  async function sendDamRelay(dev, newMode) {
    if (dev.safeWaitRelay) return;
    dev.safeWaitRelay = true;
    setTimeout(() => {
      delete dev.safeWaitRelay;
    }, 2500);
    try {
      dev.loading = true; state.changed();
      const telemetry = await apiCall('/dam/set-dam-operation', {
        dev_id: dev.DAM_ID,
        relay: newMode, // 'allow', 'forbid', 'onlyfan'
      });
      updateDamStatus(telemetry, dev);
      state.changed();
      // toast.success('Enviado')
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    dev.loading = false; state.changed();
  }

  const manualCommandsEnabled = (dam.Mode === 'Manual') && (!['enabling', 'disabling'].includes(dam.State));
  const damStateIsEco = (dam.State === 'eco') ? t('refrigerarEco') : t('refrigerar');

  return (
    <div>
      <Row justifyContent="space-between">
        <Text isBold style={{ marginTop: '0' }}>{t('automacao')}</Text>
      </Row>
      <Row>
        <RadioButton
          label={t('automatico')}
          checked={dam.Mode === 'Auto'}
          onClick={() => sendDamMode(dam, 'auto')}
          style={{ width: '170px' }}
        />
        <RadioButton
          label={t('manual')}
          checked={dam.Mode === 'Manual'}
          onClick={() => sendDamMode(dam, 'manual')}
          style={{ width: '170px' }}
        />
        {(dam.Mode === 'Local') && (
          <RadioButton
            label={t('local')}
            checked={dam.Mode === 'Local'}
            onClick={undefined}
            style={{ width: '170px' }}
          />
        )}
      </Row>
      <Row>
        <Text isBold>{t('statusAutomacao')}</Text>
      </Row>
      <Row style={{ flexWrap: 'wrap', paddingBottom: '1.3em', color: (manualCommandsEnabled ? colors.Blue400 : colors.Grey200) }}>
        {(dam.DAM_ID && !(dam.DAM_ID.startsWith('DAC3') || dam.DAM_ID.startsWith('DAC4'))) // TODO: FIXME: find a better way to check this
          && (
          <div style={{ display: 'inline-flex', width: '170px' }}>
            <RadioButton
              label={t('ventilar')}
              checked={dam.State === 'onlyfan'}
              checkedColor={manualCommandsEnabled ? colors.Blue300 : colors.Grey200}
              uncheckedColor={manualCommandsEnabled ? colors.Grey400 : colors.Grey200}
              onClick={manualCommandsEnabled ? (() => sendDamRelay(dam, 'onlyfan')) : null}
            />
            {/* <span> &nbsp; &nbsp; </span>
            <FanIcon width='1.3em' color={manualCommandsEnabled ? colors.Blue400 : colors.Grey200} /> */}
          </div>
          )}

        <div style={{ display: 'inline-flex', width: '170px' }}>
          <RadioButton
            label={(dam.State === 'enabling') ? 'Habilitando...' : damStateIsEco}
            checked={dam.State === 'allow' || dam.State === 'enabling' || dam.State === 'eco'}
            checkedColor={manualCommandsEnabled ? colors.Blue300 : colors.Grey200}
            uncheckedColor={manualCommandsEnabled ? colors.Grey400 : colors.Grey200}
            onClick={manualCommandsEnabled ? (() => sendDamRelay(dam, 'allow')) : null}
          />
          {/* <span> &nbsp; &nbsp; </span>
          <WindIcon width='1.3em' color={manualCommandsEnabled ? colors.Blue400 : colors.Grey200} /> */}
        </div>

        <div style={{ display: 'inline-flex', width: '170px' }}>
          <RadioButton
            label={dam.State === 'disabling' ? `${t('bloqueando')}...` : t('bloquear')}
            checked={dam.State === 'forbid' || dam.State === 'disabling'}
            checkedColor={manualCommandsEnabled ? colors.Blue300 : colors.Grey200}
            uncheckedColor={manualCommandsEnabled ? colors.Grey400 : colors.Grey200}
            onClick={manualCommandsEnabled ? (() => sendDamRelay(dam, 'forbid')) : null}
          />
          {/* <span> &nbsp; &nbsp; </span>
          <BlockedIcon width='1.3em' color={dam.Mode === 'Manual' ? colors.Blue400 : colors.Grey200} /> */}
        </div>
      </Row>
    </div>
  );
};
