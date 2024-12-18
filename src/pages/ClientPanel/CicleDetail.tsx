import { useStateVar } from '~/helpers/useStateVar';
import {
  CicleDetailContainer,
  TitleSelectRow,
  CustomInputCicle,
  CicleInfoContainer,
  CicleInfoRow,
  ItemRow,
  ItemSubTitle,
  ItemTitle,
  ItemDateRow,
  CicleDateInfoRow,
} from './styles';
import { RateModelsType } from './ClientPanel';
import { useEffect } from 'react';
import { Select } from '~/components/NewSelect';

type RateCicle = {
  CICLE_ID: number
  MODEL_ID: number
  START_CICLE_DATE: string
  END_CICLE_DATE: string
  PIS: number
  VIGENCYCICLE: boolean,
  COFINS: number
  ICMS: number
  CONVENTIONALRATE_PARAMETERS?: {
    RATE: string
    CONVENTIONALRATE_ID: number,
  }
  WHITERATE_PARAMETERS?: {
    WHITERATE_ID: number,
    RATE_PONTA: string,
    RATE_OUTPONTA: string,
    START_PONTA: string,
    END_PONTA: string,
    FIRST_MID_RATE: string,
    START_FIRST_MID_RATE: string,
    END_FIRST_MID_RATE: string,
    LAST_MID_RATE?: string,
    START_LAST_MID_RATE: string,
    END_LAST_MID_RATE: string,
  },
}

export const CicleDetail = ({ rateModels, formUnitState }: { rateModels?: RateModelsType[], formUnitState: any }): JSX.Element => {
  const [state, render] = useStateVar(() => {
    const state = {
      selectedModel: '' as string,
      modelOptions: [] as string[],
      energyRate: '' as string,
      vigencyCicle: {} as RateCicle,
      vigencyModel: {} as RateModelsType,
    };
    return state;
  });

  function setUpInfos() {
    if (rateModels) {
      rateModels.forEach((model) => state.modelOptions.push(model.modelName));
    }
  }

  function loadVigencyCicle(modelName: string) {
    state.selectedModel = modelName;
    const model = rateModels?.find((model) => model.modelName === modelName);
    formUnitState.selectedModelId = model?.modelId;
    const vigencyCicle = model?.rateCicles[0];
    if (vigencyCicle) state.vigencyCicle = vigencyCicle;
    if (model) state.vigencyModel = model;
    render();
  }

  useEffect(() => {
    setUpInfos();
    render();
  }, []);

  return (
    <CicleDetailContainer>
      <TitleSelectRow>
        <b style={{ fontSize: '19px' }}>
          Consumo
        </b>
        <CustomInputCicle>
          <div style={{ width: '100%' }}>
            <Select
              options={state.modelOptions}
              value={state.selectedModel}
              onSelect={(value) => { loadVigencyCicle(value); }}
              closeOnSelect
              placeholder="Selecione um modelo"
            />
          </div>
        </CustomInputCicle>
      </TitleSelectRow>
      { !state.selectedModel ? (<>Selecione um modelo de tarifa</>) : (
        <CicleInfoContainer>
          <CicleDateInfoRow>
            <ItemDateRow>
              <ItemTitle>
                Início do ciclo vigente
              </ItemTitle>
              <ItemSubTitle>
                {state.vigencyCicle.START_CICLE_DATE }
              </ItemSubTitle>
            </ItemDateRow>
            <div style={{ width: '22px' }} />

            {state.vigencyCicle.END_CICLE_DATE && (
            <>
              <ItemDateRow>
                <ItemTitle>
                  Fim do ciclo vigente
                </ItemTitle>
                <ItemSubTitle>
                  {state.vigencyCicle.END_CICLE_DATE}
                </ItemSubTitle>
              </ItemDateRow>
            </>
            )}
          </CicleDateInfoRow>
          <CicleInfoRow>
            <ItemRow>
              <ItemTitle>
                Grupo
              </ItemTitle>
              <ItemSubTitle>
                {state.vigencyModel.groupName}
              </ItemSubTitle>
            </ItemRow>
            <ItemRow>
              <ItemTitle>
                Subgrupo
              </ItemTitle>
              <ItemSubTitle>
                {state.vigencyModel.subGroupName}
              </ItemSubTitle>
            </ItemRow>
            <ItemRow>
              <ItemTitle>
                Tipo de tarifa
              </ItemTitle>
              <ItemSubTitle>
                {state.vigencyModel.rateModalityName}
              </ItemSubTitle>
            </ItemRow>
          </CicleInfoRow>
          { state.vigencyModel.rateModalityName === 'Branca' ? (
            <>
              <CicleInfoRow>
                <ItemRow>
                  <ItemTitle>
                    Ponta
                  </ItemTitle>
                  <ItemSubTitle>
                    {state.vigencyCicle.WHITERATE_PARAMETERS?.RATE_PONTA}
                  </ItemSubTitle>
                </ItemRow>
                <ItemRow>
                  <ItemTitle>
                    Horário inicio
                  </ItemTitle>
                  <ItemSubTitle>
                    {state.vigencyCicle.WHITERATE_PARAMETERS?.START_PONTA}
                  </ItemSubTitle>
                </ItemRow>
                <ItemRow>
                  <ItemTitle>
                    Horário fim
                  </ItemTitle>
                  <ItemSubTitle>
                    {state.vigencyCicle.WHITERATE_PARAMETERS?.END_PONTA}
                  </ItemSubTitle>
                </ItemRow>
              </CicleInfoRow>
              <CicleInfoRow>
                <ItemRow>
                  <ItemTitle>
                    Faixa intermediária inicial
                  </ItemTitle>
                  <ItemSubTitle>
                    {state.vigencyCicle.WHITERATE_PARAMETERS?.FIRST_MID_RATE}
                  </ItemSubTitle>
                </ItemRow>
                <ItemRow>
                  <ItemTitle>
                    Horário inicio
                  </ItemTitle>
                  <ItemSubTitle>
                    {state.vigencyCicle.WHITERATE_PARAMETERS?.START_FIRST_MID_RATE}
                  </ItemSubTitle>
                </ItemRow>
                <ItemRow>
                  <ItemTitle>
                    Horário fim
                  </ItemTitle>
                  <ItemSubTitle>
                    {state.vigencyCicle.WHITERATE_PARAMETERS?.END_FIRST_MID_RATE}
                  </ItemSubTitle>
                </ItemRow>
              </CicleInfoRow>
              <CicleInfoRow>
                <ItemRow>
                  <ItemTitle>
                    Faixa intermediária Final
                  </ItemTitle>
                  <ItemSubTitle>
                    {state.vigencyCicle.WHITERATE_PARAMETERS?.LAST_MID_RATE}
                  </ItemSubTitle>
                </ItemRow>
                <ItemRow>
                  <ItemTitle>
                    Horário inicio
                  </ItemTitle>
                  <ItemSubTitle>
                    {state.vigencyCicle.WHITERATE_PARAMETERS?.START_LAST_MID_RATE}
                  </ItemSubTitle>
                </ItemRow>
                <ItemRow>
                  <ItemTitle>
                    Horário fim
                  </ItemTitle>
                  <ItemSubTitle>
                    {state.vigencyCicle.WHITERATE_PARAMETERS?.END_LAST_MID_RATE}
                  </ItemSubTitle>
                </ItemRow>
              </CicleInfoRow>
              <CicleInfoRow>
                <ItemRow>
                  <ItemTitle>
                    Fora ponta
                  </ItemTitle>
                  <ItemSubTitle>
                    {state.vigencyCicle.WHITERATE_PARAMETERS?.RATE_OUTPONTA}
                  </ItemSubTitle>
                </ItemRow>
              </CicleInfoRow>
            </>
          ) : (
            <CicleInfoRow>
              <ItemRow>
                <ItemTitle>
                  Tarifa
                </ItemTitle>
                <ItemSubTitle>
                  {state.vigencyCicle.CONVENTIONALRATE_PARAMETERS?.RATE}
                </ItemSubTitle>
              </ItemRow>
            </CicleInfoRow>
          )}
          <CicleInfoRow>
            <ItemRow>
              <ItemTitle>
                PIS
              </ItemTitle>
              <ItemSubTitle>
                {`${state.vigencyCicle.PIS}%`}
              </ItemSubTitle>
            </ItemRow>
            <ItemRow>
              <ItemTitle>
                COFINS
              </ItemTitle>
              <ItemSubTitle>
                {`${state.vigencyCicle.COFINS}%`}
              </ItemSubTitle>
            </ItemRow>
            <ItemRow>
              <ItemTitle>
                ICMS
              </ItemTitle>
              <ItemSubTitle>
                {`${state.vigencyCicle.ICMS}%`}
              </ItemSubTitle>
            </ItemRow>
          </CicleInfoRow>
        </CicleInfoContainer>
      )}
    </CicleDetailContainer>
  );
};
