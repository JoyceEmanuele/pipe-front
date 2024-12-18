import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'components/NewSelect';
import {
  currentCapacityOpts,
  driLayerOpts, driParityOpts, driProtocolsOpts, driStopBitsOpts, installationTypeOpts, modbusBaudRateOpts,
} from '~/helpers/driConfigOptions';
import { Input } from '~/components';
import { CustomInput } from '~/components/FormMachine/styles';
import { Label, SearchInput } from '../../../styles';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { DriConfigState } from '../types';
import { isAutomation } from '~/helpers/driConfig';

interface ParametersProps {
  state: DriConfigState;
  setState: (newState: Partial<DriConfigState>) => void;
  render: () => void;
}

const allowedMeterModelsDriSlaveId = ['Nexus II', 'EM210', 'MULT-K', 'MULT-K 05', 'MULT-K 120', 'iKRON 03', 'ET330', 'Schneider PM2100', 'Schneider PM210', 'ETE-30', 'ETE-50', 'Schneider PM9C'];

export function DriConfigParameters({ state, setState, render }: ParametersProps): ReactElement | null {
  const { t } = useTranslation();

  function verifyDisabled() {
    return !(state.driProtocol && ['Modbus RTU', 'Carrier ECOSPLIT'].includes(state.driProtocol))
    || state.driApplication === 'Carrier ECOSPLIT'
    || state.driApplication === 'VAV'
    || state.driApplication === 'Fancoil'
    || (state.driApplication === 'Medidor de Energia'
    && !['Nexus II', 'EM210', 'MULT-K', 'MULT-K 05', 'MULT-K 120', 'iKRON 03', 'ET330', 'ETE-30', 'ETE-50', 'Schneider PM2100', 'Schneider PM210', 'Schneider PM9C'].includes(state.driMeterModel?.NAME ?? ''));
  }

  function disableDriLayer() {
    return state.driApplication === 'Carrier ECOSPLIT'
    || state.driApplication === 'VAV'
    || state.driApplication === 'Fancoil'
    || (state.driApplication === 'Medidor de Energia'
      && !['Nexus II', 'iKRON 03', 'ET330', 'Schneider PM2100'].includes(state.driMeterModel?.NAME || ''));
  }

  function disabledDriProtocol() {
    return state.driApplication === 'Carrier ECOSPLIT'
    || state.driApplication === 'VAV'
     || state.driApplication === 'Fancoil'
     || (state.driApplication === 'Medidor de Energia'
      && !['Nexus II', 'MULT-K', 'MULT-K 05', 'MULT-K 120', 'ET330', 'Schneider PM2100'].includes(state.driMeterModel?.NAME || ''));
  }

  if (!state.application || (isAutomation(state) && !state.automation)) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', rowGap: 14 }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>{t('parametros')}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        <Select
          label={t('protocoloComunicacao')}
          style={{ width: '200px' }}
          options={Object.keys(driProtocolsOpts)}
          value={state.driProtocol}
          placeholder={t('selecioneTipo')}
          disabled={disabledDriProtocol()}
          onSelect={(item) => { state.driProtocol = item; render(); }}
        />
        <Select
          label="Baud-rate"
          style={{ width: '200px' }}
          options={modbusBaudRateOpts}
          value={state.modbusBaudRate}
          placeholder={t('selecionar')}
          disabled={verifyDisabled()}
          onSelect={(item) => { state.modbusBaudRate = item; render(); }}
        />
        <Select
          style={{ width: '200px' }}
          label={t('paridade')}
          options={Object.keys(driParityOpts)}
          value={state.driParity}
          placeholder={t('selecionar')}
          disabled={verifyDisabled()}
          onSelect={(item) => { state.driParity = item; render(); }}
        />
        <Select
          style={{ width: '200px' }}
          label={t('camadaFisica')}
          options={Object.keys(driLayerOpts)}
          value={state.driLayer}
          placeholder={t('selecionar')}
          disabled={disableDriLayer()}
          onSelect={(item) => { state.driLayer = item; render(); }}
        />
        <Select
          style={{ width: '200px' }}
          label="Stop Bits"
          options={Object.keys(driStopBitsOpts)}
          value={state.driStopBits}
          placeholder={t('selecionar')}
          disabled={verifyDisabled()}
          onSelect={(item) => { state.driStopBits = item; render(); }}
        />
        <Input
          style={{ width: '200px', height: 50 }}
          label={t('intervaloEnvio')}
          placeholder={t('digitar')}
          suffix={t('segundos')}
          value={state.driSendInterval}
          onChange={(event) => setState({ driSendInterval: event.target.value })}
        />
        {state.driMeterModel?.NAME && ['ET330', 'EM210', 'MULT-K', 'MULT-K 05', 'MULT-K 120'].includes(state.driMeterModel.NAME) && (
        <>
          <Select
            style={{ width: '200px' }}
            options={installationTypeOpts[state.driMeterModel.NAME]}
            value={state.selectedInstallationType}
            label={t('tipoInstalacaoEletrica')}
            placeholder={t('selecionarTipo')}
            propLabel="name"
            disabled={['MULT-K', 'MULT-K 05'].includes(state.driMeterModel.NAME)}
            onSelect={(value) => setState({ selectedInstallationType: value })}
          />
          {!['MULT-K 120'].includes(state.driMeterModel.NAME) && (
          <SearchInput
            style={{
              width: '200px',
              height: '50px',
              margin: 0,
              marginBottom: 10,
              border: '1px solid #818181',
            }}
          >
            <div style={{ width: '100%', paddingTop: 3 }}>
              <Label>{t('capacidadeCorrente')}</Label>
              <SelectSearch
                options={currentCapacityOpts}
                value={state.selectedCurrentCapacity?.value.toString() || ''}
                printOptions="on-focus"
                search
                filterOptions={fuzzySearch}
                placeholder={t('selecionarCapacidade')}
                onChange={(value) => {
                  setState({ selectedCurrentCapacity: { name: `${value}A`, value: value.toString() } });
                }}
                closeOnSelect={false}
              />
            </div>
          </SearchInput>
          )}
        </>
        )}
        {((state.driMeterModel?.NAME && allowedMeterModelsDriSlaveId.includes(state.driMeterModel?.NAME || ''))
          || state.driApplication === 'Chiller Carrier') && (
            <Input
              style={{ width: '200px', height: 50 }}
              label={t('enderecoID')}
              placeholder={t('digitar')}
              value={state.driSlaveId}
              onChange={(event) => {
                if (Number(event.target.value) || event.target.value === '') {
                  state.driSlaveId = event.target.value;
                  render();
                }
              }}
            />
        )}
      </div>
    </div>
  );
}
