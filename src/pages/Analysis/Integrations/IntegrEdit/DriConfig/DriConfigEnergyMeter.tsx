import { ReactElement } from 'react';
import { DriConfigState } from '../types';
import { Select } from '~/components/NewSelect';
import { Input } from '~/components';
import { getKeyByValue } from '../../IntegrRealTime/DriContents';
import {
  driLayerOpts, driMetersCfgs, driParityOpts, driProtocolsOpts, driStopBitsOpts,
} from '~/helpers/driConfigOptions';
import { useTranslation } from 'react-i18next';

interface DriConfigEnergyMeterProps {
  state: DriConfigState;
  render: () => void;
  resetCfgFields: () => void;
}

export function DriConfigEnergyMeter({
  render,
  resetCfgFields,
  state,
}: DriConfigEnergyMeterProps): ReactElement | null {
  const { t } = useTranslation();

  if (state.driApplication !== 'Medidor de Energia') {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
      <Select
        style={{ width: '200px' }}
        label={t('modelo')}
        placeholder={t('selecionar')}
        options={state.comboOpts.meterModels}
        propLabel="NAME"
        value={state.driMeterModel}
        onSelect={(item) => {
          state.driMeterModel = item;
          state.selectedCurrentCapacity = null;
          state.selectedInstallationType = null;
          state.driSlaveId = '1';
          const defaultConfig = driMetersCfgs[item.NAME];

          if (defaultConfig) {
            state.driProtocol = getKeyByValue(driProtocolsOpts, defaultConfig.protocol) || null;
            state.modbusBaudRate = defaultConfig.modbusBaudRate;
            state.driParity = getKeyByValue(driParityOpts, defaultConfig.parity) || null;
            state.driLayer = getKeyByValue(driLayerOpts, defaultConfig.serialMode) || null;
            state.driStopBits = getKeyByValue(driStopBitsOpts, defaultConfig.stopBits) || null;
            state.driSendInterval = defaultConfig.telemetryInterval;
            state.driSlaveId = defaultConfig.driSlaveId ?? state.driSlaveId;
          } else { resetCfgFields(); }
          render();
        }}
      />
      <Input
        style={{ width: '200px', height: '50px' }}
        label={t('quadroEletricoRelativo')}
        placeholder={t('nome')}
        value={state.formData.establishmentName}
        onChange={(event) => { state.formData.establishmentName = event.target.value; render(); }}
      />
    </div>
  );
}
