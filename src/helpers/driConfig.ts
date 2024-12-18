import { DriConfigState } from '~/pages/Analysis/Integrations/IntegrEdit/types';
import { ApiResps } from '~/providers';

export function isAutomation(state: DriConfigState): boolean {
  return state.application?.value === 'automation';
}

export function isFancoil(state: DriConfigState): boolean {
  return isAutomation(state) && state.driApplication === 'Fancoil';
}

export function isVAV(state: DriConfigState): boolean {
  return isAutomation(state) && state.driApplication === 'VAV';
}

export function isFancoilVavAutomation(state: DriConfigState): boolean {
  return isAutomation(state) && (isFancoil(state) || isVAV(state));
}

type DriConfigs = NonNullable<ApiResps['/get-integration-info']['dri']>['driConfigs'];
type DriConfigProtocol = NonNullable<DriConfigs>[number];

export function checkProtocolValue(cfg: DriConfigProtocol, value: string): boolean {
  if (cfg.protocol != null) {
    return cfg.protocol === value;
  }
  return false;
}
