import { SingleDatePicker } from 'react-dates';
import {
  BtnExport, ContentDate, ExportWorksheet, Label, StyledCalendarIcon, Text,
} from './styles';
import { t } from 'i18next';
import moment from 'moment';
import i18n from '~/i18n';
import { getDatesRange } from '~/helpers/formatTime';
import { useStateVar } from '~/helpers/useStateVar';

export function DateButtonExport({ onFocusedUpdate, onClickDownload, onDateChange }): JSX.Element {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');

  const [state, render, setState] = useStateVar({
    lastDate: moment().subtract(1, 'days'),
    selectedDate: moment().subtract(1, 'days'),
    datesRange: getDatesRange(moment().subtract(1, 'days'), 7) as {
      mdate: moment.Moment,
      YMD: string,
      DMY: string,
    }[],
    focusedInput: null,
    focused: false,
    gettingCsv: false,
  });

  function dateChange(date, dateEnd) {
    state.selectedDate = date;
    state.datesRange = getDatesRange(date, 7);
    onDateChange(date, dateEnd);
  }

  const handleFocused = (data) => {
    setState({ focused: data.focused });
    onFocusedUpdate(data.focused);
    render();
  };

  return (
    <div>
      <ContentDate>
        <Label>{t('dataFinalDaSemana')}</Label>
        <SingleDatePicker
          date={state.selectedDate}
          // eslint-disable-next-line react/jsx-no-bind
          onDateChange={dateChange}
          focused={state.focused}
          onFocusChange={({ focused }) => { handleFocused({ focused }); }}
          id="datepicker"
          numberOfMonths={1}
          isOutsideRange={(d) => !d.isBefore(state.lastDate)}
        />
        <StyledCalendarIcon color="#202370" />
      </ContentDate>
      <BtnExport style={{ alignSelf: 'center', marginTop: '20px' }} variant="primary" onClick={onClickDownload}>
        <div>
          <ExportWorksheet />
          <Text style={{ paddingLeft: '5px' }}>
            {t('exportarPlanilha')}
          </Text>
        </div>
      </BtnExport>
    </div>
  );
}
