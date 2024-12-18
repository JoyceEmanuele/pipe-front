import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { SingleDatePicker } from 'react-dates';
import {
  ContentDate, StyledCalendarIcon, DateLabel, Unit, Test, InputText, InputLabel, InputRow, Title, ConsumptionContainer, ConsumptionRow, DateRow, EditCicleContainer, ModelRateContainer, CancelButton, RateGroupsTitle,
} from './styles';
import moment from 'moment';
import { CicleType } from './ClientPanel';
import { apiCall } from '~/providers';
import { RateCicleType } from './Tables/TableModels';

type typeProps = {
  clientId: number,
  onCancel: () => void,
  cicleBaseInfo: CicleType,
  itemToEdit?: null | RateCicleType,
}

export const FormEditCreateCicle = ({
  onCancel, cicleBaseInfo, itemToEdit,
}: typeProps): JSX.Element => {
  const [state, render, setState] = useStateVar({
    submitting: false,
    editingExtras: false,
    focused: false,
    dateStart: null as null|moment.Moment,
    dateEnd: null as null|moment.Moment,
    focusedEnd: false,
    dateStartEnd: null as null|moment.Moment,
    dateEndF: null as null|moment.Moment,
    formCicle: {
      ponta: '' as string,
      outPonta: '' as string,
      startPonta: '' as string,
      endPonta: '' as string,
      firstMidRate: '' as string,
      startFirstMidRate: '' as string,
      endFirstMidRate: '' as string,
      lastMidRate: '' as string,
      startLastMidRate: '' as string,
      endLastMidRate: '' as string,
      rate: '' as string,
    },
    PIS: '',
    COFINS: '',
    ICMS: '',
  });

  useEffect(() => {
    loadEditCicle();
  }, []);

  async function createEditCicle() {
    try {
      if (itemToEdit) {
        await apiCall('/update-rate-cicle', {
          START_CICLE_DATE: state.dateStart?.format('DD/MM/YYYY'),
          MODEL_ID: cicleBaseInfo.modelId,
          CICLE_ID: itemToEdit.CICLE_ID,
          END_CICLE_DATE: state.dateStartEnd?.format('DD/MM/YYYY'),
          PIS: Number(state.PIS),
          ICMS: Number(state.ICMS),
          COFINS: Number(state.COFINS),
          WHITERATE_PARAMETERS: (cicleBaseInfo.rateModalityName === 'Branca') ? {
            RATE_PONTA: state.formCicle.ponta,
            RATE_OUTPONTA: state.formCicle.outPonta,
            END_PONTA: state.formCicle.endPonta,
            START_PONTA: state.formCicle.startPonta,
            FIRST_MID_RATE: state.formCicle.firstMidRate,
            END_FIRST_MID_RATE: state.formCicle.endFirstMidRate,
            START_FIRST_MID_RATE: state.formCicle.startFirstMidRate,
            LAST_MID_RATE: state.formCicle.lastMidRate,
            END_LAST_MID_RATE: state.formCicle.endLastMidRate,
            START_LAST_MID_RATE: state.formCicle.startLastMidRate,
          } : undefined,
          CONVENTIONALRATE_PARAMETERS: (cicleBaseInfo.rateModalityName === 'Convencional') ? {
            RATE: state.formCicle.rate,
          } : undefined,
        });
      } else if (state.dateStart) {
        await apiCall('/create-rate-cicle', {
          MODEL_ID: cicleBaseInfo.modelId,
          START_CICLE_DATE: state.dateStart.format('DD/MM/YYYY'),
          END_CICLE_DATE: state.dateStartEnd?.format('DD/MM/YYYY'),
          PIS: Number(state.PIS),
          COFINS: Number(state.COFINS),
          ICMS: Number(state.ICMS),
          WHITERATE_PARAMETERS: (cicleBaseInfo.rateModalityName === 'Branca') ? {
            RATE_PONTA: state.formCicle.ponta,
            RATE_OUTPONTA: state.formCicle.outPonta,
            START_PONTA: state.formCicle.startPonta,
            END_PONTA: state.formCicle.endPonta,
            FIRST_MID_RATE: state.formCicle.firstMidRate,
            START_FIRST_MID_RATE: state.formCicle.startFirstMidRate,
            END_FIRST_MID_RATE: state.formCicle.endFirstMidRate,
            LAST_MID_RATE: state.formCicle.lastMidRate,
            START_LAST_MID_RATE: state.formCicle.startLastMidRate,
            END_LAST_MID_RATE: state.formCicle.endLastMidRate,
          } : undefined,
          CONVENTIONALRATE_PARAMETERS: (cicleBaseInfo.rateModalityName === 'Convencional') ? {
            RATE: state.formCicle.rate,
          } : undefined,
        });
      }
      window.location.reload();
    } catch (error) {
      toast.error('Houve um erro ao criar/editar ciclo');
    }
  }

  function loadEditCicle() {
    if (itemToEdit) {
      console.log(itemToEdit);
      setState({
        focusedEnd: false,
        formCicle: {
          ponta: itemToEdit.WHITERATE_PARAMETERS?.RATE_PONTA || '',
          outPonta: itemToEdit.WHITERATE_PARAMETERS?.RATE_OUTPONTA || '',
          startPonta: itemToEdit.WHITERATE_PARAMETERS?.START_PONTA || '',
          endPonta: itemToEdit.WHITERATE_PARAMETERS?.END_PONTA || '',
          firstMidRate: itemToEdit.WHITERATE_PARAMETERS?.FIRST_MID_RATE || '',
          startFirstMidRate: itemToEdit.WHITERATE_PARAMETERS?.START_FIRST_MID_RATE || '',
          endFirstMidRate: itemToEdit.WHITERATE_PARAMETERS?.END_FIRST_MID_RATE || '',
          lastMidRate: itemToEdit.WHITERATE_PARAMETERS?.LAST_MID_RATE || '',
          startLastMidRate: itemToEdit.WHITERATE_PARAMETERS?.START_LAST_MID_RATE || '',
          endLastMidRate: itemToEdit.WHITERATE_PARAMETERS?.END_LAST_MID_RATE || '',
          rate: itemToEdit.CONVENTIONALRATE_PARAMETERS?.RATE || '',
        },
        PIS: (itemToEdit.PIS).toString(),
        COFINS: (itemToEdit.COFINS).toString(),
        ICMS: (itemToEdit.ICMS).toString(),
      });
    }
  }

  async function confirm() {
    try {
      createEditCicle();
      onCancel();
    } catch (err) {
      console.log(err);
      toast.error('Houve erro');
    }
    state.submitting = false; render();
  }

  return (
    <EditCicleContainer>
      <h3 style={{ fontWeight: 'bold' }}>
        { itemToEdit ? 'Editar ciclo' : 'Criar novo ciclo' }
      </h3>
      <div style={{ width: '700px' }}>
        <div style={{
          display: 'flex', flexDirection: 'row', width: '400px', marginLeft: '5px',
        }}
        >
          <ContentDate>
            <DateLabel>Início do ciclo vigente</DateLabel>
            <br />
            <SingleDatePicker
              placeholder=""
              disabled={false}
              date={state.dateStart}
              id="datepicker"
              onDateChange={(value) => {
                setState({ dateStart: value, dateEnd: value });
              }}
              focused={state.focused}
              onFocusChange={({ focused }) => setState({ focused })}
              numberOfMonths={1}
            />
            <StyledCalendarIcon color="#202370" />
          </ContentDate>
          <div style={{ width: '14px' }} />
          <ContentDate>
            <DateLabel>Fim do ciclo vigente</DateLabel>
            <br />
            <SingleDatePicker
              placeholder=""
              disabled={false}
              date={state.dateStartEnd}
              id="datepicker"
              onDateChange={(value) => {
                setState({ dateStartEnd: value, dateEndF: value });
              }}
              focused={state.focusedEnd}
              onFocusChange={({ focused }) => setState({ focusedEnd: focused })}
              numberOfMonths={1}
            />
            <StyledCalendarIcon color="#202370" />
          </ContentDate>
        </div>
        <ModelRateContainer>
          <div>
            <RateGroupsTitle>
              Grupo
            </RateGroupsTitle>
            { cicleBaseInfo.groupName }
          </div>
          <div style={{ width: '15px' }} />
          <div>
            <RateGroupsTitle>
              Subgrupo
            </RateGroupsTitle>
            <p>
              { cicleBaseInfo.subGroupName }
            </p>
          </div>
          <div style={{ width: '15px' }} />
          <div>
            <RateGroupsTitle>
              Modelo de tarifa
            </RateGroupsTitle>
            <p>
              { cicleBaseInfo.rateModalityName }
            </p>
          </div>
        </ModelRateContainer>
      </div>
      <Title>
        Consumo
      </Title>
      <div style={{ height: '10px' }} />
      { cicleBaseInfo.rateModalityName === 'Branca' ? (
        <ConsumptionContainer>
          <ConsumptionRow>
            <Test>
              <InputLabel>Ponta</InputLabel>
              <InputRow>
                <Unit>
                  kWh/R$
                </Unit>
                <InputText
                  value={state.formCicle.ponta}
                  onChange={({ target }) => { state.formCicle.ponta = target.value; render(); }}
                />
              </InputRow>
            </Test>
            <div style={{ width: '15px' }} />
            <DateRow>
              <Test>
                <InputLabel>Horário início</InputLabel>
                <InputRow>
                  <InputText
                    value={state.formCicle.startPonta}
                    onChange={({ target }) => { state.formCicle.startPonta = target.value; render(); }}
                  />
                </InputRow>
              </Test>
              <div style={{ width: '15px' }} />
              <Test>
                <InputLabel>Horário fim</InputLabel>
                <InputRow>
                  <InputText
                    value={state.formCicle.endPonta}
                    onChange={({ target }) => { state.formCicle.endPonta = target.value; render(); }}
                  />
                </InputRow>
              </Test>
            </DateRow>

          </ConsumptionRow>
          <ConsumptionRow>
            <Test>
              <InputLabel>Inicio do horário intermediário</InputLabel>
              <InputRow>
                <Unit>
                  kWh/R$
                </Unit>
                <InputText
                  value={state.formCicle.firstMidRate}
                  onChange={({ target }) => { state.formCicle.firstMidRate = target.value; render(); }}
                />
              </InputRow>
            </Test>
            <div style={{ width: '15px' }} />
            <DateRow>
              <Test>
                <InputLabel>Horário início</InputLabel>
                <InputRow>
                  <InputText
                    value={state.formCicle.startFirstMidRate}
                    onChange={({ target }) => { state.formCicle.startFirstMidRate = target.value; render(); }}
                  />
                </InputRow>
              </Test>
              <div style={{ width: '15px' }} />
              <Test>
                <InputLabel>Horário fim</InputLabel>
                <InputRow>
                  <InputText
                    value={state.formCicle.endFirstMidRate}
                    onChange={({ target }) => { state.formCicle.endFirstMidRate = target.value; render(); }}
                  />
                </InputRow>
              </Test>
            </DateRow>
          </ConsumptionRow>
          <ConsumptionRow>
            <Test>
              <InputLabel>Fim do horário intermediário</InputLabel>
              <InputRow>
                <Unit>
                  kWh/R$
                </Unit>
                <InputText
                  value={state.formCicle.lastMidRate}
                  onChange={({ target }) => { state.formCicle.lastMidRate = target.value; render(); }}
                />
              </InputRow>
            </Test>
            <div style={{ width: '15px' }} />
            <DateRow>
              <Test>
                <InputLabel>Horário início</InputLabel>
                <InputRow>
                  <InputText
                    value={state.formCicle.startLastMidRate}
                    onChange={({ target }) => { state.formCicle.startLastMidRate = target.value; render(); }}
                  />
                </InputRow>
              </Test>
              <div style={{ width: '15px' }} />
              <Test>
                <InputLabel>Horário fim</InputLabel>
                <InputRow>
                  <InputText
                    value={state.formCicle.endLastMidRate}
                    onChange={({ target }) => { state.formCicle.endLastMidRate = target.value; render(); }}
                  />
                </InputRow>
              </Test>
            </DateRow>
          </ConsumptionRow>
          <ConsumptionRow>
            <Test>
              <InputLabel>Fora ponta</InputLabel>
              <InputRow>
                <Unit>
                  kWh/R$
                </Unit>
                <InputText
                  value={state.formCicle.outPonta}
                  onChange={({ target }) => { state.formCicle.outPonta = target.value; render(); }}
                />
              </InputRow>
            </Test>
            <div style={{ width: '379px' }} />
          </ConsumptionRow>
        </ConsumptionContainer>
      ) : (
        <ConsumptionRow>
          <Test>
            <InputLabel>Tarifa</InputLabel>
            <InputRow>
              <Unit>
                kWh/R$
              </Unit>
              <InputText
                value={state.formCicle.rate}
                onChange={({ target }) => { state.formCicle.rate = target.value; render(); }}
              />
            </InputRow>
          </Test>
          <div style={{ width: '379px' }} />
        </ConsumptionRow>
      )}

      <div style={{ height: cicleBaseInfo.rateModalityName === 'Branca' ? '80px' : '10px' }} />
      <Title>
        Impostos
      </Title>
      <div style={{
        display: 'flex', flexDirection: 'row', width: '600px', marginLeft: '5px', paddingTop: '10px',
      }}
      >
        <Test>
          <InputLabel>PIS</InputLabel>
          <InputRow>
            <Unit>
              %
            </Unit>
            <InputText
              value={state.PIS}
              type="number"
              onChange={({ target }) => { state.PIS = target.value; render(); }}
            />
          </InputRow>
        </Test>
        <div style={{ width: '15px' }} />
        <Test>
          <InputLabel>COFINS</InputLabel>
          <InputRow>
            <Unit>
              %
            </Unit>
            <InputText
              type="number"
              value={state.COFINS}
              onChange={({ target }) => { state.COFINS = target.value; render(); }}
            />
          </InputRow>
        </Test>
        <div style={{ width: '15px' }} />
        <Test>
          <InputLabel>ICMS</InputLabel>
          <InputRow>
            <Unit>
              %
            </Unit>
            <InputText
              type="number"
              value={state.ICMS}
              onChange={({ target }) => { state.ICMS = (target.value); render(); }}
            />
          </InputRow>
        </Test>
      </div>

      <div style={{ height: '50px' }} />

      <div style={{
        flexDirection: 'column', display: 'flex', alignItems: 'left', paddingTop: '10',
      }}
      >
        <Button style={{ width: '20%' }} onClick={confirm} variant="primary">
          {itemToEdit ? 'Salvar' : 'Adicionar'}
        </Button>
        <div style={{ height: '15px' }} />
        <CancelButton onClick={onCancel} variant="grey">
          Cancelar
        </CancelButton>
      </div>
    </EditCicleContainer>
  );
};
