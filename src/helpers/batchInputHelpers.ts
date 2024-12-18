import {
  ApiResps,
} from 'providers';

export type Option = { label: string, value: string };

export function stateObject() {
  return ({
    isLoading: true,
    isSending: false,
    isExporting: false,
    selectedTypeSolution: 'unit',
    sended: false,
    columns: {} as ApiResps['/batch-input-columns']['assets']|ApiResps['/batch-input-columns']['unified']|ApiResps['/batch-input-columns']['dacs'],
    parsedCols: [] as string[],
    parsedRows: [] as ApiResps['/check-client-assets-batch']['list']|ApiResps['/check-client-unified-batch']['list']|ApiResps['/check-client-dacs-batch']['list'],
    parsedColsAdditionalParameters: [] as string[],
    resultadoEnvio: {} as { [key: string]: string },
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
      evaporatorModels?: { label: string, value: string }[],
      fancoils?: { label: string, value: string }[],
      fancoilsValveManuf?: { label: string, value: string }[],
      fancoilsThermManuf?: { label: string, value: string }[],
      fancoilsManuf?: { label: string, value: string }[],
    },
    energyOpts: {} as {
      MODEL_ID: number;
      MANUFACTURER_ID: number;
      NAME: string;
    }[],
    selectedUnit: [] as string[],
    selectedTypeOfSolution: [] as string[],
  });
}
