import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import {
  Button,
  Loader,
  ModalWindow,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { AdminLayout } from '../AdminLayout';
import { withTransaction } from '@elastic/apm-rum-react';
import { DateRangePicker } from 'react-dates';
import { t } from 'i18next';
import moment from 'moment';
import { ContainerAreas, ContainerDST, InputAreasContainer } from './styles';
import { apiCall } from '~/providers';
import SelectSearch, { fuzzySearch } from 'react-select-search';

export function HorarioVerao(): JSX.Element {
  const [state, render, setState] = useStateVar({
    isLoading: false,
    dateStart: null as null | Date,
    dateEnd: null as null | Date,
    focusedInput: null as 'startDate' | 'endDate' | null,
    tomorrow: moment(moment().add(1, 'days').format('YYYY-MM-DD')),
    listAreas: [] as { name: string; value: number; }[],
    selectedAreas: [] as any,
    isSending: false,
    hourInitial: '0',
    minuteInitial: '0',
    hourFinal: '0',
    minuteFinal: '0',
  });
  async function fetchData() {
    await apiCall('/get-timezones-list-with-offset', {}).then(({ list }) => {
      state.listAreas = list.map((item) => ({ name: `${item.area} (${item.offset})`, value: item.id }));
    });
    render();
  }
  useEffect(() => {
    fetchData();
  }, []);

  async function sendMessageDST() {
    try {
      if (!state.dateStart || !state.dateEnd) {
        toast.error(t('selecioneAsDatas'));
        return;
      }
      const params = {
        dateInitial: state.dateStart.toLocaleString(),
        dateFinal: state.dateEnd.toLocaleString(),
        areas: state.selectedAreas,
        hourInitial: `${state.hourInitial.toString().padStart(2, '0')}:${state.minuteInitial.toString().padStart(2, '0')}`,
        hourFinal: `${state.hourFinal.toString().padStart(2, '0')}:${state.minuteFinal.toString().padStart(2, '0')}`,
      };
      console.log(params);
      await apiCall('/timezone/set-posix', params);
    } catch (err) {
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }
  if (state.isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Helmet>
        <title>Diel Energia - Development Tools</title>
      </Helmet>
      <AdminLayout />
      <h4> Acrescentar ou mudar horário de verão em uma área: </h4>
      <ContainerDST>
        <p>{t('rangeDST')}</p>
        <DateRangePicker
          readOnly
          disabled={state.isLoading}
          startDate={state.dateStart}// momentPropTypes.momentObj or null,
          startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
          endDate={state.dateEnd}// momentPropTypes.momentObj or null,
          endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
          onDatesChange={({ startDate, endDate }) => {
            if (startDate) { setState({ dateStart: startDate }); }
            if (startDate !== state.dateStart) { setState({ dateEnd: null }); }
            else {
              setState({ dateEnd: endDate });
            }
          }} // PropTypes.func.isRequired,
          onFocusChange={(focused: 'endDate' | 'startDate' | null) => {
            state.focusedInput = focused;
            render();
          }}
          focusedInput={state.focusedInput}
          noBorder
          isOutsideRange={(d) => !d}
          startDatePlaceholderText={t('dataInicial')}
          endDatePlaceholderText={t('dataFinal')}
        />
        <div>
          <strong><p> Hora Inicial: </p></strong>
          <InputAreasContainer>
            <span>Horas:</span>
            <input type="number" min="00" max="23" value={state.hourInitial} onChange={(e) => setState({ hourInitial: (e.target.value).padStart(2, '0') })} />
          </InputAreasContainer>
          <InputAreasContainer>
            <span>Minutos:</span>
            <input type="number" min="00" max="59" value={state.minuteInitial} onChange={(e) => setState({ minuteInitial: (e.target.value).padStart(2, '0') })} />
          </InputAreasContainer>
        </div>
        <div>
          <strong><p> Hora Final: </p></strong>
          <InputAreasContainer>
            <span>Horas:</span>
            <input type="number" min="00" max="23" value={state.hourFinal} onChange={(e) => setState({ hourFinal: (e.target.value).padStart(2, '0') })} />
          </InputAreasContainer>
          <InputAreasContainer>
            <span>Minutos:</span>
            <input type="number" min="00" max="59" value={state.minuteFinal} onChange={(e) => setState({ minuteFinal: (e.target.value).padStart(2, '0') })} />
          </InputAreasContainer>
        </div>
        <ContainerAreas>
          <p>{t('selecioneArea')}</p>
          <SelectSearch
            options={state.listAreas}
            value={state.selectedAreas}
            multiple
            closeOnSelect={false}
            printOptions="on-focus"
            search
            filterOptions={fuzzySearch}
            placeholder={t('selecione')}
            // eslint-disable-next-line react/jsx-no-bind
            onChange={(values) => setState({ selectedAreas: values })}
            // onBlur={onFilterUnitBlur}
            disabled={state.isLoading}
          />
        </ContainerAreas>
      </ContainerDST>
      <Button style={{ padding: 8 }} onClick={() => setState({ isSending: true })} variant={state.isLoading ? 'disabled' : 'primary'}> Enviar </Button>
      {
        state.isSending && (
          <ModalWindow style={{ width: '400px' }} borderTop onClickOutside={() => setState({ isSending: false })}>
            <h3> Você tem certeza que deseja alterar o horário de verão dessa(s) area(s)? </h3>
            <span> Caso aperte sim, os dispositivos dessa(s) área(s) vão receber o comando com o novo horário de verão </span>
            <div
              style={{
                display: 'flex', gap: 10, alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', marginTop: 10,
              }}
            >
              <Button variant="primary" style={{ width: '60%', padding: 8 }} onClick={() => sendMessageDST()}> Sim </Button>
              <span onClick={() => setState({ isSending: false })} style={{ textDecoration: 'underline', color: 'gray' }}>Cancelar</span>
            </div>
          </ModalWindow>
        )
      }
    </>
  );
}

export default withTransaction('HorarioVerao', 'component')(HorarioVerao);
