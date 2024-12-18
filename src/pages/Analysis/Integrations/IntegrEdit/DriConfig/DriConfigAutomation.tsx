import { ReactElement } from 'react';
import { Option, Select } from '~/components/NewSelect';
import { DriConfigState } from '../types';
import { useTranslation } from 'react-i18next';
import {
  driApplicationCfgs, driApplicationOpts, driLayerOpts, driParityOpts, driProtocolsOpts, driStopBitsOpts, driVAVApplicationsOptions,
  vavFancoilValveTypes,
} from '~/helpers/driConfigOptions';
import { getKeyByValue } from '../../IntegrRealTime/DriContents';
import { Manufacturer } from './DriConfigManufacturer';
import {
  isAutomation, isFancoilVavAutomation, isVAV,
} from '~/helpers/driConfig';
import { Input } from '~/components';

interface AutomationProps {
  state: DriConfigState;
  setState: (newState: Partial<DriConfigState>) => void;
  render: () => void;
  resetCfgFields: () => void;
}

export function DriConfigAutomation({
  render, setState, state, resetCfgFields,
}: AutomationProps): ReactElement | null {
  const { t } = useTranslation();
  const vav = isVAV(state);

  const setDriApplication = (item?: {name: string, value: string}) => {
    state.driApplication = getKeyByValue(driApplicationOpts, item?.value) ?? null;
    if (item?.value === 'carrier-ecosplit') {
      state.driProtocol = getKeyByValue(driProtocolsOpts, 'carrier-ecosplit') ?? null;
      state.modbusBaudRate = '9600';
      state.driParity = 'Desabilitado';
      state.driLayer = 'RS-485';
      state.driStopBits = '1 Stop Bit';
      state.driSendInterval = '60';
    } else { resetCfgFields(); }
  };

  if (!isAutomation(state)) {
    return null;
  }

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        <Select
          style={{ width: '200px' }}
          options={state.comboOpts.automation}
          value={state.automation}
          label={t('Automação')}
          placeholder={t('selecionar')}
          onSelect={(item) => {
            state.automation = (item !== '') ? item : '';
            setDriApplication(item);
            render();
          }}
          propLabel="name"
        />
        {vav && (
          <Input
            style={{ width: '200px', height: '50px' }}
            label={t('ambienteMonitorado')}
            placeholder={t('digitar')}
            value={state.roomName}
            onChange={(event) => setState({ roomName: event.target.value })}
          />
        )}
        {isFancoilVavAutomation(state) && (
          <Select
            style={{ width: '200px' }}
            options={vavFancoilValveTypes}
            value={state.selectedValveModel}
            label={t('tipoDeAtuador')}
            placeholder={t('selecionar')}
            onSelect={(item) => {
              setState({ selectedValveModel: item });
            }}
            propLabel="name"
          />
        )}
      </div>
      {isFancoilVavAutomation(state) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          <Select
            style={{ width: '200px' }}
            label={t('fabricanteTermostato')}
            placeholder={t('selecionar')}
            options={state.comboOpts.thermManuf}
            value={state.thermManuf}
            onSelect={(item) => setState({ thermManuf: item })}
          />
          <Select
            style={{ width: '200px' }}
            label={t('modeloTermostato')}
            placeholder={t('selecionar')}
            options={driVAVApplicationsOptions}
            value={state.driVavFancoilModel}
            onSelect={(item) => {
              if (item) {
                const value = (item as Option).value;
                state.driVavFancoilModel = value;
                const defaultConfig = driApplicationCfgs[value];
                if (state.driApplication === 'Fancoil' && defaultConfig.application) {
                  const application = defaultConfig.application.split('-');
                  application[0] = 'fancoil';
                  defaultConfig.application = application.join('-');
                }
                if (defaultConfig) {
                  state.driProtocol = getKeyByValue(driProtocolsOpts, defaultConfig.protocol) || null;
                  state.modbusBaudRate = defaultConfig.modbusBaudRate;
                  state.driParity = getKeyByValue(driParityOpts, defaultConfig.parity) || null;
                  state.driLayer = getKeyByValue(driLayerOpts, defaultConfig.serialMode) || null;
                  state.driStopBits = getKeyByValue(driStopBitsOpts, defaultConfig.stopBits) || null;
                } else { resetCfgFields(); }
              } else {
                state.driVavFancoilModel = item;
              }
              render();
            }}
          />
          <Manufacturer
            state={state}
            setState={setState}
          />
        </div>
      )}
    </>
  );
}
