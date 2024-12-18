import { ReactElement } from 'react';
import { Input } from 'components';
import { useTranslation } from 'react-i18next';
import { Select } from 'components/NewSelect';
import { DriConfigState } from '../types';
import { isFancoil, isFancoilVavAutomation, isVAV } from '~/helpers/driConfig';

interface ManufacturerProps {
  state: DriConfigState;
  setState: (newState: Partial<DriConfigState>) => void;
}

export function Manufacturer({
  state,
  setState,
}: ManufacturerProps): ReactElement | null {
  const { t } = useTranslation();
  const vav = isVAV(state);
  const fancoil = isFancoil(state);

  if (!isFancoilVavAutomation(state)) {
    return null;
  }

  return (
    <>
      <Select
        style={{ width: '200px' }}
        label={vav ? t('fabricanteAtuadorVav') : t('fabricanteAtuador')}
        placeholder={t('selecionar')}
        options={vav
          ? state.comboOpts.valveManuf
          : state.comboOpts.fancoilValveManuf}
        value={state.valveManuf}
        onSelect={(item) => setState({ valveManuf: item })}
      />
      {state.valveManuf === t('outroDigitar') && (
        <Input
          style={{ width: '200px' }}
          label={t('fabricanteAtuador')}
          placeholder={t('digitarFabricante')}
          value={state.otherValveManuf}
          onChange={(event) => setState({ otherValveManuf: event.target.value })}
        />
      )}
      <Input
        style={{ width: '200px', height: '50px' }}
        label={vav ? t('modeloAtuadorVav') : t('modeloAtuador')}
        placeholder={t('digitarModelo')}
        value={state.valveModel}
        onChange={(event) => setState({ valveModel: event.target.value })}
      />
      {vav && (
        <>
          <Select
            style={{ width: '200px' }}
            label={t('fabricanteCaixaVav')}
            placeholder={t('selecionar')}
            options={state.comboOpts.boxManuf}
            value={state.vavBoxManuf}
            onSelect={(item) => setState({ vavBoxManuf: item })}
          />
          <Input
            style={{ width: '200px', height: '50px' }}
            label={t('medidorCaixaVav')}
            placeholder={t('digitarModelo')}
            value={state.vavBoxModel}
            onChange={(event) => setState({ vavBoxModel: event.target.value })}
          />
        </>
      )}
      {fancoil && (
        <>
          <Select
            style={{ width: '200px' }}
            label={t('fabricanteFancoil')}
            placeholder={t('selecionar')}
            options={state.comboOpts.fancoilManuf}
            value={state.fancoilManuf}
            onSelect={(item) => setState({ fancoilManuf: item })}
          />
          {state.fancoilManuf === t('outroDigitar') && (
          <Input
            style={{ width: '200px', height: '50px' }}
            label={t('fabricanteFancoil')}
            placeholder={t('digitarFabricante')}
            value={state.otherFancoilManuf}
            onChange={(event) => setState({ otherFancoilManuf: event.target.value })}
          />

          )}
          <Input
            style={{ width: '200px', height: '50px' }}
            label={t('modeloFancoil')}
            placeholder={t('digitarModelo')}
            value={state.fancoilModel}
            onChange={(event) => setState({ fancoilModel: event.target.value })}
          />
        </>
      )}

    </>
  );
}
